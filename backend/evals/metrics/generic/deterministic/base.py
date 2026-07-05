from __future__ import annotations

from typing import Literal

from evals.metrics.generic.base import MetricResult
from evals.metrics.generic.types import RetrievalCase

Denominator = Literal["retrieved", "relevant"]


class RetrievalMetric:
    """Set-overlap retrieval metric: hits over a subclass-chosen denominator."""

    name: str
    denominator: Denominator

    async def score(self, case: RetrievalCase) -> MetricResult:
        retrieved = set(case.retrieved)
        relevant = set(case.relevant)
        pool = retrieved if self.denominator == "retrieved" else relevant
        value = len(retrieved & relevant) / len(pool) if pool else 0.0
        return MetricResult(name=self.name, value=value)
