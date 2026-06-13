"""Selects the configured conversation repository (process-singleton)."""

from __future__ import annotations

from collections.abc import Callable
from functools import lru_cache

from core.config import Settings, get_settings
from repository.conversation.base import BaseConversationRepository
from repository.conversation.memory_repository import InMemoryConversationRepository


def _build_memory(settings: Settings) -> BaseConversationRepository:
    return InMemoryConversationRepository(settings.conversation_ttl_seconds)


_REPOSITORY_BUILDERS: dict[str, Callable[[Settings], BaseConversationRepository]] = {
    "memory": _build_memory,
}


@lru_cache
def get_conversation_repository() -> BaseConversationRepository:
    """Build the repository."""
    settings = get_settings()
    try:
        build = _REPOSITORY_BUILDERS[settings.conversation_store]
    except KeyError as exc:
        raise ValueError(
            f"Unsupported conversation_store {settings.conversation_store!r}; "
            f"expected one of {sorted(_REPOSITORY_BUILDERS)}"
        ) from exc
    return build(settings)
