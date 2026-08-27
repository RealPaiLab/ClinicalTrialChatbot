"""What every ingestion source has to provide, whatever it reads from."""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass, field
from typing import Protocol

from pydantic import JsonValue

from scripts.ctc.canonical import CanonicalTrial

PageCallback = Callable[[int], None]


@dataclass(frozen=True, slots=True)
class SourceRecords:
    """A source's output: the canonical records, plus whatever it was served."""

    trials: list[CanonicalTrial]
    raw: list[JsonValue] = field(default_factory=list)


class TrialSource(Protocol):
    """Sources differ in where records come from, never in what comes out."""

    name: str

    async def load(self) -> SourceRecords: ...
