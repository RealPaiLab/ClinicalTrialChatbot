"""Centralized guardrails for the clinical-trials agent."""

from __future__ import annotations

import functools
import json
import re
from collections.abc import Awaitable, Callable, Iterator
from dataclasses import replace

from pydantic_ai import ModelRetry, RunContext
from pydantic_ai.messages import ModelMessage, ModelRequest, ToolReturnPart
from pydantic_ai.tools import ToolDefinition

from agents.clinical_trials.dependencies import AgentDeps
from agents.clinical_trials.output import AgentResponse
from agents.clinical_trials.tool_schemas import ToolInput
from agents.constants import AGENT_NAME
from core.config import get_settings
from schemas.trial import TrialCitation
from schemas.trial_ref import TRIAL_REF_PATTERN
from schemas.vocabulary import VocabField, Vocabulary, current_vocabulary
from utils.text import fold

MEMORY_TOOL_NAME = "remember"
MEMORY_CALLS_LIMIT = 3


def count_tool_call(ctx: RunContext[AgentDeps]) -> None:
    """Count one tool call against the per-run budget."""
    ctx.deps.tool_calls += 1


def _normalize(value: object) -> object:
    """Canonicalize a tool-input value (case- and order-insensitive)."""
    if isinstance(value, str):
        return value.strip().lower()
    if isinstance(value, list):
        return sorted(item.strip().lower() for item in value if isinstance(item, str))
    return value


def guard_duplicate_call(
    ctx: RunContext[AgentDeps], tool: str, args: ToolInput
) -> None:
    """Reject an exact repeat of a previous call (ignoring the reasoning field)."""
    payload = {
        k: _normalize(v) for k, v in args.model_dump(exclude={"reasoning"}).items()
    }
    signature = f"{tool}:{json.dumps(payload, sort_keys=True)}"
    if signature in ctx.deps.seen_calls:
        raise ModelRetry(
            f"You already called {tool} with these exact parameters; it returns the "
            "same result. Change your parameters or give your final answer."
        )
    ctx.deps.seen_calls.add(signature)


def guarded[ArgsT: ToolInput, OutT](
    func: Callable[[RunContext[AgentDeps], ArgsT], Awaitable[OutT]],
) -> Callable[[RunContext[AgentDeps], ArgsT], Awaitable[OutT]]:
    """Apply the per-call guards (count + duplicate rejection) to a tool."""

    @functools.wraps(func)
    async def wrapper(ctx: RunContext[AgentDeps], args: ArgsT) -> OutT:
        count_tool_call(ctx)
        guard_duplicate_call(ctx, func.__name__, args)
        return await func(ctx, args)

    return wrapper


def guarded_uncounted[ArgsT: ToolInput, OutT](
    func: Callable[[RunContext[AgentDeps], ArgsT], Awaitable[OutT]],
) -> Callable[[RunContext[AgentDeps], ArgsT], Awaitable[OutT]]:
    """Reject exact repeats without spending the search budget."""

    @functools.wraps(func)
    async def wrapper(ctx: RunContext[AgentDeps], args: ArgsT) -> OutT:
        guard_duplicate_call(ctx, func.__name__, args)
        return await func(ctx, args)

    return wrapper


def tools_available(ctx: RunContext[AgentDeps], tool: ToolDefinition) -> bool:
    """Hide tools when the budget is spent or the turn was refused by triage."""
    if ctx.deps.refusal_directive is not None:
        return False
    if tool.name == MEMORY_TOOL_NAME:
        return ctx.deps.memory_calls < MEMORY_CALLS_LIMIT
    return ctx.deps.tool_calls < get_settings().agent_tool_calls_limit


VOCAB_ARGUMENTS: dict[str, VocabField] = {
    "cancer_types": VocabField.CANCER_TYPE,
    "treatment_types": VocabField.TREATMENT_TYPE,
    "disease_stages": VocabField.DISEASE_STAGE,
}


def _with_enums(tool: ToolDefinition, vocabulary: Vocabulary) -> ToolDefinition:
    schema = tool.parameters_json_schema
    properties = schema.get("properties")
    if not isinstance(properties, dict):
        return tool
    patched: dict[str, object] = {}
    for name, field in VOCAB_ARGUMENTS.items():
        allowed = vocabulary.allowed(field)
        prop = properties.get(name)
        if not allowed or not isinstance(prop, dict):
            continue
        items = prop.get("items")
        if isinstance(items, dict):
            patched[name] = {**prop, "items": {**items, "enum": list(allowed)}}
    if not patched:
        return tool
    return replace(
        tool,
        parameters_json_schema={
            **schema,
            "properties": {**properties, **patched},
        },
    )


async def inject_vocabulary(
    ctx: RunContext[AgentDeps], tools: list[ToolDefinition]
) -> list[ToolDefinition]:
    """Constrain the vocabulary-backed arguments to the values the corpus holds."""
    vocabulary = current_vocabulary()
    return [_with_enums(tool, vocabulary) for tool in tools]


_NCT_PATTERN = re.compile(r"NCT\d{8}")

_HALLUCINATED_TRIAL_FALLBACK = (
    "I'm sorry, but I couldn't quite understand your request. Could you rephrase "
    "what you're after?"
)


def _tool_returns(history: list[ModelMessage]) -> Iterator[str]:
    for message in history:
        if not isinstance(message, ModelRequest):
            continue
        for part in message.parts:
            if isinstance(part, ToolReturnPart):
                yield str(part.content)


