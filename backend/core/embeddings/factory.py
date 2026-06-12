from collections.abc import Callable
from enum import StrEnum
from functools import lru_cache

from pydantic_ai.embeddings import Embedder
from pydantic_ai.embeddings.openai import OpenAIEmbeddingModel
from pydantic_ai.providers.ollama import OllamaProvider

from core.config import Settings, get_settings
from core.embeddings.pydantic_ai_embedder import PydanticAIEmbedder


class EmbeddingProvider(StrEnum):
    OLLAMA = "ollama"


class OllamaEmbeddingModelName(StrEnum):
    BGE_M3 = "bge-m3"


def _build_ollama(model: str, settings: Settings) -> Embedder:
    name = OllamaEmbeddingModelName(model)
    return Embedder(
        OpenAIEmbeddingModel(
            name.value,
            provider=OllamaProvider(base_url=settings.ollama_base_url),
        )
    )


PROVIDER_MAP: dict[EmbeddingProvider, Callable[[str, Settings], Embedder]] = {
    EmbeddingProvider.OLLAMA: _build_ollama,
}


@lru_cache
def get_embedder(
    provider: EmbeddingProvider | None = None, model: str | None = None
) -> PydanticAIEmbedder:
    """Provider-agnostic embedder factory."""
    settings = get_settings()
    selected_provider = provider or EmbeddingProvider(settings.embedding_provider)
    model_name = model or settings.embedding_model
    return PydanticAIEmbedder(PROVIDER_MAP[selected_provider](model_name, settings))
