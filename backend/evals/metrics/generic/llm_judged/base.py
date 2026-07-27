from __future__ import annotations

from abc import ABC, abstractmethod

from deepeval.metrics import BaseMetric
from deepeval.models.base_model import DeepEvalBaseLLM
from deepeval.test_case import LLMTestCase

from evals.metrics.generic.base import MetricResult
from evals.metrics.generic.types import GenerationCase

JudgeModel = str | DeepEvalBaseLLM


class DeepEvalMetric(ABC):
    """Wraps a DeepEval metric over a GenerationCase. Subclass and build the metric."""

    name: str

    def __init__(self, model: JudgeModel) -> None:
        self._model = model

    @abstractmethod
    def _build(self) -> BaseMetric:
        """A fresh DeepEval metric (built per call: a_measure mutates it)."""

    def _test_case(self, case: GenerationCase) -> LLMTestCase:
        return LLMTestCase(
            input=case.question,
            actual_output=case.answer,
            retrieval_context=list(case.contexts),
            expected_output=case.reference,
        )

    async def score(self, case: GenerationCase) -> MetricResult:
        metric = self._build()
        await metric.a_measure(self._test_case(case), _show_indicator=False)
        value = float(metric.score) if metric.score is not None else 0.0
        return MetricResult(name=self.name, value=value, reason=metric.reason)
