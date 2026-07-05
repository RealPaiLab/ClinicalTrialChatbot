from __future__ import annotations

from langfuse.api import DatasetItem
from pydantic import JsonValue

from evals.schemas.sample import EvalSample


def to_langfuse_item(sample: EvalSample) -> dict[str, JsonValue]:
    """Serialize a sample to create_dataset_item kwargs (input + expected_output)."""
    return {
        "input": [turn.model_dump() for turn in sample.input],
        "expected_output": sample.expected.model_dump(),
    }


def from_langfuse_item(item: DatasetItem) -> EvalSample:
    """Rebuild a typed EvalSample from a Langfuse dataset item."""
    return EvalSample.model_validate(
        {"input": item.input, "expected": item.expected_output}
    )
