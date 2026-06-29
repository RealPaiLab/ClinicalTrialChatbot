from __future__ import annotations

from collections.abc import Awaitable, Callable
from dataclasses import dataclass

from evals.adapters.to_cases import (
    question_from,
    to_generation_case,
    to_retrieval_case,
)

# from evals.metrics.domain.argument_correctness import argument_correctness
from evals.metrics.domain.glossary_correctness import glossary_correctness
from evals.metrics.domain.inline_citation_consistency import inline_citation_consistency
from evals.metrics.domain.tool_correctness import tool_correctness
from evals.metrics.generic.base import MetricResult
from evals.metrics.generic.deterministic.context_precision import ContextPrecision
from evals.metrics.generic.deterministic.context_recall import ContextRecall
from evals.metrics.generic.llm_judged.answer_correctness import AnswerCorrectness
from evals.metrics.generic.llm_judged.answer_relevancy import AnswerRelevancy
from evals.metrics.generic.llm_judged.base import JudgeModel
from evals.metrics.generic.llm_judged.contextual_relevancy import ContextualRelevancy
from evals.metrics.generic.llm_judged.faithfulness import Faithfulness
from evals.metrics.generic.types import GenerationCase, RetrievalCase
from evals.schemas.expected import ExpectedOutput
from evals.schemas.output import AgentEvalOutput
from evals.schemas.turn import Turn


@dataclass(frozen=True)
class ScoringContext:
    """Everything a metric needs for one sample, with the case-extraction logic."""

    turns: list[Turn]
    output: AgentEvalOutput
    expected: ExpectedOutput
    model: JudgeModel

    @property
    def question(self) -> str:
        return question_from(self.turns)

    @property
    def retrieval(self) -> RetrievalCase:
        return to_retrieval_case(self.output, self.expected)

    @property
    def generation(self) -> GenerationCase:
        return to_generation_case(self.turns, self.output, self.expected)


Scorer = Callable[[ScoringContext], Awaitable[MetricResult | None]]


async def score_context_precision(ctx: ScoringContext) -> MetricResult:
    return await ContextPrecision().score(ctx.retrieval)


async def score_context_recall(ctx: ScoringContext) -> MetricResult:
    return await ContextRecall().score(ctx.retrieval)


async def score_faithfulness(ctx: ScoringContext) -> MetricResult:
    return await Faithfulness(ctx.model).score(ctx.generation)


async def score_answer_relevancy(ctx: ScoringContext) -> MetricResult:
    return await AnswerRelevancy(ctx.model).score(ctx.generation)


async def score_contextual_relevancy(ctx: ScoringContext) -> MetricResult:
    return await ContextualRelevancy(ctx.model).score(ctx.generation)


async def score_answer_correctness(ctx: ScoringContext) -> MetricResult | None:
    if not ctx.expected.reference_facts:
        return None
    return await AnswerCorrectness(ctx.model).score(ctx.generation)


async def score_tool_correctness(ctx: ScoringContext) -> MetricResult:
    return await tool_correctness(ctx.question, ctx.output, ctx.expected)


# async def score_argument_correctness(ctx: ScoringContext) -> MetricResult:
#     return await argument_correctness(ctx.question, ctx.output, ctx.model)


async def score_glossary_correctness(ctx: ScoringContext) -> MetricResult:
    return glossary_correctness(ctx.output, ctx.expected)


async def score_inline_citation_consistency(ctx: ScoringContext) -> MetricResult:
    return inline_citation_consistency(ctx.output)


SCORERS: list[Scorer] = [
    score_context_precision,
    score_context_recall,
    score_faithfulness,
    score_answer_relevancy,
    score_contextual_relevancy,
    score_answer_correctness,
    score_tool_correctness,
    # score_argument_correctness,
    score_glossary_correctness,
    score_inline_citation_consistency,
]
