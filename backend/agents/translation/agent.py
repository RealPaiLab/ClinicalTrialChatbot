"""Translation agent factory."""

from __future__ import annotations

from functools import lru_cache

from pydantic_ai import Agent, ModelRetry, RunContext

from agents.translation.dependencies import TranslationDeps
from agents.translation.output import TranslatedLines
from agents.translation.prompts import get_translation_prompt
from core.config import get_settings
from core.llm import get_llm


@lru_cache
def get_translation_agent() -> Agent[TranslationDeps, TranslatedLines]:
    """Build the cached translate-only agent (no tools)."""
    settings = get_settings()
    agent = Agent(
        get_llm(model=settings.translation_llm_model or settings.llm_model),
        deps_type=TranslationDeps,
        output_type=TranslatedLines,
        retries={"output": settings.translation_llm_retries},
    )

    @agent.instructions
    def _system_prompt(ctx: RunContext[TranslationDeps]) -> str:
        return get_translation_prompt()

    @agent.instructions
    def _target_language(ctx: RunContext[TranslationDeps]) -> str:
        return (
            f"Target language: {ctx.deps.target.display_name}.\n"
            f"Return exactly {ctx.deps.line_count} lines."
        )

    @agent.output_validator
    def _line_count(
        ctx: RunContext[TranslationDeps], output: TranslatedLines
    ) -> TranslatedLines:
        if len(output.lines) != ctx.deps.line_count:
            raise ModelRetry(
                f"You returned {len(output.lines)} lines for "
                f"{ctx.deps.line_count} input lines. Translate each numbered "
                f"line into exactly one output line, in the same order."
            )
        return output

    return agent
