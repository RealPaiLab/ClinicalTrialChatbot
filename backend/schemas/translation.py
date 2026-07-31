"""Translated trial content schemas."""

from __future__ import annotations

from enum import StrEnum

from pydantic import BaseModel, Field

from schemas.language import Language


class TranslationSource(StrEnum):
    """Where a translation came from, so the UI can qualify what it shows."""

    OFFICIAL = "official"
    MACHINE = "machine"
    UNAVAILABLE = "unavailable"


class TrialTranslation(BaseModel):
    """A trial's free-text fields rendered in one language."""

    nct_number: str
    language: Language
    source: TranslationSource
    short_title: str | None = None
    official_title: str | None = None
    description: str | None = None
    inclusion_criteria: str | None = None
    exclusion_criteria: str | None = None
    cancer_type_names: dict[str, str] = Field(default_factory=dict)
    treatment_type_names: dict[str, str] = Field(default_factory=dict)
