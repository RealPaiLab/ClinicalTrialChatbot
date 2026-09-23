"""Async data access for the ingestion run log."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.ingestion_run import PUBLISHED, IngestionRun


class IngestionRunRepository:
    """Reads the publish history the pipeline writes."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def latest_published_per_pipeline(self) -> dict[str, IngestionRun]:
        """Each pipeline's newest publish that has not been rolled back."""
        statement = (
            select(IngestionRun)
            .where(IngestionRun.status == PUBLISHED)
            .order_by(IngestionRun.published_at.desc(), IngestionRun.id.desc())
        )
        result = await self._session.execute(statement)
        latest: dict[str, IngestionRun] = {}
        for run in result.scalars().all():
            latest.setdefault(run.pipeline, run)
        return latest
