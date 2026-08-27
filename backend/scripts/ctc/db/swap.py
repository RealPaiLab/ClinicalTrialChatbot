"""Publishing a build: one transaction, tables moved between schemas."""

from __future__ import annotations

from datetime import UTC, datetime

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncConnection

from core.database import engine
from models.base import Base
from scripts.ctc.db.shadow import BUILD_SCHEMA, LIVE_SCHEMA

GENERATION_PREFIX = "ctc_gen_"
DEFAULT_KEEP_GENERATIONS = 3
DEFAULT_LOCK_TIMEOUT = "5s"


def _generation_name() -> str:
    """Microseconds, so two publishes in the same second cannot collide."""
    return f"{GENERATION_PREFIX}{datetime.now(UTC):%Y%m%dT%H%M%S%f}Z"


def _move_order() -> list[str]:
    """Dependents first, so a partially applied move never dangles a foreign key."""
    return [table.name for table in reversed(Base.metadata.sorted_tables)]


async def _move(connection: AsyncConnection, source: str, target: str) -> None:
    for name in _move_order():
        await connection.execute(
            text(f'ALTER TABLE "{source}"."{name}" SET SCHEMA "{target}"')
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
) -> tuple[str, list[str]]:
    """Archive the live tables under a new generation, then move the build in."""
    archive = _generation_name()
    async with engine.begin() as connection:
        await connection.execute(text(f"SET LOCAL lock_timeout = '{lock_timeout}'"))
        await connection.execute(text(f'CREATE SCHEMA "{archive}"'))
        await _move(connection, live, archive)
        await _move(connection, build, live)
    return archive, await prune(keep)


async def rollback(
    *,
    build: str = BUILD_SCHEMA,
    live: str = LIVE_SCHEMA,
    lock_timeout: str = DEFAULT_LOCK_TIMEOUT,
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
    return newest
