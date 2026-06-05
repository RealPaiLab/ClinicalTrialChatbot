from typing import Any

from sqlalchemy.dialects import postgresql

from repository.trial_repository import TrialRepository
from schemas.trial import TrialFilter
from tests.factories import FakeSessionFactory, make_orm_trial


def _sql(statement: Any) -> str:
    dialect = postgresql.dialect()  # type: ignore[no-untyped-call]
    return str(statement.compile(dialect=dialect)).lower()


async def test_get_by_ncts_empty_skips_query() -> None:
    factory = FakeSessionFactory()
    repo = TrialRepository(factory.session)
    assert await repo.get_by_ncts([]) == []
    factory.session.execute.assert_not_awaited()


async def test_get_by_ncts_returns_rows() -> None:
    trial = make_orm_trial("NCT-1")
    factory = FakeSessionFactory([trial])
    repo = TrialRepository(factory.session)
    assert await repo.get_by_ncts(["NCT-1"]) == [trial]
    assert "nct_number in" in _sql(factory.last_statement)


async def test_filter_trials_uses_unaccent_ilike_for_location() -> None:
    factory = FakeSessionFactory([make_orm_trial("NCT-1")])
    repo = TrialRepository(factory.session)
    await repo.filter_trials(TrialFilter(locations=["Montreal"]))
    sql = _sql(factory.last_statement)
    assert "unaccent" in sql
    assert "ilike" in sql


async def test_filter_trials_without_filters_has_no_where() -> None:
    factory = FakeSessionFactory([make_orm_trial("NCT-1")])
    repo = TrialRepository(factory.session)
    await repo.filter_trials(TrialFilter())
    assert "where" not in _sql(factory.last_statement)


async def test_keyword_search_matches_text_columns() -> None:
    factory = FakeSessionFactory([make_orm_trial("NCT-1")])
    repo = TrialRepository(factory.session)
    await repo.keyword_search("immunotherapy")
    sql = _sql(factory.last_statement)
    assert "short_title_en" in sql
    assert "ilike" in sql
