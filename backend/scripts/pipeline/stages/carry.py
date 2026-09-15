"""Copy the other sources' rows into the build, since publish swaps whole tables."""

from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy import (
    ColumnElement,
    Table,
    cast,
    exists,
    func,
    select,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncConnection
from sqlalchemy.sql.base import ReadOnlyColumnCollection
from sqlalchemy.sql.elements import KeyedColumnElement
from sqlalchemy.types import Text

from models import Location, Trial, TrialSite
from schemas.source import rank
from scripts.pipeline.db.shadow import in_schema

# The key, and the two columns merged rather than replaced.
_NOT_NARRATIVE = frozenset({"id", "source_keys", "age_range_text"})


@dataclass(frozen=True, slots=True)
class CarryResult:
    locations: int
    trials: int
    trial_sites: int


def _others(sites: Table, source: str) -> ColumnElement[list[str]]:
    """A site's claims minus ours: what we carry, since our own rows are already in."""
    return func.array_remove(sites.c.data_sources, cast(source, Text))


def _owned_by_others(sites: Table, source: str) -> ColumnElement[bool]:
    return func.cardinality(_others(sites, source)) > 0


def _merged_trial(
    ours: Table,
    theirs: ReadOnlyColumnCollection[str, KeyedColumnElement[object]],
    source: str,
) -> dict[str, ColumnElement[object]]:
    """Keys and age always merge; only a higher-ranked source replaces the
    narrative, and with it the ref, so a merged trial keeps that source's prefix."""
    merged: dict[str, ColumnElement[object]] = {
        "source_keys": ours.c.source_keys.op("||", return_type=JSONB)(
            theirs.source_keys
        ),
        "age_range_text": func.coalesce(ours.c.age_range_text, theirs.age_range_text),
    }
    if rank(source) > 0:
        merged.update(
            {
                column.name: theirs[column.name]
                for column in ours.c
                if column.name not in _NOT_NARRATIVE
            }
        )
    return merged


async def carry_other_sources(
    connection: AsyncConnection, *, schema: str, live: str, data_source: str
) -> CarryResult:
    """Copy every row the other sources own from live into the build."""
    live_sites = in_schema(TrialSite, live)
    live_trials = in_schema(Trial, live)
    live_locations = in_schema(Location, live)
    owned = _owned_by_others(live_sites, data_source)

    build_locations = in_schema(Location, schema)
    locations = pg_insert(build_locations).from_select(
        list(live_locations.c.keys()),
        select(*live_locations.c).where(
            exists().where(live_sites.c.location_id == live_locations.c.id, owned)
        ),
    )
    # A centre both corpora name reads as the higher-ranked source spells it.
    carried_locations = await connection.execute(
        locations.on_conflict_do_update(
            index_elements=["id"],
            set_={
                column.name: locations.excluded[column.name]
                for column in build_locations.c
                if column.name != "id"
            },
        )
        if rank(data_source) > 0
        else locations.on_conflict_do_nothing(index_elements=["id"])
    )

    # Our own key is dropped from the carried map so the one we just wrote wins.
    build_trials = in_schema(Trial, schema)
    stripped = {
        "source_keys": live_trials.c.source_keys.op("-", return_type=JSONB)(
            cast(data_source, Text)
        ).label("source_keys")
    }
    trials = pg_insert(build_trials).from_select(
        list(live_trials.c.keys()),
        select(
            *(stripped.get(name, column) for name, column in live_trials.c.items())
        ).where(exists().where(live_sites.c.trial_id == live_trials.c.id, owned)),
    )
    carried_trials = await connection.execute(
        trials.on_conflict_do_update(
            index_elements=["id"],
            set_=_merged_trial(build_trials, trials.excluded, data_source),
        )
    )

    build_sites = in_schema(TrialSite, schema)
    reduced = {"data_sources": _others(live_sites, data_source).label("data_sources")}
    sites = pg_insert(build_sites).from_select(
        list(live_sites.c.keys()),
        select(
            *(reduced.get(name, column) for name, column in live_sites.c.items())
        ).where(owned),
    )
    carried_sites = await connection.execute(
        sites.on_conflict_do_update(
            index_elements=["trial_id", "location_id"],
            # Disjoint by construction: ours is [source], theirs had source removed.
            set_={
                "data_sources": build_sites.c.data_sources.op("||")(
                    sites.excluded.data_sources
                )
            },
        )
    )

    return CarryResult(
        locations=carried_locations.rowcount,
        trials=carried_trials.rowcount,
        trial_sites=carried_sites.rowcount,
    )
