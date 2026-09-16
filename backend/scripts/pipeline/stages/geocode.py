"""Fill what a location lacks: coordinates from an address, or a region from them."""

from __future__ import annotations

import asyncio
import uuid
from collections.abc import Sequence
from dataclasses import dataclass

import httpx
from sqlalchemy import bindparam, or_, select, update

from core.config import get_settings
from core.http_retry import build_retrying_client
from models import Location
from scripts.pipeline.db.shadow import shadow_connection

MAPBOX_FORWARD_URL = "https://api.mapbox.com/search/geocode/v6/forward"
MAPBOX_REVERSE_URL = "https://api.mapbox.com/search/geocode/v6/reverse"
DEFAULT_CONCURRENCY = 20

MAX_RETRIES = 3
MAX_WAIT_SECONDS = 30.0
READ_TIMEOUT_SECONDS = 30.0


@dataclass(frozen=True, slots=True)
class Coordinates:
    location_id: uuid.UUID
    lat: float
    lon: float


@dataclass(frozen=True, slots=True)
class Region:
    location_id: uuid.UUID
    city: str | None
    province: str | None


@dataclass(frozen=True, slots=True)
class GeocodeResult:
    requested: int
    resolved: int
    regions_requested: int = 0
    regions_resolved: int = 0

    @property
    def unresolved(self) -> int:
        return self.requested - self.resolved

    @property
    def regions_unresolved(self) -> int:
        return self.regions_requested - self.regions_resolved


async def _pending_coordinates(
    schema: str, limit: int | None
) -> list[tuple[uuid.UUID, str]]:
    statement = (
        select(Location.id, Location.address)
        .where(Location.lat.is_(None), Location.address.is_not(None))
        .order_by(Location.id)
    )
    if limit is not None:
        statement = statement.limit(limit)
    async with shadow_connection(schema) as connection:
        rows = await connection.execute(statement)
        return [(row.id, row.address) for row in rows]


async def _pending_regions(
    schema: str, limit: int | None
) -> list[tuple[uuid.UUID, float, float]]:
    statement = (
        select(Location.id, Location.lat, Location.lon)
        .where(
            Location.lat.is_not(None),
            or_(Location.city.is_(None), Location.province.is_(None)),
        )
        .order_by(Location.id)
    )
    if limit is not None:
        statement = statement.limit(limit)
    async with shadow_connection(schema) as connection:
        rows = await connection.execute(statement)
        return [(row.id, row.lat, row.lon) for row in rows]


def _first_feature(payload: object) -> dict[str, object] | None:
    if not isinstance(payload, dict):
        return None
    features = payload.get("features") or []
    if not isinstance(features, list) or not features:
        return None
    first = features[0]
    return first if isinstance(first, dict) else None


def parse_coordinates(payload: object) -> tuple[float, float] | None:
    """Mapbox serves GeoJSON, so coordinates arrive lon-first."""
    feature = _first_feature(payload)
    if feature is None:
        return None
    geometry = feature.get("geometry")
    coordinates = geometry.get("coordinates") if isinstance(geometry, dict) else None
    if not isinstance(coordinates, list) or len(coordinates) != 2:
        return None
    lon, lat = coordinates
    return float(lat), float(lon)


def parse_region(payload: object) -> tuple[str | None, str | None] | None:
    """The `place` and `region` of the feature's context: city and province."""
    feature = _first_feature(payload)
    if feature is None:
        return None
    properties = feature.get("properties")
    context = properties.get("context") if isinstance(properties, dict) else None
    if not isinstance(context, dict):
        return None
    names = [
        entry.get("name") if isinstance(entry, dict) else None
        for entry in (context.get("place"), context.get("region"))
    ]
    city, province = (str(name) if name else None for name in names)
    return (city, province) if city or province else None


