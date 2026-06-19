"""User feedback request schema."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class FeedbackRequest(BaseModel):
    """Explicit user feedback on a single chat turn."""

    session_id: str
    observation_id: str
    score: Literal[0, 1]
    comment: str | None = None
    suggested_nct_numbers: list[str] = Field(default_factory=list)
