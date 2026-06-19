from typing import Protocol

EXPECTED_DIMENSIONS = 1024


class QueryEmbedder(Protocol):
    async def embed_query(self, text: str) -> list[float]: ...

    async def embed_documents(self, texts: list[str]) -> list[list[float]]: ...
