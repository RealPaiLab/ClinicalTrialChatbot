from __future__ import annotations

import pytest

import core.dependencies as dependencies
from core.config import Environment, Settings


@pytest.mark.parametrize(
    ("environment", "is_production", "capture"),
    [
        (Environment.DEVELOPMENT, False, True),
        (Environment.STAGING, False, True),
        (Environment.PRODUCTION, True, False),
    ],
)
def test_environment_gates(
    environment: Environment, is_production: bool, capture: bool
) -> None:
    settings = Settings(environment=environment, langfuse_capture_content=None)

    assert settings.is_production is is_production
    assert settings.capture_patient_text is capture


@pytest.mark.parametrize(
    ("environment", "enabled"),
    [
        (Environment.DEVELOPMENT, False),
        (Environment.STAGING, False),
        (Environment.PRODUCTION, True),
    ],
)
def test_turnstile_runs_in_production_only(
    environment: Environment, enabled: bool, monkeypatch: pytest.MonkeyPatch
) -> None:
    settings = Settings(environment=environment, turnstile_secret_key="secret")
    monkeypatch.setattr(dependencies, "get_settings", lambda: settings)
    dependencies.get_turnstile_service.cache_clear()

    try:
        assert dependencies.get_turnstile_service().enabled is enabled
    finally:
        dependencies.get_turnstile_service.cache_clear()


def test_turnstile_stays_off_without_a_secret(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    settings = Settings(environment=Environment.PRODUCTION, turnstile_secret_key="")
    monkeypatch.setattr(dependencies, "get_settings", lambda: settings)
    dependencies.get_turnstile_service.cache_clear()

    try:
        assert dependencies.get_turnstile_service().enabled is False
    finally:
        dependencies.get_turnstile_service.cache_clear()


def test_explicit_capture_flag_outranks_the_environment() -> None:
    staging = Settings(environment=Environment.STAGING, langfuse_capture_content=False)
    production = Settings(
        environment=Environment.PRODUCTION, langfuse_capture_content=True
    )

    assert staging.capture_patient_text is False
    assert production.capture_patient_text is True
