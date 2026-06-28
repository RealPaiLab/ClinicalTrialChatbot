from __future__ import annotations

from deepeval.metrics import BaseMetric, ContextualRelevancyMetric

from evals.metrics.generic.llm_judged.base import DeepEvalMetric


class ContextualRelevancy(DeepEvalMetric):
    """Are the retrieved contexts relevant to the question?"""

    name = "contextual_relevancy"

    def _build(self) -> BaseMetric:
        return ContextualRelevancyMetric(model=self._model, include_reason=True)
