import time

import pytest
from pydantic_ai.messages import (
    ModelRequest,
    ModelResponse,
    TextPart,
    ToolCallPart,
    ToolReturnPart,
    UserPromptPart,
)

from agents.clinical_trials.guards import conversation_nct_numbers
from core.kv import factory as kv_factory
from core.kv.base import KeyValueStore
from core.kv.factory import _STORE_BUILDERS, get_key_value_store
from core.kv.memory import InMemoryKeyValueStore
from core.kv.redis import RedisKeyValueStore
from repository.conversation.repository import ConversationRepository
from schemas.memory import ConversationMemory
from services.conversation_service import ConversationService
from tests.factories import FakeRedis


def _messages() -> list[ModelRequest | ModelResponse]:
    return [
        ModelRequest(parts=[UserPromptPart(content="hi")]),
        ModelResponse(parts=[TextPart(content="hello")]),
    ]


def _scratchpad() -> ConversationMemory:
    memory = ConversationMemory()
    memory.record(1, "Lives in Thunder Bay")
    return memory


def _repo(store: KeyValueStore | None = None) -> ConversationRepository:
    return ConversationRepository(store or InMemoryKeyValueStore(), ttl_seconds=1800)


def _redis_repo(*, fail: bool = False) -> tuple[ConversationRepository, FakeRedis]:
    """A repository on a fake Redis, plus the fake so a test can inspect the keys."""
    redis = FakeRedis(fail=fail)
    store = RedisKeyValueStore(redis)  # type: ignore[arg-type]
    return _repo(store), redis


async def test_round_trip_history_and_scratchpad() -> None:
    repo = _repo()
    assert await repo.get_conversation("s") == []
    assert (await repo.get_memory("s")).notes == []

    await repo.save_conversation("s", _messages())
    await repo.save_memory("s", _scratchpad())

    history = await repo.get_conversation("s")
    assert [type(m).__name__ for m in history] == ["ModelRequest", "ModelResponse"]
    assert [n.text for n in (await repo.get_memory("s")).notes] == [
        "Lives in Thunder Bay"
    ]

    await repo.clear("s")
    assert await repo.get_conversation("s") == []
    assert (await repo.get_memory("s")).notes == []


async def test_history_survives_tool_parts() -> None:
    """Tool calls and returns must round-trip: conversation_nct_numbers reads them."""
    repo = _repo()
    messages = [
        ModelRequest(parts=[UserPromptPart(content="breast cancer")]),
        ModelResponse(parts=[ToolCallPart("syntactic_search", {}, tool_call_id="c1")]),
        ModelRequest(
            parts=[
                ToolReturnPart(
                    tool_name="syntactic_search",
                    content=[{"nct_number": "NCT03333333"}],
                    tool_call_id="c1",
                )
            ]
        ),
    ]
    await repo.save_conversation("s", messages)  # type: ignore[arg-type]

    assert conversation_nct_numbers(await repo.get_conversation("s")) == {"NCT03333333"}


async def test_stored_session_expires(monkeypatch: pytest.MonkeyPatch) -> None:
    repo = ConversationRepository(InMemoryKeyValueStore(), ttl_seconds=10)
    clock = {"now": 1000.0}
    monkeypatch.setattr(time, "monotonic", lambda: clock["now"])
    await repo.save_conversation("s", _messages())
    await repo.save_memory("s", _scratchpad())

    clock["now"] = 1005.0
    assert len(await repo.get_conversation("s")) == 2
    clock["now"] = 1011.0
    assert await repo.get_conversation("s") == []
    assert (await repo.get_memory("s")).notes == []


async def test_unreadable_payloads_are_dropped() -> None:
    store = InMemoryKeyValueStore()
    repo = _repo(store)
    await repo.save_conversation("s", _messages())
    await repo.save_memory("s", _scratchpad())
    for key in list(store._entries):
        await store.set(key, b"{not json", ttl_seconds=60)

    assert await repo.get_conversation("s") == []
    assert (await repo.get_memory("s")).notes == []


async def test_conversation_service_delegates() -> None:
    service = ConversationService(_repo())
    await service.save_history("s", _messages())
    assert len(await service.get_history("s")) == 2
    await service.save_memory("s", _scratchpad())
    assert len((await service.get_memory("s")).notes) == 1
    await service.reset("s")
    assert await service.get_history("s") == []
    assert (await service.get_memory("s")).notes == []


async def test_redis_store_writes_every_key_with_its_ttl() -> None:
    repo, redis = _redis_repo()
    await repo.save_conversation("s", _messages())
    await repo.save_memory("s", _scratchpad())

    # Redis expires the session itself, so both keys must carry the TTL
    assert sorted(redis.ttls) == [
        "conv:v1:s:history",
        "conv:v1:s:memory",
    ]
    assert set(redis.ttls.values()) == {1800}
    assert len(await repo.get_conversation("s")) == 2

    await repo.clear("s")
    assert redis.store == {}


async def test_redis_outage_degrades_to_an_empty_session() -> None:
    repo, _ = _redis_repo(fail=True)
    await repo.save_conversation("s", _messages())
    await repo.save_memory("s", _scratchpad())
    await repo.clear("s")

    assert await repo.get_conversation("s") == []
    assert (await repo.get_memory("s")).notes == []


def test_factory_builds_each_store(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(kv_factory, "get_redis_client", lambda: FakeRedis())
    assert isinstance(_STORE_BUILDERS["memory"](), InMemoryKeyValueStore)
    assert isinstance(_STORE_BUILDERS["redis"](), RedisKeyValueStore)


def test_get_key_value_store_default_is_memory() -> None:
    get_key_value_store.cache_clear()
    assert isinstance(get_key_value_store(), InMemoryKeyValueStore)


def test_get_key_value_store_unknown_store_raises(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    fake = type("S", (), {"conversation_store": "bogus"})
    monkeypatch.setattr(kv_factory, "get_settings", fake)
    get_key_value_store.cache_clear()
    with pytest.raises(ValueError):
        get_key_value_store()
    get_key_value_store.cache_clear()
