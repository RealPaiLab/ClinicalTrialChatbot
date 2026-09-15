"""The build schema: the same tables as `public`, filled before anything is live."""

from __future__ import annotations

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from alembic.config import Config
from alembic.script import ScriptDirectory
from sqlalchemy import MetaData, Table, func, select, text
from sqlalchemy.ext.asyncio import AsyncConnection, AsyncSession

from core.database import AsyncSessionFactory, engine
from models.base import Base
from scripts.pipeline.db.tables import PIPELINE_TABLE_NAMES, PIPELINE_TABLES

LIVE_SCHEMA = "public"


def build_schema(pipeline: str) -> str:
    """Each pipeline fills its own shadow, so two runs can never share one."""
    return f"{pipeline}_build"


def in_schema(entity: type[Base], schema: str) -> Table:
    """The same table addressed in another schema, for statements spanning two."""
    table = Base.metadata.tables[entity.__tablename__]
    return table.to_metadata(MetaData(), schema=schema)


@asynccontextmanager
async def shadow_connection(schema: str) -> AsyncGenerator[AsyncConnection, None]:
    """A connection whose unqualified tables resolve to `schema`."""
    async with engine.begin() as connection:
        yield await connection.execution_options(schema_translate_map={None: schema})


@asynccontextmanager
async def shadow_session(schema: str) -> AsyncGenerator[AsyncSession, None]:
    """A session whose unqualified tables resolve to `schema`, for ORM loading."""
    async with AsyncSessionFactory() as session:
        await session.connection(
            execution_options={"schema_translate_map": {None: schema}}
        )
        yield session


async def assert_migrations_are_current() -> None:
    """A shadow built from stale models would publish the wrong shape."""
    head = ScriptDirectory.from_config(Config("alembic.ini")).get_current_head()
    async with engine.connect() as connection:
        result = await connection.execute(
            text("SELECT version_num FROM alembic_version")
        )
        stamped = result.scalar_one_or_none()
    if stamped != head:
        raise RuntimeError(
            f"database is at migration {stamped}, models are at {head}; "
            "run `uv run alembic upgrade head` first"
        )


def _build_tables() -> list[Table]:
    """Only what the swap moves. Anything else on `Base` stays in `public`."""
    return [Base.metadata.tables[name] for name in PIPELINE_TABLE_NAMES]


async def recreate(schema: str) -> None:
    """Drop and rebuild the schema from the models, indexes included."""
    async with engine.begin() as connection:
        await connection.execute(text(f'DROP SCHEMA IF EXISTS "{schema}" CASCADE'))
        await connection.execute(text(f'CREATE SCHEMA "{schema}"'))

    tables = _build_tables()
    async with shadow_connection(schema) as connection:
        await connection.run_sync(
            lambda sync_connection: Base.metadata.create_all(
                sync_connection, tables=tables
            )
        )


async def counts(schema: str) -> dict[str, int]:
    """Row counts per table, for the validation gate and the run summary."""
    async with shadow_connection(schema) as connection:
        return {
            entity.__tablename__: (
                await connection.execute(select(func.count()).select_from(entity))
            ).scalar_one()
            for entity in PIPELINE_TABLES
        }
