import pytest

import services.chat_service as chat_service_module
from agents.clinical_trials.agent import get_clinical_trials_agent
from agents.clinical_trials.output import AgentResponse
from repository.conversation.memory_repository import InMemoryConversationRepository
from schemas.chat import ChatResult
from services.chat_service import ChatService
from services.conversation_service import ConversationService
from tests.factories import StubTrialSearch, make_citation, make_test_model


def _inject_search(monkeypatch: pytest.MonkeyPatch, stub: StubTrialSearch) -> None:
    monkeypatch.setattr(chat_service_module, "TrialSearchService", lambda factory: stub)


def _chat() -> ChatService:
    return ChatService(ConversationService(InMemoryConversationRepository(3600)))


async def test_stream_yields_partials_then_result(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    citation = make_citation("NCT-1")
    _inject_search(
        monkeypatch, StubTrialSearch(results=[citation], by_nct={"NCT-1": citation})
    )
    chat = _chat()
    model = make_test_model(
        call_tools=["search_trials"],
        output={
            "message": "see [NCT-1]",
            "used_nct_numbers": ["NCT-1"],
            "follow_up_questions": ["where are you?"],
        },
    )
    items = []
    with get_clinical_trials_agent().override(model=model):
        async for item in chat.stream_chat("s1", "breast cancer"):
            items.append(item)

    assert any(isinstance(i, AgentResponse) for i in items)
    assert isinstance(items[-1], ChatResult)
    final = items[-1]
    assert [c.nct_number for c in final.trials] == ["NCT-1"]
    assert final.follow_up_questions == ["where are you?"]


async def test_history_persists_across_turns(monkeypatch: pytest.MonkeyPatch) -> None:
    _inject_search(monkeypatch, StubTrialSearch())
    conversation = ConversationService(InMemoryConversationRepository(3600))
    chat = ChatService(conversation)
    model = make_test_model(
        call_tools=[],
        output={"message": "hi", "used_nct_numbers": [], "follow_up_questions": []},
    )
    with get_clinical_trials_agent().override(model=model):
        async for _ in chat.stream_chat("s1", "turn one"):
            pass
        after_first = len(await conversation.get_history("s1"))
        async for _ in chat.stream_chat("s1", "turn two"):
            pass
        after_second = len(await conversation.get_history("s1"))

    assert after_first >= 2
    assert after_second > after_first


async def test_reset_clears_history(monkeypatch: pytest.MonkeyPatch) -> None:
    _inject_search(monkeypatch, StubTrialSearch())
    conversation = ConversationService(InMemoryConversationRepository(3600))
    chat = ChatService(conversation)
    model = make_test_model(
        call_tools=[],
        output={"message": "hi", "used_nct_numbers": [], "follow_up_questions": []},
    )
    with get_clinical_trials_agent().override(model=model):
        async for _ in chat.stream_chat("s1", "hello"):
            pass
    assert await conversation.get_history("s1")
    await chat.reset("s1")
    assert await conversation.get_history("s1") == []
