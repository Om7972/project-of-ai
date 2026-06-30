from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from typing import List
import json
import io

from app.db.database import get_db
from app.models.models import Patient, Prediction, TriageCase
from app.schemas.schemas import (
    DiagnosticInput, DiagnosticResponse, HistoryItem, StatsResponse,
    ExplainResponse, PatientSearchResult, PatientTimelineResponse, PatientTimelineItem,
)
from app.services.ml_service import ml_service
from app.services.explain_service import explain_prediction, FEATURE_ORDER
from app.services.pdf_service import generate_clinical_report
from app.services.audit_service import log_action
from app.services.redis_service import publish_event
from app.api.v1.deps import get_current_user
from app.core.config import settings
from app.core.rate_limit import limiter

router = APIRouter()


async def _get_or_create_patient(db: AsyncSession, payload: DiagnosticInput) -> Patient:
    if payload.patient_uid:
        result = await db.execute(select(Patient).where(Patient.patient_uid == payload.patient_uid))
        patient = result.scalars().first()
        if patient:
            patient.name = payload.patient_name
            patient.age = payload.age
            patient.gender = payload.gender
            return patient

    patient = Patient(name=payload.patient_name, age=payload.age, gender=payload.gender)
    db.add(patient)
    await db.flush()
    return patient


async def _create_triage_if_needed(db: AsyncSession, prediction: Prediction, patient: Patient) -> bool:
    if prediction.risk_level not in ("High", "Moderate"):
        return False
    priority = 1 if prediction.risk_level == "High" else 2
    triage = TriageCase(prediction_id=prediction.id, priority=priority, status="pending")
    db.add(triage)
    await db.flush()
    await publish_event("triage_updates", {
        "type": "new_case",
        "prediction_id": prediction.id,
        "patient_name": patient.name,
        "risk_level": prediction.risk_level,
        "risk_probability": prediction.probability,
    })
    return True


