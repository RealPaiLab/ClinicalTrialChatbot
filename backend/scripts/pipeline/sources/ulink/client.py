"""Fetch a U-Link listing, every page, optionally narrowed to one diagnosis."""

from __future__ import annotations

import asyncio

import httpx

from scripts.pipeline.sources.ulink.parse import last_page

TRIALS_PATH = "/trials"


class UlinkClient:
    def __init__(
        self, client: httpx.AsyncClient, *, base_url: str, concurrency: int
    ) -> None:
        self._client = client
        self._url = base_url.rstrip("/") + TRIALS_PATH
        self._semaphore = asyncio.Semaphore(concurrency)

    async def page(self, number: int, pathology: str | None = None) -> str:
        params: dict[str, str | int] = {"page": number}
        if pathology is not None:
            params["pathology"] = pathology
        async with self._semaphore:
            response = await self._client.get(self._url, params=params)
        return response.text

    async def listing(self, pathology: str | None = None) -> list[str]:
        """Every page of a listing, in order. The first page says how many follow."""
        first = await self.page(0, pathology)
        rest = await asyncio.gather(
            *(self.page(number, pathology) for number in range(1, last_page(first) + 1))
        )
        return [first, *rest]
