from __future__ import annotations

from deepeval.metrics import BaseMetric, FaithfulnessMetric

from evals.metrics.generic.llm_judged.base import DeepEvalMetric


class Faithfulness(DeepEvalMetric):
    """Are the answer's claims grounded in the provided contexts?"""

    name = "faithfulness"

    def _build(self) -> BaseMetric:
        return FaithfulnessMetric(model=self._model, include_reason=True)
