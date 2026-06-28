from __future__ import annotations

from pydantic import BaseModel, Field

from evals.schemas.tool_call import ToolCall


class ExpectedOutput(BaseModel):
    """Ground truth for a sample (Langfuse item.expected_output).

    nct_numbers is team-provided gold (query-based regime); expected_tools is the
    expected tool calls with their args (a turn may fire several at once).
    """

    nct_numbers: list[str] = Field(default_factory=list)
    expected_tools: list[ToolCall] = Field(default_factory=list)
    glossary_terms: list[str] = Field(default_factory=list)
    reference_facts: list[str] | None = None
