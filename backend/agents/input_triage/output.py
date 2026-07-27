"""Structured verdict from the input-triage agent."""

from __future__ import annotations

from enum import StrEnum

from pydantic import BaseModel, Field


class TriageDecision(StrEnum):
    ALLOW = "allow"
    REFUSE = "refuse"


class RequestCategory(StrEnum):
    TRIAL_SEARCH = "trial_search"
    TERM_DEFINITION = "term_definition"
    PROVENANCE = "provenance"
    SMALL_TALK = "small_talk"
    MEDICAL_ADVICE = "medical_advice"
    TEXT_TRANSFORMATION = "text_transformation"
    PROMPT_INJECTION = "prompt_injection"
    OFF_TOPIC = "off_topic"


class TriageVerdict(BaseModel):
    """Whether a turn may reach the clinical-trials agent, and why."""

    decision: TriageDecision = Field(
        description="allow to let the turn proceed, refuse to block it."
    )
    category: RequestCategory = Field(
        description="The single category that best fits the latest patient message."
    )
    rationale: str = Field(description="One short sentence explaining the decision.")
