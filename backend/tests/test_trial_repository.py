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


async def test_syntactic_search_uses_unaccent_ilike_for_location() -> None:
    factory = FakeSessionFactory([make_orm_trial("NCT-1")])
    repo = TrialRepository(factory.session)
    await repo.syntactic_search(TrialFilter(locations=["Montreal"]))
    sql = _sql(factory.last_statement)
    assert "unaccent" in sql
    assert "ilike" in sql


async def test_syntactic_search_without_filters_or_query_has_no_where() -> None:
    factory = FakeSessionFactory([make_orm_trial("NCT-1")])
    repo = TrialRepository(factory.session)
    await repo.syntactic_search(TrialFilter())
    assert "where" not in _sql(factory.last_statement)


async def test_syntactic_search_query_matches_text_columns_within_filters() -> None:
    factory = FakeSessionFactory([make_orm_trial("NCT-1")])
    repo = TrialRepository(factory.session)
    await repo.syntactic_search(TrialFilter(cancer_types=["lung"]), query="immuno")
    sql = _sql(factory.last_statement)
    assert "short_title_en" in sql
    assert "cancer_type_names" in sql
    assert "ilike" in sql


async def test_semantic_search_orders_by_cosine_distance_within_filters() -> None:
    factory = FakeSessionFactory([make_orm_trial("NCT-1")])
    repo = TrialRepository(factory.session)
    await repo.semantic_search(
        TrialFilter(cancer_types=["lung"]), query_embedding=[0.1] * 1024, limit=5
    )
    sql = _sql(factory.last_statement)
    assert "qwen_embedding <=>" in sql
    assert "qwen_embedding is not null" in sql
    assert "order by" in sql
    assert "limit" in sql
    assert "cancer_type_names" in sql
