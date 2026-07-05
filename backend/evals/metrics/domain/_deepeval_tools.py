from __future__ import annotations

from deepeval.test_case import ToolCall as DeepEvalToolCall
from pydantic import JsonValue

from agents.clinical_trials.tools import TOOL_DESCRIPTIONS
from evals.schemas.tool_call import ToolCall


def _reasoning(args: dict[str, JsonValue]) -> str | None:
    value = args.get("reasoning")
    return str(value) if value is not None else None


def to_deepeval_tool_calls(calls: list[ToolCall]) -> list[DeepEvalToolCall]:
    """Map our ToolCalls to DeepEval ToolCalls."""
    return [
        DeepEvalToolCall(
            name=call.name,
            description=TOOL_DESCRIPTIONS.get(call.name),
            reasoning=_reasoning(call.args),
            input_parameters={k: v for k, v in call.args.items() if k != "reasoning"},
        )
        for call in calls
    ]
