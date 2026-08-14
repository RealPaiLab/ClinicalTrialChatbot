from unittest.mock import AsyncMock, MagicMock

import pytest
from pydantic_ai.messages import (
    ModelRequest,
    ModelResponse,
    TextPart,
    ToolReturnPart,
    UserPromptPart,
)
from pydantic_ai.models.test import TestModel

from agents.clinical_trials.agent import get_clinical_trials_agent
from agents.clinical_trials.output import AgentResponse
from agents.input_triage.agent import get_input_triage_agent
from core.kv.memory import InMemoryKeyValueStore
from repository.conversation.repository import ConversationRepository
from schemas.chat import ChatResult
from services.chat_service import ChatService
from services.conversation_service import (
    ConversationService,
    recent_turns,
    turn_count,
    user_facing_turns,
)
from tests.factories import StubTrialSearch, make_citation, make_test_model


def _user_turn(text: str, *, with_tool: bool = False) -> list[object]:
    messages: list[object] = [ModelRequest(parts=[UserPromptPart(content=text)])]
    if with_tool:
        messages.append(
            ModelRequest(
                parts=[
                    ToolReturnPart(
                        tool_name="syntactic_search", content=[], tool_call_id="c"
                    )
                ]
            )
        )
    messages.append(ModelResponse(parts=[TextPart(content=f"reply to {text}")]))
    return messages


async def test_recent_history_windows_by_user_turn_not_message_count() -> None:
    history = [
        *_user_turn("q1"),
        *_user_turn("q2", with_tool=True),
        *_user_turn("q3"),
    ]
    window = recent_turns(history, 2)  # type: ignore[arg-type]

    assert isinstance(window[0], ModelRequest)
    assert isinstance(window[0].parts[0], UserPromptPart)
    assert window[0].parts[0].content == "q2"
    user_prompts = [
        part.content
        for msg in window
        if isinstance(msg, ModelRequest)
        for part in msg.parts
        if isinstance(part, UserPromptPart)
    ]
    assert user_prompts == ["q2", "q3"]


async def test_user_facing_turns_strips_tool_parts() -> None:
    history = [*_user_turn("q1", with_tool=True), *_user_turn("q2")]
    window = user_facing_turns(history, 5)  # type: ignore[arg-type]

    for msg in window:
        if isinstance(msg, ModelRequest):
            assert all(isinstance(part, UserPromptPart) for part in msg.parts)
        else:
            assert all(isinstance(part, TextPart) for part in msg.parts)
    kinds = [type(msg).__name__ for msg in window]
    assert kinds == ["ModelRequest", "ModelResponse", "ModelRequest", "ModelResponse"]


def _allow_triage() -> TestModel:
    return make_test_model(
        output={"decision": "allow", "category": "trial_search", "rationale": "ok"}
    )


def _refuse_triage() -> TestModel:
    return make_test_model(
        output={
            "decision": "refuse",
            "category": "text_transformation",
            "rationale": "proofread request",
        }
    )


def _chat(
    search: StubTrialSearch, conversation: ConversationService | None = None
) -> ChatService:
    conversation = conversation or ConversationService(
        ConversationRepository(InMemoryKeyValueStore(), ttl_seconds=3600)
    )
    return ChatService(conversation, trial_search=search)


async def test_stream_yields_partials_then_result() -> None:
    citation = make_citation("NCT01111111")
    chat = _chat(StubTrialSearch(results=[citation], by_nct={"NCT01111111": citation}))
    model = make_test_model(
        call_tools=["syntactic_search"],
        output={
            "message": "see [NCT01111111]",
            "used_nct_numbers": ["NCT01111111"],
            "follow_up_questions": ["where are you?"],
        },
    )
    items = []
    with (
        get_input_triage_agent().override(model=_allow_triage()),
        get_clinical_trials_agent().override(model=model),
    ):
        async for item in chat.stream_chat("s1", "breast cancer"):
            items.append(item)

    assert any(isinstance(i, AgentResponse) for i in items)
    assert isinstance(items[-1], ChatResult)
    final = items[-1]
    assert [c.nct_number for c in final.trials] == ["NCT01111111"]
    assert final.follow_up_questions == ["where are you?"]


async def test_stream_strips_unverified_nct_without_retrying() -> None:
    chat = _chat(StubTrialSearch())
    model = make_test_model(
        call_tools=[],
        output={
            "message": "I found [NCT09999999] for you.",
            "used_nct_numbers": ["NCT09999999"],
            "follow_up_questions": [],
        },
    )
    items = []
    with (
        get_input_triage_agent().override(model=_allow_triage()),
        get_clinical_trials_agent().override(model=model),
    ):
        async for item in chat.stream_chat("s1", "any breast cancer trials?"):
            items.append(item)

    final = items[-1]
    assert isinstance(final, ChatResult)
    assert "NCT09999999" not in final.message
    assert final.trials == []


