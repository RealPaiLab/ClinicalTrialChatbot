from collections.abc import Callable
from enum import StrEnum
from functools import lru_cache

from pydantic_ai.embeddings import Embedder, EmbeddingSettings
from pydantic_ai.embeddings.openai import OpenAIEmbeddingModel
from pydantic_ai.providers.ollama import OllamaProvider
from pydantic_ai.providers.openai import OpenAIProvider

from core.config import Settings, get_settings
from core.embeddings.pydantic_ai_embedder import PydanticAIEmbedder


class EmbeddingProvider(StrEnum):
    OLLAMA = "ollama"
    OPENAI = "openai"


class OllamaEmbeddingModelName(StrEnum):
    BGE_M3 = "bge-m3"
    QWEN3_EMBEDDING_0_6B = "qwen3-embedding:0.6b"


class OpenAIEmbeddingModelName(StrEnum):
    TEXT_EMBEDDING_3_SMALL = "text-embedding-3-small"
    TEXT_EMBEDDING_3_LARGE = "text-embedding-3-large"


QUERY_PREFIXES: dict[OllamaEmbeddingModelName, str] = {
    OllamaEmbeddingModelName.QWEN3_EMBEDDING_0_6B: (
        "Instruct: Given a description of a cancer patient, retrieve "
        "clinical trials the patient may be eligible for\nQuery: "
    ),
}


def _build_ollama(
    model: str | None, settings: Settings, instrument: bool | None
) -> PydanticAIEmbedder:
    name = OllamaEmbeddingModelName(model or settings.embedding_model)
    embedder = Embedder(
        OpenAIEmbeddingModel(
            name.value,
            provider=OllamaProvider(base_url=settings.ollama_base_url),
        ),
        instrument=instrument,
    )
    return PydanticAIEmbedder(embedder, query_prefix=QUERY_PREFIXES.get(name, ""))


def _build_openai(
    model: str | None, settings: Settings, instrument: bool | None
) -> PydanticAIEmbedder:
    name = OpenAIEmbeddingModelName(model or settings.openai_embedding_model)
    if settings.openai_api_key is None:
        raise ValueError("OPENAI_API_KEY is required when EMBEDDING_PROVIDER=openai")
    embedder = Embedder(
        OpenAIEmbeddingModel(
            name.value,
            provider=OpenAIProvider(api_key=settings.openai_api_key),
        ),
        settings=EmbeddingSettings(dimensions=settings.openai_embedding_dimensions),
        instrument=instrument,
    )
    return PydanticAIEmbedder(embedder)


PROVIDER_MAP: dict[
    EmbeddingProvider, Callable[[str | None, Settings, bool | None], PydanticAIEmbedder]
] = {
    EmbeddingProvider.OLLAMA: _build_ollama,
    EmbeddingProvider.OPENAI: _build_openai,
}


@lru_cache
def get_embedder(
    provider: EmbeddingProvider | None = None,
    model: str | None = None,
    *,
    instrument: bool | None = None,
) -> PydanticAIEmbedder:
    """Provider-agnostic embedder factory.

    `instrument=None` follows the global default set by Embedder.instrument_all
    (on in the app). Pass `instrument=False` to opt out of Langfuse tracing, e.g.
    the internal /debug page, so its eval queries do not pollute production traces.
    """
    settings = get_settings()
    selected_provider = provider or EmbeddingProvider(settings.embedding_provider)
    return PROVIDER_MAP[selected_provider](model, settings, instrument)
