import pytest
from pydantic import ValidationError
from pydantic_ai import ModelRetry

from agents.clinical_trials.dependencies import AgentDeps
from agents.clinical_trials.tool_schemas import (
    DefineTermInput,
    GetTrialDetailsInput,
    SemanticSearchInput,
    SyntacticSearchInput,
)
from agents.clinical_trials.tools import (
    define_term,
    get_trial_details,
    semantic_search,
    syntactic_search,
)
from schemas.cancer_types import CancerType
from schemas.glossary import GlossaryDefinition, GlossarySource
from schemas.trial import TrialCitation
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
        ctx,
        SyntacticSearchInput(reasoning="r", cancer_types=[CancerType("Breast Cancer")]),
    )

    assert hits[0].nct_number == "NCT-1"
    assert "Breast Cancer" in hits[0].cancer_types
    assert "Montréal" in hits[0].cities
    assert "NCT-1" in deps.fetched_trials


async def test_duplicate_call_is_rejected_and_still_counts() -> None:
    deps = AgentDeps(trial_search=StubTrialSearch(results=[make_citation("NCT-1")]))
    ctx = make_run_context(deps)

    await syntactic_search(
        ctx,
        SyntacticSearchInput(reasoning="a", cancer_types=[CancerType("Breast Cancer")]),
    )
    with pytest.raises(ModelRetry):
        await syntactic_search(
            ctx,
            SyntacticSearchInput(
                reasoning="b", cancer_types=[CancerType("Breast Cancer")]
            ),
        )

    assert deps.tool_calls == 2


def test_search_limit_is_hard_capped_at_ten() -> None:
    SyntacticSearchInput(reasoning="r", limit=10)
    with pytest.raises(ValidationError):
        SyntacticSearchInput(reasoning="r", limit=11)


async def test_semantic_search_records_and_summarizes() -> None:
    citation = make_citation("NCT-1", cancer=["Lung Cancer"])
    search = StubTrialSearch(results=[citation])
    deps = AgentDeps(trial_search=search)
    ctx = make_run_context(deps)

    hits = await semantic_search(
        ctx,
        SemanticSearchInput(
            reasoning="r",
            query="metastatic lung cancer",
            cancer_types=[CancerType("Lung Cancer")],
        ),
    )

    assert hits[0].nct_number == "NCT-1"
    assert "NCT-1" in deps.fetched_trials
    assert ("semantic_search", "metastatic lung cancer") in search.calls


async def test_semantic_search_duplicate_call_is_rejected() -> None:
    deps = AgentDeps(trial_search=StubTrialSearch(results=[make_citation("NCT-1")]))
    ctx = make_run_context(deps)

    await semantic_search(ctx, SemanticSearchInput(reasoning="a", query="lung"))
    with pytest.raises(ModelRetry):
        await semantic_search(ctx, SemanticSearchInput(reasoning="b", query="lung"))

    assert deps.tool_calls == 2


async def test_same_filters_allowed_across_search_tools() -> None:
    deps = AgentDeps(trial_search=StubTrialSearch(results=[make_citation("NCT-1")]))
    ctx = make_run_context(deps)

    await syntactic_search(
        ctx,
        SyntacticSearchInput(reasoning="a", cancer_types=[CancerType("Lung Cancer")]),
    )
    await semantic_search(
        ctx,
        SemanticSearchInput(
            reasoning="b", query="lung", cancer_types=[CancerType("Lung Cancer")]
        ),
    )

    assert deps.tool_calls == 2


async def test_query_makes_search_distinct_from_filters_only() -> None:
    deps = AgentDeps(trial_search=StubTrialSearch(results=[make_citation("NCT-1")]))
    ctx = make_run_context(deps)

    await syntactic_search(
        ctx,
        SyntacticSearchInput(reasoning="a", cancer_types=[CancerType("Breast Cancer")]),
    )
    await syntactic_search(
        ctx,
        SyntacticSearchInput(
            reasoning="a", cancer_types=[CancerType("Breast Cancer")], query="immuno"
        ),
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


def _two_site_trial() -> TrialCitation:
    """The trial as get_by_ncts returns it: every site, unfiltered."""
    full = make_citation("NCT-4", city="Thunder Bay")
    full.sites = [*full.sites, *make_citation("NCT-4", city="Toronto").sites]
    return full


async def test_details_keep_the_sites_the_search_narrowed_to() -> None:
    """Details must not re-add cities the patient filtered out: sites are map pins."""
    searched = make_citation("NCT-4", city="Thunder Bay")
    deps = AgentDeps(trial_search=StubTrialSearch(by_nct={"NCT-4": _two_site_trial()}))
    deps.fetched_trials["NCT-4"] = searched
    ctx = make_run_context(deps)

    result = await get_trial_details(
        ctx, GetTrialDetailsInput(reasoning="r", nct_numbers=["NCT-4"])
    )

    assert [s.city for s in result[0].sites] == ["Thunder Bay"]
    assert [s.city for s in deps.fetched_trials["NCT-4"].sites] == ["Thunder Bay"]


async def test_all_sites_widens_on_request() -> None:
    searched = make_citation("NCT-4", city="Thunder Bay")
    deps = AgentDeps(trial_search=StubTrialSearch(by_nct={"NCT-4": _two_site_trial()}))
    deps.fetched_trials["NCT-4"] = searched
    ctx = make_run_context(deps)

    result = await get_trial_details(
        ctx,
        GetTrialDetailsInput(reasoning="r", nct_numbers=["NCT-4"], all_sites=True),
    )

    assert [s.city for s in result[0].sites] == ["Thunder Bay", "Toronto"]


async def test_details_are_unfiltered_for_a_trial_not_seen_before() -> None:
    deps = AgentDeps(trial_search=StubTrialSearch(by_nct={"NCT-4": _two_site_trial()}))
    ctx = make_run_context(deps)

    result = await get_trial_details(
        ctx, GetTrialDetailsInput(reasoning="r", nct_numbers=["NCT-4"])
    )

    assert [s.city for s in result[0].sites] == ["Thunder Bay", "Toronto"]
