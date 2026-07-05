from __future__ import annotations

from deepeval.metrics import AnswerRelevancyMetric, BaseMetric

from evals.metrics.generic.llm_judged.base import DeepEvalMetric


class AnswerRelevancy(DeepEvalMetric):
    """Does the answer address the question?"""

    name = "answer_relevancy"

    def _build(self) -> BaseMetric:
        return AnswerRelevancyMetric(model=self._model, include_reason=True)
