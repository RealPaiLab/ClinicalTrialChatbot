"""Structured output for the clinical-trials agent."""

from __future__ import annotations

from pydantic import BaseModel, Field


class AgentResponse(BaseModel):
    """The agent's final answer for one turn."""

    message: str = Field(
        description=(
            "Natural-language answer for the patient. Cite each referenced trial "
            "inline by its NCT number in square brackets, e.g. [NCT01234567]."
        )
    )
    used_nct_numbers: list[str] = Field(
        default_factory=list,
        description=(
            "NCT numbers of the trials actually used to answer this turn "
            "(not every trial a tool returned)."
        ),
    )
    follow_up_questions: list[str] = Field(
        default_factory=list,
        description=(
            "2-4 short suggested replies the patient can tap to continue, written "
            "in the patient's own voice as quick prompts (e.g. 'Only recruiting "
            "trials', 'Trials in Ontario', 'Tell me about the first one'). These "
            "are options for the patient to send next, NOT questions you ask them."
        ),
    )
