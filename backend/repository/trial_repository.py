"""Async data access for trials."""

from __future__ import annotations

from typing import cast

from sqlalchemy import ColumnElement, Select, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, undefer
from sqlalchemy.sql.operators import ColumnOperators

from core.embeddings import EmbeddingProvider
from core.embeddings.columns import EMBEDDING_COLUMNS
from models.location import Location
from models.trial import Trial
from models.trial_site import TrialSite
from schemas.provinces import split_locations
from schemas.trial import TrialFilter


def _contains(column: ColumnOperators, term: str) -> ColumnElement[bool]:
    """Case- and accent-insensitive substring match (LIKE wildcards escaped)."""
    escaped = term.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
    pattern = func.unaccent(f"%{escaped}%")
    return cast(ColumnElement[bool], func.unaccent(column).ilike(pattern, escape="\\"))


def _cancer_match(value: str) -> ColumnElement[bool]:
    site_text = func.array_to_string(TrialSite.cancer_type_names, " ")
    return _contains(site_text, value)


def _city_match(value: str) -> ColumnElement[bool]:
    return or_(
        _contains(Location.city, value),
        _contains(Location.name_en, value),
    )


def _province_match(canonical: str) -> ColumnElement[bool]:
    return _contains(Location.province, canonical)


def _location_conditions(locations: list[str]) -> list[ColumnElement[bool]]:
    cities, provinces = split_locations(locations)
    conditions: list[ColumnElement[bool]] = []
    if cities:
        conditions.append(or_(*(_city_match(v) for v in cities)))
    if provinces:
        conditions.append(or_(*(_province_match(v) for v in provinces)))
    return conditions


def _status_match(value: str) -> ColumnElement[bool]:
    return _contains(TrialSite.state, value)


def _site_match_exists(
    flt: TrialFilter, restrict_province: str | None
) -> ColumnElement[bool] | None:
    group_terms = {
        _cancer_match: [v for v in flt.cancer_types if v],
        _status_match: [v for v in flt.statuses if v],
    }
    conditions = [
        or_(*(build(v) for v in terms)) for build, terms in group_terms.items() if terms
    ]
    locations = [v for v in flt.locations if v]
    conditions.extend(_location_conditions(locations))
    if restrict_province:
        conditions.append(_contains(Location.province, restrict_province))
    if not conditions:
        return None
    needs_location = bool(locations) or restrict_province is not None
    stmt = select(TrialSite.trial_id)
    if needs_location:
        stmt = stmt.join(Location, TrialSite.location_id == Location.id)
    return stmt.where(TrialSite.trial_id == Trial.id, *conditions).exists()


_TRIAL_ARRAY_COLUMNS: dict[str, ColumnOperators] = {
    "phases": Trial.phases,
    "treatment_types": Trial.treatment_type_names,
    "disease_stages": Trial.disease_stages,
}


def _array_match(column: ColumnOperators, value: str) -> ColumnElement[bool]:
    return _contains(func.array_to_string(column, " "), value)


def _province_restriction(province: str) -> ColumnElement[bool]:
    return (
        select(TrialSite.trial_id)
        .join(Location, TrialSite.location_id == Location.id)
        .where(
            TrialSite.trial_id == Trial.id,
            _contains(Location.province, province),
        )
        .exists()
    )


def _filter_conditions(
    flt: TrialFilter, restrict_province: str | None = None
) -> list[ColumnElement[bool]]:
    """Combined same-site predicate (cancer/location/status/province) AND the
    trial-level array predicates (phase, treatment type, disease stage)."""
    conditions: list[ColumnElement[bool]] = []
    site_match = _site_match_exists(flt, restrict_province)
    if site_match is not None:
        conditions.append(site_match)
    for field, column in _TRIAL_ARRAY_COLUMNS.items():
        terms = [v for v in getattr(flt, field) if v]
        if terms:
            conditions.append(or_(*(_array_match(column, v) for v in terms)))
    return conditions


def _keyword_condition(query: str) -> ColumnElement[bool]:
    """Free-text match across titles, description, and inclusion criteria."""
    return or_(
        _contains(Trial.short_title_en, query),
        _contains(Trial.official_title_en, query),
        _contains(Trial.description_en, query),
        _contains(Trial.inclusion_criteria_en, query),
    )


