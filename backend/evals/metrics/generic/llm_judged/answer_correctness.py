from __future__ import annotations

from deepeval.metrics import BaseMetric, GEval
from deepeval.test_case import SingleTurnParams

from evals.metrics.generic.llm_judged.base import DeepEvalMetric


class AnswerCorrectness(DeepEvalMetric):
    """Does the answer match the reference facts? (golden subset only)"""

    name = "answer_correctness"

    def _build(self) -> BaseMetric:
        return GEval(
            name="Answer Correctness",
            criteria=(
                "Decide whether the actual output is factually consistent with, and "
                "covers the key facts in, the expected output."
            ),
            evaluation_params=[
                SingleTurnParams.INPUT,
                SingleTurnParams.ACTUAL_OUTPUT,
                SingleTurnParams.EXPECTED_OUTPUT,
            ],
            model=self._model,
        )
