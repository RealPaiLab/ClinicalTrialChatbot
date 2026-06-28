from __future__ import annotations

from langfuse.experiment import EvaluatorFunction
from pydantic_ai.models import Model


def build_evaluators(model: Model) -> list[EvaluatorFunction]:
    """Wrap every metric (generic + domain) as Langfuse item-level evaluators.

    Each wrapped function has the signature
    ``(*, input, output, expected_output, metadata) -> Evaluation``.
    """
    raise NotImplementedError
