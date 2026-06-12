from pydantic_ai.embeddings import Embedder

from core.embeddings.base import EXPECTED_DIMENSIONS


class PydanticAIEmbedder:
    """Adapter from pydantic-ai's Embedder to plain pgvector-sized vectors."""

    def __init__(self, embedder: Embedder) -> None:
        self._embedder = embedder

    @staticmethod
    def _checked(vector: list[float]) -> list[float]:
        if len(vector) != EXPECTED_DIMENSIONS:
            raise ValueError(
                f"Expected {EXPECTED_DIMENSIONS}-dim embedding, got {len(vector)}"
            )
        return vector

    async def embed_query(self, text: str) -> list[float]:
        result = await self._embedder.embed_query(text)
        return self._checked([float(x) for x in result.embeddings[0]])

    async def embed_documents(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []
        result = await self._embedder.embed_documents(texts)
        return [self._checked([float(x) for x in vec]) for vec in result.embeddings]
