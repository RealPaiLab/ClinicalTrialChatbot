"""The C17 pediatric registry at u-link.care: server-rendered pages, scraped."""

from __future__ import annotations

import asyncio
from collections.abc import Iterable, Sequence
from itertools import product

import httpx
from pydantic import JsonValue

from core.http_retry import build_retrying_client
from scripts.pipeline.sources.base import SourceRecords
from scripts.pipeline.sources.ulink.client import UlinkClient
from scripts.pipeline.sources.ulink.mapping import to_canonical
from scripts.pipeline.sources.ulink.parse import (
    parse_listing,
    parse_nids,
    parse_pathologies,
)
from scripts.pipeline.sources.ulink.records import UlinkRecord

MAX_RETRIES = 3
MAX_WAIT_SECONDS = 30.0
READ_TIMEOUT_SECONDS = 60.0


class UlinkScrapeSource:
    name = "ulink-scrape"

    def __init__(
        self,
        *,
        base_url: str,
        statuses: Sequence[str],
        concurrency: int = 4,
        transport: httpx.AsyncBaseTransport | None = None,
    ) -> None:
        self._base_url = base_url
        self._statuses = tuple(statuses)
        self._concurrency = concurrency
        self._transport = transport

    def _client(self) -> httpx.AsyncClient:
        return build_retrying_client(
            max_retries=MAX_RETRIES,
            max_wait=MAX_WAIT_SECONDS,
            read_timeout=READ_TIMEOUT_SECONDS,
            wrapped=self._transport,
        )

    async def load(self) -> SourceRecords:
        """One status-filtered listing per allowlisted status; nothing else is read."""
        async with self._client() as http:
            client = UlinkClient(
                http, base_url=self._base_url, concurrency=self._concurrency
            )
            listings = await asyncio.gather(
                *(client.listing(status=status) for status in self._statuses)
            )
            entries = self._dedupe(
                record
                for pages in listings
                for page in pages
                for record in parse_listing(page)
            )
            pathologies = parse_pathologies(listings[0][0]) if listings else []
            tagged = await self._pathology_index(client, pathologies)

        records = [
            entry.model_copy(update={"cancer_types": tagged.get(entry.nid, [])})
            for entry in entries
        ]
        raw: list[JsonValue] = [record.model_dump(mode="json") for record in records]
        return SourceRecords(
            trials=[to_canonical(record) for record in records], raw=raw
        )

    @staticmethod
    def _dedupe(records: Iterable[UlinkRecord]) -> list[UlinkRecord]:
        """Paging serves an entry twice when the listing shifts mid-fetch."""
        seen: dict[str, UlinkRecord] = {}
        for record in records:
            seen.setdefault(record.nid, record)
        return list(seen.values())

    async def _pathology_index(
        self, client: UlinkClient, pathologies: Sequence[str]
    ) -> dict[str, list[str]]:
        """Entry id to diagnosis tags, inverting one filtered listing per diagnosis."""
        queries = list(product(pathologies, self._statuses))
        listings = await asyncio.gather(
            *(
                client.listing(status=status, pathology=pathology)
                for pathology, status in queries
            )
        )
        index: dict[str, set[str]] = {}
        for (pathology, _), pages in zip(queries, listings, strict=True):
            for nid in {nid for page in pages for nid in parse_nids(page)}:
                index.setdefault(nid, set()).add(pathology)
        return {nid: sorted(tags) for nid, tags in index.items()}
