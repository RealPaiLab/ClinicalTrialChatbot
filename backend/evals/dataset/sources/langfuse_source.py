from __future__ import annotations

from langfuse import get_client

from evals.dataset.mapping import from_langfuse_item
from evals.schemas.sample import EvalSample


class LangfuseDatasetSource:
    """Loads samples from a Langfuse dataset (the runtime source of truth)."""

    def __init__(self, dataset_name: str) -> None:
        self._dataset_name = dataset_name

    def load(self) -> list[EvalSample]:
        dataset = get_client().get_dataset(self._dataset_name)
        return [from_langfuse_item(item) for item in dataset.items]
