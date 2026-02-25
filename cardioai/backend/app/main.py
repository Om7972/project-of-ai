"""
CardioAI Hospital System — FastAPI Application Entry Point
Author: CardioAI Team
"""

import logging
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.core.config import settings
from app.db.database import init_db, get_db
from app.api.routes import auth, predictions
from app.services.ml_service import ml_service
from app.schemas.schemas import HealthResponse, PatientResponse
from app.models.models import Patient
# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s — %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


# ── Lifespan ──────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🫀  Starting %s v%s", settings.APP_NAME, settings.APP_VERSION)
    await init_db()
    logger.info("✅  PostgreSQL tables ready")
    logger.info(
        "🤖  ML Model status: %s",
        "Loaded ✅" if ml_service.is_model_loaded else "Heuristic fallback ⚠️",
    )
    yield
    logger.info("👋  %s shutting down gracefully", settings.APP_NAME)


# ── Application ───────────────────────────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "## 🫀 CardioAI Hospital System\n\n"
        "AI-powered **Cardiac Disease Prediction** API built on XGBoost.\n\n"
        "### Key Endpoints\n"
        "- `POST /api/v1/predictions/predict` — Authenticated prediction (saved to DB)\n"
        "- `POST /api/v1/predictions/predict/guest` — Quick prediction (not saved)\n"
        "- `POST /api/v1/auth/register` — Register a new user\n"
        "- `POST /api/v1/auth/login`    — Get JWT token\n"
        "- `GET  /api/health`           — Health check\n\n"
        "### Risk Classification\n"
        "| Level | Probability |\n"
        "|-------|-------------|\n"
        "| Low | < 40% |\n"
        "| Moderate | 40–65% |\n"
        "| High | ≥ 65% |\n"
    ),
    contact={
        "name":  "CardioAI Support",
        "email": "support@cardioai.hospital",
    },
    license_info={
        "name":  "MIT",
        "url":   "https://opensource.org/licenses/MIT",
    },
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)


# ══════════════════════════════════════════════════════════════════════════════
#  Middleware
# ══════════════════════════════════════════════════════════════════════════════

# ── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,   # configured via ALLOWED_ORIGINS env var
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID", "X-Response-Time"],
)


# ── Request timing middleware ─────────────────────────────────────────────────
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    elapsed = round((time.perf_counter() - start) * 1000, 2)
    response.headers["X-Response-Time"] = f"{elapsed}ms"
    return response


# ══════════════════════════════════════════════════════════════════════════════
#  Global Exception Handlers
# ══════════════════════════════════════════════════════════════════════════════

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Return clean 422 errors with field-level messages."""
    errors = []
    for err in exc.errors():
        errors.append({
            "field":   " → ".join(str(loc) for loc in err["loc"]),
            "message": err["msg"],
            "type":    err["type"],
        })
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Input validation failed",
            "errors": errors,
        },
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception on %s: %s", request.url.path, exc, exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error. Please contact support."},
    )


# ══════════════════════════════════════════════════════════════════════════════
#  Routers
# ══════════════════════════════════════════════════════════════════════════════

app.include_router(auth.router,        prefix="/api/v1")
app.include_router(predictions.router, prefix="/api/v1")


# ── Global Predict Endpoint (Direct) ─────────────────────────────────────────

@app.post(
    "/predict",
    tags=["API"],
    summary="Direct Predict",
    description="Direct endpoint for cardiac disease prediction (Guest). Saves to Postgres.",
)
async def direct_predict(
    data: predictions.PatientInput,
    db: AsyncSession = Depends(get_db)
):
    """
    Direct prediction endpoint. Runs inference and persists result to 'patients' table.
    """
    result = ml_service.predict(data.feature_vector)
    
    # Save to database
    record = Patient(
        name=data.patient_name,
        age=data.age,
        sex=data.sex,
        prediction_probability=result["risk_probability"],
        risk_level=result["risk_level"]
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)

    return {
        "risk_probability": result["risk_probability"],
        "risk_level":       result["risk_level"],
        "id":               record.id
    }


@app.get(
    "/patients",
    response_model=List[PatientResponse],
    tags=["API"],
    summary="Get All Patients",
    description="Returns all prediction records from the database."
)
async def get_patients(db: AsyncSession = Depends(get_db)):
    """Fetch all records from the patients table."""
    result = await db.execute(select(Patient).order_by(Patient.created_at.desc()))
    return result.scalars().all()


# ══════════════════════════════════════════════════════════════════════════════
#  Base Endpoints
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/", tags=["Root"], include_in_schema=False)
async def root():
    return {
        "app":     settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs":    "/api/docs",
        "health":  "/api/health",
    }


@app.get(
    "/api/health",
    response_model=HealthResponse,
    tags=["System"],
    summary="Health Check",
)
async def health_check() -> HealthResponse:
    """Returns application health status and model load state."""
    return HealthResponse(
        status="healthy",
        app_name=settings.APP_NAME,
        version=settings.APP_VERSION,
        model_loaded=ml_service.is_model_loaded,
    )
