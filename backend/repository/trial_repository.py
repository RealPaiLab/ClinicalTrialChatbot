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


class TrialRepository:
    """Reads trials from PostgreSQL. Returns ORM rows with sites + location loaded."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    def _base_select(self) -> Select[tuple[Trial]]:
        return select(Trial).options(
            selectinload(Trial.sites).selectinload(TrialSite.location)
        )

    async def _run(self, stmt: Select[tuple[Trial]]) -> list[Trial]:
        result = await self._session.execute(stmt)
        return list(result.scalars().unique().all())

    async def filter_trials(self, flt: TrialFilter, *, limit: int = 20) -> list[Trial]:
        """Structured search"""
        values = flt.model_dump()
        conditions: list[ColumnElement[bool]] = []
        for name, build in _FILTER_BUILDERS.items():
            terms = [v for v in values.get(name, []) if v]
            if terms:
                conditions.append(or_(*(build(v) for v in terms)))
        return await self._run(self._base_select().where(*conditions).limit(limit))

    async def keyword_search(self, query: str, *, limit: int = 20) -> list[Trial]:
        """Substring search across titles, description, and inclusion criteria."""
        stmt = (
            self._base_select()
            .where(
                or_(
                    _contains(Trial.short_title_en, query),
                    _contains(Trial.official_title_en, query),
                    _contains(Trial.description_en, query),
                    _contains(Trial.inclusion_criteria_en, query),
                )
            )
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
