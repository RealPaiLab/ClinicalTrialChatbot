from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import Field, computed_field

from scripts.ctc.canonical.base import CanonicalBase
from scripts.ctc.canonical.fields import (
    Blankable,
    Name,
    NameEn,
    Names,
    NamesEn,
    Strings,
)
from scripts.ctc.canonical.identity import derived_id
from scripts.ctc.canonical.site import CanonicalSite


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

    source_updated_at: datetime | None = Field(default=None, alias="updatedAt")

    # Captured, not loaded: no column exists for these yet.
    state: Strings = Field(default_factory=list)
    biomarkers: NamesEn = Field(default_factory=list)
    cancer_type_names: NamesEn = Field(default_factory=list, alias="cancerTypes")

    sites: list[CanonicalSite] = Field(default_factory=list)

    @computed_field  # type: ignore[prop-decorator]
    @property
    def id(self) -> uuid.UUID:
        """NCT alone collides (one study, several protocol records) and is missing on
        some trials; the acronym is always there. Together they are unique."""
        return derived_id(self.nct_number, self.acronym_or_protocol_id)
