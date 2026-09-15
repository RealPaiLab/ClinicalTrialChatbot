from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import Field, computed_field

from scripts.pipeline.canonical.base import CanonicalBase
from scripts.pipeline.canonical.fields import (
    Blankable,
    Name,
    NameEn,
    Names,
    NamesEn,
    Strings,
)
from scripts.pipeline.canonical.identity import derived_id
from scripts.pipeline.canonical.site import CanonicalSite


class CanonicalTrial(CanonicalBase):
    source_id: uuid.UUID | None = Field(default=None, alias="id")
    nct_number: Blankable = None
    acronym_or_protocol_id: Blankable = None

    short_title_en: Blankable = None
    official_title_en: Blankable = None
    description_en: Blankable = None
    inclusion_criteria_en: Blankable = None
    exclusion_criteria_en: Blankable = None

    phases: Strings = Field(default_factory=list)
    treatment_type_names: Names = Field(default_factory=list, alias="treatmentTypes")
    intervention_names: NamesEn = Field(default_factory=list, alias="interventions")
    treatment_lines: Names = Field(default_factory=list)
    disease_stages: Names = Field(default_factory=list, alias="diseaseStages")

    study_type: NameEn = Field(default=None, alias="type")
    purpose: Name = None
    sponsor_name: NameEn = Field(default=None, alias="sponsor")

    # Age eligibility verbatim; there is no parser, the string is shown and embedded.
    age_range_text: Blankable = None
    # The token this source's public trial URL is built from.
    source_key: Blankable = None

    source_updated_at: datetime | None = Field(default=None, alias="updatedAt")

    # Captured, not loaded: no column exists for these yet.
    state: Strings = Field(default_factory=list)
    biomarkers: NamesEn = Field(default_factory=list)
    cancer_type_names: NamesEn = Field(default_factory=list, alias="cancerTypes")

    sites: list[CanonicalSite] = Field(default_factory=list)

    @computed_field  # type: ignore[prop-decorator]
    @property
    def id(self) -> uuid.UUID:
        """The NCT number is the one key both registries share, so a trial they
        both list becomes one row. Only a trial without one keys on its protocol id."""
        if self.nct_number:
            return derived_id(self.nct_number)
        return derived_id(None, self.acronym_or_protocol_id)
