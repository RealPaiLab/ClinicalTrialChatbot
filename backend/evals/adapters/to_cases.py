from __future__ import annotations

from evals.metrics.generic.types import GenerationCase, RetrievalCase
from evals.schemas.expected import ExpectedOutput
from evals.schemas.output import AgentEvalOutput
from evals.schemas.turn import Turn


def question_from(turns: list[Turn]) -> str:
    """The final user turn, used as the question for the metrics."""
    for turn in reversed(turns):
        if turn.role == "user":
            return turn.content
    return ""


def to_retrieval_case(
    output: AgentEvalOutput, expected: ExpectedOutput
) -> RetrievalCase:
    return RetrievalCase(retrieved=output.retrieved_ncts, relevant=expected.nct_numbers)


def to_generation_case(
    turns: list[Turn], output: AgentEvalOutput, expected: ExpectedOutput
) -> GenerationCase:
    reference = (
        "\n".join(expected.reference_facts) if expected.reference_facts else None
    )
    return GenerationCase(
        question=question_from(turns),
        answer=output.answer,
        contexts=output.contexts,
        reference=reference,
    )
