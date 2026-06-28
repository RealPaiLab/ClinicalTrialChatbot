from __future__ import annotations

from evals.metrics.generic.base import MetricResult
from evals.metrics.generic.types import GenerationCase


class AnswerRelevancy:
    """Does the answer address the question?"""

    name = "answer_relevancy"

    def __init__(self, model: str) -> None:
        self._model = model

    async def score(self, case: GenerationCase) -> MetricResult:
        raise NotImplementedError
