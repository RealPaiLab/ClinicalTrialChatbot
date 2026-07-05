from __future__ import annotations

from deepeval.metrics import ToolCorrectnessMetric
from deepeval.test_case import LLMTestCase, ToolCallParams

from evals.metrics.domain._deepeval_tools import to_deepeval_tool_calls
from evals.metrics.generic.base import MetricResult
from evals.schemas.expected import ExpectedOutput
from evals.schemas.output import AgentEvalOutput

NAME = "tool_correctness"


async def tool_correctness(
    question: str, output: AgentEvalOutput, expected: ExpectedOutput
) -> MetricResult:
    """Right tools called (and, when expected args are given, right input args)."""
    if not expected.expected_tools:
        return MetricResult(name=NAME, value=1.0, reason="No expected tools.")

    has_expected_args = any(
        any(k != "reasoning" for k in tool.args) for tool in expected.expected_tools
    )
    params = [ToolCallParams.INPUT_PARAMETERS] if has_expected_args else []
    metric = ToolCorrectnessMetric(evaluation_params=params)
    await metric.a_measure(
        LLMTestCase(
            input=question,
            actual_output=output.answer,
            tools_called=to_deepeval_tool_calls(output.tool_calls),
            expected_tools=to_deepeval_tool_calls(expected.expected_tools),
        )
    )
    return MetricResult(
        name=NAME, value=float(metric.score or 0.0), reason=metric.reason
    )
