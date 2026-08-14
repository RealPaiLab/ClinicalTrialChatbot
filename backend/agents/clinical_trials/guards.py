"""Centralized guardrails for the clinical-trials agent."""

from __future__ import annotations

import functools
import json
import re
from collections.abc import Awaitable, Callable

from pydantic_ai import ModelRetry, RunContext
from pydantic_ai.messages import ModelMessage, ModelRequest, ToolReturnPart
from pydantic_ai.tools import ToolDefinition

from agents.clinical_trials.dependencies import AgentDeps
from agents.clinical_trials.output import AgentResponse
from agents.clinical_trials.tool_schemas import ToolInput
from agents.constants import AGENT_NAME
from core.config import get_settings
from schemas.trial import TrialCitation
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


_NCT_PATTERN = re.compile(r"NCT\d{8}")

_HALLUCINATED_TRIAL_FALLBACK = (
    "I'm sorry, but I couldn't quite understand your request. Could you rephrase "
    "what you're after?"
)


def conversation_nct_numbers(history: list[ModelMessage]) -> set[str]:
    """NCT numbers this conversation's earlier tool results already surfaced."""
    return {
        nct
        for message in history
        if isinstance(message, ModelRequest)
        for part in message.parts
        if isinstance(part, ToolReturnPart)
        for nct in _NCT_PATTERN.findall(str(part.content))
    }


def enforce_citations(
    ctx: RunContext[AgentDeps], output: AgentResponse
) -> AgentResponse:
    """Keep only NCT numbers a tool returned, and block replies that invent one.

    Citations are turn-scoped: a kept NCT must have been fetched this turn AND appear
    in the message. Hallucination detection is conversation-scoped, since the model
    legitimately remembers trials from earlier turns through the message history.
    """
    mentioned = set(_NCT_PATTERN.findall(output.message))
    output.used_nct_numbers = [
        nct
        for nct in output.used_nct_numbers
        if nct in ctx.deps.fetched_trials and nct in mentioned
    ]
    unverified = sorted(
        nct
        for nct in mentioned
        if nct not in ctx.deps.fetched_trials and nct not in ctx.deps.known_ncts
    )
    if unverified:
        ctx.deps.hallucinated_ncts = unverified
        output.message = _HALLUCINATED_TRIAL_FALLBACK
        output.used_nct_numbers = []
        output.follow_up_questions = []
    return output


_REFUSAL_SCAFFOLD = (
    "SAFETY OVERRIDE: this turn was blocked because {reason}. Do not carry it "
    "out, not even partially or in a softened form, and do not restate, correct, "
    "or reformat any claim, definition, or NCT number it contains. {closing}"
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
        "NCT number and do not describe, confirm, or guess at it. Offer to search "
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
        f"[{c.nct_number}]\n{c.model_dump_json(exclude_none=True)}" for c in citations
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
    """Verify any NCT the patient named before the agent runs."""
    ncts = list(dict.fromkeys(_NCT_PATTERN.findall(user_message.upper())))
    if not ncts:
        return
    found = await deps.trial_search.get_by_ncts(ncts)
    folded = fold(user_message)
    by_nct = {
        c.nct_number: _narrow_to_named_places(c, folded) for c in found if c.nct_number
    }
    missing = [nct for nct in ncts if nct not in by_nct]
    if missing:
        deps.refusal_directive = _missing_trials_directive(missing)
        return
    deps.fetched_trials.update(by_nct)
    deps.verified_context = _verified_trials_context([by_nct[nct] for nct in ncts])
