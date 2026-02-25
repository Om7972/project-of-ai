"""
/api/v1/predict  — Core cardiac disease prediction endpoint.
"""

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func
from typing import List
from uuid import UUID
from datetime import datetime

from app.db.database import get_db
from app.models.models import User, Prediction
from app.schemas.schemas import (
    PatientInput,
    PredictionResult,
    SavedPredictionResponse,
)
from app.services.ml_service import ml_service
from app.api.routes.auth import get_current_user

router = APIRouter(prefix="/predictions", tags=["Cardiac Prediction"])


# ══════════════════════════════════════════════════════════════════════════════
#  POST /predict  — Primary endpoint
# ══════════════════════════════════════════════════════════════════════════════

@router.post(
    "/predict",
    response_model=PredictionResult,
    status_code=200,
    summary="Predict Cardiac Disease Risk",
    description=(
        "Submit 13 clinical features to receive an XGBoost-powered cardiac "
        "disease risk assessment.\n\n"
        "**Risk levels:**\n"
        "- `Low` (< 40 %)\n"
        "- `Moderate` (40 – 65 %)\n"
        "- `High` (≥ 65 %)\n"
    ),
)
async def predict_cardiac_risk(
    data: PatientInput,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PredictionResult:
    """
    Run prediction and persist result to PostgreSQL.
    Requires a valid JWT Bearer token.
    """
    # ── Run inference ─────────────────────────────────────────────────────────
    result = ml_service.predict(data.feature_vector)

    # ── Persist to DB ─────────────────────────────────────────────────────────
    record = Prediction(
        user_id=current_user.id,
        patient_name=data.patient_name,
        patient_age=data.age,
        patient_gender=data.patient_gender,
        age=data.age, sex=data.sex, cp=data.cp,
        trestbps=data.trestbps, chol=data.chol, fbs=data.fbs,
        restecg=data.restecg, thalach=data.thalach, exang=data.exang,
        oldpeak=data.oldpeak, slope=data.slope, ca=data.ca, thal=data.thal,
        prediction=result["prediction"],
        probability=result["confidence"],
        risk_level=result["risk_level"],
        notes=data.notes,
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)

    # ── Build response ────────────────────────────────────────────────────────
    return PredictionResult(
        **result,
        patient_name=data.patient_name,
        patient_gender=data.patient_gender,
        age=data.age, sex=data.sex, cp=data.cp,
        trestbps=data.trestbps, chol=data.chol, fbs=data.fbs,
        restecg=data.restecg, thalach=data.thalach, exang=data.exang,
        oldpeak=data.oldpeak, slope=data.slope, ca=data.ca, thal=data.thal,
        notes=data.notes,
        timestamp=record.created_at,
    )


# ── Public (no-auth) quick predict ───────────────────────────────────────────
@router.post(
    "/predict/guest",
    response_model=PredictionResult,
    status_code=200,
    summary="Quick Predict (Guest — not saved)",
    description="Predict without authentication. Result is **not** saved to the database.",
)
async def predict_guest(data: PatientInput) -> PredictionResult:
    result = ml_service.predict(data.feature_vector)
    return PredictionResult(
        **result,
        patient_name=data.patient_name,
        patient_gender=data.patient_gender,
        age=data.age, sex=data.sex, cp=data.cp,
        trestbps=data.trestbps, chol=data.chol, fbs=data.fbs,
        restecg=data.restecg, thalach=data.thalach, exang=data.exang,
        oldpeak=data.oldpeak, slope=data.slope, ca=data.ca, thal=data.thal,
        notes=data.notes,
    )


# ══════════════════════════════════════════════════════════════════════════════
#  History & Analytics
# ══════════════════════════════════════════════════════════════════════════════

@router.get(
    "/",
    response_model=List[SavedPredictionResponse],
    summary="List Prediction History",
)
async def list_predictions(
    skip:  int = 0,
    limit: int = 20,
    db:    AsyncSession      = Depends(get_db),
    current_user: User       = Depends(get_current_user),
) -> List[SavedPredictionResponse]:
    query = (
        select(Prediction)
        .order_by(desc(Prediction.created_at))
        .offset(skip)
        .limit(limit)
    )
    if current_user.role.value == "patient":
        query = query.where(Prediction.user_id == current_user.id)

    result = await db.execute(query)
    return result.scalars().all()


@router.get(
    "/stats",
    summary="Dashboard Statistics",
)
async def get_dashboard_stats(
    db:           AsyncSession = Depends(get_db),
    current_user: User         = Depends(get_current_user),
) -> dict:
    """Aggregate stats for the current user (or all, for doctors/admins)."""
    base = select(Prediction)
    if current_user.role.value == "patient":
        base = base.where(Prediction.user_id == current_user.id)

    total    = (await db.execute(select(func.count()).select_from(base.subquery()))).scalar()
    positive = (await db.execute(
        select(func.count()).select_from(base.where(Prediction.prediction == 1).subquery())
    )).scalar()
    high_risk = (await db.execute(
        select(func.count()).select_from(
            base.where(Prediction.risk_level.in_(["High", "critical"])).subquery()
        )
    )).scalar()

    return {
        "total_predictions":  total,
        "positive_cases":     positive,
        "negative_cases":     total - positive,
        "high_risk_cases":    high_risk,
        "model_accuracy_pct": 91.8,
        "model_name":         "XGBoost (advanced_heart_model.pkl)",
    }


@router.get(
    "/{prediction_id}",
    response_model=SavedPredictionResponse,
    summary="Get Single Prediction",
)
async def get_prediction(
    prediction_id: UUID,
    db:            AsyncSession = Depends(get_db),
    current_user:  User         = Depends(get_current_user),
) -> SavedPredictionResponse:
    result = await db.execute(
        select(Prediction).where(Prediction.id == prediction_id)
    )
    pred = result.scalars().first()
    if not pred:
        raise HTTPException(status_code=404, detail="Prediction not found")
    if current_user.role.value == "patient" and pred.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    return pred


@router.delete("/{prediction_id}", status_code=204, summary="Delete Prediction")
async def delete_prediction(
    prediction_id: UUID,
    db:            AsyncSession = Depends(get_db),
    current_user:  User         = Depends(get_current_user),
):
    result = await db.execute(
        select(Prediction).where(Prediction.id == prediction_id)
    )
    pred = result.scalars().first()
    if not pred:
        raise HTTPException(status_code=404, detail="Prediction not found")
    if current_user.role.value == "patient" and pred.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    await db.delete(pred)
    await db.commit()
