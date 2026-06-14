from __future__ import annotations

from unittest.mock import MagicMock

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

import routes.feedback as feedback_module
from core.langfuse import get_langfuse_client
from routes.feedback import router


@pytest.fixture
def langfuse() -> MagicMock:
    return MagicMock()


@pytest.fixture
def client(langfuse: MagicMock, monkeypatch: pytest.MonkeyPatch) -> TestClient:
    monkeypatch.setattr(
        feedback_module,
        "trace_id_from_session",
        lambda session_id: f"trace-{session_id}",
    )
    app = FastAPI()
    app.include_router(router)
    app.dependency_overrides[get_langfuse_client] = lambda: langfuse
    return TestClient(app)


def test_submit_feedback_scores_the_observation(
    client: TestClient, langfuse: MagicMock
) -> None:
    response = client.post(
        "/feedback",
        json={
            "session_id": "abc",
            "observation_id": "obs-1",
            "score": 0,
            "comment": "missed the obvious one",
            "suggested_nct_numbers": ["NCT0001", "NCT0002"],
        },
    )

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

    kwargs = langfuse.create_score.call_args.kwargs
    assert kwargs["trace_id"] == "trace-abc"
    assert kwargs["observation_id"] == "obs-1"
    assert kwargs["value"] == 0
    assert kwargs["name"] == "user-feedback"
    assert kwargs["comment"] == "missed the obvious one"
    assert kwargs["metadata"] == {"suggested_nct_numbers": ["NCT0001", "NCT0002"]}
    assert kwargs["score_id"] == "obs-1-user-feedback"


def test_submit_feedback_omits_metadata_when_no_trials(
    client: TestClient, langfuse: MagicMock
) -> None:
    response = client.post(
        "/feedback",
        json={"session_id": "abc", "observation_id": "obs-1", "score": 1},
    )

    assert response.status_code == 200
    assert langfuse.create_score.call_args.kwargs["metadata"] is None


def test_submit_feedback_rejects_out_of_range_score(
    client: TestClient, langfuse: MagicMock
) -> None:
    response = client.post(
        "/feedback",
        json={"session_id": "abc", "observation_id": "obs-1", "score": 2},
    )

    assert response.status_code == 422
    langfuse.create_score.assert_not_called()
