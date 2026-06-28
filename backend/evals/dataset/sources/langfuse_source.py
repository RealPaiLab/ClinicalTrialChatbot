from __future__ import annotations

from evals.schemas.sample import EvalSample


class LangfuseDatasetSource:
    """Loads samples from a Langfuse dataset."""

    def __init__(self, dataset_name: str) -> None:
        self._dataset_name = dataset_name

    def load(self) -> list[EvalSample]:
        raise NotImplementedError
