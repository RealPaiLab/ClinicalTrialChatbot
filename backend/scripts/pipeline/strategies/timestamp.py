"""Change detection from the source's own `updatedAt`."""

from __future__ import annotations

import uuid
from collections.abc import Mapping
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models import Trial
from scripts.pipeline.canonical import CanonicalTrial
from scripts.pipeline.db.provenance import listed_by


class TimestampStrategy:
    """Unchanged iff the source's timestamp matches the one we stored."""

    name = "timestamp"

    async def snapshot(
        self, session: AsyncSession, data_source: str
    ) -> Mapping[uuid.UUID, object]:
        rows = await session.execute(
            select(Trial.id, Trial.source_updated_at).where(
                listed_by(Trial.id, data_source)
            )
        )
        return {row.id: row.source_updated_at for row in rows}

    def has_changed(self, incoming: CanonicalTrial, live: object) -> bool:
        stored = live if isinstance(live, datetime) else None
        return stored is None or incoming.source_updated_at != stored
