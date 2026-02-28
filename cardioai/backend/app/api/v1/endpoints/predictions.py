from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.db.database import get_db
from app.models.models import Patient, Prediction
from app.schemas.schemas import DiagnosticInput, DiagnosticResponse
from app.services.ml_service import ml_service
from app.api.v1.deps import get_current_user

router = APIRouter()

@router.post("/predict", response_model=DiagnosticResponse)
async def run_diagnostic(
    payload: DiagnosticInput,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Hospital-grade cardiac diagnostic.
    Runs XGBoost inference and persists results to the clinical database.
    (Authenticated)
    """
    patient = Patient(
        name=payload.patient_name,
        age=payload.age,
        sex=payload.gender
    )
    db.add(patient)
    await db.flush() 
    
    features = payload.model_dump(exclude={'patient_name'})
    result = ml_service.predict(features)
    
    prediction = Prediction(
        patient_id=patient.id,
        probability=result["risk_probability"],
        risk_level=result["risk_level"],
        features_json=str(features)
    )
    db.add(prediction)
    
    try:
        await db.commit()
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database persistent failure: {str(e)}"
        )
        
    return {
        "risk_probability": result["risk_probability"],
        "risk_level": result["risk_level"],
        "patient_id": patient.id,
        "prediction_id": prediction.id
    }

@router.get("/history", tags=["Analytics"])
async def get_diagnostic_history(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Fetch complete clinical diagnostic history with patient joins."""
    query = select(Patient, Prediction).join(Prediction, Patient.id == Prediction.patient_id).order_by(Prediction.created_at.desc())
    result = await db.execute(query)
    
    history = []
    for patient, pred in result.all():
        history.append({
            "id": pred.id,
            "name": patient.name,
            "age": patient.age,
            "sex": patient.sex,
            "prediction_probability": pred.probability,
            "risk_level": pred.risk_level,
            "created_at": pred.created_at
        })
    return history
