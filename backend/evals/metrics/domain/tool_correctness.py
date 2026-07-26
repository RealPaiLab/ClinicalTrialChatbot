from __future__ import annotations

from deepeval.metrics import ToolCorrectnessMetric
from deepeval.test_case import LLMTestCase, ToolCallParams

from agents.clinical_trials.tools import semantic_search, syntactic_search
from evals.metrics.domain._deepeval_tools import to_deepeval_tool_calls
from evals.metrics.generic.base import MetricResult
from evals.schemas.expected import ExpectedOutput
from evals.schemas.output import AgentEvalOutput
from evals.schemas.tool_call import ToolCall

NAME = "tool_correctness"

ANY_SEARCH = "trial_search"
"""Virtual expected-tool name: satisfied by either real search tool."""

_SEARCH_TOOLS = frozenset({syntactic_search.__name__, semantic_search.__name__})


def _collapse_search(calls: list[ToolCall]) -> list[ToolCall]:
    return [
        call.model_copy(update={"name": ANY_SEARCH})
        if call.name in _SEARCH_TOOLS
        else call
        for call in calls
    ]


def _dedupe(calls: list[ToolCall]) -> list[ToolCall]:
    """Drop repeats of an identical call."""
    unique: list[ToolCall] = []
    for call in calls:
        if call not in unique:
            unique.append(call)
    return unique


async def tool_correctness(
    question: str, output: AgentEvalOutput, expected: ExpectedOutput
) -> MetricResult | None:
    """Right tools called (and, when expected args are given, right input args)."""
    expected_tools = _dedupe(expected.expected_tools)
    if not expected_tools:
        return None

    called = output.tool_calls
    if any(tool.name == ANY_SEARCH for tool in expected_tools):
        called = _collapse_search(called)

    has_expected_args = any(
        any(k != "reasoning" for k in tool.args) for tool in expected_tools
    )
    params = [ToolCallParams.INPUT_PARAMETERS] if has_expected_args else []
    metric = ToolCorrectnessMetric(evaluation_params=params)
    await metric.a_measure(
        LLMTestCase(
            input=question,
            actual_output=output.answer,
            tools_called=to_deepeval_tool_calls(_dedupe(called)),
            expected_tools=to_deepeval_tool_calls(expected_tools),
        ),
        _show_indicator=False,
    )
    return MetricResult(
        name=NAME, value=float(metric.score or 0.0), reason=metric.reason
    )
