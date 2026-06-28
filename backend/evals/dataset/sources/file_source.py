from __future__ import annotations

from pathlib import Path

from evals.schemas.sample import EvalSample


class FileDatasetSource:
    """Loads samples from a local YAML file."""

    def __init__(self, path: Path) -> None:
        self._path = path

    def load(self) -> list[EvalSample]:
        raise NotImplementedError
