"""Machine-translation provider interface."""

from __future__ import annotations

from typing import Protocol

from schemas.language import Language


class TranslationProvider(Protocol):
    """Translates batches of English text into one target language."""

    async def translate(self, texts: list[str], target: Language) -> list[str]:
        """Return one translation per input, in the same order.

        Raises on provider failure; callers decide how to degrade.
        """
        ...

    async def aclose(self) -> None:
        """Release any transport held by the provider."""
        ...
