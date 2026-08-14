"""Redis-backed key-value store; the server owns expiry."""

from __future__ import annotations

from redis.asyncio import Redis
from redis.exceptions import RedisError

from core.logger import get_logger

logger = get_logger(__name__)


class RedisKeyValueStore:
    """Single-key reads and writes over Redis, degrading on any outage."""

    def __init__(self, redis: Redis) -> None:
        self._redis = redis

    async def get(self, key: str) -> bytes | None:
        try:
            value = await self._redis.get(key)
        except RedisError as exc:
            logger.warning("Redis read failed for %s, treating as miss: %s", key, exc)
            return None
        return value.encode("utf-8") if isinstance(value, str) else value

    async def set(self, key: str, value: bytes, *, ttl_seconds: int) -> None:
        try:
            await self._redis.setex(key, ttl_seconds, value)
        except RedisError as exc:
            logger.warning("Redis write failed for %s, dropping it: %s", key, exc)

    async def delete(self, *keys: str) -> None:
        try:
            await self._redis.delete(*keys)
        except RedisError as exc:
            logger.warning("Redis delete failed for %s: %s", keys, exc)