async def _forward(
    client: httpx.AsyncClient,
    semaphore: asyncio.Semaphore,
    location_id: uuid.UUID,
    address: str,
    token: str,
) -> Coordinates | None:
    """An address that will not resolve is skipped, never fatal to the run."""
    async with semaphore:
        try:
            response = await client.get(
                MAPBOX_FORWARD_URL,
                params={
                    "q": address,
                    "country": "CA",
                    "limit": 1,
                    "access_token": token,
                },
            )
            parsed = parse_coordinates(response.json())
        except httpx.HTTPError, AttributeError, TypeError, ValueError:
            parsed = None
    if parsed is None:
        return None
    return Coordinates(location_id=location_id, lat=parsed[0], lon=parsed[1])


async def _reverse(
    client: httpx.AsyncClient,
    semaphore: asyncio.Semaphore,
    location_id: uuid.UUID,
    lat: float,
    lon: float,
    token: str,
) -> Region | None:
    async with semaphore:
        try:
            response = await client.get(
                MAPBOX_REVERSE_URL,
                params={
                    "latitude": lat,
                    "longitude": lon,
                    "types": "place",
                    "country": "CA",
                    "limit": 1,
                    "access_token": token,
                },
            )
            parsed = parse_region(response.json())
        except httpx.HTTPError, AttributeError, TypeError, ValueError:
            parsed = None
    if parsed is None:
        return None
    return Region(location_id=location_id, city=parsed[0], province=parsed[1])


async def _write_coordinates(schema: str, resolved: Sequence[Coordinates]) -> int:
    if not resolved:
        return 0
    statement = (
        update(Location)
        .where(Location.id == bindparam("location_id"))
        .values(lat=bindparam("lat"), lon=bindparam("lon"))
    )
    async with shadow_connection(schema) as connection:
        await connection.execute(
            statement,
            [
                {"location_id": item.location_id, "lat": item.lat, "lon": item.lon}
                for item in resolved
            ],
        )
    return len(resolved)


async def _write_regions(schema: str, resolved: Sequence[Region]) -> int:
    if not resolved:
        return 0
    statement = (
        update(Location)
        .where(Location.id == bindparam("location_id"))
        .values(city=bindparam("city"), province=bindparam("province"))
    )
    async with shadow_connection(schema) as connection:
        await connection.execute(
            statement,
            [
                {
                    "location_id": item.location_id,
                    "city": item.city,
                    "province": item.province,
                }
                for item in resolved
            ],
        )
    return len(resolved)


async def geocode(
    *,
    schema: str,
    token: str | None = None,
    concurrency: int = DEFAULT_CONCURRENCY,
    limit: int | None = None,
    transport: httpx.AsyncBaseTransport | None = None,
) -> GeocodeResult:
    access_token = token or get_settings().mapbox_token
    addresses = await _pending_coordinates(schema, limit)
    points = await _pending_regions(schema, limit)
    if not addresses and not points:
        return GeocodeResult(requested=0, resolved=0)
    if not access_token:
        raise RuntimeError(
            f"{len(addresses)} addresses and {len(points)} points need geocoding "
            "but MAPBOX_TOKEN is unset"
        )

    semaphore = asyncio.Semaphore(concurrency)
    async with build_retrying_client(
        max_retries=MAX_RETRIES,
        max_wait=MAX_WAIT_SECONDS,
        read_timeout=READ_TIMEOUT_SECONDS,
        wrapped=transport,
    ) as client:
        coordinates = await asyncio.gather(
            *(
                _forward(client, semaphore, location_id, address, access_token)
                for location_id, address in addresses
            )
        )
        regions = await asyncio.gather(
            *(
                _reverse(client, semaphore, location_id, lat, lon, access_token)
                for location_id, lat, lon in points
            )
        )
    return GeocodeResult(
        requested=len(addresses),
        resolved=await _write_coordinates(schema, [c for c in coordinates if c]),
        regions_requested=len(points),
        regions_resolved=await _write_regions(schema, [r for r in regions if r]),
    )
