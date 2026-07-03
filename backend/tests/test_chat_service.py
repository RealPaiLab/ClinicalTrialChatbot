from unittest.mock import AsyncMock

import pytest

from agents.clinical_trials.agent import get_clinical_trials_agent
from agents.clinical_trials.output import AgentResponse
from repository.conversation.memory_repository import InMemoryConversationRepository
from schemas.chat import ChatResult
from services.chat_service import ChatService
from services.conversation_service import ConversationService
from tests.factories import StubTrialSearch, make_citation, make_test_model


def _chat(
    search: StubTrialSearch, conversation: ConversationService | None = None
) -> ChatService:
    conversation = conversation or ConversationService(
        InMemoryConversationRepository(3600)
    )
    return ChatService(conversation, trial_search=search)


async def test_stream_yields_partials_then_result() -> None:
    citation = make_citation("NCT-1")
    chat = _chat(StubTrialSearch(results=[citation], by_nct={"NCT-1": citation}))
    model = make_test_model(
        call_tools=["syntactic_search"],
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


async def test_history_persists_across_turns() -> None:
    conversation = ConversationService(InMemoryConversationRepository(3600))
    chat = _chat(StubTrialSearch(), conversation)
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


async def test_stream_reraises_on_failure() -> None:
    conversation = AsyncMock()
    conversation.get_history.side_effect = RuntimeError("store down")
    chat = ChatService(conversation, trial_search=StubTrialSearch())

    with pytest.raises(RuntimeError, match="store down"):
        async for _ in chat.stream_chat("s1", "hello"):
            pass


async def test_reset_clears_history() -> None:
    conversation = ConversationService(InMemoryConversationRepository(3600))
    chat = _chat(StubTrialSearch(), conversation)
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
