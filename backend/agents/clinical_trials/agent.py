"""Clinical-trials agent factory."""

from __future__ import annotations

from functools import lru_cache

from pydantic_ai import Agent, RunContext
from pydantic_ai.toolsets import FunctionToolset

from agents.clinical_trials.dependencies import AgentDeps
from agents.clinical_trials.guards import (
    enforce_citations,
    inject_vocabulary,
    tools_available,
)
from agents.clinical_trials.memory import render_memory
from agents.clinical_trials.output import AgentResponse
from agents.clinical_trials.prompts import get_clinical_trials_prompt
from agents.clinical_trials.tools import (
    define_term,
    get_trial_details,
    remember,
    semantic_search,
)
from core.config import get_settings
from core.llm import get_llm


@lru_cache
def get_clinical_trials_agent() -> Agent[AgentDeps, AgentResponse]:
    """Build the cached clinical-trials agent."""
    # `syntactic_search` is deliberately not registere
    toolset = (
        FunctionToolset[AgentDeps](
            [
                semantic_search,
                get_trial_details,
                define_term,
                remember,
            ]
        )
        .filtered(tools_available)
        .prepared(inject_vocabulary)
    )
    agent = Agent(
        get_llm(),
        deps_type=AgentDeps,
        output_type=AgentResponse,
        toolsets=[toolset],
        retries={"tools": get_settings().agent_tool_calls_limit, "output": 1},
    )

    @agent.instructions
    def _system_prompt(ctx: RunContext[AgentDeps]) -> str:
        return get_clinical_trials_prompt()

    @agent.instructions
    def _refusal_directive(ctx: RunContext[AgentDeps]) -> str:
        return ctx.deps.refusal_directive or ""

    @agent.instructions
    def _verified_context(ctx: RunContext[AgentDeps]) -> str:
        return ctx.deps.verified_context or ""

    @agent.instructions
    def _conversation_memory(ctx: RunContext[AgentDeps]) -> str:
        return render_memory(ctx.deps.memory) or ""

    agent.output_validator(enforce_citations)

    return agent
