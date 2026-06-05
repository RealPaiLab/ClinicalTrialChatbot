import time

import pytest
from pydantic_ai.messages import ModelRequest, ModelResponse, TextPart, UserPromptPart

from core.config import get_settings
from repository.conversation import factory as factory_module
from repository.conversation.factory import (
    _REPOSITORY_BUILDERS,
    get_conversation_repository,
)
from repository.conversation.memory_repository import InMemoryConversationRepository
from repository.conversation.redis_repository import RedisConversationRepository
from services.conversation_service import ConversationService


def _messages() -> list[ModelRequest | ModelResponse]:
    return [
        ModelRequest(parts=[UserPromptPart(content="hi")]),
        ModelResponse(parts=[TextPart(content="hello")]),
    ]


async def test_memory_round_trip() -> None:
    repo = InMemoryConversationRepository(ttl_seconds=3600)
    assert await repo.get("s") == []
    await repo.save("s", _messages())
    assert len(await repo.get("s")) == 2
    await repo.clear("s")
    assert await repo.get("s") == []


async def test_memory_ttl_expiry(monkeypatch: pytest.MonkeyPatch) -> None:
    repo = InMemoryConversationRepository(ttl_seconds=10)
    clock = {"now": 1000.0}
    monkeypatch.setattr(time, "monotonic", lambda: clock["now"])
    await repo.save("s", _messages())
    clock["now"] = 1005.0
    assert len(await repo.get("s")) == 2
    clock["now"] = 1011.0
    assert await repo.get("s") == []


async def test_conversation_service_delegates() -> None:
    service = ConversationService(InMemoryConversationRepository(ttl_seconds=3600))
    await service.save_history("s", _messages())
    assert len(await service.get_history("s")) == 2
    await service.reset("s")
    assert await service.get_history("s") == []


def test_factory_builds_memory_repository() -> None:
    repo = _REPOSITORY_BUILDERS["memory"](get_settings())
    assert isinstance(repo, InMemoryConversationRepository)


def test_get_conversation_repository_default_is_memory() -> None:
    get_conversation_repository.cache_clear()
    assert isinstance(get_conversation_repository(), InMemoryConversationRepository)


def test_get_conversation_repository_unknown_store_raises(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    fake = type("S", (), {"conversation_store": "bogus", "conversation_ttl_seconds": 1})
    monkeypatch.setattr(factory_module, "get_settings", fake)
    get_conversation_repository.cache_clear()
    with pytest.raises(ValueError):
        get_conversation_repository()
    get_conversation_repository.cache_clear()


def test_redis_repository_is_abstract_stub() -> None:
    with pytest.raises(TypeError):
        RedisConversationRepository()  # type: ignore[abstract]
