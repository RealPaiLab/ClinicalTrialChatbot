"""Run a data pipeline named in `pipelines.yaml`.

The YAML holds every setting; the CLI only chooses what to run.

    uv run python -m scripts.run ctc                  # every stage, in order
    uv run python -m scripts.run ctc --stage diff     # one stage, repeatable
    uv run python -m scripts.run ctc --rollback       # undo the last publish
    uv run python -m scripts.run --list
"""

from __future__ import annotations

import argparse
import asyncio
from collections.abc import Callable, Coroutine
from dataclasses import dataclass
from pathlib import Path
from typing import Any, cast

import yaml
from rich.console import Console

from scripts.ctc import orchestrator
from scripts.ctc.config import CtcConfig
from scripts.ctc.envsubst import expand
from scripts.ctc.stages.publish import undo

DEFAULT_CONFIG = Path(__file__).resolve().parent / "pipelines.yaml"
console = Console()


ConfigParser = Callable[[object], object]
PipelineRunner = Callable[[object, list[str] | None], Coroutine[Any, Any, None]]
Rollback = Callable[[], Coroutine[Any, Any, str]]


@dataclass(frozen=True, slots=True)
class Pipeline:
    """A registry entry: how to parse its block and how to run it."""

    parse: ConfigParser
    run: PipelineRunner
    rollback: Rollback
    stages: tuple[str, ...]


PIPELINES: dict[str, Pipeline] = {
    "ctc": Pipeline(
        parse=cast(ConfigParser, CtcConfig.model_validate),
        run=cast(PipelineRunner, orchestrator.run),
        rollback=cast(Rollback, undo),
        stages=tuple(orchestrator.STAGES),
    ),
}


def _load(path: Path, name: str) -> object:
    if not path.exists():
        raise SystemExit(f"no pipeline config at {path}")
    raw = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    document: dict[str, object] = raw if isinstance(raw, dict) else {}
    if name not in document:
        known = ", ".join(sorted(document)) or "none"
        raise SystemExit(f"no {name!r} entry in {path} (found: {known})")
    return PIPELINES[name].parse(expand(document[name]) or {})


def _list() -> None:
    for name, pipeline in PIPELINES.items():
        console.print(f"[bold]{name}[/bold]  stages: {', '.join(pipeline.stages)}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("pipeline", nargs="?", help="registry entry to run")
    parser.add_argument(
        "--stage",
        action="append",
        dest="stages",
        metavar="NAME",
        help="run only this stage (repeatable); defaults to the configured order",
    )
    parser.add_argument(
        "--rollback",
        action="store_true",
        help="restore the newest published generation instead of running stages",
    )
    parser.add_argument("--config", type=Path, default=DEFAULT_CONFIG, metavar="FILE")
    parser.add_argument("--list", action="store_true", help="list the pipelines")
    args = parser.parse_args()

    if args.list:
        _list()
        return
    if args.pipeline is None:
        parser.error("name a pipeline, or pass --list")
    if args.pipeline not in PIPELINES:
        parser.error(
            f"unknown pipeline {args.pipeline!r} (known: {', '.join(PIPELINES)})"
        )

    pipeline = PIPELINES[args.pipeline]
    if args.rollback:
        try:
            restored = asyncio.run(pipeline.rollback())
        except RuntimeError as error:
            raise SystemExit(f"[{args.pipeline}] {error}") from error
        console.print(f"restored [bold]{restored}[/bold]")
        return

    config = _load(args.config, args.pipeline)
    try:
        asyncio.run(pipeline.run(config, args.stages))
    except (RuntimeError, ValueError) as error:
        raise SystemExit(f"[{args.pipeline}] {error}") from error


if __name__ == "__main__":
    main()
