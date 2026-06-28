from __future__ import annotations

from evals.metrics.generic.base import MetricResult
from evals.schemas.expected import ExpectedOutput
from evals.schemas.output import AgentEvalOutput
from schemas.trial import TrialFilter


def reconstruct_filter(args: dict[str, object]) -> TrialFilter:
    """Build a TrialFilter from a search call's separate args (ignore reasoning)."""
    raise NotImplementedError


def filter_extraction(
    output: AgentEvalOutput, expected: ExpectedOutput
) -> MetricResult:
    """Did the agent pass the correct filter arguments? (filter-only regime)."""
    raise NotImplementedError
