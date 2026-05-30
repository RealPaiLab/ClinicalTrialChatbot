"""Fetch all Canadian clinical trials from the Cancer Trials Canada API."""

from __future__ import annotations

import argparse
import json
import time
from pathlib import Path

import httpx
from rich.console import Console
from rich.progress import (
    BarColumn,
    MofNCompleteColumn,
    Progress,
    TextColumn,
    TimeElapsedColumn,
)
from rich.table import Table

BASE_URL = "https://api.oncoquebec.com/api/studies"
DEFAULT_OUTPUT = Path(__file__).parent / "data" / "trials.json"
DEFAULT_PAGE_SIZE = 100
RATE_LIMIT_SLEEP = 0.3

console = Console()


def fetch_cities(client: httpx.Client) -> list[str]:
    r = client.get(f"{BASE_URL}/filter-values", params={"searchScope": "CA"})
    r.raise_for_status()
    return r.json()["cities"]  # type: ignore[no-any-return]


def fetch_province_for_city(client: httpx.Client, city: str) -> str | None:
    r = client.get(
        f"{BASE_URL}/filter-values",
        params={"searchScope": "CA", "cities": city},
    )
    r.raise_for_status()
    provinces: list[str] = r.json().get("provinces") or []
    return provinces[0] if provinces else None


def fetch_trials_for_city(
    client: httpx.Client, city: str, page_size: int
) -> list[dict]:  # type: ignore[type-arg]
    """Fetch all trials for a city across all pages (0-indexed)."""
    trials: list[dict] = []  # type: ignore[type-arg]
    page = 0
    while True:
        r = client.get(
            f"{BASE_URL}/database/search",
            params={
                "searchScope": "CA",
                "cities": city,
                "limit": page_size,
                "page": page,
            },
        )
        r.raise_for_status()
        data = r.json()
        page_trials: list[dict] = data.get("studies") or []  # type: ignore[type-arg]
        trials.extend(page_trials)
        total: int = data.get("totalCount") or 0
        if len(trials) >= total or not page_trials:
            break
        page += 1
        time.sleep(RATE_LIMIT_SLEEP)
    return trials


def load_existing(output: Path) -> dict[str, dict]:  # type: ignore[type-arg]
    if not output.exists():
        return {}
    with output.open(encoding="utf-8") as f:
        trials: list[dict] = json.load(f)  # type: ignore[type-arg]
    return {t["id"]: t for t in trials}


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Fetch clinical trials from Cancer Trials Canada."
    )
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT, metavar="FILE")
    parser.add_argument("--page-size", type=int, default=DEFAULT_PAGE_SIZE, metavar="N")
    parser.add_argument(
        "--cities",
        type=int,
        default=None,
        metavar="N",
        help="Process only the first N cities (for testing)",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Ignore existing blob and re-fetch everything",
    )
    args = parser.parse_args()

    output: Path = args.output
    output.parent.mkdir(parents=True, exist_ok=True)

    existing: dict[str, dict] = {}  # type: ignore[type-arg]
    if not args.force:
        existing = load_existing(output)
        if existing:
            console.print(
                f"[dim]Loaded {len(existing)} existing trials from {output}[/dim]"
            )

    with httpx.Client(timeout=30) as client:
        all_cities = fetch_cities(client)
        cities_to_process = all_cities[: args.cities] if args.cities else all_cities
        console.print(
            f"Processing [bold]{len(cities_to_process)}[/bold] of"
            f" {len(all_cities)} cities"
        )

        newly_added = 0
        updated = 0

        with Progress(
            TextColumn("[progress.description]{task.description}"),
            BarColumn(),
            MofNCompleteColumn(),
            TimeElapsedColumn(),
            console=console,
        ) as progress:
            task = progress.add_task("Fetching cities", total=len(cities_to_process))

            for city in cities_to_process:
                province = fetch_province_for_city(client, city)
                time.sleep(RATE_LIMIT_SLEEP)

                trials = fetch_trials_for_city(client, city, args.page_size)
                time.sleep(RATE_LIMIT_SLEEP)

                for trial in trials:
                    tid: str = trial["id"]
                    if tid not in existing:
                        trial["cities"] = [city]
                        trial["provinces"] = [province] if province else []
                        existing[tid] = trial
                        newly_added += 1
                    else:
                        changed = False
                        if city not in existing[tid].get("cities", []):
                            existing[tid].setdefault("cities", []).append(city)
                            changed = True
                        if province and province not in existing[tid].get(
                            "provinces", []
                        ):
                            existing[tid].setdefault("provinces", []).append(province)
                            changed = True
                        if changed:
                            updated += 1

                progress.advance(task)

    with output.open("w", encoding="utf-8") as f:
        json.dump(list(existing.values()), f, ensure_ascii=False, indent=2)

    table = Table(title="Done", show_header=False, box=None)
    table.add_row("Saved to", str(output))
    table.add_row("Total in file", str(len(existing)))
    table.add_row("Newly added", str(newly_added))
    table.add_row("City/province appended to existing", str(updated))
    console.print(table)


if __name__ == "__main__":
    main()
