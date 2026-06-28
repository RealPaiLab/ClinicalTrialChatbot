from __future__ import annotations

from evals.metrics.generic.base import MetricResult
from evals.schemas.expected import ExpectedOutput
from evals.schemas.output import AgentEvalOutput


def glossary_correctness(
    output: AgentEvalOutput, expected: ExpectedOutput
) -> MetricResult:
    """Did define_term resolve the expected NCI term(s)? (fuzzy/normalized match)."""
    raise NotImplementedError
