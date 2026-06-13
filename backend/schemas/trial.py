"""Trial citation schemas."""

from __future__ import annotations

from pydantic import BaseModel, Field


class TrialSiteInfo(BaseModel):
    """A trial site (joined to its Location)."""

    name_en: str
    address: str | None = None
    city: str | None = None
    province: str | None = None
    lat: float | None = None
    lon: float | None = None
    state: str | None = None
    cancer_type_names: list[str] = Field(default_factory=list)


class TrialCitation(BaseModel):
    """A trial in a shape safe to cite and render, keyed by NCT number."""

    nct_number: str | None = None
    acronym_or_protocol_id: str | None = None
    short_title_en: str | None = None
    official_title_en: str | None = None
    description_en: str | None = None
    phases: list[str] = Field(default_factory=list)
    sites: list[TrialSiteInfo] = Field(default_factory=list)


class TrialFilter(BaseModel):
    """Structured-search filters"""

    cancer_types: list[str] = Field(default_factory=list)
    locations: list[str] = Field(default_factory=list)
    statuses: list[str] = Field(default_factory=list)
    phases: list[str] = Field(default_factory=list)
