"""Keeps the controlled filter vocabularies in step with the corpus."""

from __future__ import annotations

import asyncio
import time

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from core.config import get_settings
from core.database import ReadOnlySessionFactory
from core.logger import get_logger
from repository.vocabulary_repository import VocabularyRepository
from schemas.vocabulary import Vocabulary, current_vocabulary, set_vocabulary

logger = get_logger(__name__)


class VocabularyService:
    """Loads the vocabulary at most once per TTL and publishes it as the snapshot."""

    def __init__(
        self,
        session_factory: async_sessionmaker[AsyncSession] = ReadOnlySessionFactory,
    ) -> None:
        self._session_factory = session_factory
        self._ttl = get_settings().vocabulary_ttl_seconds
        self._loaded_at: float | None = None
        self._lock = asyncio.Lock()

    def _is_stale(self) -> bool:
        return (
            self._loaded_at is None or (time.monotonic() - self._loaded_at) >= self._ttl
        )

    async def refresh(self) -> Vocabulary:
        """Reload when stale. A failed load keeps the previous snapshot."""
        if not self._is_stale():
            return current_vocabulary()
        async with self._lock:
            if not self._is_stale():
                return current_vocabulary()
            try:
                async with self._session_factory() as session:
                    vocabulary = await VocabularyRepository(session).load()
            except Exception:
                logger.exception("Vocabulary refresh failed; keeping the last one")
                return current_vocabulary()
            set_vocabulary(vocabulary)
            self._loaded_at = time.monotonic()
            return vocabulary
