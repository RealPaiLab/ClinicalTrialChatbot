from evals.adapters import langfuse_evaluators as lf
from evals.adapters.scoring import (
    score_answer_correctness,
    score_glossary_correctness,
)
from evals.adapters.to_cases import (
    question_from,
    to_generation_case,
    to_retrieval_case,
)
from evals.metrics.domain.glossary_correctness import glossary_correctness
from evals.metrics.domain.inline_citation_consistency import inline_citation_consistency
from evals.metrics.domain.tool_correctness import tool_correctness
from evals.schemas.expected import ExpectedOutput
from evals.schemas.output import AgentEvalOutput
from evals.schemas.tool_call import ToolCall
from evals.schemas.turn import Turn


async def test_tool_correctness_matches_expected() -> None:
    output = AgentEvalOutput(
        answer="...",
        tool_calls=[
            ToolCall(
                name="syntactic_search",
                args={"reasoning": "r", "cancer_types": ["breast"]},
            )
        ],
    )
    expected = ExpectedOutput(
        expected_tools=[
            ToolCall(name="syntactic_search", args={"cancer_types": ["breast"]})
        ]
    )
    result = await tool_correctness("breast trials", output, expected)
    assert result.value == 1.0


async def test_tool_correctness_no_expected_is_pass() -> None:
    result = await tool_correctness("q", AgentEvalOutput(answer="x"), ExpectedOutput())
    assert result.value == 1.0


def test_glossary_correctness_hit_and_miss() -> None:
    defined = AgentEvalOutput(
        answer="x",
        tool_calls=[ToolCall(name="define_term", args={"term": "Metastatic"})],
    )
    expected = ExpectedOutput(glossary_terms=["metastatic"])
    assert glossary_correctness(defined, expected).value == 1.0
    assert glossary_correctness(AgentEvalOutput(answer="x"), expected).value == 0.0


def test_inline_citation_consistency() -> None:
    grounded = AgentEvalOutput(
        answer="See [NCT01234567].", retrieved_ncts=["NCT01234567"]
    )
    assert inline_citation_consistency(grounded).value == 1.0
    hallucinated = AgentEvalOutput(
        answer="See [NCT09999999].", retrieved_ncts=["NCT01234567"]
    )
    assert inline_citation_consistency(hallucinated).value == 0.0
    assert inline_citation_consistency(AgentEvalOutput(answer="none")).value == 1.0


def test_to_cases() -> None:
    turns = [
        Turn(role="user", content="q1"),
        Turn(role="assistant", content="a"),
        Turn(role="user", content="q2"),
    ]
    assert question_from(turns) == "q2"
    output = AgentEvalOutput(answer="ans", contexts=["doc"], retrieved_ncts=["NCT1"])
    expected = ExpectedOutput(
        nct_numbers=["NCT1", "NCT2"], reference_facts=["f1", "f2"]
    )
    retrieval = to_retrieval_case(output, expected)
    assert list(retrieval.retrieved) == ["NCT1"]
    assert list(retrieval.relevant) == ["NCT1", "NCT2"]
    generation = to_generation_case(turns, output, expected)
    assert generation.question == "q2"
    assert generation.contexts == ["doc"]
    assert generation.reference == "f1\nf2"


async def test_evaluator_wraps_metric() -> None:
    evaluator = lf._make(score_glossary_correctness, "gpt-5.4-mini")
    output = AgentEvalOutput(
        answer="x",
        tool_calls=[ToolCall(name="define_term", args={"term": "metastatic"})],
    )
    result = await evaluator(
        input=[{"role": "user", "content": "q"}],
        output=output,
        expected_output={"glossary_terms": ["metastatic"]},
        metadata=None,
    )
    assert len(result) == 1
    assert result[0].name == "glossary_correctness"
    assert result[0].value == 1.0


async def test_answer_correctness_skips_without_reference() -> None:
    evaluator = lf._make(score_answer_correctness, "gpt-5.4-mini")
    result = await evaluator(
        input=[{"role": "user", "content": "q"}],
        output=AgentEvalOutput(answer="x"),
        expected_output={},
        metadata=None,
    )
    assert result == []
