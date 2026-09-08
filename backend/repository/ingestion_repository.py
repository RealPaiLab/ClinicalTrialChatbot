"""Async data access for the ingestion run log."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.ingestion_run import PUBLISHED, IngestionRun


class IngestionRunRepository:
    """Reads the publish history the pipeline writes."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def latest_published(self, pipeline: str) -> IngestionRun | None:
        """The newest publish that has not been rolled back, or None."""
        statement = (
            select(IngestionRun)
            .where(IngestionRun.pipeline == pipeline, IngestionRun.status == PUBLISHED)
            .order_by(IngestionRun.published_at.desc(), IngestionRun.id.desc())
            .limit(1)
        )
        result = await self._session.execute(statement)
        return result.scalar_one_or_none()
