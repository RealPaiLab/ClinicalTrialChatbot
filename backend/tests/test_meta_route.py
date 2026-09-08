from datetime import UTC, datetime
from typing import Any, cast

from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from core.dependencies import get_data_freshness_service
from models.ingestion_run import IngestionRun
from routes.meta import router
from services.data_freshness_service import DataFreshnessService
from tests.factories import FakeSessionFactory

PUBLISHED_AT = datetime(2026, 9, 2, 13, 4, 22, tzinfo=UTC)


def make_client(runs: list[IngestionRun]) -> TestClient:
    factory: Any = FakeSessionFactory(runs)
    service = DataFreshnessService(cast(async_sessionmaker[AsyncSession], factory))
    app = FastAPI()
    app.include_router(router)
    app.dependency_overrides[get_data_freshness_service] = lambda: service
    return TestClient(app)


def test_the_recorded_publish_is_served_as_the_freshness_date() -> None:
    run = IngestionRun(
        pipeline="ctc",
        published_at=PUBLISHED_AT,
        generation="ctc_gen_20260902T130422000000Z",
        trial_count=1215,
    )

    response = make_client([run]).get("/meta/data-freshness")

    assert response.status_code == 200
    assert response.json() == {"published_at": "2026-09-02T13:04:22Z"}


def test_a_corpus_that_was_never_ingested_is_200_with_a_null_not_404() -> None:
    """The frontend hides the badge on a null. A 404 would read as a failure."""
    response = make_client([]).get("/meta/data-freshness")

    assert response.status_code == 200
    assert response.json() == {"published_at": None}
