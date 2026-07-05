from __future__ import annotations

from deepeval.metrics import ArgumentCorrectnessMetric
from deepeval.test_case import LLMTestCase

from evals.metrics.domain._deepeval_tools import to_deepeval_tool_calls
from evals.metrics.generic.base import MetricResult
from evals.schemas.output import AgentEvalOutput

NAME = "argument_correctness"


async def argument_correctness(
    question: str, output: AgentEvalOutput, model: str
) -> MetricResult:
    """Are the arguments passed to each tool call correct for the question?"""
    if not output.tool_calls:
        return MetricResult(name=NAME, value=1.0, reason="No tool calls.")

    metric = ArgumentCorrectnessMetric(model=model)
    await metric.a_measure(
        LLMTestCase(
            input=question,
            actual_output=output.answer,
            tools_called=to_deepeval_tool_calls(output.tool_calls),
        )
    )
    return MetricResult(
        name=NAME, value=float(metric.score or 0.0), reason=metric.reason
    )
