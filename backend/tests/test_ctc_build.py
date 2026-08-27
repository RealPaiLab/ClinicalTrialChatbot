from __future__ import annotations

import uuid

from scripts.ctc.canonical import CanonicalTrial, index_trials
from scripts.ctc.stages.build import BuildResult
from tests.factories import make_source_trial


def make_trial(nct: str, sites: list[str]) -> CanonicalTrial:
    return CanonicalTrial.model_validate(
        make_source_trial(nct, sites=[(name, None, None) for name in sites])
    )


def test_the_result_reports_what_the_next_stages_still_owe() -> None:
    """A carried row costs nothing; the remainder is the Mapbox and OpenAI bill."""
    result = BuildResult(
        schema="ctc_build",
        trials=1218,
        locations=148,
        trial_sites=2856,
        embeddings_carried=1200,
        coordinates_carried=146,
    )

    assert result.to_embed == 18
    assert result.to_geocode == 2


def test_one_location_row_per_place_however_many_trials_use_it() -> None:
    """The rows the build inserts are deduped by primary key, not by trial."""
    from scripts.ctc.canonical import to_location_rows

    incoming = index_trials(
        [
            make_trial("NCT01", ["Princess Margaret", "CHUM"]),
            make_trial("NCT02", ["Princess Margaret"]),
        ]
    )
    rows = {
        row.id: row for trial in incoming.values() for row in to_location_rows(trial)
    }

    assert len(rows) == 2
    assert sum(len(trial.sites) for trial in incoming.values()) == 3


def test_a_dropped_site_leaves_no_junction_row_to_write() -> None:
    """Rows are written fresh, so removal needs no delete path."""
    from scripts.ctc.canonical import to_site_rows

    before = index_trials([make_trial("NCT01", ["Princess Margaret", "CHUM"])])
    after = index_trials([make_trial("NCT01", ["Princess Margaret"])])

    written: set[uuid.UUID] = {
        row.location_id for trial in after.values() for row in to_site_rows(trial)
    }
    dropped = {
        row.location_id for trial in before.values() for row in to_site_rows(trial)
    } - written

    assert len(written) == 1
    assert len(dropped) == 1
