from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
import json

from app.db.database import get_db
from app.models.models import Patient, Prediction
from app.schemas.schemas import DiagnosticInput, DiagnosticResponse, HistoryItem, StatsResponse
from app.services.ml_service import ml_service
from app.api.v1.deps import get_current_user

router = APIRouter()


@router.post("/predict", response_model=DiagnosticResponse, status_code=status.HTTP_201_CREATED)
async def run_diagnostic(payload: DiagnosticInput, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    patient = Patient(name=payload.patient_name, age=payload.age, gender=payload.gender)
    db.add(patient)
    await db.flush()

    features_dict = payload.model_dump()
    result = ml_service.predict(features_dict)

    prediction = Prediction(
        patient_id=patient.id,
        probability=result["risk_probability"],
        risk_level=result["risk_level"],
        features_json=json.dumps(features_dict)
    )
    db.add(prediction)

    try:
        await db.commit()
        await db.refresh(patient)
        await db.refresh(prediction)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database persistent failure: {str(e)}"
        )

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
        prediction_id=prediction.id
    )


@router.post("/predict/guest", response_model=DiagnosticResponse)
async def run_guest_diagnostic(payload: DiagnosticInput):
    features_dict = payload.model_dump()
    result = ml_service.predict(features_dict)

    return DiagnosticResponse(
        risk_probability=result["risk_probability"],
        risk_level=result["risk_level"],
        prediction=result["prediction"],
        confidence=result["confidence"],
        model_used=result["model_used"],
        patient_name=payload.patient_name,
        age=payload.age,
        gender=payload.gender
    )


@router.get("/", response_model=List[HistoryItem])
async def get_predictions_history(skip: int = 0, limit: int = 20, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    query = select(Prediction, Patient).join(Patient, Patient.id == Prediction.patient_id).order_by(Prediction.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    rows = result.all()

    history = []
    for pred, patient in rows:
        features = {}
        if pred.features_json:
            try:
                features = json.loads(pred.features_json)
            except Exception:
                pass
        history.append(HistoryItem(
            id=pred.id,
            patient_name=patient.name,
            patient_age=patient.age,
            patient_gender=patient.gender,
            risk_probability=pred.probability,
            risk_level=pred.risk_level,
            created_at=pred.created_at,
            trestbps=features.get("ap_hi"),
            chol=features.get("cholesterol"),
            thalach=features.get("thalach")
        ))
    return history


@router.get("/{prediction_id}", response_model=DiagnosticResponse)
async def get_prediction_by_id(prediction_id: int, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    query = select(Prediction, Patient).join(Patient, Patient.id == Prediction.patient_id).where(Prediction.id == prediction_id)
    result = await db.execute(query)
    row = result.first()

    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prediction not found")

    pred, patient = row
    features = {}
    if pred.features_json:
        try:
            features = json.loads(pred.features_json)
        except Exception:
            pass

    return DiagnosticResponse(
        risk_probability=pred.probability,
        risk_level=pred.risk_level,
        prediction=1 if pred.probability >= 50 else 0,
        confidence=pred.probability / 100 if pred.probability >= 50 else (100 - pred.probability) / 100,
        model_used="XGBoost (advanced_heart_model.pkl)",
        patient_name=patient.name,
        age=patient.age,
        gender=patient.gender,
        patient_id=patient.id,
        prediction_id=pred.id
    )


@router.delete("/{prediction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_prediction(prediction_id: int, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    query = select(Prediction).where(Prediction.id == prediction_id)
    result = await db.execute(query)
    pred = result.scalars().first()

    if not pred:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prediction not found")

    await db.delete(pred)
    await db.commit()
    return


@router.get("/stats", response_model=StatsResponse)
async def get_stats(db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    total_query = select(func.count(Prediction.id))
    total_result = await db.execute(total_query)
    total = total_result.scalar() or 0

    high_query = select(func.count(Prediction.id)).where(Prediction.risk_level == "High")
    high_result = await db.execute(high_query)
    high = high_result.scalar() or 0

    moderate_query = select(func.count(Prediction.id)).where(Prediction.risk_level == "Moderate")
    moderate_result = await db.execute(moderate_query)
    moderate = moderate_result.scalar() or 0

    low_query = select(func.count(Prediction.id)).where(Prediction.risk_level == "Low")
    low_result = await db.execute(low_query)
    low = low_result.scalar() or 0

    positive_query = select(func.count(Prediction.id)).where(Prediction.probability >= 50)
    positive_result = await db.execute(positive_query)
    positive = positive_result.scalar() or 0
    negative = total - positive

    return StatsResponse(
        total_predictions=total,
        high_risk_cases=high,
        moderate_risk_cases=moderate,
        low_risk_cases=low,
        negative_cases=negative,
        positive_cases=positive,
        model_accuracy_pct=92.4,
        model_name=ml_service.model_name
    )
