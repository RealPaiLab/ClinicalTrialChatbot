from agents.clinical_trials.dependencies import AgentDeps
from agents.clinical_trials.tool_schemas import (
    GetTrialDetailsInput,
    KeywordSearchInput,
    SearchTrialsInput,
)
from agents.clinical_trials.tools import (
    get_trial_details,
    keyword_search_trials,
    search_trials,
)
from tests.factories import StubTrialSearch, make_citation, make_run_context


async def test_search_trials_records_and_summarizes() -> None:
    citation = make_citation("NCT-1", cancer=["Breast Cancer"], city="Montréal")
    deps = AgentDeps(trial_search=StubTrialSearch(results=[citation]))
    ctx = make_run_context(deps)

    hits = await search_trials(
        ctx, SearchTrialsInput(reasoning="r", cancer_types=["breast"])
    )

    assert hits[0].nct_number == "NCT-1"
    assert "Breast Cancer" in hits[0].cancer_types
    assert "Montréal" in hits[0].cities
    assert "NCT-1" in deps.fetched_trials


async def test_keyword_search_records_fetched() -> None:
    citation = make_citation("NCT-2")
    deps = AgentDeps(trial_search=StubTrialSearch(results=[citation]))
    ctx = make_run_context(deps)

    hits = await keyword_search_trials(
        ctx, KeywordSearchInput(reasoning="r", query="immuno")
    )

    assert hits[0].nct_number == "NCT-2"
    assert "NCT-2" in deps.fetched_trials


async def test_get_trial_details_returns_found_only() -> None:
    citation = make_citation("NCT-3")
    deps = AgentDeps(trial_search=StubTrialSearch(by_nct={"NCT-3": citation}))
    ctx = make_run_context(deps)

    result = await get_trial_details(
        ctx, GetTrialDetailsInput(reasoning="r", nct_numbers=["NCT-3", "NCT-x"])
    )

    assert [c.nct_number for c in result] == ["NCT-3"]
    assert "NCT-3" in deps.fetched_trials
