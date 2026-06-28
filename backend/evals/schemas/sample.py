from __future__ import annotations

from pydantic import BaseModel

from evals.schemas.expected import ExpectedOutput
from evals.schemas.turn import Turn


class EvalSample(BaseModel):
    """One evaluation dataset item (the versioned unit)."""

    input: list[Turn]
    expected: ExpectedOutput
