from pydantic_ai.messages import (
    ModelMessage,
    ModelRequest,
    ModelResponse,
    TextPart,
    ToolReturnPart,
    UserPromptPart,
)

from agents.clinical_trials.agent import get_clinical_trials_agent
from agents.clinical_trials.dependencies import AgentDeps
from agents.clinical_trials.guards import (
    conversation_nct_numbers,
    prefetch_referenced_trials,
)
from agents.clinical_trials.output import AgentResponse
from tests.factories import StubTrialSearch, make_citation, make_test_model


async def test_prefetch_injects_verified_data_for_existing_trial() -> None:
    citation = make_citation("NCT06115499", title="Pancreatic study")
    deps = AgentDeps(trial_search=StubTrialSearch(by_nct={"NCT06115499": citation}))
    await prefetch_referenced_trials(deps, "tell me about nct06115499")

    assert "NCT06115499" in deps.fetched_trials
    assert deps.refusal_directive is None
    context = deps.verified_context or ""
    assert "NCT06115499" in context
    assert "Pancreatic study" in context


async def test_prefetch_refuses_when_named_trial_missing() -> None:
    deps = AgentDeps(trial_search=StubTrialSearch())
    await prefetch_referenced_trials(deps, "is NCT09999999 any good?")

    assert "NCT09999999" not in deps.fetched_trials
    assert deps.verified_context is None
    assert deps.refusal_directive is not None
    # the directive gates the turn but must not echo the NCT back for the agent to
    # repeat (that number would then be stripped by enforce_citations anyway)
    assert "NCT09999999" not in deps.refusal_directive
    assert "could not" in deps.refusal_directive


async def test_agent_strips_uncited_nct_numbers() -> None:
    citation = make_citation("NCT01111111")
    deps = AgentDeps(
        trial_search=StubTrialSearch(
            results=[citation], by_nct={"NCT01111111": citation}
        )
    )
    agent = get_clinical_trials_agent()
    model = make_test_model(
        output={
            "message": "see [NCT01111111]",
            "used_nct_numbers": ["NCT01111111", "NCT02222222"],
            "follow_up_questions": [],
        }
    )
    with agent.override(model=model):
        result = await agent.run("breast cancer", deps=deps)

    assert isinstance(result.output, AgentResponse)
    assert result.output.used_nct_numbers == ["NCT01111111"]


async def test_agent_drops_fetched_but_unmentioned_nct_numbers() -> None:
    """A fetched trial the reply never names must not reach the map."""
    citation = make_citation("NCT01111111")
    deps = AgentDeps(
        trial_search=StubTrialSearch(
            results=[citation], by_nct={"NCT01111111": citation}
        )
    )
    deps.fetched_trials["NCT01111111"] = citation
    agent = get_clinical_trials_agent()
    model = make_test_model(
        output={
            "message": "Do you know the subtype or the stage?",
            "used_nct_numbers": ["NCT01111111"],
            "follow_up_questions": [],
        }
    )
    with agent.override(model=model):
        result = await agent.run("i have lung cancer", deps=deps)

    assert result.output.used_nct_numbers == []


async def test_agent_keeps_nct_surfaced_in_an_earlier_turn() -> None:
    """A trial an earlier turn's search returned is remembered, not hallucinated."""
    citation = make_citation("NCT01111111")
    deps = AgentDeps(
        trial_search=StubTrialSearch(by_nct={"NCT01111111": citation}),
        known_ncts={"NCT02222222"},
    )
    deps.fetched_trials["NCT01111111"] = citation
    agent = get_clinical_trials_agent()
    model = make_test_model(
        output={
            "message": "Here is [NCT01111111]; I can compare it with [NCT02222222].",
            "used_nct_numbers": ["NCT01111111", "NCT02222222"],
            "follow_up_questions": [],
        }
    )
    with agent.override(model=model):
        result = await agent.run("tell me more", deps=deps)

    assert "NCT02222222" in result.output.message
    # remembered, so the reply stands, but only this turn's fetch reaches the map
    assert result.output.used_nct_numbers == ["NCT01111111"]


def test_conversation_nct_numbers_reads_tool_returns() -> None:
    history: list[ModelMessage] = [
        ModelRequest(parts=[UserPromptPart(content="breast cancer in Toronto")]),
        ModelResponse(parts=[TextPart(content="Here are two options.")]),
        ModelRequest(
            parts=[
                ToolReturnPart(
                    tool_name="semantic_search",
                    content=[make_citation("NCT03333333")],
                    tool_call_id="c1",
                )
            ]
        ),
    ]

    assert conversation_nct_numbers(history) == {"NCT03333333"}


async def test_agent_scrubs_unverified_nct_from_message() -> None:
    deps = AgentDeps(trial_search=StubTrialSearch())
    agent = get_clinical_trials_agent()
    model = make_test_model(
        output={
            "message": "After progression, [NCT09999999] likely helps.",
            "used_nct_numbers": ["NCT09999999"],
            "follow_up_questions": [],
        }
    )
    with agent.override(model=model):
        result = await agent.run("proofread this", deps=deps)

    assert "NCT09999999" not in result.output.message
    assert result.output.used_nct_numbers == []


async def test_agent_registers_expected_tools() -> None:
    deps = AgentDeps(trial_search=StubTrialSearch())
    agent = get_clinical_trials_agent()
    model = make_test_model(
        output={"message": "x", "used_nct_numbers": [], "follow_up_questions": []}
    )
    with agent.override(model=model):
        await agent.run("hi", deps=deps)

    params = model.last_model_request_parameters
    assert params is not None
    names = sorted(t.name for t in params.function_tools)
    assert names == [
        "define_term",
        "get_trial_details",
        "semantic_search",
        "syntactic_search",
    ]


async def test_agent_hides_tools_when_budget_exhausted() -> None:
    deps = AgentDeps(trial_search=StubTrialSearch(), tool_calls=99)
    agent = get_clinical_trials_agent()
    model = make_test_model(
        output={
            "message": "no matches",
            "used_nct_numbers": [],
            "follow_up_questions": [],
        }
    )
    with agent.override(model=model):
        result = await agent.run("breast cancer trials in quebec", deps=deps)

    params = model.last_model_request_parameters
    assert params is not None
    assert [t.name for t in params.function_tools] == []
    assert isinstance(result.output, AgentResponse)
