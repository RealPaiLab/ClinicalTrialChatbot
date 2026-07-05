from __future__ import annotations

from pydantic import BaseModel, JsonValue


class ToolCall(BaseModel):
    """A single tool call the agent made, with its arguments."""

    name: str
    args: dict[str, JsonValue]
