from __future__ import annotations

import uuid
from datetime import UTC, datetime

from scripts.ctc.canonical import CanonicalTrial, index_trials, to_location_rows
from scripts.ctc.stages.diff import (
    LiveLocation,
    LiveSnapshot,
    build_plan,
    site_changes,
)
from scripts.ctc.strategies import TimestampStrategy
from tests.factories import make_source_trial

MAY = datetime(2026, 5, 30, tzinfo=UTC)
AUGUST = datetime(2026, 8, 21, tzinfo=UTC)
STRATEGY = TimestampStrategy()


def make_trial(
    nct: str,
    *,
    updated_at: datetime | None = MAY,
    sites: list[tuple[str, str, str | None]] | None = None,
) -> CanonicalTrial:
    return CanonicalTrial.model_validate(
        make_source_trial(
            nct,
            updated_at=updated_at.isoformat() if updated_at else None,
            sites=sites or [],
        )
    )


def snapshot(
    incoming: dict[uuid.UUID, CanonicalTrial],
    *,
    stored_at: datetime | None = MAY,
    geocoded: bool = True,
) -> LiveSnapshot:
    return LiveSnapshot(
        trials=dict.fromkeys(incoming, stored_at),
        locations={
            row.id: LiveLocation(
                address=row.address, lat=43.6 if geocoded else None, lon=-79.4
            )
            for trial in incoming.values()
            for row in to_location_rows(trial)
        },
        site_states={
            (trial.id, site.id): site.state
            for trial in incoming.values()
            for site in trial.sites
        },
    )


def test_the_timestamp_decides_changed_or_unchanged() -> None:
    """A stored None means a row seeded before this pipeline: rebuild it."""
    same = index_trials([make_trial("NCT01", updated_at=MAY)])
    assert build_plan(same, snapshot(same), STRATEGY).unchanged == set(same)

    moved = index_trials([make_trial("NCT01", updated_at=AUGUST)])
    plan = build_plan(moved, snapshot(moved, stored_at=MAY), STRATEGY)
    assert plan.changed == plan.reembed == set(moved)

    assert build_plan(same, snapshot(same, stored_at=None), STRATEGY).changed == set(
        same
    )


def test_trials_only_one_side_knows_are_added_or_removed() -> None:
    kept, dropped = make_trial("NCT01"), make_trial("NCT02")
    live = snapshot(index_trials([kept, dropped]))

    plan = build_plan(index_trials([kept]), live, STRATEGY)

    assert plan.removed == {dropped.id}
    assert not plan.added

    fresh = index_trials([make_trial("NCT03")])
    assert build_plan(fresh, live, STRATEGY).added == set(fresh)


def test_full_refresh_rebuilds_everything() -> None:
    """The correction run for anything the timestamp silently missed."""
    incoming = index_trials([make_trial("NCT01"), make_trial("NCT02")])

    plan = build_plan(incoming, snapshot(incoming), STRATEGY, full_refresh=True)

    assert plan.changed == set(incoming)
    assert not plan.unchanged


def test_only_new_or_moved_or_ungeocoded_addresses_are_queued() -> None:
    settled = make_trial("NCT01", sites=[("Princess Margaret", "610 University", None)])
    live = snapshot(index_trials([settled]))

    assert not build_plan(index_trials([settled]), live, STRATEGY).geocode

    moved = make_trial("NCT01", sites=[("Princess Margaret", "700 Bay St", None)])
    assert build_plan(index_trials([moved]), live, STRATEGY).geocode == {
        moved.sites[0].id
    }

    never = snapshot(index_trials([settled]), geocoded=False)
    assert build_plan(index_trials([settled]), never, STRATEGY).geocode == {
        settled.sites[0].id
    }


def test_repeated_records_combine_but_a_dropped_site_does_not_survive() -> None:
    """Combining is within one fetch, so it can never resurrect a removed site."""
    both = index_trials(
        [
            make_trial("NCT01", sites=[("Princess Margaret", "610 University", None)]),
            make_trial("NCT01", sites=[("CHUM", "1051 Sanguinet", None)]),
        ]
    )
    assert {s.name_en for s in next(iter(both.values())).sites} == {
        "Princess Margaret",
        "CHUM",
    }

    after = index_trials(
        [make_trial("NCT01", sites=[("Princess Margaret", "610 University", None)])]
    )
    kept = next(iter(after.values()))
    assert [s.name_en for s in kept.sites] == ["Princess Margaret"]


def test_the_report_names_sites_that_opened_or_changed_status() -> None:
    before = make_trial(
        "NCT01", sites=[("Princess Margaret", "610 University", "recruiting")]
    )
    live = snapshot(index_trials([before]))

    after = make_trial(
        "NCT01",
        updated_at=AUGUST,
        sites=[
            ("Princess Margaret", "610 University", "closed"),
            ("CHUM", "1051 Sanguinet", "recruiting"),
        ],
    )
    incoming = index_trials([after])

    (change,) = site_changes(incoming, live, build_plan(incoming, live, STRATEGY))

    assert change.opened == ("CHUM",)
    assert change.restated == (("Princess Margaret", "recruiting", "closed"),)
