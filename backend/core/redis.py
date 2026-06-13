"""Lazy async Redis client."""

from functools import lru_cache

from redis.asyncio import Redis, from_url

from core.config import get_settings


@lru_cache
def get_redis_client() -> Redis:
    """Shared async Redis client built from settings.redis_url (bytes responses)."""
    return from_url(get_settings().redis_url)
