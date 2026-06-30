from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.db.database import get_db
from app.models.models import TriageCase, Prediction, Patient, User
from app.schemas.schemas import TriageCaseResponse, TriageUpdate
from app.api.v1.deps import get_current_user
from app.services.redis_service import publish_event

router = APIRouter()


@router.get("/", response_model=List[TriageCaseResponse])
async def list_triage_cases(
    status_filter: str = "pending",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = (
        select(TriageCase, Prediction, Patient)
        .join(Prediction, Prediction.id == TriageCase.prediction_id)
        .join(Patient, Patient.id == Prediction.patient_id)
        .where(TriageCase.status == status_filter)
        .order_by(TriageCase.priority.asc(), TriageCase.created_at.asc())
    )
    rows = (await db.execute(query)).all()
    return [
        TriageCaseResponse(
            id=t.id,
            prediction_id=p.id,
            patient_name=pat.name,
            patient_uid=pat.patient_uid,
            risk_probability=p.probability,
            risk_level=p.risk_level,
            status=t.status,
            priority=t.priority,
            notes=t.notes,
            created_at=t.created_at,
        )
        for t, p, pat in rows
    ]


@router.patch("/{triage_id}", response_model=TriageCaseResponse)
async def update_triage_case(
    triage_id: int,
    update: TriageUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    row = (await db.execute(
        select(TriageCase, Prediction, Patient)
        .join(Prediction).join(Patient)
        .where(TriageCase.id == triage_id)
    )).first()
    if not row:
        raise HTTPException(status_code=404, detail="Triage case not found")

    triage, pred, patient = row
    if update.status:
        triage.status = update.status
    if update.notes is not None:
        triage.notes = update.notes
    if update.assigned_to is not None:
        triage.assigned_to = update.assigned_to

    await db.commit()
    await db.refresh(triage)
    await publish_event("triage_updates", {"type": "updated", "triage_id": triage_id, "status": triage.status})

    return TriageCaseResponse(
        id=triage.id,
        prediction_id=pred.id,
        patient_name=patient.name,
        patient_uid=patient.patient_uid,
        risk_probability=pred.probability,
        risk_level=pred.risk_level,
        status=triage.status,
        priority=triage.priority,
        notes=triage.notes,
        created_at=triage.created_at,
    )
