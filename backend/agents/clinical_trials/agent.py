"""Clinical-trials agent factory."""

from __future__ import annotations

from functools import lru_cache

from pydantic_ai import Agent, RunContext
from pydantic_ai.toolsets import FunctionToolset

from agents.clinical_trials.dependencies import AgentDeps
from agents.clinical_trials.guards import enforce_citations, within_tool_budget
from agents.clinical_trials.output import AgentResponse
from agents.clinical_trials.prompts import get_system_prompt
from agents.clinical_trials.tools import (
    define_term,
    get_trial_details,
    syntactic_search,
)
from core.config import get_settings
from core.llm import get_llm


@lru_cache
def get_clinical_trials_agent() -> Agent[AgentDeps, AgentResponse]:
    """Build the cached clinical-trials agent."""
    toolset = FunctionToolset[AgentDeps](
        [syntactic_search, get_trial_details, define_term]
    ).filtered(within_tool_budget)
    agent = Agent(
        get_llm(),
        deps_type=AgentDeps,
        output_type=AgentResponse,
        toolsets=[toolset],
        retries={"tools": get_settings().agent_tool_calls_limit},
    )

    @agent.instructions
    def _system_prompt(ctx: RunContext[AgentDeps]) -> str:
        return get_system_prompt()

    agent.output_validator(enforce_citations)

    return agent
