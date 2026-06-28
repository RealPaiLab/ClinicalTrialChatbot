from __future__ import annotations

from evals.metrics.generic.base import MetricResult
from evals.schemas.output import AgentEvalOutput


def argument_correctness(
    question: str, output: AgentEvalOutput, model: str
) -> MetricResult:
    """Are the arguments passed to each tool call correct for the question?"""
    raise NotImplementedError
