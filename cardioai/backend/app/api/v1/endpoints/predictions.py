from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
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
    # 1. Create Patient Record if new, or update existing
    # For now, we create a new patient entry for every unique assessment as requested
    patient = Patient(
        name=payload.patient_name,
        age=payload.age,
        sex=payload.sex
    )
    db.add(patient)
    await db.flush() # get patient.id without committing yet
    
    # 2. Run ML Inference
    features = payload.dict(exclude={'patient_name'})
    result = ml_service.predict(features)
    
    # 3. Persist Prediction Result
    prediction = Prediction(
        patient_id=patient.id,
        probability=result["risk_probability"],
        risk_level=result["risk_level"],
        features_json=str(features) # snapshot for audit trail
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

@router.post("/predict/guest", response_model=DiagnosticResponse)
async def run_guest_diagnostic(payload: DiagnosticInput):
    """
    Ephemeral prediction without database persistence.
    Used for quick clinical screening.
    """
    features = payload.dict(exclude={'patient_name'})
    result = ml_service.predict(features)
    
    return {
        "risk_probability": result["risk_probability"],
        "risk_level": result["risk_level"],
        "patient_id": 0,
        "prediction_id": 0
    }
