"""Async data access for trials."""

from __future__ import annotations

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


def _cancer_match(value: str) -> ColumnElement[bool]:
    site_text = func.array_to_string(TrialSite.cancer_type_names, " ")
    return _contains(site_text, value)


def _location_match(value: str) -> ColumnElement[bool]:
    return or_(
        _contains(Location.city, value),
        _contains(Location.province, value),
        _contains(Location.name_en, value),
    )


def _status_match(value: str) -> ColumnElement[bool]:
    return _contains(TrialSite.state, value)


def _site_match_exists(
    flt: TrialFilter, restrict_province: str | None
) -> ColumnElement[bool] | None:
    site_terms = {
        _cancer_match: [v for v in flt.cancer_types if v],
        _status_match: [v for v in flt.statuses if v],
        _location_match: [v for v in flt.locations if v],
    }
    conditions = [
        or_(*(build(v) for v in terms)) for build, terms in site_terms.items() if terms
    ]
    if restrict_province:
        conditions.append(_contains(Location.province, restrict_province))
    if not conditions:
        return None
    needs_location = bool(flt.locations) or restrict_province is not None
    stmt = select(TrialSite.trial_id)
    if needs_location:
        stmt = stmt.join(Location, TrialSite.location_id == Location.id)
    return stmt.where(TrialSite.trial_id == Trial.id, *conditions).exists()


def _phase_filter(value: str) -> ColumnElement[bool]:
    return _contains(func.array_to_string(Trial.phases, " "), value)


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
    trial-level phase predicate."""
    conditions: list[ColumnElement[bool]] = []
    site_match = _site_match_exists(flt, restrict_province)
    if site_match is not None:
        conditions.append(site_match)
    phases = [v for v in flt.phases if v]
    if phases:
        conditions.append(or_(*(_phase_filter(v) for v in phases)))
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

    async def semantic_search(
        self,
        flt: TrialFilter,
        *,
        query_embedding: list[float],
        limit: int = 20,
        offset: int = 0,
    ) -> list[Trial]:
        """Vector search: filter conditions, ranked by cosine distance."""
        conditions = [
            *_filter_conditions(flt, self._restrict_to_province),
            Trial.embedding.is_not(None),
        ]
        stmt = (
            self._base_select()
            .where(*conditions)
            .order_by(Trial.embedding.cosine_distance(query_embedding))
            .limit(limit)
            .offset(offset)
        )
        return await self._run(stmt)

    async def get_by_ncts(self, nct_numbers: list[str]) -> list[Trial]:
        """Fetch trials by their NCT numbers."""
        if not nct_numbers:
            return []
        conditions: list[ColumnElement[bool]] = [Trial.nct_number.in_(nct_numbers)]
        if self._restrict_to_province:
            conditions.append(_province_restriction(self._restrict_to_province))
        return await self._run(self._base_select().where(*conditions))
