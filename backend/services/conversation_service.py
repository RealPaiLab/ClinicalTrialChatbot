"""Session conversation-history lifecycle."""

from __future__ import annotations

from pydantic_ai.messages import ModelMessage

from repository.conversation.base import BaseConversationRepository


class ConversationService:
    """Loads, persists, and resets a session's message history."""

    def __init__(self, conversation_repository: BaseConversationRepository) -> None:
        self._conversation_repository = conversation_repository

    async def get_history(self, session_id: str) -> list[ModelMessage]:
        return await self._conversation_repository.get(session_id)

    async def save_history(self, session_id: str, messages: list[ModelMessage]) -> None:
        await self._conversation_repository.save(session_id, messages)

    async def reset(self, session_id: str) -> None:
        await self._conversation_repository.clear(session_id)