class TrialRepository:
    """Reads trials from PostgreSQL. Returns ORM rows with sites + location loaded."""

    def __init__(
        self, session: AsyncSession, *, restrict_to_province: str | None = None
    ) -> None:
        self._session = session
        self._restrict_to_province = restrict_to_province

    def _base_select(self) -> Select[tuple[Trial]]:
        return select(Trial).options(
            selectinload(Trial.sites).selectinload(TrialSite.location)
        )

    async def _run(self, stmt: Select[tuple[Trial]]) -> list[Trial]:
        result = await self._session.execute(stmt)
        return list(result.scalars().unique().all())

    async def syntactic_search(
        self,
        flt: TrialFilter,
        *,
        query: str | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> list[Trial]:
        """Lexical search: filter conditions AND an optional free-text query."""
        conditions = _filter_conditions(flt, self._restrict_to_province)
        if query:
            conditions.append(_keyword_condition(query))
        stmt = (
            self._base_select()
            .where(*conditions)
            .order_by(Trial.id)
            .limit(limit)
            .offset(offset)
        )
        return await self._run(stmt)

    async def count_matches(
        self,
        flt: TrialFilter,
        *,
        query: str | None = None,
        provider: EmbeddingProvider | None = None,
    ) -> int:
        """How many trials match"""
        conditions = _filter_conditions(flt, self._restrict_to_province)
        if query:
            conditions.append(_keyword_condition(query))
        if provider is not None:
            conditions.append(EMBEDDING_COLUMNS[provider].is_not(None))
        stmt = select(func.count()).select_from(Trial).where(*conditions)
        result = await self._session.execute(stmt)
        return int(result.scalar_one())

    async def semantic_search(
        self,
        flt: TrialFilter,
        *,
        query_embedding: list[float],
        provider: EmbeddingProvider = EmbeddingProvider.OLLAMA,
        limit: int = 20,
        offset: int = 0,
    ) -> list[Trial]:
        """Vector search: filter conditions, ranked by cosine distance against
        the column matching the provider that produced the query embedding."""
        column = EMBEDDING_COLUMNS[provider]
        conditions = [
            *_filter_conditions(flt, self._restrict_to_province),
            column.is_not(None),
        ]
        stmt = (
            self._base_select()
            .where(*conditions)
            .order_by(column.cosine_distance(query_embedding))
            .limit(limit)
            .offset(offset)
        )
        return await self._run(stmt)

    async def get_by_refs(self, trial_refs: list[str]) -> list[Trial]:
        """Fetch trials by their refs."""
        if not trial_refs:
            return []
        conditions: list[ColumnElement[bool]] = [Trial.trial_ref.in_(trial_refs)]
        if self._restrict_to_province:
            conditions.append(_province_restriction(self._restrict_to_province))
        return await self._run(self._base_select().where(*conditions))

    async def get_site_contacts(self, trial_ref: str) -> list[TrialSite]:
        conditions: list[ColumnElement[bool]] = [Trial.trial_ref == trial_ref]
        if self._restrict_to_province:
            conditions.append(_contains(Location.province, self._restrict_to_province))
        stmt = (
            select(TrialSite)
            .join(Trial, TrialSite.trial_id == Trial.id)
            .join(Location, TrialSite.location_id == Location.id)
            .where(*conditions)
            .options(undefer(TrialSite.coordinators), selectinload(TrialSite.location))
            .order_by(Location.name_en)
        )
        result = await self._session.execute(stmt)
        return list(result.scalars().unique().all())

    async def exists_by_ref(self, trial_ref: str) -> bool:
        stmt = select(Trial.id).where(Trial.trial_ref == trial_ref).limit(1)
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none() is not None

    async def get_by_ncts(self, nct_numbers: list[str]) -> list[Trial]:
        """Fetch trials by their NCT numbers."""
        if not nct_numbers:
            return []
        conditions: list[ColumnElement[bool]] = [Trial.nct_number.in_(nct_numbers)]
        if self._restrict_to_province:
            conditions.append(_province_restriction(self._restrict_to_province))
        return await self._run(self._base_select().where(*conditions))
