from __future__ import annotations

from langfuse.api import DatasetItem

from evals.schemas.sample import EvalSample


def to_langfuse_item(sample: EvalSample) -> dict[str, object]:
    """Serialize a sample to create_dataset_item kwargs (input/expected/metadata)."""
    raise NotImplementedError


def from_langfuse_item(item: DatasetItem) -> EvalSample:
    raise NotImplementedError
