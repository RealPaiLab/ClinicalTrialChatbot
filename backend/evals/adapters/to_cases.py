from __future__ import annotations

from evals.metrics.types import GenerationCase, RetrievalCase
from evals.schemas.expected import ExpectedOutput
from evals.schemas.output import AgentEvalOutput
from evals.schemas.turn import Turn


def question_from(turns: list[Turn]) -> str:
    """The final user turn, used as the question for generation metrics."""
    raise NotImplementedError


def to_retrieval_case(
    output: AgentEvalOutput, expected: ExpectedOutput
) -> RetrievalCase:
    raise NotImplementedError


def to_generation_case(
    turns: list[Turn], output: AgentEvalOutput, expected: ExpectedOutput
) -> GenerationCase:
    raise NotImplementedError