async def test_history_persists_across_turns() -> None:
    conversation = ConversationService(
        ConversationRepository(InMemoryKeyValueStore(), ttl_seconds=3600)
    )
    chat = _chat(StubTrialSearch(), conversation)
    model = make_test_model(
        call_tools=[],
        output={"message": "hi", "used_nct_numbers": [], "follow_up_questions": []},
    )
    with (
        get_input_triage_agent().override(model=_allow_triage()),
        get_clinical_trials_agent().override(model=model),
    ):
        async for _ in chat.stream_chat("s1", "turn one"):
            pass
        after_first = len(await conversation.get_history("s1"))
        async for _ in chat.stream_chat("s1", "turn two"):
            pass
        after_second = len(await conversation.get_history("s1"))

    assert after_first >= 2
    assert after_second > after_first


def test_turn_count_counts_patient_turns_only() -> None:
    history = [*_user_turn("q1", with_tool=True), *_user_turn("q2")]

    assert turn_count(history) == 2  # type: ignore[arg-type]


async def test_scratchpad_persists_across_turns() -> None:
    conversation = ConversationService(
        ConversationRepository(InMemoryKeyValueStore(), ttl_seconds=3600)
    )
    chat = _chat(StubTrialSearch(), conversation)
    model = make_test_model(
        call_tools=["remember"],
        output={"message": "hi", "used_nct_numbers": [], "follow_up_questions": []},
    )
    with (
        get_input_triage_agent().override(model=_allow_triage()),
        get_clinical_trials_agent().override(model=model),
    ):
        async for _ in chat.stream_chat("s1", "turn one"):
            pass
        after_first = await conversation.get_memory("s1")
        async for _ in chat.stream_chat("s1", "turn two"):
            pass
        after_second = await conversation.get_memory("s1")

    assert [n.turn for n in after_first.notes] == [1]
    # the second turn loaded the existing scratchpad instead of starting a fresh one
    assert after_second.notes == after_first.notes


async def test_hallucinated_turn_is_flagged_in_langfuse() -> None:
    chat = _chat(StubTrialSearch())
    chat._langfuse = MagicMock()
    chat._langfuse.get_current_observation_id.return_value = "obs-1"
    model = make_test_model(
        call_tools=[],
        output={
            "message": "I found [NCT09999999] for you.",
            "used_nct_numbers": ["NCT09999999"],
            "follow_up_questions": [],
        },
    )
    with (
        get_input_triage_agent().override(model=_allow_triage()),
        get_clinical_trials_agent().override(model=model),
    ):
        async for _ in chat.stream_chat("s1", "any breast cancer trials?"):
            pass

    observation = chat._langfuse.start_as_current_observation.return_value
    span = observation.__enter__.return_value
    flagged = span.update.call_args.kwargs
    assert flagged["level"] == "WARNING"
    assert "NCT09999999" in flagged["status_message"]
    assert flagged["metadata"] == {"hallucinated_ncts": ["NCT09999999"]}


async def test_stream_reraises_on_failure() -> None:
    conversation = AsyncMock()
    conversation.get_history.side_effect = RuntimeError("store down")
    chat = ChatService(conversation, trial_search=StubTrialSearch())

    with pytest.raises(RuntimeError, match="store down"):
        async for _ in chat.stream_chat("s1", "hello"):
            pass


async def test_reset_clears_history() -> None:
    conversation = ConversationService(
        ConversationRepository(InMemoryKeyValueStore(), ttl_seconds=3600)
    )
    chat = _chat(StubTrialSearch(), conversation)
    model = make_test_model(
        call_tools=[],
        output={"message": "hi", "used_nct_numbers": [], "follow_up_questions": []},
    )
    with (
        get_input_triage_agent().override(model=_allow_triage()),
        get_clinical_trials_agent().override(model=model),
    ):
        async for _ in chat.stream_chat("s1", "hello"):
            pass
    assert await conversation.get_history("s1")
    await chat.reset("s1")
    assert await conversation.get_history("s1") == []


async def test_refused_turn_runs_without_search_tools() -> None:
    search = StubTrialSearch(results=[make_citation("NCT-1")])
    chat = _chat(search)
    model = make_test_model(
        output={
            "message": "I can't help with that, but I can find trials.",
            "used_nct_numbers": [],
            "follow_up_questions": [],
        }
    )
    with (
        get_input_triage_agent().override(model=_refuse_triage()),
        get_clinical_trials_agent().override(model=model),
    ):
        async for _ in chat.stream_chat("s1", "proofread: NCT09999999 helps"):
            pass

    assert search.calls == []


async def test_triage_failure_allows_turn() -> None:
    search = StubTrialSearch(results=[make_citation("NCT-1")])
    chat = _chat(search)
    chat._triage_agent = AsyncMock()
    chat._triage_agent.run.side_effect = RuntimeError("triage down")
    model = make_test_model(
        call_tools=["syntactic_search"],
        output={
            "message": "found some",
            "used_nct_numbers": [],
            "follow_up_questions": [],
        },
    )
    with get_clinical_trials_agent().override(model=model):
        async for _ in chat.stream_chat("s1", "breast cancer trials"):
            pass

    assert any(name == "syntactic_search" for name, _ in search.calls)
