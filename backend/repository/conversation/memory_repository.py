"""In-memory conversation history."""

from __future__ import annotations

import time

from pydantic_ai.messages import ModelMessage

from repository.conversation.base import BaseConversationRepository


class InMemoryConversationRepository(BaseConversationRepository):
    """Holds histories in a dict."""

    def __init__(self, ttl_seconds: int) -> None:
        self._ttl_seconds = ttl_seconds
        self._store: dict[str, tuple[float, list[ModelMessage]]] = {}

    async def get(self, session_id: str) -> list[ModelMessage]:
        entry = self._store.get(session_id)
        if entry is None:
            return []
        expires_at, messages = entry
        if time.monotonic() >= expires_at:
            del self._store[session_id]
            return []
        return list(messages)

    async def save(self, session_id: str, messages: list[ModelMessage]) -> None:
        self._store[session_id] = (time.monotonic() + self._ttl_seconds, list(messages))

    async def clear(self, session_id: str) -> None:
        self._store.pop(session_id, None)
