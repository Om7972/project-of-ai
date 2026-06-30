from fastapi import APIRouter
from app.api.v1.endpoints import auth, predictions, triage, audit, batch, ws

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(predictions.router, prefix="/predictions", tags=["Clinical Inferences"])
api_router.include_router(triage.router, prefix="/triage", tags=["Triage Queue"])
api_router.include_router(audit.router, prefix="/audit", tags=["Audit Trail"])
api_router.include_router(batch.router, prefix="/batch", tags=["Batch Screening"])
api_router.include_router(ws.router, prefix="/ws", tags=["WebSocket"])
