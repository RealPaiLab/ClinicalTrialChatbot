from __future__ import annotations

from evals.metrics.generic.base import MetricResult
from evals.schemas.expected import ExpectedOutput
from evals.schemas.output import AgentEvalOutput


def tool_trajectory(output: AgentEvalOutput, expected: ExpectedOutput) -> MetricResult:
    """Did the agent call the expected set/sequence of tools?"""
    raise NotImplementedError
