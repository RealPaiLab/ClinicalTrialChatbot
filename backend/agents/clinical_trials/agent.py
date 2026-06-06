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
    get_trial_details,
    keyword_search_trials,
    search_trials,
)
from core.config import get_settings
from core.llm import get_llm


@lru_cache
def get_clinical_trials_agent() -> Agent[AgentDeps, AgentResponse]:
    """Build the cached clinical-trials agent."""
    toolset = FunctionToolset[AgentDeps](
        [search_trials, keyword_search_trials, get_trial_details]
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
