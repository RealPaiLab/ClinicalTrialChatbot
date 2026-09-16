from datetime import UTC, datetime, timedelta
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


def make_run(pipeline: str, published_at: datetime) -> IngestionRun:
    return IngestionRun(
        pipeline=pipeline,
        published_at=published_at,
        generation=f"{pipeline}_gen_{published_at:%Y%m%dT%H%M%S}000000Z",
        trial_count=1215,
    )


def test_the_badge_date_is_the_oldest_source_and_each_source_is_listed() -> None:
    """Newest first, as the query orders them: the first row per pipeline wins."""
    runs = [
        make_run("ulc", PUBLISHED_AT),
        make_run("ctc", PUBLISHED_AT - timedelta(days=9)),
        make_run("ctc", PUBLISHED_AT - timedelta(days=16)),
    ]

    response = make_client(runs).get("/meta/data-freshness")

    assert response.status_code == 200
    assert response.json() == {
        "published_at": "2026-08-24T13:04:22Z",
        "sources": [
            {
                "source": "ctc",
                "name": "Cancer Trials Canada",
                "published_at": "2026-08-24T13:04:22Z",
            },
            {"source": "ulc", "name": "U-Link", "published_at": "2026-09-02T13:04:22Z"},
        ],
    }


def test_a_corpus_that_was_never_ingested_is_200_with_a_null_not_404() -> None:
    """A null hides the badge, a 404 reads as failure; an unrun source is null."""
    response = make_client([]).get("/meta/data-freshness")

    assert response.status_code == 200
    body = response.json()
    assert body["published_at"] is None
    assert [s["published_at"] for s in body["sources"]] == [None, None]
