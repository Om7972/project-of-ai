import csv
import io
import json
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.database import get_db
from app.models.models import BatchJob, Patient, Prediction
from app.schemas.schemas import BatchJobResponse, DiagnosticInput
from app.services.ml_service import ml_service
from app.services.explain_service import explain_prediction
from app.api.v1.deps import get_current_user

router = APIRouter()

REQUIRED_COLUMNS = {"patient_name", "age", "gender", "height", "weight", "ap_hi", "ap_lo",
                    "cholesterol", "gluc", "smoke", "alco", "active"}


@router.post("/upload", response_model=BatchJobResponse)
async def upload_batch_csv(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted")

    content = await file.read()
    try:
        text = content.decode("utf-8")
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="Invalid file encoding. Use UTF-8.")

    reader = csv.DictReader(io.StringIO(text))
    if not reader.fieldnames or not REQUIRED_COLUMNS.issubset(set(reader.fieldnames)):
        missing = REQUIRED_COLUMNS - set(reader.fieldnames or [])
        raise HTTPException(status_code=400, detail=f"Missing CSV columns: {', '.join(missing)}")

    rows = list(reader)
    job = BatchJob(user_id=current_user.id, status="processing", total_rows=len(rows))
    db.add(job)
    await db.flush()

    results = []
    processed = 0
    for row in rows:
        try:
            payload = DiagnosticInput(**{k: row[k] for k in REQUIRED_COLUMNS})
            features = payload.model_dump(exclude={"patient_uid"})
            result = ml_service.predict(features)
            explain = explain_prediction(features, ml_service)

            patient = Patient(name=payload.patient_name, age=payload.age, gender=payload.gender)
            db.add(patient)
            await db.flush()

            pred = Prediction(
                patient_id=patient.id,
                user_id=current_user.id,
                probability=result["risk_probability"],
                risk_level=result["risk_level"],
                features_json=json.dumps(features),
                explain_json=json.dumps(explain),
            )
            db.add(pred)
            await db.flush()

            results.append({
                "row": processed + 1,
                "patient_name": payload.patient_name,
                "patient_uid": patient.patient_uid,
                "risk_probability": result["risk_probability"],
                "risk_level": result["risk_level"],
                "prediction_id": pred.id,
            })
            processed += 1
        except Exception as e:
            results.append({"row": processed + 1, "error": str(e)})

    job.status = "completed"
    job.processed_rows = processed
    job.results_json = json.dumps(results)
    job.completed_at = datetime.utcnow()
    await db.commit()
    await db.refresh(job)
    return job


@router.get("/{job_id}", response_model=BatchJobResponse)
async def get_batch_job(
    job_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    job = (await db.execute(select(BatchJob).where(BatchJob.id == job_id))).scalars().first()
    if not job:
        raise HTTPException(status_code=404, detail="Batch job not found")
    if job.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    return job


@router.get("/{job_id}/results")
async def get_batch_results(
    job_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    job = (await db.execute(select(BatchJob).where(BatchJob.id == job_id))).scalars().first()
    if not job:
        raise HTTPException(status_code=404, detail="Batch job not found")
    if job.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    return json.loads(job.results_json) if job.results_json else []
