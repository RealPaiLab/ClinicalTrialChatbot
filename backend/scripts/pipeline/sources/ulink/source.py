"""The C17 pediatric registry at u-link.care: server-rendered pages, scraped."""

from __future__ import annotations

import asyncio
from collections.abc import Iterable, Sequence

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
        self._statuses = frozenset(statuses)
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
        """The capture keeps every status; the allowlist decides what is published."""
        async with self._client() as http:
            client = UlinkClient(
                http, base_url=self._base_url, concurrency=self._concurrency
            )
            pages = await client.listing()
            entries = self._dedupe(
                record for page in pages for record in parse_listing(page)
            )
            tagged = await self._pathology_index(client, parse_pathologies(pages[0]))

        records = [
            entry.model_copy(update={"cancer_types": tagged.get(entry.nid, [])})
            for entry in entries
        ]
        raw: list[JsonValue] = [record.model_dump(mode="json") for record in records]
        return SourceRecords(
            trials=[
                to_canonical(record)
                for record in records
                if record.status in self._statuses
            ],
            raw=raw,
        )

    @staticmethod
    def _dedupe(records: Iterable[UlinkRecord]) -> list[UlinkRecord]:
        """Paging serves an entry twice when the listing shifts mid-fetch."""
        seen: dict[str, UlinkRecord] = {}
        for record in records:
            seen.setdefault(record.nid, record)
        return list(seen.values())

    @staticmethod
    async def _pathology_index(
        client: UlinkClient, pathologies: Sequence[str]
    ) -> dict[str, list[str]]:
        """Entry id to the diagnoses it is tagged with, by inverting one
        filtered listing per diagnosis. Tags are what the site's own search
        matches on, and far cleaner than its free-text diagnosis cell."""
        listings = await asyncio.gather(
            *(client.listing(pathology) for pathology in pathologies)
        )
        index: dict[str, list[str]] = {}
        for pathology, pages in zip(pathologies, listings, strict=True):
            for nid in {nid for page in pages for nid in parse_nids(page)}:
                index.setdefault(nid, []).append(pathology)
        return index
