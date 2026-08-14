"""A session's conversation history and agent scratchpad, over a key-value store."""

from __future__ import annotations

from pydantic import ValidationError
from pydantic_ai.messages import ModelMessage, ModelMessagesTypeAdapter

from core.kv.base import KeyValueStore
from core.logger import get_logger
from schemas.memory import ConversationMemory

logger = get_logger(__name__)

_KEY_VERSION = "v1"


def _history_key(session_id: str) -> str:
    return f"conv:{_KEY_VERSION}:{session_id}:history"


def _memory_key(session_id: str) -> str:
    return f"conv:{_KEY_VERSION}:{session_id}:memory"


class ConversationRepository:
    """Serializes a session's messages and scratchpad under one TTL."""

    def __init__(self, store: KeyValueStore, *, ttl_seconds: int) -> None:
        self._store = store
        self._ttl_seconds = ttl_seconds

    async def get_conversation(self, session_id: str) -> list[ModelMessage]:
        """Return the session's messages, or an empty list if none/expired."""
        raw = await self._store.get(_history_key(session_id))
        if raw is None:
            return []
        try:
            return ModelMessagesTypeAdapter.validate_json(raw)
        except ValidationError as exc:
            logger.warning("Stored history is unreadable, dropping it: %s", exc)
            return []

    async def save_conversation(
        self, session_id: str, messages: list[ModelMessage]
    ) -> None:
        """Persist the session's full message history."""
        await self._store.set(
            _history_key(session_id),
            ModelMessagesTypeAdapter.dump_json(messages),
            ttl_seconds=self._ttl_seconds,
        )

    async def get_memory(self, session_id: str) -> ConversationMemory:
        """Return the session's scratchpad, or an empty one if none/expired."""
        raw = await self._store.get(_memory_key(session_id))
        if raw is None:
            return ConversationMemory()
        try:
            return ConversationMemory.model_validate_json(raw)
        except ValidationError as exc:
            logger.warning("Stored scratchpad is unreadable, dropping it: %s", exc)
            return ConversationMemory()

    async def save_memory(self, session_id: str, memory: ConversationMemory) -> None:
        """Persist the session's scratchpad."""
        await self._store.set(
            _memory_key(session_id),
            memory.model_dump_json().encode("utf-8"),
            ttl_seconds=self._ttl_seconds,
        )

    async def clear(self, session_id: str) -> None:
        """Drop the session's history and scratchpad."""
        await self._store.delete(_history_key(session_id), _memory_key(session_id))
