"""Structured output from the translation agent."""

from __future__ import annotations

from pydantic import BaseModel, Field


class TranslatedLines(BaseModel):
    """One translated line per input line, in the same order."""

    lines: list[str] = Field(
        description=(
            "The translated lines, same count and same order as the numbered "
            "input lines. Never merge, split, drop, or reorder lines."
        )
    )
