import pytest
from pydantic_ai import UnexpectedModelBehavior

from agents.translation.agent import get_translation_agent
from repository.translation.llm_provider import LLMTranslationProvider, _numbered
from schemas.language import Language
from tests.factories import (
    make_echo_translation_model,
    make_fixed_line_model,
    make_test_model,
)


def make_provider(*, fallback_max_lines: int = 20) -> LLMTranslationProvider:
    return LLMTranslationProvider(
        timeout=5.0, concurrency=2, fallback_max_lines=fallback_max_lines
    )


async def test_no_texts_never_reaches_the_model() -> None:
    assert await make_provider().translate([], Language.ES) == []


async def test_returns_one_translation_per_line_in_order() -> None:
    agent = get_translation_agent()
    model = make_test_model(output={"lines": ["hola", "adios"]})
    with agent.override(model=model):
        result = await make_provider().translate(["hello", "goodbye"], Language.ES)

    assert result == ["hola", "adios"]


async def test_batch_that_loses_alignment_falls_back_to_one_line_per_run() -> None:
    """A merged or dropped line would silently shift every later translation, so
    the batch is re-run one line at a time, where the count cannot be wrong."""
    agent = get_translation_agent()
    with agent.override(model=make_fixed_line_model(1)):
        result = await make_provider().translate(["hello", "goodbye"], Language.ES)

    assert result == ["line 0", "line 0"]


async def test_batch_above_the_fallback_cap_is_not_rescued_line_by_line() -> None:
    """Rescuing a large batch costs one call per line; past the cap the caller
    serves English instead."""
    agent = get_translation_agent()
    with (
        agent.override(model=make_fixed_line_model(1)),
        pytest.raises(UnexpectedModelBehavior),
    ):
        await make_provider(fallback_max_lines=2).translate(
            ["a", "b", "c"], Language.ES
        )


async def test_single_line_that_still_misaligns_raises() -> None:
    agent = get_translation_agent()
    with (
        agent.override(model=make_fixed_line_model(2)),
        pytest.raises(UnexpectedModelBehavior),
    ):
        await make_provider().translate(["hello"], Language.ES)


async def test_concurrent_batches_keep_the_input_order() -> None:
    """Batches are gathered, not awaited in turn, so their results must still be
    reassembled in the order the caller passed them."""
    texts = [f"{i} " + "x" * 2_000 for i in range(6)]
    agent = get_translation_agent()
    with agent.override(model=make_echo_translation_model()):
        result = await make_provider().translate(texts, Language.ES)

    assert result == [f"xx:{text}" for text in texts]


def test_lines_are_numbered_for_alignment() -> None:
    assert _numbered(["first", "second"]) == "1. first\n2. second"
