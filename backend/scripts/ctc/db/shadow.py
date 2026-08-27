"""The build schema: the same tables as `public`, filled before anything is live."""

from __future__ import annotations

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from alembic.config import Config
from alembic.script import ScriptDirectory
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncConnection

from core.database import engine
from models.base import Base

BUILD_SCHEMA = "ctc_build"
LIVE_SCHEMA = "public"


@asynccontextmanager
async def shadow_connection(schema: str) -> AsyncGenerator[AsyncConnection, None]:
    """A connection whose unqualified tables resolve to `schema`."""
    async with engine.begin() as connection:
        yield await connection.execution_options(schema_translate_map={None: schema})


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


async def recreate(schema: str) -> None:
    """Drop and rebuild the schema from the models, indexes included."""
    async with engine.begin() as connection:
        await connection.execute(text(f'DROP SCHEMA IF EXISTS "{schema}" CASCADE'))
        await connection.execute(text(f'CREATE SCHEMA "{schema}"'))

    async with shadow_connection(schema) as connection:
        await connection.run_sync(Base.metadata.create_all)
