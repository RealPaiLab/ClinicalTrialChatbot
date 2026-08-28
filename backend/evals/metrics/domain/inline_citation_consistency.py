from __future__ import annotations

from evals.metrics.generic.base import MetricResult
from evals.schemas.output import AgentEvalOutput
from schemas.trial_ref import TRIAL_REF_PATTERN

NAME = "inline_citation_consistency"


def inline_citation_consistency(output: AgentEvalOutput) -> MetricResult | None:
    """Fraction of inline [CTC-…] citations grounded in the fetched trials.
    None (skip) when the answer cites nothing.
    """
    cited = set(TRIAL_REF_PATTERN.findall(output.answer))
    if not cited:
        return None

    fetched = set(output.retrieved_refs)
    grounded = cited & fetched
    return MetricResult(
        name=NAME,
        value=len(grounded) / len(cited),
        reason=f"{len(grounded)}/{len(cited)} inline citations grounded in fetched.",
    )
