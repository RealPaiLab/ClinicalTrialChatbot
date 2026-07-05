from __future__ import annotations

from evals.metrics.generic.deterministic.base import RetrievalMetric


class ContextRecall(RetrievalMetric):
    """|retrieved ∩ relevant| / |relevant|."""

    name = "context_recall"
    denominator = "relevant"
