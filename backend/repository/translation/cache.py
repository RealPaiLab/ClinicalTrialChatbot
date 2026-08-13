"""Redis-backed translation cache, keyed on the hash of the source text."""

from __future__ import annotations

from hashlib import sha256

from redis.asyncio import Redis
from redis.exceptions import RedisError

from core.logger import get_logger
from schemas.language import Language

logger = get_logger(__name__)

# Bump when translations of identical source text should change, e.g. once a
# clinical glossary is attached to the provider.
_KEY_VERSION = "v1"


def _key(text: str, target: Language) -> str:
    digest = sha256(text.encode("utf-8")).hexdigest()[:16]
    return f"xl8:{_KEY_VERSION}:{target.value}:{digest}"


class TranslationCache:
    """Caches translations by content hash."""

    def __init__(self, redis: Redis, *, ttl_seconds: int) -> None:
        self._redis = redis
        self._ttl = ttl_seconds

    async def get_many(self, texts: list[str], target: Language) -> dict[str, str]:
        """Return the subset of texts already translated, keyed by source text."""
        if not texts:
            return {}
        unique = list(dict.fromkeys(texts))
        try:
            values = await self._redis.mget([_key(t, target) for t in unique])
        except RedisError as exc:
            logger.warning("Translation cache read failed, treating as miss: %s", exc)
            return {}
        return {
            text: value.decode("utf-8") if isinstance(value, bytes) else value
            for text, value in zip(unique, values, strict=True)
            if value is not None
        }

    async def set_many(self, entries: dict[str, str], target: Language) -> None:
        """Store translations, keyed by their source text."""
        if not entries:
            return
        try:
            async with self._redis.pipeline(transaction=False) as pipe:
                for text, translated in entries.items():
                    pipe.setex(_key(text, target), self._ttl, translated)
                await pipe.execute()
        except RedisError as exc:
            logger.warning("Translation cache write failed, skipping: %s", exc)
