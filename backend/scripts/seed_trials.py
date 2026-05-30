"""Seed the database with clinical trials."""

from __future__ import annotations

import argparse
import asyncio
import json
import uuid
from pathlib import Path

from rich.console import Console
from rich.progress import (
    BarColumn,
    MofNCompleteColumn,
    Progress,
    TextColumn,
    TimeElapsedColumn,
)
from rich.table import Table
from sqlalchemy.dialects.postgresql import insert as pg_insert

from core.database import AsyncSessionFactory
from models import Location, Trial, TrialSite

DEFAULT_DATA = Path(__file__).parent / "data" / "trials.json"
DEFAULT_BATCH_SIZE = 200

console = Console()


def extract_locations(raw_trials: list[dict]) -> list[dict]:  # type: ignore[type-arg]
    location_map: dict[uuid.UUID, dict] = {}  # type: ignore[type-arg]
    for trial in raw_trials:
        for site in trial.get("sites") or []:
            sid = uuid.UUID(site["id"])
            if sid not in location_map:
                location_map[sid] = {
                    "id": sid,
                    "name_en": site["nameEn"],
                    "name_fr": site.get("nameFr"),
                    "address": site.get("address") or None,
                    "city": None,
                    "province": None,
                    "lat": None,
                    "lon": None,
                }
    return list(location_map.values())


def transform_trial(raw: dict) -> dict:  # type: ignore[type-arg]
    return {
        "id": uuid.UUID(raw["id"]),
        "acronym_or_protocol_id": raw.get("acronymOrProtocolId"),
        "nct_number": raw.get("nctNumber"),
        "short_title_en": raw.get("shortTitleEn"),
        "short_title_fr": raw.get("shortTitleFr"),
        "official_title_en": raw.get("officialTitleEn"),
        "official_title_fr": raw.get("officialTitleFr"),
        "description_en": raw.get("descriptionEn"),
        "description_fr": raw.get("descriptionFr"),
        "inclusion_criteria_en": raw.get("inclusionCriteriaEn"),
        "inclusion_criteria_fr": raw.get("inclusionCriteriaFr"),
        "exclusion_criteria_en": raw.get("exclusionCriteriaEn"),
        "exclusion_criteria_fr": raw.get("exclusionCriteriaFr"),
        "phases": raw.get("phases") or [],
        "treatment_type_names": [
            tt["name"] for tt in (raw.get("treatmentTypes") or [])
        ],
        "intervention_names": [
            iv["nameEn"] for iv in (raw.get("interventions") or []) if iv.get("nameEn")
        ],
        "study_type": (raw.get("type") or {}).get("nameEn"),
        "purpose": (raw.get("purpose") or {}).get("name"),
        "sponsor_name": (raw.get("sponsor") or {}).get("nameEn"),
        "treatment_lines": [
            tl["name"] for tl in (raw.get("treatmentLines") or []) if tl.get("name")
        ],
        "embedding": None,
    }


def build_trial_sites(raw_trials: list[dict]) -> list[dict]:  # type: ignore[type-arg]
    rows: list[dict] = []  # type: ignore[type-arg]
    seen: set[tuple[uuid.UUID, uuid.UUID]] = set()
    for raw in raw_trials:
        trial_id = uuid.UUID(raw["id"])
        for site in raw.get("sites") or []:
            location_id = uuid.UUID(site["id"])
            key = (trial_id, location_id)
            if key not in seen:
                seen.add(key)
                rows.append(
                    {
                        "trial_id": trial_id,
                        "location_id": location_id,
                        "state": site.get("state"),
                        "cancer_type_names": [
                            ct["nameEn"] for ct in (site.get("cancerTypes") or [])
                        ],
                    }
                )
    return rows


async def bulk_insert(
    rows: list[dict],  # type: ignore[type-arg]
    model: type,
    batch_size: int,
    label: str,
) -> int:
    inserted = 0
    with Progress(
        TextColumn(f"[progress.description]Inserting {label}"),
        BarColumn(),
        MofNCompleteColumn(),
        TimeElapsedColumn(),
        console=console,
    ) as progress:
        task = progress.add_task(label, total=len(rows))
        async with AsyncSessionFactory() as session:
            for i in range(0, len(rows), batch_size):
                batch = rows[i : i + batch_size]
                stmt = pg_insert(model).values(batch).on_conflict_do_nothing()
                result = await session.execute(stmt)
                await session.commit()
                inserted += result.rowcount  # type: ignore[attr-defined]
                progress.advance(task, len(batch))
    return inserted


async def seed(data_path: Path, batch_size: int) -> None:
    console.print(f"[dim]Loading {data_path}[/dim]")
    with data_path.open(encoding="utf-8") as f:
        raw_trials: list[dict] = json.load(f)  # type: ignore[type-arg]
    console.print(f"Loaded [bold]{len(raw_trials)}[/bold] trials from JSON")

    location_rows = extract_locations(raw_trials)
    trial_rows = [transform_trial(r) for r in raw_trials]
    trial_site_rows = build_trial_sites(raw_trials)

    locations_inserted = await bulk_insert(
        location_rows, Location, batch_size, "locations"
    )
    trials_inserted = await bulk_insert(trial_rows, Trial, batch_size, "trials")
    sites_inserted = await bulk_insert(
        trial_site_rows, TrialSite, batch_size, "trial_sites"
    )

    table = Table(title="Seed complete", show_header=False, box=None)
    table.add_row("Locations unique", str(len(location_rows)))
    table.add_row("Locations inserted", str(locations_inserted))
    table.add_row("Trials in JSON", str(len(trial_rows)))
    table.add_row("Trials inserted", str(trials_inserted))
    table.add_row("Trial-site junctions", str(len(trial_site_rows)))
    table.add_row("Trial-site junctions inserted", str(sites_inserted))
    console.print(table)
    console.print(
        "[dim]Run geocode_mapbox.py next to fill city, province, lat, lon"
        " on locations.[/dim]"
    )


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Seed clinical trials into PostgreSQL."
    )
    parser.add_argument("--data", type=Path, default=DEFAULT_DATA, metavar="FILE")
    parser.add_argument(
        "--batch-size", type=int, default=DEFAULT_BATCH_SIZE, metavar="N"
    )
    args = parser.parse_args()
    asyncio.run(seed(args.data, args.batch_size))


if __name__ == "__main__":
    main()
