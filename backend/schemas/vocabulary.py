from __future__ import annotations

from enum import StrEnum

from pydantic import BaseModel, Field


class VocabField(StrEnum):
    """A filter argument whose allowed values are read from the trial corpus."""

    CANCER_TYPE = "cancer_type"
    TREATMENT_TYPE = "treatment_type"
    DISEASE_STAGE = "disease_stage"


class Vocabulary(BaseModel):
    """Allowed values per field, plus the same values split by listing registry."""

    values: dict[VocabField, tuple[str, ...]] = Field(default_factory=dict)
    by_source: dict[VocabField, dict[str, tuple[str, ...]]] = Field(
        default_factory=dict
    )

    def allowed(self, field: VocabField) -> tuple[str, ...]:
        return self.values.get(field, ())

    def per_source(self, field: VocabField) -> dict[str, tuple[str, ...]]:
        return self.by_source.get(field, {})


_current = Vocabulary()


def current_vocabulary() -> Vocabulary:
    return _current


def set_vocabulary(vocabulary: Vocabulary) -> None:
    global _current
    _current = vocabulary
