from __future__ import annotations

import uuid
from collections.abc import Iterable
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from schemas.source import SourceCode
from schemas.trial_ref import derived_ref
from scripts.pipeline.canonical.coordinator import CanonicalCoordinator
from scripts.pipeline.canonical.site import CanonicalSite
from scripts.pipeline.canonical.trial import CanonicalTrial


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
    age_range_text: str | None
    source_keys: dict[str, str]
    source_updated_at: datetime | None


class LocationRow(RowBase):
    id: uuid.UUID
    name_en: str
    address: str | None
    city: str | None
    province: str | None
    lat: float | None
    lon: float | None


class SiteRow(RowBase):
    trial_id: uuid.UUID
    location_id: uuid.UUID
    data_sources: list[str]
    state: str | None
    cancer_type_names: list[str]
    coordinators: list[dict[str, str | None]]


TRIAL_COLUMNS: tuple[str, ...] = tuple(TrialRow.model_fields)
LOCATION_COLUMNS: tuple[str, ...] = tuple(LocationRow.model_fields)
SITE_COLUMNS: tuple[str, ...] = tuple(SiteRow.model_fields)


def to_trial_row(trial: CanonicalTrial, data_source: str) -> TrialRow:
    """The ref prefix and the URL key both name the source, so they are stamped
    here rather than on the record."""
    source = SourceCode(data_source)
    stamped = {
        "trial_ref": derived_ref(trial.id, source),
        "source_keys": {source.value: trial.source_key} if trial.source_key else {},
    }
    copied = {
        name: getattr(trial, name) for name in TRIAL_COLUMNS if name not in stamped
    }
    return TrialRow.model_validate(copied | stamped)


def _location_row(site: CanonicalSite) -> LocationRow:
    """Coordinates come from the source when it has them; the geocode stage
    fills the rest."""
    address = site.address
    return LocationRow(
        id=site.id,
        name_en=site.name_en,
        address=address.as_text() if address else None,
        city=address.city if address else None,
        province=address.province if address else None,
        lat=site.lat,
        lon=site.lon,
    )


def to_location_rows(trial: CanonicalTrial) -> list[LocationRow]:
    return [_location_row(site) for site in trial.sites]


def to_coordinator_rows(
    coordinators: Iterable[CanonicalCoordinator],
) -> list[dict[str, str | None]]:
    rows: list[dict[str, str | None]] = []
    for c in coordinators:
        if not c.full_name and not c.email and not c.phone_number:
            continue
        rows.append(
            {
                "full_name": c.full_name,
                "email": c.email,
                "phone_number": c.phone_number,
                "phone_extension": c.phone_extension,
            }
        )
    return rows


def to_site_rows(trial: CanonicalTrial, data_source: str) -> list[SiteRow]:
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
                data_sources=[data_source],
                state=site.state,
                cancer_type_names=site.cancer_type_names,
                coordinators=to_coordinator_rows(site.coordinators),
            )
        )
    return rows


def collect_location_rows(
    trials: Iterable[CanonicalTrial],
) -> dict[uuid.UUID, LocationRow]:
    rows: dict[uuid.UUID, LocationRow] = {}
    for trial in trials:
        for site in trial.sites:
            if site.id not in rows:
                rows[site.id] = _location_row(site)
    return rows
