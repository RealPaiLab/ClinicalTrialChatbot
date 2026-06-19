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
    QWEN3_EMBEDDING_0_6B = "qwen3-embedding:0.6b"


QUERY_PREFIXES: dict[OllamaEmbeddingModelName, str] = {
    OllamaEmbeddingModelName.QWEN3_EMBEDDING_0_6B: (
        "Instruct: Given a description of a cancer patient, retrieve "
        "clinical trials the patient may be eligible for\nQuery: "
    ),
}


def _build_ollama(model: str, settings: Settings) -> PydanticAIEmbedder:
    name = OllamaEmbeddingModelName(model)
    embedder = Embedder(
        OpenAIEmbeddingModel(
            name.value,
            provider=OllamaProvider(base_url=settings.ollama_base_url),
        )
    )
    return PydanticAIEmbedder(embedder, query_prefix=QUERY_PREFIXES.get(name, ""))


PROVIDER_MAP: dict[EmbeddingProvider, Callable[[str, Settings], PydanticAIEmbedder]] = {
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
    return PROVIDER_MAP[selected_provider](model_name, settings)
