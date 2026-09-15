"""When each trial corpus was last published."""

from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from core.database import ReadOnlySessionFactory
from repository.ingestion_repository import IngestionRunRepository
from schemas.ingestion import DataFreshness, SourceFreshness
from schemas.source import SOURCE_NAMES, SourceCode


class DataFreshnessService:
    def __init__(
        self, session_factory: async_sessionmaker[AsyncSession] = ReadOnlySessionFactory
    ) -> None:
        self._session_factory = session_factory

    async def get(self) -> DataFreshness:
        async with self._session_factory() as session:
            latest = await IngestionRunRepository(
                session
            ).latest_published_per_pipeline()
        sources = [
            SourceFreshness(
                source=code,
                name=SOURCE_NAMES[code],
                published_at=None if code not in latest else latest[code].published_at,
            )
            for code in SourceCode
        ]
        dates = [entry.published_at for entry in sources if entry.published_at]
        return DataFreshness(published_at=min(dates, default=None), sources=sources)
