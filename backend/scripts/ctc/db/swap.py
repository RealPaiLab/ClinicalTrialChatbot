"""Publishing a build: one transaction, tables moved between schemas."""

from __future__ import annotations

from datetime import UTC, datetime

from sqlalchemy import ScalarSelect, func, insert, select, text, update
from sqlalchemy.ext.asyncio import AsyncConnection

from core.database import engine
from models.ingestion_run import CTC_PIPELINE, PUBLISHED, ROLLED_BACK, IngestionRun
from models.trial import Trial
from scripts.ctc.db.shadow import BUILD_SCHEMA, LIVE_SCHEMA
from scripts.ctc.db.tables import PIPELINE_TABLE_NAMES

GENERATION_PREFIX = "ctc_gen_"
DEFAULT_KEEP_GENERATIONS = 3
DEFAULT_LOCK_TIMEOUT = "5s"


def _generation_name() -> str:
    """Microseconds, so two publishes in the same second cannot collide."""
    return f"{GENERATION_PREFIX}{datetime.now(UTC):%Y%m%dT%H%M%S%f}Z"


def _move_order() -> list[str]:
    """Dependents first, so a partially applied move never dangles a foreign key."""
    return list(reversed(PIPELINE_TABLE_NAMES))


async def _move(connection: AsyncConnection, source: str, target: str) -> None:
    for name in _move_order():
        await connection.execute(
            text(f'ALTER TABLE "{source}"."{name}" SET SCHEMA "{target}"')
        )


def _newest_published(pipeline: str) -> ScalarSelect[int]:
    return (
        select(IngestionRun.id)
        .where(IngestionRun.pipeline == pipeline, IngestionRun.status == PUBLISHED)
        .order_by(IngestionRun.published_at.desc(), IngestionRun.id.desc())
        .limit(1)
        .scalar_subquery()
    )


async def _record_run(
    connection: AsyncConnection, live: str, pipeline: str, generation: str
) -> datetime:
    """Log the publish in the transaction that performs it, so the two land
    together. Re-running publish to fix a lost record would swap a second time."""
    scoped = await connection.execution_options(schema_translate_map={None: live})
    count = await scoped.execute(select(func.count()).select_from(Trial))
    recorded = await scoped.execute(
        insert(IngestionRun)
        .values(
            pipeline=pipeline,
            generation=generation,
            trial_count=count.scalar_one(),
            status=PUBLISHED,
        )
        .returning(IngestionRun.published_at)
    )
    published_at: datetime = recorded.scalar_one()
    return published_at


async def _retire_run(connection: AsyncConnection, live: str, pipeline: str) -> None:
    """Mark the newest publish as undone, so the freshness date walks back."""
    scoped = await connection.execution_options(schema_translate_map={None: live})
    await scoped.execute(
        update(IngestionRun)
        .where(IngestionRun.id == _newest_published(pipeline))
        .values(status=ROLLED_BACK, rolled_back_at=func.now())
    )


async def generations() -> list[str]:
    """Published generations, newest first. The timestamp makes the name sortable."""
    async with engine.connect() as connection:
        result = await connection.execute(
            text(
                "SELECT schema_name FROM information_schema.schemata "
                "WHERE schema_name LIKE :prefix ORDER BY schema_name DESC"
            ),
            {"prefix": f"{GENERATION_PREFIX}%"},
        )
        return [row[0] for row in result]


async def prune(keep: int = DEFAULT_KEEP_GENERATIONS) -> list[str]:
    """Drop the generations older than the ones worth keeping."""
    stale = (await generations())[keep:]
    if stale:
        async with engine.begin() as connection:
            for schema in stale:
                await connection.execute(text(f'DROP SCHEMA "{schema}" CASCADE'))
    return stale


async def swap(
    *,
    build: str = BUILD_SCHEMA,
    live: str = LIVE_SCHEMA,
    keep: int = DEFAULT_KEEP_GENERATIONS,
    lock_timeout: str = DEFAULT_LOCK_TIMEOUT,
    pipeline: str = CTC_PIPELINE,
) -> tuple[str, datetime, list[str]]:
    """Archive the live tables under a new generation, then move the build in."""
    archive = _generation_name()
    async with engine.begin() as connection:
        await connection.execute(text(f"SET LOCAL lock_timeout = '{lock_timeout}'"))
        await connection.execute(text(f'CREATE SCHEMA "{archive}"'))
        await _move(connection, live, archive)
        await _move(connection, build, live)
        published_at = await _record_run(connection, live, pipeline, archive)
    return archive, published_at, await prune(keep)


async def rollback(
    *,
    build: str = BUILD_SCHEMA,
    live: str = LIVE_SCHEMA,
    lock_timeout: str = DEFAULT_LOCK_TIMEOUT,
    pipeline: str = CTC_PIPELINE,
) -> str:
    """Restore the newest archived generation; what was live moves to the build."""
    available = await generations()
    if not available:
        raise RuntimeError("no published generation to roll back to")
    newest = available[0]

    async with engine.begin() as connection:
        await connection.execute(text(f"SET LOCAL lock_timeout = '{lock_timeout}'"))
        await connection.execute(text(f'DROP SCHEMA IF EXISTS "{build}" CASCADE'))
        await connection.execute(text(f'CREATE SCHEMA "{build}"'))
        await _move(connection, live, build)
        await _move(connection, newest, live)
        await connection.execute(text(f'DROP SCHEMA "{newest}" CASCADE'))
        await _retire_run(connection, live, pipeline)
    return newest
