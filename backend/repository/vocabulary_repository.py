"""Async data access for the controlled filter vocabularies."""

from __future__ import annotations

from sqlalchemy import Select, func, select, true
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import InstrumentedAttribute

from models.trial import Trial
from models.trial_site import TrialSite
from schemas.vocabulary import VocabField, Vocabulary

VOCAB_COLUMNS: dict[VocabField, InstrumentedAttribute[list[str]]] = {
    VocabField.CANCER_TYPE: TrialSite.cancer_type_names,
    VocabField.TREATMENT_TYPE: Trial.treatment_type_names,
    VocabField.DISEASE_STAGE: Trial.disease_stages,
    VocabField.DATA_SOURCE: TrialSite.data_sources,
}


def _distinct_values(column: InstrumentedAttribute[list[str]]) -> Select[tuple[str]]:
    """Distinct non-blank values of an array column, sorted."""
    unnested = select(func.unnest(column).label("value")).subquery()
    value = unnested.c.value
    return (
        select(value).distinct().where(value.is_not(None), value != "").order_by(value)
    )


def _values_by_source(
    column: InstrumentedAttribute[list[str]],
) -> Select[tuple[str, str]]:
    """Distinct (source, value) pairs; lateral, since a double unnest would zip."""
    source = func.unnest(TrialSite.data_sources).table_valued("value")
    sources = source.render_derived().lateral("src")
    value = func.unnest(column).table_valued("value")
    values = value.render_derived().lateral("val")
    return (
        select(sources.c.value, values.c.value)
        .distinct()
        .select_from(TrialSite)
        .join(Trial, Trial.id == TrialSite.trial_id)
        .join(sources, true())
        .join(values, true())
        .where(values.c.value.is_not(None), values.c.value != "")
        .order_by(sources.c.value, values.c.value)
    )


class VocabularyRepository:
    """Reads the distinct values of every vocabulary-backed column."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def load(self) -> Vocabulary:
        values: dict[VocabField, tuple[str, ...]] = {}
        by_source: dict[VocabField, dict[str, tuple[str, ...]]] = {}
        for field, column in VOCAB_COLUMNS.items():
            result = await self._session.execute(_distinct_values(column))
            values[field] = tuple(result.scalars().all())
            if field is VocabField.DATA_SOURCE:
                continue
            grouped: dict[str, list[str]] = {}
            for source, value in await self._session.execute(_values_by_source(column)):
                grouped.setdefault(source, []).append(value)
            by_source[field] = {src: tuple(vals) for src, vals in grouped.items()}
        return Vocabulary(values=values, by_source=by_source)
