"""Which column each embedding provider writes and ranks on."""

from sqlalchemy.orm import InstrumentedAttribute

from core.config import get_settings
from core.embeddings.factory import EmbeddingProvider
from models import Trial

EMBEDDING_COLUMNS: dict[
    EmbeddingProvider, InstrumentedAttribute[list[float] | None]
] = {
    EmbeddingProvider.OLLAMA: Trial.qwen_embedding,
    EmbeddingProvider.OPENAI: Trial.openai_embedding,
}


def resolve_provider(provider: EmbeddingProvider | None = None) -> EmbeddingProvider:
    """The provider asked for, else the configured default."""
    return provider or EmbeddingProvider(get_settings().embedding_provider)
