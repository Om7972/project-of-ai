import time
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from datetime import datetime

from app.core.config import settings
from app.db.database import init_db
from app.core.rate_limit import limiter
from app.api.v1.api import api_router
from app.services.ml_service import ml_service
from app.schemas.schemas import HealthResponse

# ── Logging Setup ───────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s : %(message)s",
)
logger = logging.getLogger(__name__)

# ── Lifespan ───────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"🫀  Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    try:
        await init_db()
        logger.info("✅  Database initialization synchronized.")
    except Exception as e:
        logger.error(f"❌  Database synchronization failed: {str(e)}")
    
    logger.info(f"🤖  ML Service status: {'Active ✅' if ml_service.is_model_loaded else 'Fallback Active ⚠️'}")
    yield
    logger.info("👋  System shutting down gracefully.")

# ── Application Instance ────────────────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Hospital-grade AI backend for Cardiovascular Risk Analytics.",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── Middleware ─────────────────────────────────────────────────────────────

# Standard CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Timing & Logging Middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000
    response.headers["X-Process-Time-MS"] = str(process_time)
    logger.info(f"{request.method} {request.url.path} - {response.status_code} ({process_time:.2f}ms)")
    return response

# ── Exception Handlers ──────────────────────────────────────────────────────

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "Clinical data validation failed.", "errors": exc.errors()},
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled fault: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal clinical system fault occurred."},
    )

# ── Routes ─────────────────────────────────────────────────────────────────

app.include_router(api_router, prefix="/api/v1")

@app.get("/", tags=["Root"])
async def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/api/docs"
    }

@app.get("/api/health", response_model=HealthResponse, tags=["Monitoring"])
async def health_check():
    return {
        "status": "Operational",
        "version": settings.APP_VERSION,
        "model_loaded": ml_service.is_model_loaded,
        "db_connected": True, # basic check for endpoint availability
        "timestamp": datetime.utcnow()
    }
