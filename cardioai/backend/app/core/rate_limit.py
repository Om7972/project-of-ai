from slowapi import Limiter
from slowapi.util import get_remote_address
from app.core.config import settings

# Use in-memory storage locally; Redis only when explicitly enabled
_storage = settings.REDIS_URL if settings.REDIS_ENABLED else "memory://"

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200/minute"],
    storage_uri=_storage,
)
