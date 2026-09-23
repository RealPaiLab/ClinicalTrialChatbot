"""Paths for the dated dumps in `scripts/data`, one directory per pipeline."""

from __future__ import annotations

from datetime import date
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parents[1] / "data"

TRIALS_PREFIX = "trials-"
CANONICAL_PREFIX = "canonical-"
JSON_SUFFIX = ".json"


def _dated(pipeline: str, prefix: str, day: date | None) -> Path:
    stamp = (day or date.today()).isoformat()
    return DATA_DIR / pipeline / f"{prefix}{stamp}{JSON_SUFFIX}"


def _latest(pipeline: str, prefix: str) -> Path | None:
    dumps = sorted((DATA_DIR / pipeline).glob(f"{prefix}*{JSON_SUFFIX}"))
    return dumps[-1] if dumps else None


def dated_trials_path(pipeline: str, day: date | None = None) -> Path:
    """Where today's raw source payload goes."""
    return _dated(pipeline, TRIALS_PREFIX, day)


def latest_trials_path(pipeline: str) -> Path | None:
    return _latest(pipeline, TRIALS_PREFIX)


def dated_canonical_path(pipeline: str, day: date | None = None) -> Path:
    """Where today's canonical records go."""
    return _dated(pipeline, CANONICAL_PREFIX, day)


def latest_canonical_path(pipeline: str) -> Path | None:
    return _latest(pipeline, CANONICAL_PREFIX)
