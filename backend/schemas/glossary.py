"""Glossary term schema and dictionary sources."""

from __future__ import annotations

from enum import StrEnum

from pydantic import BaseModel


class GlossarySource(StrEnum):
    """Which NCI dictionary a term is looked up in."""

    CANCER_TERMS = "cancer_terms"
    GENETICS = "genetics"
    DRUGS = "drugs"


class GlossaryDefinition(BaseModel):
    """A plain-language definition of a medical, genetic, or drug term."""

    source: GlossarySource
    term: str
    definition: str
