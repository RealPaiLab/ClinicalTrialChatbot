"""What changed since the last run"""

from __future__ import annotations

import uuid
from collections.abc import Mapping
from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models import Location, TrialSite
from scripts.ctc.canonical import CanonicalTrial, LocationRow, to_location_rows
from scripts.ctc.strategies import ChangeStrategy


@dataclass(frozen=True, slots=True)
class LiveLocation:
    address: str | None
    lat: float | None
    lon: float | None

    def matches(self, row: LocationRow) -> bool:
        """Coordinates carry forward only if the address still agrees."""
        return self.address == row.address and self.lat is not None


@dataclass(frozen=True, slots=True)
class LiveSnapshot[LiveState]:
    """Read once. `LiveState` is whatever the strategy stored per trial, so a
    snapshot cannot be paired with a strategy that did not produce it."""

    trials: Mapping[uuid.UUID, LiveState]
    locations: Mapping[uuid.UUID, LiveLocation]
    site_states: Mapping[tuple[uuid.UUID, uuid.UUID], str | None]


@dataclass(frozen=True, slots=True)
class DiffPlan:
    unchanged: frozenset[uuid.UUID]
    changed: frozenset[uuid.UUID]
    added: frozenset[uuid.UUID]
    removed: frozenset[uuid.UUID]
    geocode: frozenset[uuid.UUID]

    @property
    def reembed(self) -> frozenset[uuid.UUID]:
        """A touched trial gets a fresh vector; a copied one keeps its own."""
        return self.changed | self.added

    @property
    def total_incoming(self) -> int:
        return len(self.unchanged) + len(self.changed) + len(self.added)


async def load_live[LiveState](
    session: AsyncSession, strategy: ChangeStrategy[LiveState]
) -> LiveSnapshot[LiveState]:
    trials = await strategy.snapshot(session)

    location_rows = await session.execute(
        select(Location.id, Location.address, Location.lat, Location.lon)
    )
    locations = {
        row.id: LiveLocation(address=row.address, lat=row.lat, lon=row.lon)
        for row in location_rows
    }

    site_rows = await session.execute(
        select(TrialSite.trial_id, TrialSite.location_id, TrialSite.state)
    )
    site_states = {(row.trial_id, row.location_id): row.state for row in site_rows}

    return LiveSnapshot(trials=trials, locations=locations, site_states=site_states)


def build_plan[LiveState](
    incoming: Mapping[uuid.UUID, CanonicalTrial],
    live: LiveSnapshot[LiveState],
    strategy: ChangeStrategy[LiveState],
    *,
    full_refresh: bool = False,
) -> DiffPlan:
    unchanged: set[uuid.UUID] = set()
    changed: set[uuid.UUID] = set()

    for trial_id, trial in incoming.items():
        if trial_id not in live.trials:
            continue
        if full_refresh or strategy.has_changed(trial, live.trials[trial_id]):
            changed.add(trial_id)
        else:
            unchanged.add(trial_id)

    added = frozenset(incoming.keys() - live.trials.keys())
    removed = frozenset(live.trials.keys() - incoming.keys())

    geocode = {
        row.id
        for trial in incoming.values()
        for row in to_location_rows(trial)
        if not _carried_forward(row, live)
    }

    return DiffPlan(
        unchanged=frozenset(unchanged),
        changed=frozenset(changed),
        added=added,
        removed=removed,
        geocode=frozenset(geocode),
    )


def _carried_forward[LiveState](
    row: LocationRow, live: LiveSnapshot[LiveState]
) -> bool:
    stored = live.locations.get(row.id)
    return stored is not None and stored.matches(row)


@dataclass(frozen=True, slots=True)
class SiteChange:
    """What moved at a trial's sites."""

    trial_id: uuid.UUID
    nct_number: str | None
    opened: tuple[str, ...]
    closed: tuple[str, ...]
    restated: tuple[tuple[str, str | None, str | None], ...]


def site_changes[LiveState](
    incoming: Mapping[uuid.UUID, CanonicalTrial],
    live: LiveSnapshot[LiveState],
    plan: DiffPlan,
) -> list[SiteChange]:
    """Site add/drop and status flips, for the standalone report."""
    by_trial: dict[uuid.UUID, dict[uuid.UUID, str | None]] = {}
    for (trial_id, location_id), state in live.site_states.items():
        by_trial.setdefault(trial_id, {})[location_id] = state

    changes: list[SiteChange] = []
    for trial_id in sorted(plan.changed, key=str):
        trial = incoming[trial_id]
        stored = by_trial.get(trial_id, {})
        names = {site.id: site.name_en for site in trial.sites}
        opened = tuple(sorted(names[sid] for sid in names.keys() - stored.keys()))
        closed = tuple(sorted(str(sid) for sid in stored.keys() - names.keys()))
        restated = tuple(
            (names[site.id], stored[site.id], site.state)
            for site in trial.sites
            if site.id in stored and stored[site.id] != site.state
        )
        if opened or closed or restated:
            changes.append(
                SiteChange(
                    trial_id=trial_id,
                    nct_number=trial.nct_number,
                    opened=opened,
                    closed=closed,
                    restated=restated,
                )
            )
    return changes
