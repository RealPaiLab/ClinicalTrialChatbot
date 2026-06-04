"""Agent tools for searching clinical trials.

Tools record every fetched trial into ``ctx.deps.fetched_trials`` and return a
compact ``TrialSearchHit`` summary so the model can decide what to cite.
"""

from __future__ import annotations

from pydantic_ai import RunContext

from agents.clinical_trials.dependencies import AgentDeps
from agents.clinical_trials.tool_schemas import (
    GetTrialDetailsInput,
    KeywordSearchInput,
    SearchTrialsInput,
    TrialSearchHit,
)
from schemas.trial import TrialCitation, TrialFilter


def _record(
    ctx: RunContext[AgentDeps], citations: list[TrialCitation]
) -> list[TrialSearchHit]:
    hits: list[TrialSearchHit] = []
    for c in citations:
        if c.nct_number:
            ctx.deps.fetched_trials[c.nct_number] = c
        hits.append(
            TrialSearchHit(
                nct_number=c.nct_number,
                title=c.short_title_en or c.official_title_en,
                phases=c.phases,
                cities=sorted({s.city for s in c.sites if s.city}),
                provinces=sorted({s.province for s in c.sites if s.province}),
                recruiting_statuses=sorted({s.state for s in c.sites if s.state}),
            )
        )
    return hits


async def search_trials(
    ctx: RunContext[AgentDeps], args: SearchTrialsInput
) -> list[TrialSearchHit]:
    """Structured search for clinical trials; use for clear, specific requests.

    Values within one field are OR'd and fields are AND'd, so you may pass several
    cancer types, locations, or phases at once.
    """
    flt = TrialFilter(
        cancer_types=args.cancer_types,
        locations=args.locations,
        statuses=args.statuses,
        phases=args.phases,
    )
    return _record(ctx, await ctx.deps.trial_search.search(flt))


async def keyword_search_trials(
    ctx: RunContext[AgentDeps], args: KeywordSearchInput
) -> list[TrialSearchHit]:
    """Free-text trial search; use when the request is vague or symptom-based.

    Prefer this when the request does not map to a specific cancer type
    (e.g. "advanced solid tumors", "immunotherapy after surgery").
    """
    return _record(ctx, await ctx.deps.trial_search.keyword_search(args.query))


async def get_trial_details(
    ctx: RunContext[AgentDeps], args: GetTrialDetailsInput
) -> list[TrialCitation]:
    """Fetch full details for one or more trials by NCT number.

    Use when the patient wants to go deeper on specific trials; pass every NCT
    number you need in one call. Returns only the trials that were found.
    """
    citations = await ctx.deps.trial_search.get_by_ncts(args.nct_numbers)
    for citation in citations:
        if citation.nct_number:
            ctx.deps.fetched_trials[citation.nct_number] = citation
    return citations
