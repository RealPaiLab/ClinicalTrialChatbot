"""Change detection from the source's own `updatedAt`."""

from __future__ import annotations

import uuid
from collections.abc import Mapping
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models import Trial
from scripts.ctc.canonical import CanonicalTrial


class TimestampStrategy:
    """Unchanged iff the source's timestamp matches the one we stored."""

    name = "timestamp"

    async def snapshot(
        self, session: AsyncSession
    ) -> Mapping[uuid.UUID, datetime | None]:
        rows = await session.execute(select(Trial.id, Trial.source_updated_at))
        return {row.id: row.source_updated_at for row in rows}

    def has_changed(self, incoming: CanonicalTrial, live: datetime | None) -> bool:
        return live is None or incoming.source_updated_at != live
