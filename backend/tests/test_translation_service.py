from typing import Any, cast

import pytest

from repository.translation.batching import batches
from repository.translation.cache import TranslationCache, _key
from repository.translation.google_provider import (
    _MAX_REQUEST_CODEPOINTS,
    _MAX_REQUEST_SEGMENTS,
)
from schemas.language import Language
from schemas.translation import TranslationSource
from schemas.trial import TrialCitation
from services.translation_service import TranslationService
from tests.factories import (
    FakeRedis,
    StubTranslationProvider,
    StubTrialSearch,
    make_citation,
)


def build_service(
    trial: TrialCitation | None,
    *,
    provider: StubTranslationProvider | None = None,
    redis: FakeRedis | None = None,
) -> tuple[TranslationService, StubTranslationProvider, FakeRedis]:
    stub = provider or StubTranslationProvider()
    fake_redis = redis or FakeRedis()
    trials = StubTrialSearch(
        by_nct={trial.nct_number: trial} if trial and trial.nct_number else {}
    )
    service = TranslationService(
        trials,
        provider_factory=lambda: cast(Any, stub),
        cache=TranslationCache(cast(Any, fake_redis), ttl_seconds=60),
    )
    return service, stub, fake_redis


@pytest.mark.asyncio
async def test_unknown_trial_returns_none() -> None:
    service, _, _ = build_service(None)
    assert await service.translate_trial("NCT-missing", Language.FR_CA) is None


@pytest.mark.asyncio
async def test_english_returns_stored_text_without_provider() -> None:
    service, provider, _ = build_service(make_citation("NCT-1"))
    result = await service.translate_trial("NCT-1", Language.EN)
    assert result is not None
    assert result.short_title == "A trial"
    assert result.source is TranslationSource.OFFICIAL
    assert provider.batches == []


@pytest.mark.asyncio
async def test_french_goes_through_the_provider_like_any_other_language() -> None:
    """The seeded ``*_fr`` columns are not a source: every target is machine
    translated, and the citation the service reads does not even carry them."""
    service, provider, _ = build_service(make_citation("NCT-1"))
    result = await service.translate_trial("NCT-1", Language.FR_CA)

    assert result is not None
    assert result.source is TranslationSource.MACHINE
    assert result.short_title == "[fr-CA] A trial"
    assert "A trial" in provider.translated_texts


@pytest.mark.asyncio
async def test_other_language_machine_translates_narrative_and_vocabulary() -> None:
    service, _, _ = build_service(make_citation("NCT-1"))
    result = await service.translate_trial("NCT-1", Language.DE)

    assert result is not None
    assert result.source is TranslationSource.MACHINE
    assert result.short_title == "[de] A trial"
    assert result.cancer_type_names == {"Breast Cancer": "[de] Breast Cancer"}
    assert result.treatment_type_names == {"Immunotherapy": "[de] Immunotherapy"}


@pytest.mark.asyncio
async def test_second_request_is_served_from_cache() -> None:
    redis = FakeRedis()
    service, provider, _ = build_service(make_citation("NCT-1"), redis=redis)
    first = await service.translate_trial("NCT-1", Language.ES)
    calls_after_first = len(provider.batches)

    service2, provider2, _ = build_service(make_citation("NCT-1"), redis=redis)
    second = await service2.translate_trial("NCT-1", Language.ES)

    # Cold: narrative and vocabulary are fetched separately, so two calls.
    # Warm is what matters: the repeat costs nothing.
    assert calls_after_first == 2
    assert provider2.batches == []
    assert second == first


@pytest.mark.asyncio
async def test_cache_is_keyed_per_language() -> None:
    redis = FakeRedis()
    service, _, _ = build_service(make_citation("NCT-1"), redis=redis)
    await service.translate_trial("NCT-1", Language.ES)

    service2, provider2, _ = build_service(make_citation("NCT-1"), redis=redis)
    result = await service2.translate_trial("NCT-1", Language.HI)

    assert result is not None
    assert result.short_title == "[hi] A trial"
    assert provider2.batches, "a new language must not hit the Spanish cache"


@pytest.mark.asyncio
async def test_redis_failure_still_translates() -> None:
    service, provider, _ = build_service(
        make_citation("NCT-1"), redis=FakeRedis(fail=True)
    )
    result = await service.translate_trial("NCT-1", Language.ES)

    assert result is not None
    assert result.source is TranslationSource.MACHINE
    assert result.short_title == "[es] A trial"
    assert provider.batches


@pytest.mark.asyncio
async def test_english_works_when_the_provider_cannot_even_be_built() -> None:
    """An unconfigured provider must not break the path served from the DB."""

    def explode() -> Any:
        raise ValueError("google_project_id is required for the google provider")

    service = TranslationService(
        StubTrialSearch(by_nct={"NCT-1": make_citation("NCT-1")}),
        provider_factory=explode,
        cache=TranslationCache(cast(Any, FakeRedis()), ttl_seconds=60),
    )

    english = await service.translate_trial("NCT-1", Language.EN)
    assert english is not None
    assert english.short_title == "A trial"

    german = await service.translate_trial("NCT-1", Language.DE)
    assert german is not None
    assert german.source is TranslationSource.UNAVAILABLE


@pytest.mark.asyncio
async def test_provider_failure_degrades_to_english() -> None:
    service, _, _ = build_service(
        make_citation("NCT-1"), provider=StubTranslationProvider(fail=True)
    )
    result = await service.translate_trial("NCT-1", Language.ES)

    assert result is not None
    assert result.source is TranslationSource.UNAVAILABLE
    assert result.short_title == "A trial"
    assert result.inclusion_criteria == "Adults with the condition."


@pytest.mark.asyncio
async def test_identical_text_across_trials_shares_one_cache_entry() -> None:
    redis = FakeRedis()
    service, provider, _ = build_service(make_citation("NCT-1"), redis=redis)
    await service.translate_trial("NCT-1", Language.ES)

    service2, provider2, _ = build_service(make_citation("NCT-2"), redis=redis)
    await service2.translate_trial("NCT-2", Language.ES)

    assert provider2.batches == []


def test_cache_key_changes_with_source_text_and_language() -> None:
    assert _key("a", Language.ES) != _key("b", Language.ES)
    assert _key("a", Language.ES) != _key("a", Language.HI)
    assert _key("a", Language.ES) == _key("a", Language.ES)


def _google_batches(texts: list[str]) -> list[list[str]]:
    return list(
        batches(
            texts,
            max_codepoints=_MAX_REQUEST_CODEPOINTS,
            max_segments=_MAX_REQUEST_SEGMENTS,
        )
    )


def test_batches_split_on_the_request_codepoint_budget() -> None:
    texts = ["x" * 20_000, "y" * 20_000, "z"]
    split = _google_batches(texts)
    assert [len(b) for b in split] == [1, 2]
    assert [t for b in split for t in b] == texts


def test_batches_keep_a_single_oversized_text_intact() -> None:
    huge = "x" * 40_000
    assert _google_batches([huge]) == [[huge]]


def test_batches_split_on_the_segment_budget() -> None:
    texts = [str(i) for i in range(_MAX_REQUEST_SEGMENTS + 3)]
    split = _google_batches(texts)
    assert [len(b) for b in split] == [_MAX_REQUEST_SEGMENTS, 3]
