"""Selects the configured key-value store (process-singleton)."""

from __future__ import annotations

from collections.abc import Callable
from functools import lru_cache

from core.config import get_settings
from core.kv.base import KeyValueStore
from core.kv.memory import InMemoryKeyValueStore
from core.kv.redis import RedisKeyValueStore
from core.redis import get_redis_client


def _build_memory() -> KeyValueStore:
    return InMemoryKeyValueStore()


def _build_redis() -> KeyValueStore:
    return RedisKeyValueStore(get_redis_client())


_STORE_BUILDERS: dict[str, Callable[[], KeyValueStore]] = {
    "memory": _build_memory,
    "redis": _build_redis,
}


@lru_cache
def get_key_value_store() -> KeyValueStore:
    """Build the store named by settings.conversation_store."""
    configured = get_settings().conversation_store
    try:
        build = _STORE_BUILDERS[configured]
    except KeyError as exc:
        raise ValueError(
            f"Unsupported conversation_store {configured!r}; "
            f"expected one of {sorted(_STORE_BUILDERS)}"
        ) from exc
    return build()
