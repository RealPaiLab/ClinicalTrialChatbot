"""Conversation-history persistence interface."""

from __future__ import annotations

from abc import ABC, abstractmethod

from pydantic_ai.messages import ModelMessage


class BaseConversationRepository(ABC):
    """Stores and retrieves conversation history."""

    @abstractmethod
    async def get(self, session_id: str) -> list[ModelMessage]:
        """Return the session's messages, or an empty list if none/expired."""

    @abstractmethod
    async def save(self, session_id: str, messages: list[ModelMessage]) -> None:
        """Persist the session's full message history."""

    @abstractmethod
    async def clear(self, session_id: str) -> None:
        """Drop the session's history."""
