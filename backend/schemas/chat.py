"""Chat turn result schema."""

from __future__ import annotations

from pydantic import BaseModel, Field

from schemas.trial import TrialCitation


class ChatRequest(BaseModel):
    """Incoming chat turn request."""

    session_id: str
    user_message: str


class ChatResult(BaseModel):
    """Final assembled turn result."""

    message: str
    trials: list[TrialCitation] = Field(default_factory=list)
    follow_up_questions: list[str] = Field(default_factory=list)
    observation_id: str = ""
