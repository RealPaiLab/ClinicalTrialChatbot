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
from pathlib import Path

import yaml
from dotenv import load_dotenv
from rich.console import Console

from scripts.pipeline import orchestrator
from scripts.pipeline.config import STAGE_ORDER, PipelineConfig
from scripts.pipeline.envsubst import expand

DEFAULT_CONFIG = Path(__file__).resolve().parent / "pipelines.yaml"
console = Console()


def _document(path: Path) -> dict[str, object]:
    if not path.exists():
        raise SystemExit(f"no pipeline config at {path}")
    raw = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    return raw if isinstance(raw, dict) else {}


def _load(path: Path, name: str) -> PipelineConfig:
    """The YAML is the registry: a top-level key is a pipeline."""
    document = _document(path)
    if name not in document:
        known = ", ".join(sorted(document)) or "none"
        raise SystemExit(f"no {name!r} entry in {path} (found: {known})")
    return PipelineConfig.model_validate(expand(document[name]) or {})


def _list(path: Path) -> None:
    """Reads the raw blocks: listing what exists must not need a pipeline's env vars."""
    for name, block in sorted(_document(path).items()):
        declared = block.get("stages") if isinstance(block, dict) else None
        stages = declared if isinstance(declared, list) else list(STAGE_ORDER)
        console.print(f"[bold]{name}[/bold]  stages: {', '.join(stages)}")


def main() -> None:
    load_dotenv()

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
        _list(args.config)
        return
    if args.pipeline is None:
        parser.error("name a pipeline, or pass --list")

    if args.rollback:
        try:
            config = _load(args.config, args.pipeline)
            restored = asyncio.run(orchestrator.undo(args.pipeline, config))
        except RuntimeError as error:
            raise SystemExit(f"[{args.pipeline}] {error}") from error
        console.print(f"restored [bold]{restored}[/bold]")
        return

    try:
        config = _load(args.config, args.pipeline)
        asyncio.run(orchestrator.run(args.pipeline, config, args.stages))
    except (RuntimeError, ValueError) as error:
        raise SystemExit(f"[{args.pipeline}] {error}") from error


if __name__ == "__main__":
    main()
