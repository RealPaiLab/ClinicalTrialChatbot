from __future__ import annotations

from evals.metrics.generic.base import MetricResult
from evals.schemas.expected import ExpectedOutput
from evals.schemas.output import AgentEvalOutput

NAME = "glossary_correctness"


def _normalize(term: str) -> str:
    return term.strip().lower()


def glossary_correctness(
    output: AgentEvalOutput, expected: ExpectedOutput
) -> MetricResult:
    """Fraction of expected glossary terms the agent asked define_term about."""
    expected_terms = {_normalize(t) for t in expected.glossary_terms}
    if not expected_terms:
        return MetricResult(name=NAME, value=1.0, reason="No glossary terms expected.")

    defined = {
        _normalize(str(call.args["term"]))
        for call in output.tool_calls
        if call.name == "define_term" and call.args.get("term")
    }
    hits = len(expected_terms & defined)
    return MetricResult(
        name=NAME,
        value=hits / len(expected_terms),
        reason=f"{hits}/{len(expected_terms)} expected terms defined.",
    )
