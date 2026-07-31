"""Selects the configured translation provider (process-singleton)."""

from __future__ import annotations

from collections.abc import Callable
from functools import lru_cache

from core.config import Settings, get_settings
from repository.translation.base import TranslationProvider
from repository.translation.google_provider import GoogleTranslationProvider


def _build_google(settings: Settings) -> TranslationProvider:
    if not settings.google_project_id:
        raise ValueError("google_project_id is required for the google provider")
    return GoogleTranslationProvider(
        project_id=settings.google_project_id,
        timeout=settings.translation_request_timeout,
    )


_PROVIDER_BUILDERS: dict[str, Callable[[Settings], TranslationProvider]] = {
    "google": _build_google,
}


@lru_cache
def get_translation_provider() -> TranslationProvider:
    """Build the provider."""
    settings = get_settings()
    try:
        build = _PROVIDER_BUILDERS[settings.translation_provider]
    except KeyError as exc:
        raise ValueError(
            f"Unsupported translation_provider {settings.translation_provider!r}; "
            f"expected one of {sorted(_PROVIDER_BUILDERS)}"
        ) from exc
    return build(settings)
