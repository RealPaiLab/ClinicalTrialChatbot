from __future__ import annotations

from typing import Protocol

from pydantic import BaseModel


class MetricResult(BaseModel):
    """A single metric's score."""

    name: str
    value: float
    reason: str | None = None


class Metric[CaseT](Protocol):
    """Scores one generic case. Implementations inject any model at construction."""

    name: str

    async def score(self, case: CaseT) -> MetricResult: ...
