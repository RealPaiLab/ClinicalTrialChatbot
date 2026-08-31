from __future__ import annotations

import uuid

from models import Location, Trial, TrialSite
from scripts.ctc.canonical import (
    LOCATION_COLUMNS,
    SITE_COLUMNS,
    TRIAL_COLUMNS,
    CanonicalTrial,
    derived_id,
    to_location_rows,
    to_site_rows,
    to_trial_row,
)

SITE = {
    "id": "a13daf58-cb15-4b8c-867e-4e8c8ed3c842",
    "nameEn": "Cross Cancer Institute",
    "addresses": [{"city": "Edmonton", "province": "Alberta", "isPrimary": True}],
    "coordinators": [{"email": "coordinator@example.org"}],
    "state": "recruiting",
    "cancerTypes": [{"nameEn": "Sarcoma"}],
}

PAYLOAD = {
    "id": "d8d62a06-dbdf-4259-9308-a08974fb6a4d",
    "nctNumber": "NCT06422806",
    "acronymOrProtocolId": "SRC.8 ",
    "shortTitleEn": "A sarcoma trial\n",
    "exclusionCriteriaEn": "-",
    "treatmentLines": [{"name": "NA"}],
    "biomarkers": [{"nameEn": "BRCA1"}],
    "updatedAt": "2026-08-21T17:45:56.916749+00:00",
    "sites": [SITE],
}


def test_blank_markers_and_stray_whitespace_are_normalized() -> None:
    """The source spells "no value" as '-', 'NA' or trailing whitespace."""
    trial = CanonicalTrial.model_validate(PAYLOAD)

    assert trial.exclusion_criteria_en is None
    assert trial.treatment_lines == []
    assert trial.acronym_or_protocol_id == "SRC.8"
    assert trial.short_title_en == "A sarcoma trial"


def test_identity_is_derived_from_the_business_key() -> None:
    """Ids must not depend on the source shipping one, or on stray whitespace."""
    trial = CanonicalTrial.model_validate(PAYLOAD)
    without_id = CanonicalTrial.model_validate(
        {k: v for k, v in PAYLOAD.items() if k != "id"}
    )

    assert trial.id == without_id.id != trial.source_id
    assert derived_id("NCT05272826", "CMRG 010") == derived_id(
        "nct05272826", "CMRG 010 "
    )
    assert derived_id(None, "SRC.8") != derived_id("NCT06422806", "SRC.8")


def test_only_projected_columns_reach_the_database() -> None:
    """The trial-level vocabulary is captured, never loaded."""
    trial = CanonicalTrial.model_validate(PAYLOAD)

    assert trial.biomarkers == ["BRCA1"]

    for columns, model, row in (
        (TRIAL_COLUMNS, Trial, to_trial_row(trial)),
        (LOCATION_COLUMNS, Location, to_location_rows(trial)[0]),
        (SITE_COLUMNS, TrialSite, to_site_rows(trial)[0]),
    ):
        assert set(columns) <= {column.name for column in model.__table__.columns}
        assert set(row.model_dump()) == set(columns)


def test_coordinators_are_projected_as_contactable_rows() -> None:
    """Every field is optional; only an entry with no way to reach anyone is dropped."""
    site = {
        **SITE,
        "coordinators": [
            {
                "firstName": "Ada",
                "lastName": "Lovelace",
                "phoneNumber": "416-946-4501 ",
            },
            {"email": "coordinator@example.org"},
            {"phoneNumber": "902-473-2700", "phoneExtension": "204"},
            {"phoneExtension": "204"},
        ],
    }
    trial = CanonicalTrial.model_validate({**PAYLOAD, "sites": [site]})

    assert to_site_rows(trial)[0].coordinators == [
        {
            "full_name": "Ada Lovelace",
            "email": None,
            "phone_number": "416-946-4501",
            "phone_extension": None,
        },
        {
            "full_name": None,
            "email": "coordinator@example.org",
            "phone_number": None,
            "phone_extension": None,
        },
        {
            "full_name": None,
            "email": None,
            "phone_number": "902-473-2700",
            "phone_extension": "204",
        },
    ]


def test_a_site_listed_twice_yields_one_junction_row() -> None:
    trial = CanonicalTrial.model_validate({**PAYLOAD, "sites": [SITE, SITE]})

    assert len(to_site_rows(trial)) == 1
    assert to_site_rows(trial)[0].location_id == uuid.UUID(
        str(derived_id("Cross Cancer Institute"))
    )
