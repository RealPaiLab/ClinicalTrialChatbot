"""When the trial corpus was last published."""

from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from core.database import ReadOnlySessionFactory
from models.ingestion_run import CTC_PIPELINE
from repository.ingestion_repository import IngestionRunRepository
from schemas.ingestion import DataFreshness


class DataFreshnessService:
    def __init__(
        self,
        session_factory: async_sessionmaker[AsyncSession] = ReadOnlySessionFactory,
        pipeline: str = CTC_PIPELINE,
    ) -> None:
        self._session_factory = session_factory
        self._pipeline = pipeline

    async def get(self) -> DataFreshness:
        async with self._session_factory() as session:
            run = await IngestionRunRepository(session).latest_published(self._pipeline)
        return DataFreshness(published_at=None if run is None else run.published_at)
