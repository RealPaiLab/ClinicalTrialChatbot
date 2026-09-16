"""One run at a time: a build carries every corpus and publish swaps whole tables."""

from __future__ import annotations

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from sqlalchemy import text

from core.database import engine

# One key for every pipeline: they share the live tables, so they share the lock.
INGESTION_LOCK_KEY = 7_364_100


@asynccontextmanager
async def exclusive_run() -> AsyncGenerator[None, None]:
    """Hold a session-level advisory lock for the whole run; a second run fails fast."""
    async with engine.connect() as connection:
        acquired = await connection.execute(
            text("SELECT pg_try_advisory_lock(:key)"), {"key": INGESTION_LOCK_KEY}
        )
        if not acquired.scalar_one():
            raise RuntimeError(
                "another pipeline run holds the ingestion lock; let it finish first"
            )
        try:
            yield
        finally:
            await connection.execute(
                text("SELECT pg_advisory_unlock(:key)"), {"key": INGESTION_LOCK_KEY}
            )
