from __future__ import annotations

from evals.metrics.generic.base import MetricResult
from evals.schemas.output import AgentEvalOutput


def inline_citation_consistency(output: AgentEvalOutput) -> MetricResult:
    """Every inline [NCT…] in the answer text is grounded in fetched/used trials."""
    raise NotImplementedError
