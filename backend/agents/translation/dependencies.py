"""Run-scoped inputs for the translation agent."""

from __future__ import annotations

from dataclasses import dataclass

from schemas.language import Language


@dataclass(frozen=True, slots=True)
class TranslationDeps:
    """The target language and how many lines the run must return."""

    target: Language
    line_count: int
