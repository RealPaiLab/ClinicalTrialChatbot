from typing import Any

from sqlalchemy.dialects import postgresql

from repository.trial_repository import TrialRepository, _location_conditions
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


def test_city_and_parent_province_are_separate_and_ed_groups() -> None:
    # Ottawa (city) + Ontario (province) must AND, so it stays scoped to Ottawa
    # rather than widening to every site in Ontario.
    conditions = _location_conditions(["Ottawa", "Ontario"])
    assert len(conditions) == 2
    city_sql, province_sql = (str(c.compile()).lower() for c in conditions)
    assert "city" in city_sql and "province" not in city_sql
    assert "province" in province_sql and "city" not in province_sql


def test_multiple_cities_stay_one_or_group() -> None:
    conditions = _location_conditions(["Ottawa", "Toronto"])
    assert len(conditions) == 1


def test_bare_province_is_one_group() -> None:
    conditions = _location_conditions(["Ontario"])
    assert len(conditions) == 1
    assert "province" in str(conditions[0].compile()).lower()


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


async def test_trial_level_filters_reach_the_where_clause() -> None:
    factory = FakeSessionFactory([make_orm_trial("NCT-1")])
    repo = TrialRepository(factory.session)
    await repo.syntactic_search(
        TrialFilter(treatment_types=["Immunotherapy"], disease_stages=["Metastatic"])
    )
    sql = _sql(factory.last_statement)
    assert "treatment_type_names" in sql
    assert "disease_stages" in sql
    assert "exists" not in sql


async def test_trial_level_filters_combine_with_the_same_site_exists() -> None:
    factory = FakeSessionFactory([make_orm_trial("NCT-1")])
    repo = TrialRepository(factory.session)
    await repo.syntactic_search(
        TrialFilter(cancer_types=["lung"], disease_stages=["Metastatic"])
    )
    sql = _sql(factory.last_statement)
    assert "exists" in sql
    assert "disease_stages" in sql
