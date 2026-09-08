"""Machine translation through a translate-only LLM agent."""

from __future__ import annotations

import asyncio

from pydantic_ai import Agent, UnexpectedModelBehavior
from pydantic_ai.settings import ModelSettings

from agents.translation.agent import get_translation_agent
from agents.translation.dependencies import TranslationDeps
from agents.translation.output import TranslatedLines
from core.langfuse import get_langfuse_client
from core.logger import get_logger
from repository.translation.batching import batches
from schemas.language import Language

logger = get_logger(__name__)

_MAX_REQUEST_CODEPOINTS = 4_000
_MAX_REQUEST_SEGMENTS = 40

# Distinct from the agent's own auto-instrumented spans and from "chat-turn".
_SPAN_NAME = "llm-translation"
_BATCH_SPAN_NAME = "llm-translation-batch"


def _numbered(texts: list[str]) -> str:
    return "\n".join(f"{i}. {text}" for i, text in enumerate(texts, start=1))


class LLMTranslationProvider:
    """Translates by running the translation agent over numbered lines."""

    def __init__(
        self,
        *,
        timeout: float,
        concurrency: int,
        fallback_max_lines: int,
        agent: Agent[TranslationDeps, TranslatedLines] | None = None,
    ) -> None:
        self._model_settings = ModelSettings(timeout=timeout)
        self._semaphore = asyncio.Semaphore(concurrency)
        self._fallback_max_lines = fallback_max_lines
        self._agent = agent or get_translation_agent()
        self._langfuse = get_langfuse_client()

    async def _run(self, batch: list[str], target: Language) -> list[str]:
        async with self._semaphore:
            result = await self._agent.run(
                _numbered(batch),
                deps=TranslationDeps(target=target, line_count=len(batch)),
                model_settings=self._model_settings,
            )
        return result.output.lines

    async def _translate_batch(self, batch: list[str], target: Language) -> list[str]:
        metadata: dict[str, object] = {
            "language": target.value,
            "lines": len(batch),
            "codepoints": sum(len(text) for text in batch),
        }
        with self._langfuse.start_as_current_observation(
            name=_BATCH_SPAN_NAME, as_type="span", input=batch
        ) as span:
            try:
                lines = await self._run(batch, target)
                span.update(output=lines, metadata=metadata)
                return lines
            except UnexpectedModelBehavior:
                if len(batch) == 1 or len(batch) > self._fallback_max_lines:
                    span.update(
                        level="ERROR",
                        status_message="lost line alignment",
                        metadata=metadata,
                    )
                    raise
                logger.warning(
                    "Translation lost line alignment on a %d-line batch (%s); "
                    "retrying line by line",
                    len(batch),
                    target,
                )
                span.update(
                    level="WARNING",
                    status_message="lost line alignment, retried line by line",
                    metadata={**metadata, "fallback": "per_line"},
                )
                rescued = await asyncio.gather(
                    *(self._run([text], target) for text in batch)
                )
                return [line for lines in rescued for line in lines]

    async def translate(self, texts: list[str], target: Language) -> list[str]:
        if not texts:
            return []
        chunks = list(
            batches(
                texts,
                max_codepoints=_MAX_REQUEST_CODEPOINTS,
                max_segments=_MAX_REQUEST_SEGMENTS,
            )
        )
        with self._langfuse.start_as_current_observation(
            name=_SPAN_NAME, as_type="span", input=texts
        ) as span:
            results = await asyncio.gather(
                *(self._translate_batch(chunk, target) for chunk in chunks)
            )
            translated = [line for batch in results for line in batch]
            span.update(
                output=translated,
                metadata={
                    "language": target.value,
                    "lines": len(texts),
                    "batches": len(chunks),
                },
            )
        if len(translated) != len(texts):
            raise ValueError(
                f"Translation returned {len(translated)} results "
                f"for {len(texts)} inputs"
            )
        return translated

    async def aclose(self) -> None:
        # The model's HTTP client is the shared retrying client, owned elsewhere.
        return None
