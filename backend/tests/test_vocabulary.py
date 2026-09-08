from typing import Any, cast
from unittest.mock import AsyncMock

import pytest
from pydantic import ValidationError
from pydantic_ai.tools import ToolDefinition
from sqlalchemy.dialects import postgresql

from agents.clinical_trials.dependencies import AgentDeps
from agents.clinical_trials.guards import inject_vocabulary
from agents.clinical_trials.tool_schemas import (
    SemanticSearchInput,
    SyntacticSearchInput,
)
from models.trial import Trial
from repository.vocabulary_repository import _distinct_values
from schemas.vocabulary import (
    VocabField,
    Vocabulary,
    current_vocabulary,
    set_vocabulary,
)
from services.vocabulary_service import VocabularyService
from tests.factories import FakeSessionFactory, StubTrialSearch, make_run_context

LOADED = Vocabulary(
    values={
        VocabField.CANCER_TYPE: ("Breast Cancer", "Lung Cancer"),
        VocabField.TREATMENT_TYPE: ("Immunotherapy",),
        VocabField.DISEASE_STAGE: ("Metastatic",),
    }
)


@pytest.fixture(autouse=True)
def restore_vocabulary() -> Any:
    previous = current_vocabulary()
    yield
    set_vocabulary(previous)


def _ctx() -> Any:
    return make_run_context(AgentDeps(trial_search=StubTrialSearch()))


def _tool_definition() -> ToolDefinition:
    return ToolDefinition(
        name="syntactic_search",
        parameters_json_schema=SyntacticSearchInput.model_json_schema(),
    )


def _items(tool: ToolDefinition, name: str) -> dict[str, Any]:
    items: dict[str, Any] = tool.parameters_json_schema["properties"][name]["items"]
    return items


async def test_empty_vocabulary_leaves_the_tool_unconstrained() -> None:
    set_vocabulary(Vocabulary())
    [prepared] = await inject_vocabulary(_ctx(), [_tool_definition()])

    assert "enum" not in _items(prepared, "cancer_types")
    assert SyntacticSearchInput(reasoning="r", cancer_types=["anything"])


async def test_loaded_vocabulary_reaches_every_backed_argument() -> None:
    set_vocabulary(LOADED)
    [prepared] = await inject_vocabulary(_ctx(), [_tool_definition()])

    assert _items(prepared, "cancer_types")["enum"] == ["Breast Cancer", "Lung Cancer"]
    assert _items(prepared, "treatment_types")["enum"] == ["Immunotherapy"]
    assert _items(prepared, "disease_stages")["enum"] == ["Metastatic"]


async def test_injection_does_not_mutate_the_original_definition() -> None:
    set_vocabulary(LOADED)
    original = _tool_definition()
    await inject_vocabulary(_ctx(), [original])

    assert "enum" not in _items(original, "cancer_types")


def test_off_vocabulary_value_is_rejected() -> None:
    set_vocabulary(LOADED)
    with pytest.raises(ValidationError):
        SemanticSearchInput(reasoning="r", query="q", disease_stages=["Stage IV"])

    assert SemanticSearchInput(reasoning="r", query="q", disease_stages=["Metastatic"])


async def test_refresh_publishes_the_loaded_values() -> None:
    set_vocabulary(Vocabulary())
    service = VocabularyService(cast(Any, FakeSessionFactory(["Lung Cancer"])))

    await service.refresh()

    assert current_vocabulary().allowed(VocabField.CANCER_TYPE) == ("Lung Cancer",)


async def test_refresh_is_a_no_op_while_the_ttl_is_warm() -> None:
    factory = FakeSessionFactory(["Lung Cancer"])
    service = VocabularyService(cast(Any, factory))

    await service.refresh()
    await service.refresh()

    assert factory.session.execute.await_count == len(VocabField)


async def test_a_failed_refresh_keeps_the_previous_vocabulary() -> None:
    set_vocabulary(LOADED)
    factory = FakeSessionFactory()
    factory.session.execute = AsyncMock(side_effect=RuntimeError("db down"))

    assert await VocabularyService(cast(Any, factory)).refresh() == LOADED
    assert current_vocabulary() == LOADED


def test_unnest_stays_out_of_the_where_clause() -> None:
    """Postgres rejects a set-returning function in WHERE, so it needs a subquery."""
    statement = _distinct_values(Trial.disease_stages)
    sql = str(statement.compile(dialect=postgresql.dialect())).lower()  # type: ignore[no-untyped-call]

    assert "unnest" not in sql.split("where", 1)[1]
