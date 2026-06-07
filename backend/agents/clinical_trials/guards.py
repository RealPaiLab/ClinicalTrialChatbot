"""Centralized guardrails for the clinical-trials agent."""

from __future__ import annotations

import functools
import json
from collections.abc import Awaitable, Callable

from pydantic_ai import ModelRetry, RunContext
from pydantic_ai.tools import ToolDefinition

from agents.clinical_trials.dependencies import AgentDeps
from agents.clinical_trials.output import AgentResponse
from agents.clinical_trials.tool_schemas import ToolInput
from core.config import get_settings


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


def within_tool_budget(ctx: RunContext[AgentDeps], _tool: ToolDefinition) -> bool:
    """Hide the tools once the per-run budget is spent, forcing a final answer."""
    return ctx.deps.tool_calls < get_settings().agent_tool_calls_limit


def enforce_citations(
    ctx: RunContext[AgentDeps], output: AgentResponse
) -> AgentResponse:
    """Drop any cited NCT number a tool never actually returned."""
    output.used_nct_numbers = [
        nct for nct in output.used_nct_numbers if nct in ctx.deps.fetched_trials
    ]
    return output
