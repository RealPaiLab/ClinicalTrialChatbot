import pytest
from pydantic import ValidationError
from pydantic_ai import ModelRetry

from agents.clinical_trials.dependencies import AgentDeps
from agents.clinical_trials.tool_schemas import (
    DefineTermInput,
    GetTrialDetailsInput,
    SyntacticSearchInput,
)
from agents.clinical_trials.tools import (
    define_term,
    get_trial_details,
    syntactic_search,
)
from schemas.glossary import GlossaryDefinition, GlossarySource
from tests.factories import (
    StubGlossary,
    StubTrialSearch,
    make_citation,
    make_run_context,
)


async def test_syntactic_search_records_and_summarizes() -> None:
    citation = make_citation("NCT-1", cancer=["Breast Cancer"], city="Montréal")
    deps = AgentDeps(trial_search=StubTrialSearch(results=[citation]))
    ctx = make_run_context(deps)

    hits = await syntactic_search(
        ctx, SyntacticSearchInput(reasoning="r", cancer_types=["breast"])
    )

    assert hits[0].nct_number == "NCT-1"
    assert "Breast Cancer" in hits[0].cancer_types
    assert "Montréal" in hits[0].cities
    assert "NCT-1" in deps.fetched_trials


async def test_duplicate_call_is_rejected_and_still_counts() -> None:
    deps = AgentDeps(trial_search=StubTrialSearch(results=[make_citation("NCT-1")]))
    ctx = make_run_context(deps)

    await syntactic_search(
        ctx, SyntacticSearchInput(reasoning="a", cancer_types=["breast"])
    )
    with pytest.raises(ModelRetry):
        await syntactic_search(
            ctx, SyntacticSearchInput(reasoning="b", cancer_types=["breast"])
        )

    assert deps.tool_calls == 2


def test_search_limit_is_hard_capped_at_ten() -> None:
    SyntacticSearchInput(reasoning="r", limit=10)
    with pytest.raises(ValidationError):
        SyntacticSearchInput(reasoning="r", limit=11)


async def test_query_makes_search_distinct_from_filters_only() -> None:
    deps = AgentDeps(trial_search=StubTrialSearch(results=[make_citation("NCT-1")]))
    ctx = make_run_context(deps)

    await syntactic_search(
        ctx, SyntacticSearchInput(reasoning="a", cancer_types=["breast"])
    )
    await syntactic_search(
        ctx,
        SyntacticSearchInput(reasoning="a", cancer_types=["breast"], query="immuno"),
    )

    assert deps.tool_calls == 2


async def test_define_term_returns_glossary_definitions() -> None:
    definition = GlossaryDefinition(
        source=GlossarySource.DRUGS, term="imatinib", definition="a kinase inhibitor"
    )
    glossary = StubGlossary(results=[definition])
    deps = AgentDeps(trial_search=StubTrialSearch(), glossary=glossary)
    ctx = make_run_context(deps)

    result = await define_term(
        ctx,
        DefineTermInput(reasoning="r", term="gleevec", source=GlossarySource.DRUGS),
    )

    assert [d.term for d in result] == ["imatinib"]
    assert glossary.calls == [("gleevec", GlossarySource.DRUGS)]
    assert deps.tool_calls == 1


async def test_get_trial_details_returns_found_only() -> None:
    citation = make_citation("NCT-3")
    deps = AgentDeps(trial_search=StubTrialSearch(by_nct={"NCT-3": citation}))
    ctx = make_run_context(deps)

    result = await get_trial_details(
        ctx, GetTrialDetailsInput(reasoning="r", nct_numbers=["NCT-3", "NCT-x"])
    )

    assert [c.nct_number for c in result] == ["NCT-3"]
    assert "NCT-3" in deps.fetched_trials
