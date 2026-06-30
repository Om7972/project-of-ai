import json
import logging
from typing import Any, Optional

from app.core.config import settings

logger = logging.getLogger(__name__)

_redis = None


async def get_redis():
    global _redis
    if not settings.REDIS_ENABLED:
        return None
    if _redis is None:
        try:
            import redis.asyncio as aioredis
            _redis = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
            await _redis.ping()
            logger.info("Redis connected")
        except Exception as e:
            logger.warning("Redis unavailable: %s", e)
            _redis = None
    return _redis


async def redis_health() -> bool:
    try:
        client = await get_redis()
        if client is None:
            return False
        await client.ping()
        return True
    except Exception:
        return False


async def publish_event(channel: str, payload: dict) -> None:
    client = await get_redis()
    if client:
        try:
            await client.publish(channel, json.dumps(payload))
        except Exception as e:
            logger.warning("Redis publish failed: %s", e)


async def cache_get(key: str) -> Optional[str]:
    client = await get_redis()
    if client:
        try:
            return await client.get(key)
        except Exception:
            pass
    return None


async def cache_set(key: str, value: str, ttl: int = 300) -> None:
    client = await get_redis()
    if client:
        try:
            await client.setex(key, ttl, value)
        except Exception:
            pass


async def close_redis() -> None:
    global _redis
    if _redis:
        await _redis.close()
        _redis = None
