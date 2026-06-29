from __future__ import annotations

import httpx
from deepeval.models import GPTModel

from core.config import get_settings
from core.llm import OpenAIModelName
from evals.metrics.generic.llm_judged.base import JudgeModel


def build_judge_model(model_name: str | None = None) -> JudgeModel:
    """A DeepEval judge backed by a shared httpx pool."""
    settings = get_settings()
    name = OpenAIModelName(model_name or settings.eval_llm_model).value
    limits = httpx.Limits(
        max_connections=settings.eval_http_max_connections,
        max_keepalive_connections=settings.eval_http_max_connections,
    )
    return GPTModel(model=name, async_http_client=httpx.AsyncClient(limits=limits))
