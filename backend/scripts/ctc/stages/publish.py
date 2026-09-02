"""Make the build live, keeping the generations it replaces."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime

from scripts.ctc.db.shadow import BUILD_SCHEMA, LIVE_SCHEMA
from scripts.ctc.db.swap import (
    DEFAULT_KEEP_GENERATIONS,
    DEFAULT_LOCK_TIMEOUT,
    generations,
    rollback,
    swap,
)


@dataclass(frozen=True, slots=True)
class PublishResult:
    archived: str
    published_at: datetime
    pruned: list[str]
    retained: list[str]


async def publish(
    *,
    build: str = BUILD_SCHEMA,
    live: str = LIVE_SCHEMA,
    keep: int = DEFAULT_KEEP_GENERATIONS,
    lock_timeout: str = DEFAULT_LOCK_TIMEOUT,
) -> PublishResult:
    archived, published_at, pruned = await swap(
        build=build, live=live, keep=keep, lock_timeout=lock_timeout
    )
    return PublishResult(
        archived=archived,
        published_at=published_at,
        pruned=pruned,
        retained=await generations(),
    )


async def undo(
    *,
    build: str = BUILD_SCHEMA,
    live: str = LIVE_SCHEMA,
    lock_timeout: str = DEFAULT_LOCK_TIMEOUT,
) -> str:
    """Restore the newest generation. What is live now moves back to the build."""
    return await rollback(build=build, live=live, lock_timeout=lock_timeout)
