"""Make the build live, keeping the generations it replaces."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime

from scripts.pipeline.db.shadow import LIVE_SCHEMA
from scripts.pipeline.db.swap import (
    DEFAULT_KEEP_GENERATIONS,
    DEFAULT_LOCK_TIMEOUT,
    generations,
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
    pipeline: str,
    build: str,
    live: str = LIVE_SCHEMA,
    keep: int = DEFAULT_KEEP_GENERATIONS,
    lock_timeout: str = DEFAULT_LOCK_TIMEOUT,
) -> PublishResult:
    archived, published_at, pruned = await swap(
        pipeline=pipeline, build=build, live=live, keep=keep, lock_timeout=lock_timeout
    )
    return PublishResult(
        archived=archived,
        published_at=published_at,
        pruned=pruned,
        retained=await generations(pipeline),
    )
