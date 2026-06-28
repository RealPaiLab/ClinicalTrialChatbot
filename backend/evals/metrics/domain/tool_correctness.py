from __future__ import annotations

from evals.metrics.generic.base import MetricResult
from evals.schemas.expected import ExpectedOutput
from evals.schemas.output import AgentEvalOutput


def tool_correctness(
    question: str, output: AgentEvalOutput, expected: ExpectedOutput
) -> MetricResult:
    """Right tools called (optionally with right input args) vs expected."""
    raise NotImplementedError
