"""Clinical-trials agent factory."""

from __future__ import annotations

from functools import lru_cache

from pydantic_ai import Agent, RunContext

from agents.clinical_trials.dependencies import AgentDeps
from agents.clinical_trials.output import AgentResponse
from agents.clinical_trials.prompts import get_system_prompt
from agents.clinical_trials.tools import (
    get_trial_details,
    keyword_search_trials,
    search_trials,
)
from core.llm import get_llm


@lru_cache
def get_clinical_trials_agent() -> Agent[AgentDeps, AgentResponse]:
    """Build the cached clinical-trials agent."""
    agent = Agent(
        get_llm(),
        deps_type=AgentDeps,
        output_type=AgentResponse,
        tools=[search_trials, keyword_search_trials, get_trial_details],
    )

    @agent.instructions
    def _system_prompt(ctx: RunContext[AgentDeps]) -> str:
        return get_system_prompt()

    @agent.output_validator
    def _enforce_citations(
        ctx: RunContext[AgentDeps], output: AgentResponse
    ) -> AgentResponse:
        """Drop any cited NCT number a tool never actually returned."""
        output.used_nct_numbers = [
            nct for nct in output.used_nct_numbers if nct in ctx.deps.fetched_trials
        ]
        return output

    return agent
