"""Input-triage agent factory."""

from __future__ import annotations

from functools import lru_cache

from pydantic_ai import Agent

from agents.input_triage.output import TriageVerdict
from agents.input_triage.prompts import get_triage_prompt
from core.config import get_settings
from core.llm import get_llm


@lru_cache
def get_input_triage_agent() -> Agent[None, TriageVerdict]:
    """Build the cached classify-and-gate agent (no tools, no deps)."""
    settings = get_settings()
    return Agent(
        get_llm(model=settings.triage_llm_model or settings.llm_model),
        output_type=TriageVerdict,
        instructions=get_triage_prompt(),
    )
