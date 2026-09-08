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
from evals.metrics.domain.tool_correctness import ANY_SEARCH, tool_correctness
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
    assert result is not None and result.value == 1.0


async def test_tool_correctness_skips_without_expected_tools() -> None:
    result = await tool_correctness("q", AgentEvalOutput(answer="x"), ExpectedOutput())
    assert result is None


async def test_any_search_accepts_either_search_tool() -> None:
    expected = ExpectedOutput(expected_tools=[ToolCall(name=ANY_SEARCH, args={})])
    for name in ("syntactic_search", "semantic_search"):
        output = AgentEvalOutput(
            answer="...", tool_calls=[ToolCall(name=name, args={"reasoning": "r"})]
        )
        result = await tool_correctness("trials near me", output, expected)
        assert result is not None and result.value == 1.0, name


async def test_extra_calls_are_not_penalized() -> None:
    expected = ExpectedOutput(expected_tools=[ToolCall(name=ANY_SEARCH, args={})])
    output = AgentEvalOutput(
        answer="...",
        tool_calls=[
            ToolCall(name="semantic_search", args={"reasoning": "r"}),
            ToolCall(name="get_trial_details", args={"trial_refs": ["CTC-00000001"]}),
            ToolCall(name="define_term", args={"term": "refractory"}),
        ],
    )
    result = await tool_correctness("trials near me", output, expected)
    assert result is not None and result.value == 1.0


async def test_repeated_expected_tool_does_not_halve_the_score() -> None:
    """Two identical expected calls used to cap a correct agent at 0.5."""
    expected = ExpectedOutput(
        expected_tools=[
            ToolCall(name="define_term", args={}),
            ToolCall(name="define_term", args={}),
        ]
    )
    output = AgentEvalOutput(
        answer="...",
        tool_calls=[
            ToolCall(name="define_term", args={"term": "dMMR"}),
            ToolCall(name="define_term", args={"term": "dostarlimab"}),
        ],
    )
    result = await tool_correctness("what do these mean?", output, expected)
    assert result is not None and result.value == 1.0


async def test_wrong_tool_still_fails() -> None:
    expected = ExpectedOutput(
        expected_tools=[ToolCall(name="get_trial_details", args={})]
    )
    output = AgentEvalOutput(
        answer="...", tool_calls=[ToolCall(name="define_term", args={"term": "x"})]
    )
    result = await tool_correctness("tell me more about it", output, expected)
    assert result is not None and result.value == 0.0


def test_glossary_correctness_hit_and_miss() -> None:
    defined = AgentEvalOutput(
        answer="x",
        tool_calls=[ToolCall(name="define_term", args={"term": "Metastatic"})],
    )
    expected = ExpectedOutput(glossary_terms=["metastatic"])
    hit = glossary_correctness(defined, expected)
    assert hit is not None and hit.value == 1.0
    missed = glossary_correctness(AgentEvalOutput(answer="x"), expected)
    assert missed is not None and missed.value == 0.0
    assert glossary_correctness(defined, ExpectedOutput()) is None


def test_inline_citation_consistency() -> None:
    grounded = AgentEvalOutput(
        answer="See [CTC-12345678].", retrieved_refs=["CTC-12345678"]
    )
    ok = inline_citation_consistency(grounded)
    assert ok is not None and ok.value == 1.0
    hallucinated = AgentEvalOutput(
        answer="See [CTC-99999999].", retrieved_refs=["CTC-12345678"]
    )
    bad = inline_citation_consistency(hallucinated)
    assert bad is not None and bad.value == 0.0
    assert inline_citation_consistency(AgentEvalOutput(answer="none")) is None


def test_to_cases() -> None:
    turns = [
        Turn(role="user", content="q1"),
        Turn(role="assistant", content="a"),
        Turn(role="user", content="q2"),
    ]
    assert question_from(turns) == "q2"
    output = AgentEvalOutput(
        answer="ans", contexts=["doc"], retrieved_refs=["CTC-00000001"]
    )
    expected = ExpectedOutput(
        trial_refs=["CTC-00000001", "CTC-00000002"], reference_facts=["f1", "f2"]
    )
    retrieval = to_retrieval_case(output, expected)
    assert list(retrieval.retrieved) == ["CTC-00000001"]
    assert list(retrieval.relevant) == ["CTC-00000001", "CTC-00000002"]
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
