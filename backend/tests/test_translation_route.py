from __future__ import annotations

from typing import Any

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from core.dependencies import get_translation_service
from routes.translation import router
from schemas.language import Language
from schemas.translation import TranslationSource, TrialTranslation


class StubTranslationService:
    def __init__(self, *, found: bool = True) -> None:
        self.found = found
        self.calls: list[tuple[str, Language, bool]] = []

    async def translate_trial(
        self, trial_ref: str, target: Language, *, cached_only: bool = False
    ) -> TrialTranslation | None:
        self.calls.append((trial_ref, target, cached_only))
        if not self.found:
            return None
        return TrialTranslation(
            trial_ref=trial_ref,
            language=target,
            source=TranslationSource.MACHINE,
            short_title="Un essai",
        )


def make_client(service: Any) -> TestClient:
    app = FastAPI()
    app.include_router(router)
    app.dependency_overrides[get_translation_service] = lambda: service
    return TestClient(app)


def test_returns_translation() -> None:
    service = StubTranslationService()
    response = make_client(service).get(
        "/trials/CTC-00000001/translation?language=fr-CA"
    )

    assert response.status_code == 200
    assert response.json()["short_title"] == "Un essai"
    assert service.calls == [("CTC-00000001", Language.FR_CA, False)]


def test_cached_only_is_passed_through() -> None:
    service = StubTranslationService()
    response = make_client(service).get(
        "/trials/CTC-00000001/translation?language=fr-CA&cached_only=true"
    )

    assert response.status_code == 200
    assert service.calls == [("CTC-00000001", Language.FR_CA, True)]


def test_unknown_trial_is_404() -> None:
    response = make_client(StubTranslationService(found=False)).get(
        "/trials/CTC-M15S1NGX/translation?language=de"
    )
    assert response.status_code == 404


@pytest.mark.parametrize("language", ["klingon", "fr_CA", ""])
def test_unsupported_language_is_rejected(language: str) -> None:
    service = StubTranslationService()
    response = make_client(service).get(
        f"/trials/CTC-00000001/translation?language={language}"
    )

    assert response.status_code == 422
    assert service.calls == []


def test_language_is_required() -> None:
    assert (
        make_client(StubTranslationService())
        .get("/trials/CTC-00000001/translation")
        .status_code
        == 422
    )
