from __future__ import annotations

from evals.metrics.generic.deterministic.base import RetrievalMetric


class ContextPrecision(RetrievalMetric):
    """|retrieved ∩ relevant| / |retrieved|."""

    name = "context_precision"
    denominator = "retrieved"
