from __future__ import annotations

from pydantic import BaseModel, Field

from evals.schemas.tool_call import ToolCall


class AgentEvalOutput(BaseModel):
    """The task's return value for one sample; the 'actual' evaluators read."""

    answer: str
    contexts: list[str] = Field(default_factory=list)
    used_ncts: list[str] = Field(default_factory=list)
    tool_calls: list[ToolCall] = Field(default_factory=list)

    @property
    def trajectory(self) -> list[str]:
        return [call.name for call in self.tool_calls]
