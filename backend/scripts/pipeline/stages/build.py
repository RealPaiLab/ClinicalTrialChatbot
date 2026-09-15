"""Fill the shadow schema"""

from __future__ import annotations

import uuid
from collections.abc import Mapping, Sequence
from dataclasses import dataclass

from sqlalchemy import func, update
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncConnection

from models import Location, Trial, TrialSite
from scripts.pipeline.canonical import (
    CanonicalTrial,
    collect_location_rows,
    to_site_rows,
    to_trial_row,
)
from scripts.pipeline.db.shadow import (
    LIVE_SCHEMA,
    assert_migrations_are_current,
    in_schema,
    recreate,
    shadow_connection,
)
from scripts.pipeline.stages.carry import CarryResult, carry_other_sources
from scripts.pipeline.stages.diff import DiffPlan

DEFAULT_BATCH_SIZE = 500


@dataclass(frozen=True, slots=True)
class BuildResult:
    schema: str
    trials: int
    locations: int
    trial_sites: int
    embeddings_carried: int
    coordinates_carried: int
    carried: CarryResult

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
    build, live = in_schema(Trial, schema), in_schema(Trial, source)
    result = await connection.execute(
        update(build)
        .where(live.c.id == build.c.id, build.c.id.in_(unchanged))
        .values(
            qwen_embedding=live.c.qwen_embedding,
            openai_embedding=live.c.openai_embedding,
        )
    )
    return result.rowcount


async def _carry_coordinates(
    connection: AsyncConnection,
    schema: str,
    source: str,
    geocode: frozenset[uuid.UUID],
) -> int:
    """Every location keeps its coordinates unless the diff queued it for geocoding,
    and a region the source left blank keeps the one reverse-geocoded last time."""
    build, live = in_schema(Location, schema), in_schema(Location, source)
    result = await connection.execute(
        update(build)
        .where(live.c.id == build.c.id, build.c.id.not_in(geocode))
        .values(
            lat=live.c.lat,
            lon=live.c.lon,
            city=func.coalesce(build.c.city, live.c.city),
            province=func.coalesce(build.c.province, live.c.province),
        )
    )
    return result.rowcount


async def build(
    incoming: Mapping[uuid.UUID, CanonicalTrial],
    plan: DiffPlan,
    *,
    data_source: str,
    schema: str,
    source: str = LIVE_SCHEMA,
    batch_size: int = DEFAULT_BATCH_SIZE,
) -> BuildResult:
    await assert_migrations_are_current()
    await recreate(schema)

    locations = [
        row.model_dump() for row in collect_location_rows(incoming.values()).values()
    ]
    trials = [
        to_trial_row(trial, data_source).model_dump() for trial in incoming.values()
    ]
    sites = [
        row.model_dump()
        for trial in incoming.values()
        for row in to_site_rows(trial, data_source)
    ]

    async with shadow_connection(schema) as connection:
        location_count = await _insert(connection, Location, locations, batch_size)
        trial_count = await _insert(connection, Trial, trials, batch_size)
        site_count = await _insert(connection, TrialSite, sites, batch_size)

        # After our own rows, so the conflict clauses decide what a shared trial keeps.
        carried = await carry_other_sources(
            connection, schema=schema, live=source, data_source=data_source
        )

        embeddings = await _carry_embeddings(connection, schema, source, plan.unchanged)
        coordinates = await _carry_coordinates(connection, schema, source, plan.geocode)

    return BuildResult(
        schema=schema,
        trials=trial_count,
        locations=location_count,
        trial_sites=site_count,
        embeddings_carried=embeddings,
        coordinates_carried=coordinates,
        carried=carried,
    )
