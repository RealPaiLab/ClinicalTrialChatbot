"""Async data access for trials."""

from __future__ import annotations

from collections.abc import Callable
from typing import cast

from sqlalchemy import ColumnElement, Select, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy.sql.operators import ColumnOperators

from models.location import Location
from models.trial import Trial
from models.trial_site import TrialSite
from schemas.trial import TrialFilter


def _contains(column: ColumnOperators, term: str) -> ColumnElement[bool]:
    """Case- and accent-insensitive substring match (LIKE wildcards escaped)."""
    escaped = term.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
    pattern = func.unaccent(f"%{escaped}%")
    return cast(ColumnElement[bool], func.unaccent(column).ilike(pattern, escape="\\"))


def _cancer_type_filter(value: str) -> ColumnElement[bool]:
    site_text = func.array_to_string(TrialSite.cancer_type_names, " ")
    return (
        select(TrialSite.trial_id)
        .where(TrialSite.trial_id == Trial.id, _contains(site_text, value))
        .exists()
    )


def _location_filter(value: str) -> ColumnElement[bool]:
    return (
        select(TrialSite.trial_id)
        .join(Location, TrialSite.location_id == Location.id)
        .where(
            TrialSite.trial_id == Trial.id,
            or_(
                _contains(Location.city, value),
                _contains(Location.province, value),
                _contains(Location.name_en, value),
            ),
        )
        .exists()
    )


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


def _status_filter(value: str) -> ColumnElement[bool]:
    return (
        select(TrialSite.trial_id)
        .where(TrialSite.trial_id == Trial.id, _contains(TrialSite.state, value))
        .exists()
    )


def _phase_filter(value: str) -> ColumnElement[bool]:
    return _contains(func.array_to_string(Trial.phases, " "), value)


_FILTER_BUILDERS: dict[str, Callable[[str], ColumnElement[bool]]] = {
    "cancer_types": _cancer_type_filter,
    "locations": _location_filter,
    "statuses": _status_filter,
    "phases": _phase_filter,
}


def _filter_conditions(flt: TrialFilter) -> list[ColumnElement[bool]]:
    """AND of per-dimension OR-groups built from a TrialFilter."""
    values = flt.model_dump()
    conditions: list[ColumnElement[bool]] = []
    for name, build in _FILTER_BUILDERS.items():
        terms = [v for v in values.get(name, []) if v]
        if terms:
            conditions.append(or_(*(build(v) for v in terms)))
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
        stmt = select(Trial).options(
            selectinload(Trial.sites).selectinload(TrialSite.location)
        )
        if self._restrict_to_province:
            stmt = stmt.where(_province_restriction(self._restrict_to_province))
        return stmt

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
        conditions = _filter_conditions(flt)
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

    async def semantic_search(
        self,
        flt: TrialFilter,
        *,
        query_embedding: list[float],
        limit: int = 20,
    ) -> list[Trial]:
        """Vector search: filter conditions, ranked by cosine distance."""
        conditions = [*_filter_conditions(flt), Trial.embedding.is_not(None)]
        stmt = (
            self._base_select()
            .where(*conditions)
            .order_by(Trial.embedding.cosine_distance(query_embedding))
            .limit(limit)
        )
        return await self._run(stmt)

    async def get_by_ncts(self, nct_numbers: list[str]) -> list[Trial]:
        """Fetch trials by their NCT numbers."""
        if not nct_numbers:
            return []
        return await self._run(
            self._base_select().where(Trial.nct_number.in_(nct_numbers))
        )
