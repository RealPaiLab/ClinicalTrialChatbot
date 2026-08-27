"""The Cancer Trials Canada API: paged search, fetched concurrently."""

from __future__ import annotations

import asyncio

import httpx
from pydantic import JsonValue

from core.http_retry import build_retrying_client
from scripts.ctc.canonical import CanonicalTrial
from scripts.ctc.sources.base import PageCallback, SourceRecords

MAX_RETRIES = 3
MAX_WAIT_SECONDS = 30.0
READ_TIMEOUT_SECONDS = 60.0


class CtcApiSource:
    name = "ctc-api"

    def __init__(
        self,
        *,
        base_url: str,
        search_scope: str = "CA",
        page_size: int = 100,
        concurrency: int = 5,
        on_page: PageCallback | None = None,
        transport: httpx.AsyncBaseTransport | None = None,
    ) -> None:
        self._base_url = base_url.rstrip("/")
        self._search_scope = search_scope
        self._page_size = page_size
        self._concurrency = concurrency
        self._on_page = on_page
        self._transport = transport

    def _client(self) -> httpx.AsyncClient:
        return build_retrying_client(
            max_retries=MAX_RETRIES,
            max_wait=MAX_WAIT_SECONDS,
            read_timeout=READ_TIMEOUT_SECONDS,
            wrapped=self._transport,
        )

    async def load(self) -> SourceRecords:
        async with self._client() as client:
            total = await self._count(client)
            pages = -(-total // self._page_size)
            semaphore = asyncio.Semaphore(self._concurrency)
            results = await asyncio.gather(
                *(self._page(client, semaphore, page) for page in range(pages))
            )

        raw = self._dedupe(results)
        return SourceRecords(
            trials=[CanonicalTrial.model_validate(entry) for entry in raw], raw=raw
        )

    async def _count(self, client: httpx.AsyncClient) -> int:
        response = await client.get(
            f"{self._base_url}/database/count",
            params={"searchScope": self._search_scope},
        )
        return int(response.json()["totalCount"])

    async def _page(
        self, client: httpx.AsyncClient, semaphore: asyncio.Semaphore, page: int
    ) -> list[JsonValue]:
        async with semaphore:
            response = await client.get(
                f"{self._base_url}/database/search",
                params={
                    "searchScope": self._search_scope,
                    "limit": self._page_size,
                    "page": page,
                },
            )
            studies: list[JsonValue] = response.json().get("studies") or []
            if self._on_page is not None:
                self._on_page(len(studies))
            return studies

    @staticmethod
    def _dedupe(pages: list[list[JsonValue]]) -> list[JsonValue]:
        """Paging serves a trial twice when the corpus shifts mid-fetch."""
        seen: set[str] = set()
        trials: list[JsonValue] = []
        for page in pages:
            for entry in page:
                if not isinstance(entry, dict):
                    continue
                key = str(entry.get("id"))
                if key not in seen:
                    seen.add(key)
                    trials.append(entry)
        return trials
