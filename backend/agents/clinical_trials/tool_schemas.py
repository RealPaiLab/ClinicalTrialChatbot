"""Input/output schemas for the clinical-trials agent tools."""

from __future__ import annotations

from pydantic import BaseModel, Field

from schemas.cancer_types import CancerType
from schemas.glossary import GlossarySource

_CANCER_TYPES_DESC = (
    "Cancer-type buckets to match, from the controlled vocabulary, e.g. "
    '["Breast Cancer", "Lung Cancer"]. Pick the closest bucket(s); put clinical '
    "subtype, stage, or treatment detail in the semantic query instead."
)


class ToolInput(BaseModel):
    """Base input shared by every tool."""

    reasoning: str = Field(
        description="One short sentence on why you are calling this tool now."
    )


class SyntacticSearchInput(ToolInput):
    cancer_types: list[CancerType] = Field(
        default_factory=list,
        description=_CANCER_TYPES_DESC,
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
    query: str | None = Field(
        default=None,
        description="Optional free-text matched within titles, descriptions, and "
        "eligibility criteria (e.g. a symptom or treatment wording not captured by "
        "the fields above). It is AND'd with the filters, so it only searches "
        "trials that already match them. Leave empty for a purely structured search.",
    )
    limit: int = Field(
        default=5,
        ge=1,
        le=10,
        description="How many trials to return this page (1-10). Start small.",
    )
    offset: int = Field(
        default=0,
        ge=0,
        description="Trials to skip; raise by the previous limit to fetch the "
        "next page when the patient wants more.",
    )


class SemanticSearchInput(ToolInput):
    query: str = Field(
        description="A plain-language description of the patient's clinical "
        "situation and what they are looking for, written in English (translate "
        'first if the patient writes in another language), e.g. "stage IV '
        "non-small-cell lung cancer, progressed after chemotherapy, seeking "
        'immunotherapy".'
    )
    cancer_types: list[CancerType] = Field(
        default_factory=list,
        description=_CANCER_TYPES_DESC,
    )
    locations: list[str] = Field(
        default_factory=list,
        description='Cities or provinces to require, e.g. ["Quebec", "Ontario"].',
    )
    statuses: list[str] = Field(
        default_factory=list,
        description='Recruiting statuses to require, e.g. ["recruiting"].',
    )
    phases: list[str] = Field(
        default_factory=list,
        description='Trial phases to require, e.g. ["PHASE2", "PHASE3"].',
    )
    limit: int = Field(
        default=5,
        ge=1,
        le=10,
        description="How many of the best-matching trials to return (1-10). "
        "There is no pagination; raise the limit to see more.",
    )


class GetTrialDetailsInput(ToolInput):
    nct_numbers: list[str] = Field(
        description='NCT numbers to fetch full details for, e.g. ["NCT01234567"].'
    )


class DefineTermInput(ToolInput):
    term: str = Field(
        description=(
            "A single medical, genetic, or drug term to define in plain language, "
            'e.g. "metastatic", "allele", or "Gleevec".'
        )
    )
    source: GlossarySource = Field(
        default=GlossarySource.CANCER_TERMS,
        description=(
            "Which NCI dictionary to search, chosen from the term: 'cancer_terms' "
            "for general cancer and clinical-trial terms (default), 'genetics' for "
            "genetic or inherited-risk terms, 'drugs' for medication or drug names "
            "(including brand names)."
        ),
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
