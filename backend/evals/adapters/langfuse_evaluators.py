from __future__ import annotations

from collections.abc import Awaitable, Callable
from typing import Any

from langfuse import Evaluation
from langfuse.experiment import EvaluatorFunction

from evals.adapters.scoring import SCORERS, Scorer, ScoringContext
from evals.metrics.generic.llm_judged.base import JudgeModel
from evals.schemas.expected import ExpectedOutput
from evals.schemas.output import AgentEvalOutput
from evals.schemas.turn import Turn

EvaluatorImpl = Callable[..., Awaitable[list[Evaluation]]]


def _parse(
    input: Any, output: Any, expected_output: Any
) -> tuple[list[Turn], AgentEvalOutput, ExpectedOutput]:
    turns = [Turn.model_validate(t) for t in (input or [])]
    out = (
        output
        if isinstance(output, AgentEvalOutput)
        else AgentEvalOutput.model_validate(output)
    )
    expected = ExpectedOutput.model_validate(expected_output or {})
    return turns, out, expected


def _make(scorer: Scorer, model: JudgeModel) -> EvaluatorImpl:
    async def evaluator(
        *,
        input: Any,
        output: Any,
        expected_output: Any,
        metadata: dict[str, Any] | None = None,
        **kwargs: Any,
    ) -> list[Evaluation]:
        turns, out, expected = _parse(input, output, expected_output)
        result = await scorer(ScoringContext(turns, out, expected, model))
        if result is None:
            return []
        return [Evaluation(name=result.name, value=result.value, comment=result.reason)]

    return evaluator


def build_evaluators(model: JudgeModel) -> list[EvaluatorFunction]:
    """Wrap each metric in the scoring index as a Langfuse item-level evaluator."""
    return [_make(scorer, model) for scorer in SCORERS]
