from __future__ import annotations

import re

from evals.metrics.generic.base import MetricResult
from evals.schemas.output import AgentEvalOutput

NAME = "inline_citation_consistency"

_NCT = re.compile(r"NCT\d+")


def inline_citation_consistency(output: AgentEvalOutput) -> MetricResult | None:
    """Fraction of inline [NCT…] citations grounded in the fetched trials.
    None (skip) when the answer cites nothing.
    """
    cited = set(_NCT.findall(output.answer))
    if not cited:
        return None

    fetched = set(output.retrieved_ncts)
    grounded = cited & fetched
    return MetricResult(
        name=NAME,
        value=len(grounded) / len(cited),
        reason=f"{len(grounded)}/{len(cited)} inline citations grounded in fetched.",
    )
