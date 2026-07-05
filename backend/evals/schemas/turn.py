from __future__ import annotations

from typing import Literal

from pydantic import BaseModel


class Turn(BaseModel):
    """One conversation turn in a dataset sample."""

    role: Literal["user", "assistant"]
    content: str
