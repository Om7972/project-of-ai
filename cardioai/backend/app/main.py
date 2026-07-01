import time
import logging
from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from fastapi.exceptions import RequestValidationError
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from sqlalchemy import text

from app.core.config import settings
from app.db.database import init_db, engine
from app.core.rate_limit import limiter
from app.api.v1.api import api_router
from app.services.ml_service import ml_service
from app.services.redis_service import redis_health, close_redis
from app.schemas.schemas import HealthResponse

logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format='{"time":"%(asctime)s","level":"%(levelname)s","logger":"%(name)s","msg":"%(message)s"}',
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting %s v%s", settings.APP_NAME, settings.APP_VERSION)
    try:
        await init_db()
        logger.info("Database initialized")
    except Exception as e:
        logger.error("Database init failed: %s", e)

    redis_ok = await redis_health()
    logger.info("ML Service: %s | Redis: %s",
                "loaded" if ml_service.is_model_loaded else "fallback",
                "connected" if redis_ok else "unavailable")
    yield
    await close_redis()
    logger.info("Shutdown complete")


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

# CORS must wrap the entire app — added last so it runs first on every request/response
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Process-Time-MS"],
)

app.add_middleware(SlowAPIMiddleware)


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    ms = (time.time() - start) * 1000
    response.headers["X-Process-Time-MS"] = f"{ms:.2f}"
    return response


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "Clinical data validation failed.", "errors": exc.errors()},
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    origin = request.headers.get("origin", "")
    headers = {}
    if origin in settings.origins_list:
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal clinical system fault occurred."},
        headers=headers,
    )


app.include_router(api_router, prefix="/api/v1")


@app.get("/", tags=["Root"])
async def root():
    return {"app": settings.APP_NAME, "version": settings.APP_VERSION, "docs": "/api/docs"}


@app.get("/api/health", response_model=HealthResponse, tags=["Monitoring"])
async def health_check():
    db_ok = False
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        pass

    redis_ok = await redis_health()
    all_ok = db_ok and (not settings.REDIS_ENABLED or redis_ok)

    return HealthResponse(
        status="Operational" if all_ok else "Degraded",
        version=settings.APP_VERSION,
        model_loaded=ml_service.is_model_loaded,
        db_connected=db_ok,
        redis_connected=redis_ok,
        timestamp=datetime.utcnow(),
    )


@app.get("/api/metrics", tags=["Monitoring"])
async def prometheus_metrics():
    try:
        from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
        return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)
    except ImportError:
        return JSONResponse(content={"detail": "Prometheus client not installed"}, status_code=501)
