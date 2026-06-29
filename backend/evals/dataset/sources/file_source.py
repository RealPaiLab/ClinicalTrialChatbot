from __future__ import annotations

from pathlib import Path
from typing import Any

import yaml

from evals.schemas.sample import EvalSample


class FileDatasetSource:
    """Loads samples from a local YAML file (tests / offline / CI smoke)."""

    def __init__(self, path: Path) -> None:
        self._path = path

    def load(self) -> list[EvalSample]:
        raw: Any = yaml.safe_load(self._path.read_text()) or []
        return [EvalSample.model_validate(item) for item in raw]
