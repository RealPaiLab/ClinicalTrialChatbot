"""Read a source and write both what it served and what we made of it."""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

from scripts.ctc.canonical import CanonicalTrial
from scripts.ctc.paths import dated_canonical_path, dated_trials_path
from scripts.ctc.sources.base import TrialSource


@dataclass(frozen=True, slots=True)
class IngestResult:
    trials: int
    raw_path: Path | None
    canonical_path: Path


def _write(path: Path, payload: object) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    return path


async def ingest(source: TrialSource) -> tuple[list[CanonicalTrial], IngestResult]:
    records = await source.load()

    raw_path = _write(dated_trials_path(), records.raw) if records.raw else None
    canonical_path = _write(
        dated_canonical_path(),
        [trial.model_dump(mode="json") for trial in records.trials],
    )

    return records.trials, IngestResult(
        trials=len(records.trials),
        raw_path=raw_path,
        canonical_path=canonical_path,
    )


def load_canonical(path: Path) -> list[CanonicalTrial]:
    """Re-read an earlier ingest, so later stages can run on their own."""
    payload = json.loads(path.read_text(encoding="utf-8"))
    return [CanonicalTrial.model_validate(entry) for entry in payload]
