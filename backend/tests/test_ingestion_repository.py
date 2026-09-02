from sqlalchemy.dialects import postgresql

from repository.ingestion_repository import IngestionRunRepository
from tests.factories import FakeSessionFactory


async def test_a_rolled_back_publish_is_not_a_candidate() -> None:
    """Rollback restores older data, so its run row must stop being the answer."""
    factory = FakeSessionFactory([])
    async with factory() as session:
        await IngestionRunRepository(session).latest_published("ctc")

    compiled = str(factory.last_statement.compile(dialect=postgresql.dialect()))  # type: ignore[no-untyped-call]

    assert "ingestion_runs.status = " in compiled
    assert "ORDER BY ingestion_runs.published_at DESC" in compiled
