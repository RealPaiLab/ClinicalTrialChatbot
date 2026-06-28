from __future__ import annotations

from typing import Protocol

from evals.schemas.sample import EvalSample


class DatasetSource(Protocol):
    """Yields evaluation samples from some backing store."""

    def load(self) -> list[EvalSample]: ...
