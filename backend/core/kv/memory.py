"""In-process key-value store, for tests and single-process local runs."""

from __future__ import annotations

import time


class InMemoryKeyValueStore:
    """Holds values in a dict, each with its own expiry."""

    def __init__(self) -> None:
        self._entries: dict[str, tuple[float, bytes]] = {}

    async def get(self, key: str) -> bytes | None:
        entry = self._entries.get(key)
        if entry is None:
            return None
        expires_at, value = entry
        if time.monotonic() >= expires_at:
            del self._entries[key]
            return None
        return value

    async def set(self, key: str, value: bytes, *, ttl_seconds: int) -> None:
        self._entries[key] = (time.monotonic() + ttl_seconds, value)

    async def delete(self, *keys: str) -> None:
        for key in keys:
            self._entries.pop(key, None)
