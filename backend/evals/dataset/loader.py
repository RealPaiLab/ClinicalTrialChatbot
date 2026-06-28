from __future__ import annotations

from evals.dataset.sources.base import DatasetSource
from evals.schemas.sample import EvalSample


def load_samples(source: DatasetSource) -> list[EvalSample]:
    """Load and validate samples from the given source."""
    raise NotImplementedError
