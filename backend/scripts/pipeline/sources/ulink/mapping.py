"""One U-Link record as the canonical trial the rest of the pipeline reads."""

from __future__ import annotations

from datetime import UTC, datetime

from scripts.pipeline.canonical import (
    CanonicalCoordinator,
    CanonicalSite,
    CanonicalTrial,
    clean,
)
from scripts.pipeline.sources.ulink.records import UlinkCentre, UlinkRecord

# Roman numerals as the page spells them, to the phases CTC already uses.
PHASES: dict[str, str] = {
    "I": "PHASE1",
    "II": "PHASE2",
    "III": "PHASE3",
    "IV": "PHASE4",
}

# Listing statuses to the site states the app knows; the rest pass through lowercased.
SITE_STATES: dict[str, str] = {"Open": "recruiting"}


def phases_of(phase: str | None) -> list[str]:
    """`II/III` names two phases; `N/A` names none."""
    if not phase:
        return []
    return [PHASES[part] for part in phase.split("/") if part.strip() in PHASES]


def state_of(status: str | None) -> str | None:
    if not status:
        return None
    return SITE_STATES.get(status, status.lower())


def _lines(text: str | None) -> list[str]:
    return [
        line for line in (clean(part) for part in (text or "").splitlines()) if line
    ]


def _comma_separated(text: str | None) -> list[str]:
    return [part for part in (clean(part) for part in (text or "").split(",")) if part]


def _posted_at(day: str | None) -> datetime | None:
    if not day:
        return None
    return datetime.strptime(day, "%Y-%m-%d").replace(tzinfo=UTC)


def _site(centre: UlinkCentre, record: UlinkRecord) -> CanonicalSite:
    """No address: the page ships coordinates; geocode reverse-resolves the region."""
    return CanonicalSite.model_validate(
        {
            "name_en": centre.name,
            "state": state_of(record.status),
            "cancer_type_names": record.cancer_types,
            "coordinators": [
                CanonicalCoordinator(full_name=contact.name, email=contact.email)
                for contact in centre.contacts
            ],
            "lat": centre.lat,
            "lon": centre.lon,
        }
    )


def to_canonical(record: UlinkRecord) -> CanonicalTrial:
    return CanonicalTrial.model_validate(
        {
            "nct_number": record.nct_number,
            "acronym_or_protocol_id": record.protocol_id,
            "short_title_en": record.title,
            "official_title_en": record.title,
            "description_en": record.description,
            "inclusion_criteria_en": record.inclusion_criteria,
            "exclusion_criteria_en": record.exclusion_criteria,
            "phases": phases_of(record.phase),
            "intervention_names": _lines(record.routes),
            "treatment_lines": _comma_separated(record.treatment_lines),
            "sponsor_name": record.sponsor,
            "age_range_text": record.age,
            "source_key": record.nid,
            "source_updated_at": _posted_at(record.last_posted),
            "state": [record.status] if record.status else [],
            "cancer_type_names": record.cancer_types,
            "sites": [_site(centre, record) for centre in record.centres],
        }
    )
