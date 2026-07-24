"""Session conversation-history lifecycle."""

from __future__ import annotations

from pydantic_ai.messages import ModelMessage, ModelRequest, UserPromptPart

from repository.conversation.base import BaseConversationRepository


def recent_turns(history: list[ModelMessage], turns: int) -> list[ModelMessage]:
    """Window history to its last `turns` patient turns, sliced on a user boundary."""
    if not history or turns <= 0:
        return []
    seen = 0
    for i in range(len(history) - 1, -1, -1):
        msg = history[i]
        if isinstance(msg, ModelRequest) and any(
            isinstance(part, UserPromptPart) for part in msg.parts
        ):
            seen += 1
            if seen >= turns:
                return history[i:]
    return history


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
