import pytest

from evals.metrics.generic.deterministic.context_precision import ContextPrecision
from evals.metrics.generic.deterministic.context_recall import ContextRecall
from evals.metrics.generic.llm_judged.answer_correctness import AnswerCorrectness
from evals.metrics.generic.llm_judged.answer_relevancy import AnswerRelevancy
from evals.metrics.generic.llm_judged.contextual_relevancy import ContextualRelevancy
from evals.metrics.generic.llm_judged.faithfulness import Faithfulness
from evals.metrics.generic.types import GenerationCase, RetrievalCase


async def test_context_precision_and_recall() -> None:
    case = RetrievalCase(retrieved=["a", "b", "c"], relevant=["b", "c", "d"])
    precision = await ContextPrecision().score(case)
    recall = await ContextRecall().score(case)
    assert precision is not None and precision.value == pytest.approx(2 / 3)
    assert recall is not None and recall.value == pytest.approx(2 / 3)


async def test_retrieval_skipped_without_gold() -> None:
    case = RetrievalCase(retrieved=[], relevant=[])
    assert await ContextPrecision().score(case) is None
    assert await ContextRecall().score(case) is None


async def test_recall_is_zero_when_gold_is_missed() -> None:
    case = RetrievalCase(retrieved=[], relevant=["x"])
    recall = await ContextRecall().score(case)
    assert recall is not None and recall.value == 0.0
    assert await ContextPrecision().score(case) is None


def test_llm_judged_maps_generation_case() -> None:
    case = GenerationCase(
        question="q", answer="a", contexts=["c1", "c2"], reference="r"
    )
    tc = Faithfulness("gpt-5.4-mini")._test_case(case)
    assert tc.input == "q"
    assert tc.actual_output == "a"
    assert tc.retrieval_context == ["c1", "c2"]
    assert tc.expected_output == "r"


def test_llm_judged_metrics_build() -> None:
    model = "gpt-5.4-mini"
    metrics = [
        Faithfulness(model),
        AnswerRelevancy(model),
        ContextualRelevancy(model),
        AnswerCorrectness(model),
    ]
    assert [m.name for m in metrics] == [
        "faithfulness",
        "answer_relevancy",
        "contextual_relevancy",
        "answer_correctness",
    ]
    assert all(m._build() is not None for m in metrics)
