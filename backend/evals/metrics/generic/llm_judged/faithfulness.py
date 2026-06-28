from __future__ import annotations

from evals.metrics.generic.base import MetricResult
from evals.metrics.generic.types import GenerationCase


class Faithfulness:
    """Are the answer's claims grounded in the provided contexts?"""

    name = "faithfulness"

    def __init__(self, model: str) -> None:
        self._model = model

    async def score(self, case: GenerationCase) -> MetricResult:
        raise NotImplementedError
