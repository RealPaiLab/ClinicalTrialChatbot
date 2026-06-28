from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass


@dataclass(frozen=True)
class RetrievalCase:
    """Generic retrieval case: what was retrieved vs. what is relevant."""

    retrieved: Sequence[str]
    relevant: Sequence[str]


@dataclass(frozen=True)
class GenerationCase:
    """Generic generation case for grounded-answer judging."""

    question: str
    answer: str
    contexts: Sequence[str]
    reference: str | None = None
