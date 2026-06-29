"""pydantic-evals Evaluator for the offline (no-Langfuse) run path."""

from __future__ import annotations

from dataclasses import dataclass

from pydantic_evals.evaluators import Evaluator, EvaluatorContext

from evals.adapters.scoring import SCORERS, Scorer, ScoringContext
from evals.schemas.output import AgentEvalOutput
from evals.schemas.sample import EvalSample

_Ctx = EvaluatorContext[EvalSample, AgentEvalOutput, object]


@dataclass
class MetricEvaluator(Evaluator[EvalSample, AgentEvalOutput, object]):
    """Runs one scorer from the index; names the score by its MetricResult.name."""

    scorer: Scorer
    model: str

    async def evaluate(self, ctx: _Ctx) -> dict[str, float]:
        result = await self.scorer(
            ScoringContext(
                ctx.inputs.input, ctx.output, ctx.inputs.expected, self.model
            )
        )
        return {} if result is None else {result.name: result.value}


def build_evaluators(
    model: str,
) -> list[Evaluator[EvalSample, AgentEvalOutput, object]]:
    """Wrap each metric in the scoring index as a pydantic-evals evaluator."""
    return [MetricEvaluator(scorer=scorer, model=model) for scorer in SCORERS]
