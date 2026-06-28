from langfuse.api import DatasetItem

from evals.dataset.mapping import from_langfuse_item, to_langfuse_item
from evals.schemas.sample import EvalSample
from tests.factories import make_eval_sample


def test_eval_sample_json_round_trips() -> None:
    sample = make_eval_sample()
    assert EvalSample.model_validate(sample.model_dump()) == sample


def test_eval_sample_langfuse_item_round_trips() -> None:
    sample = make_eval_sample()
    payload = to_langfuse_item(sample)
    item = DatasetItem.model_construct(
        input=payload["input"], expected_output=payload["expected_output"]
    )
    assert from_langfuse_item(item) == sample
