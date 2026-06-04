"""Input/output schemas for the clinical-trials agent tools."""

from __future__ import annotations

from pydantic import BaseModel, Field


class ToolInput(BaseModel):
    """Base input shared by every tool."""

    reasoning: str = Field(
        description="One short sentence on why you are calling this tool now."
    )


class SearchTrialsInput(ToolInput):
    cancer_types: list[str] = Field(
        default_factory=list,
        description='Cancer types to match, e.g. ["breast cancer", "lung"].',
    )
    locations: list[str] = Field(
        default_factory=list,
        description='Cities or provinces to match, e.g. ["Quebec", "Ontario"].',
    )
    statuses: list[str] = Field(
        default_factory=list,
        description='Recruiting statuses to match, e.g. ["recruiting"].',
    )
    phases: list[str] = Field(
        default_factory=list,
        description='Trial phases to match, e.g. ["PHASE2", "PHASE3"].',
    )


class KeywordSearchInput(ToolInput):
    query: str = Field(
        description="Free-text query across titles, descriptions, and criteria."
    )


class GetTrialDetailsInput(ToolInput):
    nct_numbers: list[str] = Field(
        description='NCT numbers to fetch full details for, e.g. ["NCT01234567"].'
    )


class TrialSearchHit(BaseModel):
    """Compact trial summary for the model; full details stay on deps."""

    nct_number: str | None = None
    title: str | None = None
    cancer_types: list[str] = Field(default_factory=list)
    phases: list[str] = Field(default_factory=list)
    cities: list[str] = Field(default_factory=list)
    provinces: list[str] = Field(default_factory=list)
    recruiting_statuses: list[str] = Field(default_factory=list)
