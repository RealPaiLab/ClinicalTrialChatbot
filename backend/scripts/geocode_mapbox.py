"""Geocode location addresses."""

from __future__ import annotations

import argparse
import asyncio
import os
import unicodedata

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
from sqlalchemy import select, update

from core.database import AsyncSessionFactory
from models import Location

MAPBOX_URL = "https://api.mapbox.com/search/geocode/v6/forward"
CTC_FILTER_URL = "https://api.oncoquebec.com/api/studies/filter-values"
CONCURRENCY = 20

console = Console()


def _normalize(s: str) -> str:
    """Strip accents and casefold for accent-insensitive comparison."""
    normalized = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return normalized.casefold()


async def fetch_known_sets(
    client: httpx.AsyncClient,
) -> tuple[frozenset[str], frozenset[str]]:
    """Fetch the canonical city and province lists from the CTC API at runtime."""
    r = await client.get(CTC_FILTER_URL, params={"searchScope": "CA"})
    r.raise_for_status()
    data = r.json()
    cities_norm = frozenset(_normalize(c) for c in (data.get("cities") or []))
    provinces_norm = frozenset(_normalize(p) for p in (data.get("provinces") or []))
    console.print(
        f"Fetched [bold]{len(cities_norm)}[/bold] cities"
        f" and [bold]{len(provinces_norm)}[/bold] provinces from CTC API"
    )
    return cities_norm, provinces_norm


async def _api_city_province(
    client: httpx.AsyncClient,
    name_en: str,
    cities_norm: frozenset[str],
    provinces_norm: frozenset[str],
) -> tuple[str | None, str | None]:
    """
    Query the CTC filter-values endpoint with hospitalCenters=
    to get the canonical city and province for a site name.
    This is a fallback if Mapbox doesn't return a valid city/province.
    """
    try:
        r = await client.get(
            CTC_FILTER_URL,
            params={"searchScope": "CA", "hospitalCenters": name_en},
        )
        r.raise_for_status()
        data = r.json()
        cities: list[str] = data.get("cities") or []
        provinces: list[str] = data.get("provinces") or []
        city = cities[0] if cities else None
        province = provinces[0] if provinces else None
        if city and _normalize(city) not in cities_norm:
            city = None
        if province and _normalize(province) not in provinces_norm:
            province = None
        return city, province
    except Exception as exc:
        console.print(f"[yellow]  warn (api fallback): {exc}[/yellow]")
        return None, None


async def geocode(
    client: httpx.AsyncClient,
    address: str,
    name_en: str,
    token: str,
    cities_norm: frozenset[str],
    provinces_norm: frozenset[str],
) -> tuple[float, float, str | None, str | None, str, str] | None:
    """Return (lat, lon, city, province, city_source, province_source) or None"""
    try:
        r = await client.get(
            MAPBOX_URL,
            params={"q": address, "country": "CA", "limit": 1, "access_token": token},
        )
        r.raise_for_status()
        features = r.json().get("features") or []
        if not features:
            return None

        lon, lat = features[0]["geometry"]["coordinates"]
        ctx = (features[0].get("properties") or {}).get("context") or {}
        mb_city: str | None = (ctx.get("place") or {}).get("name")
        mb_province: str | None = (ctx.get("region") or {}).get("name")

        city = mb_city if mb_city and _normalize(mb_city) in cities_norm else None
        province = (
            mb_province
            if mb_province and _normalize(mb_province) in provinces_norm
            else None
        )

        city_source = "mapbox" if city else "none"
        province_source = "mapbox" if province else "none"

        if not city or not province:
            api_city, api_province = await _api_city_province(
                client, name_en, cities_norm, provinces_norm
            )
            if not city and api_city:
                city = api_city
                city_source = "api"
            if not province and api_province:
                province = api_province
                province_source = "api"

        return float(lat), float(lon), city, province, city_source, province_source

    except Exception as exc:
        console.print(f"[yellow]  warn: {exc}[/yellow]")
    return None


