import json
import logging
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import AuditLog

logger = logging.getLogger(__name__)


async def log_action(
    db: AsyncSession,
    action: str,
    user_id: Optional[int] = None,
    resource: Optional[str] = None,
    resource_id: Optional[str] = None,
    ip_address: Optional[str] = None,
    details: Optional[dict] = None,
) -> None:
    try:
        entry = AuditLog(
            user_id=user_id,
            action=action,
            resource=resource,
            resource_id=str(resource_id) if resource_id is not None else None,
            ip_address=ip_address,
            details=json.dumps(details) if details else None,
        )
        db.add(entry)
        await db.flush()
    except Exception as e:
        logger.error("Audit log failed: %s", e)
