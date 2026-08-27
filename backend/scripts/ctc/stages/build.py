"""Fill the shadow schema"""

from __future__ import annotations

import uuid
from collections.abc import Mapping, Sequence
from dataclasses import dataclass

from sqlalchemy import ARRAY, bindparam, text
from sqlalchemy.dialects.postgresql import UUID as PgUUID
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncConnection

from models import Location, Trial, TrialSite
from scripts.ctc.canonical import (
    CanonicalTrial,
    collect_location_rows,
    to_site_rows,
    to_trial_row,
)
from scripts.ctc.db.shadow import (
    BUILD_SCHEMA,
    LIVE_SCHEMA,
    assert_migrations_are_current,
    recreate,
    shadow_connection,
)
from scripts.ctc.stages.diff import DiffPlan

DEFAULT_BATCH_SIZE = 500

_ID_ARRAY = ARRAY(PgUUID(as_uuid=True))


@dataclass(frozen=True, slots=True)
class BuildResult:
    schema: str
    trials: int
    locations: int
    trial_sites: int
    embeddings_carried: int
    coordinates_carried: int

    @property
    def to_embed(self) -> int:
        return self.trials - self.embeddings_carried

    @property
    def to_geocode(self) -> int:
        return self.locations - self.coordinates_carried


async def _insert(
    connection: AsyncConnection,
    table: type[Trial] | type[Location] | type[TrialSite],
    rows: Sequence[Mapping[str, object]],
    batch_size: int,
) -> int:
    for start in range(0, len(rows), batch_size):
        batch = rows[start : start + batch_size]
        await connection.execute(pg_insert(table).values(list(batch)))
    return len(rows)


async def _carry_embeddings(
    connection: AsyncConnection,
    schema: str,
    source: str,
    unchanged: frozenset[uuid.UUID],
) -> int:
    """An unchanged trial keeps the vectors we already paid to compute."""
    if not unchanged:
        return 0
    statement = text(
        f"""
        UPDATE "{schema}".trials AS build
        SET qwen_embedding = live.qwen_embedding,
            openai_embedding = live.openai_embedding
        FROM "{source}".trials AS live
        WHERE live.id = build.id AND build.id = ANY(:ids)
        """
    ).bindparams(bindparam("ids", type_=_ID_ARRAY))
    result = await connection.execute(statement, {"ids": list(unchanged)})
    return result.rowcount


async def _carry_coordinates(
    connection: AsyncConnection,
    schema: str,
    source: str,
    geocode: frozenset[uuid.UUID],
) -> int:
    """Every location keeps its coordinates unless the diff queued it for geocoding."""
    statement = text(
        f"""
        UPDATE "{schema}".locations AS build
        SET lat = live.lat, lon = live.lon
        FROM "{source}".locations AS live
        WHERE live.id = build.id AND NOT (build.id = ANY(:ids))
        """
    ).bindparams(bindparam("ids", type_=_ID_ARRAY))
    result = await connection.execute(statement, {"ids": list(geocode)})
    return result.rowcount


async def build(
    incoming: Mapping[uuid.UUID, CanonicalTrial],
    plan: DiffPlan,
    *,
    schema: str = BUILD_SCHEMA,
    source: str = LIVE_SCHEMA,
    batch_size: int = DEFAULT_BATCH_SIZE,
) -> BuildResult:
    await assert_migrations_are_current()
    await recreate(schema)

    locations = [
        row.model_dump() for row in collect_location_rows(incoming.values()).values()
    ]
    trials = [to_trial_row(trial).model_dump() for trial in incoming.values()]
    sites = [
        row.model_dump() for trial in incoming.values() for row in to_site_rows(trial)
    ]

    async with shadow_connection(schema) as connection:
        location_count = await _insert(connection, Location, locations, batch_size)
        trial_count = await _insert(connection, Trial, trials, batch_size)
        site_count = await _insert(connection, TrialSite, sites, batch_size)

        embeddings = await _carry_embeddings(connection, schema, source, plan.unchanged)
        coordinates = await _carry_coordinates(connection, schema, source, plan.geocode)

    return BuildResult(
        schema=schema,
        trials=trial_count,
        locations=location_count,
        trial_sites=site_count,
        embeddings_carried=embeddings,
        coordinates_carried=coordinates,
    )