@router.post("/predict", response_model=DiagnosticResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit(settings.RATE_LIMIT_PREDICT)
async def run_diagnostic(
    request: Request,
    payload: DiagnosticInput,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    try:
        patient = await _get_or_create_patient(db, payload)
        features_dict = payload.model_dump(exclude={"patient_uid"})
        result = ml_service.predict(features_dict)
        explain = explain_prediction(features_dict, ml_service)

        prediction = Prediction(
            patient_id=patient.id,
            user_id=current_user.id,
            probability=result["risk_probability"],
            risk_level=result["risk_level"],
            features_json=json.dumps(features_dict),
            explain_json=json.dumps(explain),
            model_version=result.get("engine", "v1.0"),
        )
        db.add(prediction)
        await db.flush()

        triage_created = await _create_triage_if_needed(db, prediction, patient)
        await log_action(db, "predict", current_user.id, "prediction", prediction.id,
                         request.client.host if request.client else None,
                         {"risk_level": result["risk_level"]})
        await db.commit()
        await db.refresh(patient)
        await db.refresh(prediction)

        return DiagnosticResponse(
            risk_probability=result["risk_probability"],
            risk_level=result["risk_level"],
            prediction=result["prediction"],
            confidence=result["confidence"],
            model_used=result["model_used"],
            patient_name=patient.name,
            age=patient.age,
            gender=patient.gender,
            patient_id=patient.id,
            patient_uid=patient.patient_uid,
            prediction_id=prediction.id,
            triage_created=triage_created,
        )
    except ValueError as e:
        await db.rollback()
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@router.post("/predict/guest", response_model=DiagnosticResponse)
@limiter.limit(settings.RATE_LIMIT_PREDICT)
async def run_guest_diagnostic(request: Request, payload: DiagnosticInput):
    try:
        features_dict = payload.model_dump(exclude={"patient_uid"})
        result = ml_service.predict(features_dict)
        return DiagnosticResponse(
            risk_probability=result["risk_probability"],
            risk_level=result["risk_level"],
            prediction=result["prediction"],
            confidence=result["confidence"],
            model_used=result["model_used"],
            patient_name=payload.patient_name,
            age=payload.age,
            gender=payload.gender,
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))


@router.get("/", response_model=List[HistoryItem])
async def get_predictions_history(
    skip: int = 0, limit: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    query = (
        select(Prediction, Patient)
        .join(Patient, Patient.id == Prediction.patient_id)
        .order_by(Prediction.created_at.desc())
        .offset(skip).limit(min(limit, 100))
    )
    result = await db.execute(query)
    history = []
    for pred, patient in result.all():
        features = json.loads(pred.features_json) if pred.features_json else {}
        history.append(HistoryItem(
            id=pred.id,
            patient_name=patient.name,
            patient_uid=patient.patient_uid,
            patient_age=patient.age,
            patient_gender=patient.gender,
            risk_probability=pred.probability,
            risk_level=pred.risk_level,
            created_at=pred.created_at,
            trestbps=features.get("ap_hi"),
            chol=features.get("cholesterol"),
        ))
    return history


@router.get("/history", response_model=List[HistoryItem])
async def get_predictions_history_alias(
    skip: int = 0, limit: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return await get_predictions_history(skip, limit, db, current_user)


@router.get("/search", response_model=List[PatientSearchResult])
async def search_patients(
    q: str = "",
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if not q or len(q) < 2:
        return []
    q_lower = q.lower()
    pattern = f"%{q_lower}%"
    query = (
        select(Patient)
        .where(or_(
            func.lower(Patient.name).like(pattern),
            func.lower(Patient.patient_uid).like(pattern),
        ))
        .limit(20)
    )
    patients = (await db.execute(query)).scalars().all()
    results = []
    for p in patients:
        pred_q = select(Prediction).where(Prediction.patient_id == p.id).order_by(Prediction.created_at.desc()).limit(1)
        latest = (await db.execute(pred_q)).scalars().first()
        count_q = select(func.count(Prediction.id)).where(Prediction.patient_id == p.id)
        count = (await db.execute(count_q)).scalar() or 0
        results.append(PatientSearchResult(
            patient_uid=p.patient_uid,
            patient_name=p.name,
            age=p.age,
            gender=p.gender,
            latest_risk=latest.probability if latest else None,
            latest_risk_level=latest.risk_level if latest else None,
            assessment_count=count,
        ))
    return results


@router.get("/stats", response_model=StatsResponse)
async def get_stats(db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    total = (await db.execute(select(func.count(Prediction.id)))).scalar() or 0
    high = (await db.execute(select(func.count(Prediction.id)).where(Prediction.risk_level == "High"))).scalar() or 0
    moderate = (await db.execute(select(func.count(Prediction.id)).where(Prediction.risk_level == "Moderate"))).scalar() or 0
    low = (await db.execute(select(func.count(Prediction.id)).where(Prediction.risk_level == "Low"))).scalar() or 0
    positive = (await db.execute(select(func.count(Prediction.id)).where(Prediction.probability >= 50))).scalar() or 0
    pending_triage = (await db.execute(select(func.count(TriageCase.id)).where(TriageCase.status == "pending"))).scalar() or 0

    return StatsResponse(
        total_predictions=total,
        high_risk_cases=high,
        moderate_risk_cases=moderate,
        low_risk_cases=low,
        negative_cases=total - positive,
        positive_cases=positive,
        model_accuracy_pct=92.4,
        model_name=ml_service.model_name,
        pending_triage=pending_triage,
    )


@router.get("/patients/{patient_uid}/timeline", response_model=PatientTimelineResponse)
async def get_patient_timeline(
    patient_uid: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    patient = (await db.execute(select(Patient).where(Patient.patient_uid == patient_uid))).scalars().first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    preds = (await db.execute(
        select(Prediction).where(Prediction.patient_id == patient.id).order_by(Prediction.created_at.asc())
    )).scalars().all()

    assessments = [
        PatientTimelineItem(
            prediction_id=p.id, risk_probability=p.probability,
            risk_level=p.risk_level, created_at=p.created_at,
        ) for p in preds
    ]
    trend = None
    if len(assessments) >= 2:
        trend = round(assessments[-1].risk_probability - assessments[-2].risk_probability, 2)

    return PatientTimelineResponse(
        patient_uid=patient.patient_uid,
        patient_name=patient.name,
        age=patient.age,
        gender=patient.gender,
        assessments=assessments,
        risk_trend=trend,
    )


@router.get("/{prediction_id}/explain", response_model=ExplainResponse)
async def explain_prediction_endpoint(
    prediction_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    pred = (await db.execute(select(Prediction).where(Prediction.id == prediction_id))).scalars().first()
    if not pred:
        raise HTTPException(status_code=404, detail="Prediction not found")

    if pred.explain_json:
        explain = json.loads(pred.explain_json)
    else:
        features = json.loads(pred.features_json) if pred.features_json else {}
        explain = explain_prediction(features, ml_service)

    return ExplainResponse(
        prediction_id=prediction_id,
        method=explain["method"],
        contributions=explain["contributions"],
        summary=explain["summary"],
    )


@router.get("/{prediction_id}/report")
async def download_report(
    prediction_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    row = (await db.execute(
        select(Prediction, Patient).join(Patient).where(Prediction.id == prediction_id)
    )).first()
    if not row:
        raise HTTPException(status_code=404, detail="Prediction not found")

    pred, patient = row
    features = json.loads(pred.features_json) if pred.features_json else {}
    explain = json.loads(pred.explain_json) if pred.explain_json else {}
    contributions = explain.get("contributions", [])

    pdf_bytes = generate_clinical_report(
        patient_name=patient.name,
        age=patient.age,
        gender=patient.gender,
        risk_probability=pred.probability,
        risk_level=pred.risk_level,
        model_used=ml_service.model_name,
        features=features,
        contributions=contributions,
        doctor_name=current_user.name,
        prediction_id=pred.id,
    )
    await log_action(db, "export_pdf", current_user.id, "prediction", pred.id)
    await db.commit()

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=cardioai_report_{prediction_id}.pdf"},
    )


@router.get("/{prediction_id}/fhir")
async def export_fhir(
    prediction_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    row = (await db.execute(
        select(Prediction, Patient).join(Patient).where(Prediction.id == prediction_id)
    )).first()
    if not row:
        raise HTTPException(status_code=404, detail="Prediction not found")

    pred, patient = row
    features = json.loads(pred.features_json) if pred.features_json else {}
    gender_code = "female" if patient.gender == 1 else "male"

    bundle = {
        "resourceType": "Bundle",
        "type": "collection",
        "entry": [
            {
                "resource": {
                    "resourceType": "Patient",
                    "id": patient.patient_uid,
                    "name": [{"text": patient.name}],
                    "gender": gender_code,
                    "birthDate": f"{2026 - patient.age}-01-01",
                }
            },
            {
                "resource": {
                    "resourceType": "Observation",
                    "id": str(pred.id),
                    "status": "final",
                    "code": {"text": "Cardiovascular Risk Score"},
                    "subject": {"reference": f"Patient/{patient.patient_uid}"},
                    "valueQuantity": {"value": pred.probability, "unit": "%"},
                    "component": [
                        {"code": {"text": k}, "valueQuantity": {"value": v}}
                        for k, v in features.items() if k != "patient_name"
                    ],
                }
            },
        ],
    }
    return bundle


@router.get("/{prediction_id}", response_model=DiagnosticResponse)
async def get_prediction_by_id(
    prediction_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    row = (await db.execute(
        select(Prediction, Patient).join(Patient).where(Prediction.id == prediction_id)
    )).first()
    if not row:
        raise HTTPException(status_code=404, detail="Prediction not found")

    pred, patient = row
    return DiagnosticResponse(
        risk_probability=pred.probability,
        risk_level=pred.risk_level,
        prediction=1 if pred.probability >= 50 else 0,
        confidence=pred.probability / 100 if pred.probability >= 50 else (100 - pred.probability) / 100,
        model_used=ml_service.model_name,
        patient_name=patient.name,
        age=patient.age,
        gender=patient.gender,
        patient_id=patient.id,
        patient_uid=patient.patient_uid,
        prediction_id=pred.id,
    )


@router.delete("/{prediction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_prediction(
    prediction_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    pred = (await db.execute(select(Prediction).where(Prediction.id == prediction_id))).scalars().first()
    if not pred:
        raise HTTPException(status_code=404, detail="Prediction not found")
    await db.delete(pred)
    await log_action(db, "delete", current_user.id, "prediction", prediction_id,
                     request.client.host if request.client else None)
    await db.commit()
