from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.db.database import get_db
from app.models.models import AuditLog, User
from app.schemas.schemas import AuditLogResponse
from app.api.v1.deps import check_admin_role

router = APIRouter()


@router.get("/", response_model=List[AuditLogResponse])
async def list_audit_logs(
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    admin_user=Depends(check_admin_role),
):
    query = (
        select(AuditLog, User.name)
        .outerjoin(User, User.id == AuditLog.user_id)
        .order_by(AuditLog.created_at.desc())
        .offset(skip).limit(min(limit, 200))
    )
    rows = (await db.execute(query)).all()
    return [
        AuditLogResponse(
            id=log.id,
            user_id=log.user_id,
            user_name=name,
            action=log.action,
            resource=log.resource,
            resource_id=log.resource_id,
            ip_address=log.ip_address,
            details=log.details,
            created_at=log.created_at,
        )
        for log, name in rows
    ]
