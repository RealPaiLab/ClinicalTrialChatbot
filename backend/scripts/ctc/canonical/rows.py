from __future__ import annotations

import uuid
from collections.abc import Iterable
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from scripts.ctc.canonical.trial import CanonicalTrial


class RowBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class TrialRow(RowBase):
    id: uuid.UUID
    trial_ref: str
    nct_number: str | None
    acronym_or_protocol_id: str | None
    short_title_en: str | None
    official_title_en: str | None
    description_en: str | None
    inclusion_criteria_en: str | None
    exclusion_criteria_en: str | None
    phases: list[str]
    treatment_type_names: list[str]
    intervention_names: list[str]
    treatment_lines: list[str]
    disease_stages: list[str]
    study_type: str | None
    purpose: str | None
    sponsor_name: str | None
    source_updated_at: datetime | None


class LocationRow(RowBase):
    id: uuid.UUID
    name_en: str
    address: str | None
    city: str | None
    province: str | None


class SiteRow(RowBase):
    trial_id: uuid.UUID
    location_id: uuid.UUID
    state: str | None
    cancer_type_names: list[str]


TRIAL_COLUMNS: tuple[str, ...] = tuple(TrialRow.model_fields)
LOCATION_COLUMNS: tuple[str, ...] = tuple(LocationRow.model_fields)
SITE_COLUMNS: tuple[str, ...] = tuple(SiteRow.model_fields)


def to_trial_row(trial: CanonicalTrial) -> TrialRow:
    return TrialRow.model_validate(trial)


def to_location_rows(trial: CanonicalTrial) -> list[LocationRow]:
    """lat/lon belong to the geocode stage, not the source."""
    rows: list[LocationRow] = []
    for site in trial.sites:
        address = site.address
        rows.append(
            LocationRow(
                id=site.id,
                name_en=site.name_en,
                address=address.as_text() if address else None,
                city=address.city if address else None,
                province=address.province if address else None,
            )
        )
    return rows


def to_site_rows(trial: CanonicalTrial) -> list[SiteRow]:
    rows: list[SiteRow] = []
    seen: set[uuid.UUID] = set()
    for site in trial.sites:
        if site.id in seen:
            continue
        seen.add(site.id)
        rows.append(
            SiteRow(
                trial_id=trial.id,
                location_id=site.id,
                state=site.state,
                cancer_type_names=site.cancer_type_names,
            )
        )
    return rows


def collect_location_rows(
    trials: Iterable[CanonicalTrial],
) -> dict[uuid.UUID, LocationRow]:
    rows: dict[uuid.UUID, LocationRow] = {}
    for trial in trials:
        for site in trial.sites:
            if site.id in rows:
                continue
            address = site.address
            rows[site.id] = LocationRow(
                id=site.id,
                name_en=site.name_en,
                address=address.as_text() if address else None,
                city=address.city if address else None,
                province=address.province if address else None,
            )
    return rows
