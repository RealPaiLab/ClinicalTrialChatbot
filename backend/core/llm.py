from collections.abc import Callable
from enum import StrEnum
from functools import lru_cache

import httpx
from pydantic_ai.models import Model
from pydantic_ai.models.ollama import OllamaModel
from pydantic_ai.models.openai import OpenAIChatModel
from pydantic_ai.providers.ollama import OllamaProvider
from pydantic_ai.providers.openai import OpenAIProvider

from core.config import Settings, get_settings
from core.http_retry import build_retrying_client


class LLMProvider(StrEnum):
    OPENAI = "openai"
    OLLAMA = "ollama"


class OllamaModelName(StrEnum):
    QWEN3 = "qwen3"


class OpenAIModelName(StrEnum):
    GPT_5 = "gpt-5"
    GPT_5_4_MINI = "gpt-5.4-mini"
    GPT_5_4 = "gpt-5.4"


def _http_client(settings: Settings) -> httpx.AsyncClient:
    return build_retrying_client(
        max_retries=settings.llm_max_retries,
        max_wait=settings.llm_retry_max_wait,
        read_timeout=settings.llm_request_timeout,
    )


def _build_ollama(model: str, settings: Settings) -> Model:
    name = OllamaModelName(model)
    return OllamaModel(
        name.value,
        provider=OllamaProvider(
            base_url=settings.ollama_base_url, http_client=_http_client(settings)
        ),
    )


def _build_openai(model: str, settings: Settings) -> Model:
    name = OpenAIModelName(model)
    if settings.openai_api_key is None:
        raise ValueError("OPENAI_API_KEY is required when LLM_PROVIDER=openai")
    return OpenAIChatModel(
        name.value,
        provider=OpenAIProvider(
            api_key=settings.openai_api_key, http_client=_http_client(settings)
        ),
    )


PROVIDER_MAP: dict[LLMProvider, Callable[[str, Settings], Model]] = {
    LLMProvider.OLLAMA: _build_ollama,
    LLMProvider.OPENAI: _build_openai,
}


@lru_cache
def get_llm(provider: LLMProvider | None = None, model: str | None = None) -> Model:
    """Provider-agnostic LLM factory."""
    settings = get_settings()
    selected_provider = provider or LLMProvider(settings.llm_provider)
    model_name = model or settings.llm_model
    return PROVIDER_MAP[selected_provider](model_name, settings)
