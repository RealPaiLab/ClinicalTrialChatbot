"""Agent tools for searching clinical trials."""

from __future__ import annotations

from langfuse import observe
from pydantic_ai import RunContext

from agents.clinical_trials.dependencies import AgentDeps
from agents.clinical_trials.guards import guarded, guarded_uncounted
from agents.clinical_trials.memory import render_memory
from agents.clinical_trials.tool_schemas import (
    DefineTermInput,
    GetTrialDetailsInput,
    RememberInput,
    SemanticSearchInput,
    SyntacticSearchInput,
    TrialSearchHit,
)
from core.config import get_settings
from schemas.glossary import GlossaryDefinition
from schemas.trial import TrialCitation, TrialFilter

observed = observe(
    capture_input=get_settings().capture_patient_text,
    capture_output=get_settings().capture_patient_text,
)


def _record(
    ctx: RunContext[AgentDeps], citations: list[TrialCitation]
) -> list[TrialSearchHit]:
    hits: list[TrialSearchHit] = []
    for c in citations:
        ctx.deps.fetched_trials[c.trial_ref] = c
        hits.append(
            TrialSearchHit(
                trial_ref=c.trial_ref,
                nct_number=c.nct_number,
                title=c.short_title_en or c.official_title_en,
                cancer_types=sorted(
                    {ct for s in c.sites for ct in s.cancer_type_names}
                ),
                treatment_types=c.treatment_type_names,
                disease_stages=c.disease_stages,
                phases=c.phases,
                cities=sorted({s.city for s in c.sites if s.city}),
                provinces=sorted({s.province for s in c.sites if s.province}),
                recruiting_statuses=sorted({s.state for s in c.sites if s.state}),
            )
        )
    return hits


@observed
@guarded
async def syntactic_search(
    ctx: RunContext[AgentDeps], args: SyntacticSearchInput
) -> list[TrialSearchHit]:
    """Search clinical trials by structured filters, optionally narrowed by free text.

    Values within one field are OR'd and fields are AND'd, so you may pass several
    cancer types, locations, or phases at once. Add `query` only for symptom or
    treatment wording the filters cannot express (e.g. "immunotherapy after
    surgery"); it searches only within trials that already match the filters.
    """
    flt = TrialFilter(
        cancer_types=args.cancer_types,
        locations=args.locations,
        statuses=args.statuses,
        phases=args.phases,
        treatment_types=args.treatment_types,
        disease_stages=args.disease_stages,
    )
    citations = await ctx.deps.trial_search.syntactic_search(
        flt, query=args.query, limit=args.limit, offset=args.offset
    )
    return _record(ctx, citations)


@observed
@guarded
async def semantic_search(
    ctx: RunContext[AgentDeps], args: SemanticSearchInput
) -> list[TrialSearchHit]:
    """Search clinical trials by meaning, ranked by fit to the patient's situation.

    Use when the match depends on soft clinical fit the structured filters cannot
    express: how advanced the disease is, prior treatments, eligibility nuances,
    or intent in the patient's own words. Write `query` in English. The filters
    are hard constraints applied before ranking, so keep passing the known cancer
    type, location, status, or phase. Results always come back in best-fit order;
    a weak top result means the constraints are too narrow, so relax a filter
    rather than rephrasing the same query.
    """
    flt = TrialFilter(
        cancer_types=args.cancer_types,
        locations=args.locations,
        statuses=args.statuses,
        phases=args.phases,
        treatment_types=args.treatment_types,
        disease_stages=args.disease_stages,
    )
    citations = await ctx.deps.trial_search.semantic_search(
        flt, query=args.query, limit=args.limit
    )
    return _record(ctx, citations)


def _keep_narrowed_sites(
    ctx: RunContext[AgentDeps], citation: TrialCitation
) -> TrialCitation:
    """Re-apply the site list a search already narrowed for this trial."""
    known = ctx.deps.fetched_trials.get(citation.trial_ref)
    if known is None or not known.sites:
        return citation
    return citation.model_copy(update={"sites": known.sites})


@observed
@guarded
async def get_trial_details(
    ctx: RunContext[AgentDeps], args: GetTrialDetailsInput
) -> list[TrialCitation]:
    """Fetch full details for one or more trials by ref.

    Use when the patient wants to go deeper on specific trials; pass every ref
    you need in one call. Returns only the trials that were found. Keeps
    whatever locations the search was narrowed to; set `all_sites` only when the
    patient asks where else a trial runs.
    """
    citations = await ctx.deps.trial_search.get_by_refs(args.trial_refs)
    if not args.all_sites:
        citations = [_keep_narrowed_sites(ctx, c) for c in citations]
    for citation in citations:
        ctx.deps.fetched_trials[citation.trial_ref] = citation
    return citations


@observed
@guarded
async def define_term(
    ctx: RunContext[AgentDeps], args: DefineTermInput
) -> list[GlossaryDefinition]:
    """Look up a plain-language definition of a medical or clinical-trial term.

    Use sparingly, only for a central term you cannot confidently explain yourself,
    not for everyday words. Pick the `source` dictionary that fits the term (cancer
    terms, genetics, or drugs). Returns the single closest match (or nothing); if it
    is empty or off, you may try once more with clearer phrasing or a different
    source, but do not keep retrying.
    """
    return await ctx.deps.glossary.define(args.term, args.source)


@observed
@guarded_uncounted
async def remember(ctx: RunContext[AgentDeps], args: RememberInput) -> str:
    """Save what the patient just told you to your notes for the rest of the chat.

    Call it whenever they give or change a fact worth keeping (cancer type, subtype,
    stage, treatments tried, location, age, who they are asking for, what they hope
    for, any constraint), before you search. Pass every new note in one call. The
    notes come back to you on every later turn, so you never have to ask twice.
    Returns your notes as they now stand.
    """
    ctx.deps.memory_calls += 1
    for note in args.notes:
        ctx.deps.memory.record(ctx.deps.turn_index, note)
    return render_memory(ctx.deps.memory) or "Your notes are empty."


def _first_line(doc: str | None) -> str:
    lines = (doc or "").strip().splitlines()
    return lines[0] if lines else ""


TOOL_DESCRIPTIONS: dict[str, str] = {
    tool.__name__: _first_line(tool.__doc__)
    for tool in (
        syntactic_search,
        semantic_search,
        get_trial_details,
        define_term,
        remember,
    )
}
