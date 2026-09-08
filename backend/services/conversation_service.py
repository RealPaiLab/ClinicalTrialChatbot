"""Session conversation-history lifecycle."""

from __future__ import annotations

from collections.abc import Iterator

from pydantic_ai.messages import (
    ModelMessage,
    ModelRequest,
    ModelResponse,
    TextPart,
    UserPromptPart,
)

from repository.conversation.repository import ConversationRepository
from schemas.memory import ConversationMemory


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


def turn_count(history: list[ModelMessage]) -> int:
    """How many patient turns the stored history already holds."""
    return sum(
        1
        for msg in history
        if isinstance(msg, ModelRequest)
        and any(isinstance(part, UserPromptPart) for part in msg.parts)
    )


def _without_tool_parts(messages: list[ModelMessage]) -> Iterator[ModelMessage]:
    """Rebuild history keeping only patient prompts and assistant text."""
    for msg in messages:
        if isinstance(msg, ModelRequest):
            prompts = [p for p in msg.parts if isinstance(p, UserPromptPart)]
            if prompts:
                yield ModelRequest(parts=prompts)
        elif isinstance(msg, ModelResponse):
            texts = [p for p in msg.parts if isinstance(p, TextPart)]
            if texts:
                yield ModelResponse(parts=texts)


def user_facing_turns(history: list[ModelMessage], turns: int) -> list[ModelMessage]:
    """Last `turns` patient turns with tool calls/returns stripped."""
    return list(_without_tool_parts(recent_turns(history, turns)))


class ConversationService:
    """Loads, persists, and resets a session's message history."""

    def __init__(self, conversation_repository: ConversationRepository) -> None:
        self._conversation_repository = conversation_repository

    async def get_history(self, session_id: str) -> list[ModelMessage]:
        return await self._conversation_repository.get_conversation(session_id)

    async def save_history(self, session_id: str, messages: list[ModelMessage]) -> None:
        await self._conversation_repository.save_conversation(session_id, messages)

    async def get_memory(self, session_id: str) -> ConversationMemory:
        return await self._conversation_repository.get_memory(session_id)

    async def save_memory(self, session_id: str, memory: ConversationMemory) -> None:
        await self._conversation_repository.save_memory(session_id, memory)

    async def reset(self, session_id: str) -> None:
        await self._conversation_repository.clear(session_id)
