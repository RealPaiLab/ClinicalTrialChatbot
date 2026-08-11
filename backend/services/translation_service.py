"""Resolves a trial's free text into a target language."""

from __future__ import annotations

from collections.abc import Callable
from typing import Protocol

from core.logger import get_logger
from repository.translation.base import TranslationProvider
from repository.translation.cache import TranslationCache
from schemas.language import Language
from schemas.translation import TranslationSource, TrialTranslation
from schemas.trial import TrialCitation
from utils.markdown import rebuild, translatable_lines

logger = get_logger(__name__)

# The narrative fields, named without their language suffix.
_TEXT_FIELDS = (
    "short_title",
    "official_title",
    "description",
    "inclusion_criteria",
    "exclusion_criteria",
)


class TrialLookup(Protocol):
    """Reads trials by NCT number (the trial-search service satisfies this)."""

    async def get_by_ncts(self, nct_numbers: list[str]) -> list[TrialCitation]: ...


def _clean(value: str | None) -> str | None:
    return value.strip() if value and value.strip() else None


def _english(trial: TrialCitation) -> dict[str, str | None]:
    return {name: _clean(getattr(trial, f"{name}_en")) for name in _TEXT_FIELDS}


def _vocabulary(trial: TrialCitation) -> tuple[list[str], list[str]]:
    cancer_types = sorted(
        {name for site in trial.sites for name in (site.cancer_type_names or [])}
    )
    return cancer_types, sorted(set(trial.treatment_type_names or []))


class TranslationService:
    """Serves trial text in a target language.

    Only trial text read from our own database is ever handed to the provider.
    Nothing a patient typed reaches it: this service takes an NCT number, never a
    user-supplied string.
    """

    def __init__(
        self,
        trials: TrialLookup,
        *,
        provider_factory: Callable[[], TranslationProvider],
        cache: TranslationCache,
    ) -> None:
        self._trials = trials
        self._provider_factory = provider_factory
        self._cache = cache

    async def _get_trial(self, nct_number: str) -> TrialCitation | None:
        found = await self._trials.get_by_ncts([nct_number])
        return found[0] if found else None

    async def _translate(self, texts: list[str], target: Language) -> dict[str, str]:
        """Translate the given source strings, using and filling the cache."""
        wanted = list(dict.fromkeys(t for t in texts if t))
        if not wanted:
            return {}
        cached = await self._cache.get_many(wanted, target)
        missing = [t for t in wanted if t not in cached]
        if not missing:
            return cached
        provider = self._provider_factory()
        fresh = dict(
            zip(missing, await provider.translate(missing, target), strict=True)
        )
        await self._cache.set_many(fresh, target)
        return {**cached, **fresh}

    async def translate_trial(
        self, nct_number: str, target: Language
    ) -> TrialTranslation | None:
        """Return the trial rendered in ``target``, or None if the trial is unknown."""
        trial = await self._get_trial(nct_number)
        if trial is None:
            return None

        english = _english(trial)
        cancer_types, treatment_types = _vocabulary(trial)

        if target is Language.EN:
            return TrialTranslation(
                nct_number=nct_number,
                language=target,
                source=TranslationSource.OFFICIAL,
                cancer_type_names={name: name for name in cancer_types},
                treatment_type_names={name: name for name in treatment_types},
                **english,
            )

        needs_machine: dict[str, str] = {
            name: text for name, text in english.items() if text
        }

        lines = [
            line for text in needs_machine.values() for line in translatable_lines(text)
        ]
        try:
            narrative = await self._translate(lines, target)
        except Exception as exc:
            logger.warning(
                "Translation provider failed for %s -> %s: %s", nct_number, target, exc
            )
            return TrialTranslation(
                nct_number=nct_number,
                language=target,
                source=TranslationSource.UNAVAILABLE,
                cancer_type_names={name: name for name in cancer_types},
                treatment_type_names={name: name for name in treatment_types},
                **english,
            )

        # Vocabulary is best-effort: losing it must not discard the translated
        # narrative, so it is translated separately and falls back to English.
        try:
            vocabulary = await self._translate(
                [*cancer_types, *treatment_types], target
            )
        except Exception as exc:
            logger.warning("Vocabulary translation failed for %s: %s", target, exc)
            vocabulary = {}

        machine = {
            name: rebuild(text, narrative) for name, text in needs_machine.items()
        }
        resolved = {name: machine.get(name) or text for name, text in english.items()}

        return TrialTranslation(
            nct_number=nct_number,
            language=target,
            source=TranslationSource.MACHINE,
            cancer_type_names={
                name: vocabulary.get(name, name) for name in cancer_types
            },
            treatment_type_names={
                name: vocabulary.get(name, name) for name in treatment_types
            },
            **resolved,
        )
