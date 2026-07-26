from __future__ import annotations

from typing import Literal

from evals.metrics.generic.base import MetricResult
from evals.metrics.generic.types import RetrievalCase

Denominator = Literal["retrieved", "relevant"]


class RetrievalMetric:
    """Set-overlap retrieval metric: hits over a subclass-chosen denominator."""

    name: str
    denominator: Denominator

    async def score(self, case: RetrievalCase) -> MetricResult | None:
        retrieved = set(case.retrieved)
        relevant = set(case.relevant)
        pool = retrieved if self.denominator == "retrieved" else relevant
        if not relevant or not pool:
            return None
        return MetricResult(name=self.name, value=len(retrieved & relevant) / len(pool))
