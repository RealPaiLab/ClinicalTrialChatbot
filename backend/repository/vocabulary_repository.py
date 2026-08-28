"""Async data access for the controlled filter vocabularies."""

from __future__ import annotations

from sqlalchemy import Select, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import InstrumentedAttribute

from models.trial import Trial
from models.trial_site import TrialSite
from schemas.vocabulary import VocabField, Vocabulary

VOCAB_COLUMNS: dict[VocabField, InstrumentedAttribute[list[str]]] = {
    VocabField.CANCER_TYPE: TrialSite.cancer_type_names,
    VocabField.TREATMENT_TYPE: Trial.treatment_type_names,
    VocabField.DISEASE_STAGE: Trial.disease_stages,
}


def _distinct_values(column: InstrumentedAttribute[list[str]]) -> Select[tuple[str]]:
    """Distinct non-blank values of an array column, sorted."""
    unnested = select(func.unnest(column).label("value")).subquery()
    value = unnested.c.value
    return (
        select(value).distinct().where(value.is_not(None), value != "").order_by(value)
    )


class VocabularyRepository:
    """Reads the distinct values of every vocabulary-backed column."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def load(self) -> Vocabulary:
        values: dict[VocabField, tuple[str, ...]] = {}
        for field, column in VOCAB_COLUMNS.items():
            result = await self._session.execute(_distinct_values(column))
            values[field] = tuple(result.scalars().all())
        return Vocabulary(values=values)
