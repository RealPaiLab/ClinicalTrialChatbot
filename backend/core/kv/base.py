from typing import Protocol


class KeyValueStore(Protocol):
    """A TTL key-value store. Implementations degrade rather than raise."""

    async def get(self, key: str) -> bytes | None: ...

    async def set(self, key: str, value: bytes, *, ttl_seconds: int) -> None: ...

    async def delete(self, *keys: str) -> None: ...