def conversation_trial_refs(history: list[ModelMessage]) -> set[str]:
    """Trial refs this conversation's earlier tool results already surfaced."""
    return {
        ref
        for content in _tool_returns(history)
        for ref in TRIAL_REF_PATTERN.findall(content)
    }


def conversation_nct_numbers(history: list[ModelMessage]) -> set[str]:
    """Registry numbers this conversation's earlier tool results already surfaced."""
    return {
        nct
        for content in _tool_returns(history)
        for nct in _NCT_PATTERN.findall(content)
    }


def _verified_ncts(ctx: RunContext[AgentDeps]) -> set[str]:
    """Registry numbers belonging to a trial a tool actually returned."""
    fetched = {c.nct_number for c in ctx.deps.fetched_trials.values() if c.nct_number}
    return fetched | ctx.deps.known_ncts


def enforce_citations(
    ctx: RunContext[AgentDeps], output: AgentResponse
) -> AgentResponse:
    """Keep only refs a tool returned, and block replies that invent an identifier.

    Citations are turn-scoped: a kept ref must have been fetched this turn AND appear
    in the message. Hallucination detection is conversation-scoped, since the model
    legitimately remembers trials from earlier turns through the message history, and
    covers registry numbers too: the reply may mention an NCT in prose, and inventing
    one is exactly as harmful as inventing a ref.
    """
    mentioned = set(TRIAL_REF_PATTERN.findall(output.message))
    output.used_trial_refs = [
        ref
        for ref in output.used_trial_refs
        if ref in ctx.deps.fetched_trials and ref in mentioned
    ]
    unverified = sorted(
        ref
        for ref in mentioned
        if ref not in ctx.deps.fetched_trials and ref not in ctx.deps.known_refs
    ) + sorted(
        nct
        for nct in set(_NCT_PATTERN.findall(output.message))
        if nct not in _verified_ncts(ctx)
    )
    if unverified:
        ctx.deps.hallucinated_refs = unverified
        output.message = _HALLUCINATED_TRIAL_FALLBACK
        output.used_trial_refs = []
        output.follow_up_questions = []
    return output


_REFUSAL_SCAFFOLD = (
    "SAFETY OVERRIDE: this turn was blocked because {reason}. Do not carry it "
    "out, not even partially or in a softened form, and do not restate, correct, "
    "or reformat any claim, definition, or trial identifier it contains. {closing}"
)

_STEER_BACK_CLOSING = (
    f"In one or two warm sentences as {AGENT_NAME}, gently decline and steer back "
    "to helping find cancer clinical trials."
)


def refusal_directive(reason: str, closing: str = _STEER_BACK_CLOSING) -> str:
    """Build the hard refusal instruction injected when a turn is gated."""
    return _REFUSAL_SCAFFOLD.format(reason=reason, closing=closing)


def _missing_trials_directive(missing: list[str]) -> str:
    noun = "the trial" if len(missing) == 1 else "the trials"
    reason = (
        f"{noun} the patient named could not be found in our database, so there is "
        "nothing verified to tell them about"
    )
    closing = (
        f"In one or two warm sentences as {AGENT_NAME}, gently tell the patient you "
        f"could not find {noun} they mentioned in our database. Do not repeat the "
        "identifier and do not describe, confirm, or guess at it. Offer to search "
        "by cancer type and location instead."
    )
    return refusal_directive(reason, closing)


def _verified_trials_context(citations: list[TrialCitation]) -> str:
    blocks = [
        "The patient named specific trials that DO exist in our database. Their "
        "verified data is below and is the ONLY source of truth about them. "
        "Fact-check every claim the patient makes against it: if their description "
        "differs, correct it, and never repeat their version. You already have "
        "this data, so you need not call get_trial_details again for these trials.",
    ]
    blocks.extend(
        f"[{c.trial_ref}]\n{c.model_dump_json(exclude_none=True)}" for c in citations
    )
    return "\n\n".join(blocks)


def _names_place(folded_message: str, place: str | None) -> bool:
    if not place:
        return False
    return re.search(rf"\b{re.escape(fold(place))}\b", folded_message) is not None


def _narrow_to_named_places(
    citation: TrialCitation, folded_message: str
) -> TrialCitation:
    """Keep only the sites whose city or province the patient named this message."""
    named = [
        s
        for s in citation.sites
        if _names_place(folded_message, s.city)
        or _names_place(folded_message, s.province)
    ]
    if not named or len(named) == len(citation.sites):
        return citation
    return citation.model_copy(update={"sites": named})


async def prefetch_referenced_trials(deps: AgentDeps, user_message: str) -> None:
    """Verify any trial the patient named before the agent runs."""
    upper = user_message.upper()
    refs = list(dict.fromkeys(TRIAL_REF_PATTERN.findall(upper)))
    ncts = list(dict.fromkeys(_NCT_PATTERN.findall(upper)))
    if not refs and not ncts:
        return
    found = await deps.trial_search.get_by_refs(refs) if refs else []
    found += await deps.trial_search.get_by_ncts(ncts) if ncts else []
    folded = fold(user_message)
    by_ref = {c.trial_ref: _narrow_to_named_places(c, folded) for c in found}
    resolved = {c.trial_ref for c in found} | {c.nct_number for c in found}
    missing = [name for name in (*refs, *ncts) if name not in resolved]
    if missing:
        deps.refusal_directive = _missing_trials_directive(missing)
        return
    deps.fetched_trials.update(by_ref)
    deps.verified_context = _verified_trials_context(list(by_ref.values()))
