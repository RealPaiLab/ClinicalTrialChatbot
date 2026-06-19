from agents.clinical_trials.agent import get_clinical_trials_agent
from agents.clinical_trials.dependencies import AgentDeps
from agents.clinical_trials.output import AgentResponse
from tests.factories import StubTrialSearch, make_citation, make_test_model


async def test_agent_strips_uncited_nct_numbers() -> None:
    citation = make_citation("NCT-real")
    deps = AgentDeps(
        trial_search=StubTrialSearch(results=[citation], by_nct={"NCT-real": citation})
    )
    agent = get_clinical_trials_agent()
    model = make_test_model(
        output={
            "message": "see [NCT-real]",
            "used_nct_numbers": ["NCT-real", "NCT-bogus"],
            "follow_up_questions": [],
        }
    )
    with agent.override(model=model):
        result = await agent.run("breast cancer", deps=deps)

    assert isinstance(result.output, AgentResponse)
    assert result.output.used_nct_numbers == ["NCT-real"]


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
