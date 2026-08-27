"""Fill lat/lon for the addresses the diff did not carry forward."""

from __future__ import annotations

import asyncio
import uuid
from dataclasses import dataclass

import httpx
from sqlalchemy import bindparam, select, update

from core.config import get_settings
from core.http_retry import build_retrying_client
from models import Location
from scripts.ctc.db.shadow import BUILD_SCHEMA, shadow_connection

MAPBOX_URL = "https://api.mapbox.com/search/geocode/v6/forward"
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
class GeocodeResult:
    requested: int
    resolved: int

    @property
    def unresolved(self) -> int:
        return self.requested - self.resolved


async def _pending(schema: str, limit: int | None) -> list[tuple[uuid.UUID, str]]:
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


def parse_coordinates(payload: object) -> tuple[float, float] | None:
    """Mapbox serves GeoJSON, so coordinates arrive lon-first."""
    if not isinstance(payload, dict):
        return None
    features = payload.get("features") or []
    if not isinstance(features, list) or not features:
        return None
    coordinates = (features[0].get("geometry") or {}).get("coordinates") or []
    if len(coordinates) != 2:
        return None
    lon, lat = coordinates
    return float(lat), float(lon)


async def _resolve(
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
                MAPBOX_URL,
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


async def _write(schema: str, resolved: list[Coordinates]) -> int:
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


async def geocode(
    *,
    schema: str = BUILD_SCHEMA,
    token: str | None = None,
    concurrency: int = DEFAULT_CONCURRENCY,
    limit: int | None = None,
    transport: httpx.AsyncBaseTransport | None = None,
) -> GeocodeResult:
    access_token = token or get_settings().mapbox_token
    pending = await _pending(schema, limit)
    if not pending:
        return GeocodeResult(requested=0, resolved=0)
    if not access_token:
        raise RuntimeError(
            f"{len(pending)} addresses need coordinates but MAPBOX_TOKEN is unset"
        )

    semaphore = asyncio.Semaphore(concurrency)
    async with build_retrying_client(
        max_retries=MAX_RETRIES,
        max_wait=MAX_WAIT_SECONDS,
        read_timeout=READ_TIMEOUT_SECONDS,
        wrapped=transport,
    ) as client:
        results = await asyncio.gather(
            *(
                _resolve(client, semaphore, location_id, address, access_token)
                for location_id, address in pending
            )
        )

    resolved = [item for item in results if item is not None]
    return GeocodeResult(
        requested=len(pending), resolved=await _write(schema, resolved)
    )
