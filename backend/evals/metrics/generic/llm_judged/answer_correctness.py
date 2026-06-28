from __future__ import annotations

from evals.metrics.generic.base import MetricResult
from evals.metrics.generic.types import GenerationCase


class AnswerCorrectness:
    """Does the answer match the reference facts? (golden subset only)"""

    name = "answer_correctness"

    def __init__(self, model: str) -> None:
        self._model = model

    async def score(self, case: GenerationCase) -> MetricResult:
        raise NotImplementedError