async def fetch_pending(limit: int | None) -> list[tuple[str, str, str]]:
    """Return (id, address, name_en) for locations missing coordinates."""
    async with AsyncSessionFactory() as session:
        stmt = select(Location.id, Location.address, Location.name_en).where(
            Location.lat.is_(None),
            Location.address.is_not(None),
        )
        if limit:
            stmt = stmt.limit(limit)
        rows = await session.execute(stmt)
        return [(str(row.id), row.address, row.name_en or "") for row in rows]


_Update = tuple[str, float, float, str | None, str | None]


async def batch_update_locations(updates: list[_Update]) -> None:
    async with AsyncSessionFactory() as session:
        for loc_id, lat, lon, city, province in updates:
            await session.execute(
                update(Location)
                .where(Location.id == loc_id)
                .values(lat=lat, lon=lon, city=city, province=province)
            )
        await session.commit()


async def _geocode_one(
    client: httpx.AsyncClient,
    sem: asyncio.Semaphore,
    loc_id: str,
    address: str,
    name_en: str,
    token: str,
    cities_norm: frozenset[str],
    provinces_norm: frozenset[str],
    updates: list[_Update],
    progress: Progress,
    task_id: TaskID,
    counters: dict[str, int],
) -> None:
    async with sem:
        result = await geocode(
            client, address, name_en, token, cities_norm, provinces_norm
        )
    if result:
        lat, lon, city, province, city_src, province_src = result
        updates.append((loc_id, lat, lon, city, province))
        counters["ok"] += 1
        counters[f"city_{city_src}"] += 1
        counters[f"province_{province_src}"] += 1
    else:
        counters["failed"] += 1
    progress.advance(task_id)


async def run(token: str, limit: int | None, dry_run: bool) -> None:
    async with httpx.AsyncClient(timeout=10) as client:
        cities_norm, provinces_norm = await fetch_known_sets(client)

        pending = await fetch_pending(limit)
        console.print(f"Locations pending geocoding: [bold]{len(pending)}[/bold]")

        if not pending:
            console.print("[green]All locations already have coordinates.[/green]")
            return

        sem = asyncio.Semaphore(CONCURRENCY)
        updates: list[_Update] = []
        counters: dict[str, int] = {
            "ok": 0,
            "failed": 0,
            "city_mapbox": 0,
            "city_api": 0,
            "city_none": 0,
            "province_mapbox": 0,
            "province_api": 0,
            "province_none": 0,
        }

        with Progress(
            TextColumn("[progress.description]{task.description}"),
            BarColumn(),
            MofNCompleteColumn(),
            TimeElapsedColumn(),
            console=console,
        ) as progress:
            task_id = progress.add_task("Geocoding", total=len(pending))

            await asyncio.gather(
                *[
                    _geocode_one(
                        client,
                        sem,
                        loc_id,
                        address,
                        name_en,
                        token,
                        cities_norm,
                        provinces_norm,
                        updates,
                        progress,
                        task_id,
                        counters,
                    )
                    for loc_id, address, name_en in pending
                ]
            )

        if not dry_run and updates:
            await batch_update_locations(updates)

        console.print(f"Geocoded: {counters['ok']} / Failed: {counters['failed']}")
        console.print(
            f"City   — mapbox: {counters['city_mapbox']}"
            f"  api: {counters['city_api']}"
            f"  missing: {counters['city_none']}"
        )
        console.print(
            f"Province — mapbox: {counters['province_mapbox']}"
            f"  api: {counters['province_api']}"
            f"  missing: {counters['province_none']}"
        )
        if dry_run:
            console.print("[yellow]dry-run — no DB writes[/yellow]")


def main() -> None:
    parser = argparse.ArgumentParser(description="Geocode locations via Mapbox.")
    parser.add_argument(
        "--token",
        default=os.environ.get("MAPBOX_TOKEN"),
        help="Mapbox access token (or set MAPBOX_TOKEN env var)",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        metavar="N",
        help="Process only the first N locations (for testing)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Geocode but do not write to the database",
    )
    args = parser.parse_args()

    if not args.token:
        parser.error("Mapbox token required: pass --token or set MAPBOX_TOKEN env var")

    asyncio.run(run(args.token, args.limit, args.dry_run))


if __name__ == "__main__":
    main()
