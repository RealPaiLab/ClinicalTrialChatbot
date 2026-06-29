from langfuse.api import DatasetItem

from evals.task.run_agent import build_task
from tests.factories import StubGlossary, StubTrialSearch, make_citation


async def test_run_agent_on_item_populates_output() -> None:
    task = build_task(
        trial_search=StubTrialSearch(results=[make_citation("NCT01234567")]),
        glossary=StubGlossary(),
    )
    item = DatasetItem.model_construct(
        input=[{"role": "user", "content": "breast cancer trials in Quebec"}]
    )

    output = await task(item=item)

    assert isinstance(output.answer, str)
    assert "NCT01234567" in output.retrieved_ncts
    assert output.tool_calls
    assert "syntactic_search" in output.trajectory


async def test_run_agent_on_item_replays_multi_turn() -> None:
    task = build_task(
        trial_search=StubTrialSearch(results=[make_citation("NCT01234567")]),
        glossary=StubGlossary(),
    )
    item = DatasetItem.model_construct(
        input=[
            {"role": "user", "content": "breast cancer trials in Ontario"},
            {"role": "assistant", "content": "Here are a few."},
            {"role": "user", "content": "Tell me more about the first one."},
        ]
    )

    output = await task(item=item)

    assert isinstance(output.answer, str)
