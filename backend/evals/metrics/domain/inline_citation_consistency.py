from __future__ import annotations

import re

from evals.metrics.generic.base import MetricResult
from evals.schemas.output import AgentEvalOutput

NAME = "inline_citation_consistency"

_NCT = re.compile(r"NCT\d+")


def inline_citation_consistency(output: AgentEvalOutput) -> MetricResult:
    """Fraction of inline [NCT…] citations grounded in the fetched trials."""
    cited = set(_NCT.findall(output.answer))
    if not cited:
        return MetricResult(name=NAME, value=1.0, reason="No inline citations.")

    fetched = set(output.retrieved_ncts)
    grounded = cited & fetched
    return MetricResult(
        name=NAME,
        value=len(grounded) / len(cited),
        reason=f"{len(grounded)}/{len(cited)} inline citations grounded in fetched.",
    )
