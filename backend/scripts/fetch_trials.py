"""Fetch all Canadian clinical trials from the Cancer Trials Canada API."""

from __future__ import annotations

import argparse
import asyncio
import json
from pathlib import Path

import httpx
from rich.console import Console
from rich.progress import (
    BarColumn,
    MofNCompleteColumn,
    Progress,
    TaskID,
    TextColumn,
    TimeElapsedColumn,
)
from rich.table import Table

BASE_URL = "https://api.oncoquebec.com/api/studies"
DEFAULT_OUTPUT = Path(__file__).parent / "data" / "trials.json"
DEFAULT_PAGE_SIZE = 100
CONCURRENCY = 5

console = Console()


async def fetch_count(client: httpx.AsyncClient) -> int:
    r = await client.get(f"{BASE_URL}/database/count", params={"searchScope": "CA"})
    r.raise_for_status()
    return int(r.json()["totalCount"])


async def fetch_page(
    client: httpx.AsyncClient,
    sem: asyncio.Semaphore,
    page: int,
    page_size: int,
    progress: Progress,
    task_id: TaskID,
) -> list[dict]:  # type: ignore[type-arg]
    async with sem:
        r = await client.get(
            f"{BASE_URL}/database/search",
            params={"searchScope": "CA", "limit": page_size, "page": page},
        )
        r.raise_for_status()
        trials: list[dict] = r.json().get("studies") or []  # type: ignore[type-arg]
        progress.advance(task_id)
        return trials


async def fetch_all(page_size: int) -> list[dict]:  # type: ignore[type-arg]
    async with httpx.AsyncClient(timeout=30) as client:
        total = await fetch_count(client)
        console.print(f"Total trials reported by API: [bold]{total}[/bold]")

        pages = (total + page_size - 1) // page_size
        sem = asyncio.Semaphore(CONCURRENCY)

        with Progress(
            TextColumn("[progress.description]{task.description}"),
            BarColumn(),
            MofNCompleteColumn(),
            TimeElapsedColumn(),
            console=console,
        ) as progress:
            task_id = progress.add_task("Fetching pages", total=pages)
            results = await asyncio.gather(
                *[
                    fetch_page(client, sem, page, page_size, progress, task_id)
                    for page in range(pages)
                ]
            )

    seen: set[str] = set()
    trials: list[dict] = []  # type: ignore[type-arg]
    for page_trials in results:
        for trial in page_trials:
            tid: str = trial["id"]
            if tid not in seen:
                seen.add(tid)
                trials.append(trial)

    return trials


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Fetch clinical trials from Cancer Trials Canada."
    )
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT, metavar="FILE")
    parser.add_argument("--page-size", type=int, default=DEFAULT_PAGE_SIZE, metavar="N")
    args = parser.parse_args()

    output: Path = args.output
    output.parent.mkdir(parents=True, exist_ok=True)

    trials = asyncio.run(fetch_all(args.page_size))

    with output.open("w", encoding="utf-8") as f:
        json.dump(trials, f, ensure_ascii=False, indent=2)

    table = Table(title="Done", show_header=False, box=None)
    table.add_row("Saved to", str(output))
    table.add_row("Total fetched", str(len(trials)))
    console.print(table)


if __name__ == "__main__":
    main()
