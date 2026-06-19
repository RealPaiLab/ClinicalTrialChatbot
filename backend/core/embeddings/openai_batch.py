"""OpenAI Batch API embedding client."""

from __future__ import annotations

import asyncio
import json
from typing import Literal

from openai import AsyncOpenAI

from core.config import Settings
from core.embeddings.base import EXPECTED_DIMENSIONS
from core.embeddings.factory import OpenAIEmbeddingModelName, _resolve_model

_EMBEDDINGS_URL: Literal["/v1/embeddings"] = "/v1/embeddings"
_TERMINAL_OK = "completed"
_TERMINAL_BAD = {"failed", "expired", "cancelled"}


def build_jsonl(items: dict[str, str], model: str, dimensions: int) -> str:
    """One /v1/embeddings request line per item, keyed by custom_id."""
    lines = [
        json.dumps(
            {
                "custom_id": custom_id,
                "method": "POST",
                "url": _EMBEDDINGS_URL,
                "body": {"model": model, "input": text, "dimensions": dimensions},
            }
        )
        for custom_id, text in items.items()
    ]
    return "\n".join(lines)


def parse_output(content: str) -> dict[str, list[float]]:
    """Map custom_id -> embedding from a batch output JSONL (order not guaranteed)."""
    embeddings: dict[str, list[float]] = {}
    for line in content.splitlines():
        if not line.strip():
            continue
        row = json.loads(line)
        body = row["response"]["body"]
        embeddings[row["custom_id"]] = [float(x) for x in body["data"][0]["embedding"]]
    return embeddings


class OpenAIBatchEmbedder:
    """Embeds documents through OpenAI's async Batch API."""

    def __init__(self, settings: Settings) -> None:
        if settings.openai_api_key is None:
            raise ValueError("OPENAI_API_KEY is required for batch embedding")
        self._client = AsyncOpenAI(api_key=settings.openai_api_key)
        self._model = _resolve_model(
            OpenAIEmbeddingModelName,
            settings.embedding_model,
            OpenAIEmbeddingModelName.TEXT_EMBEDDING_3_LARGE,
        ).value
        self._dimensions = EXPECTED_DIMENSIONS

    async def submit(self, items: dict[str, str]) -> str:
        """Upload a JSONL batch and return the batch id."""
        payload = build_jsonl(items, self._model, self._dimensions).encode()
        uploaded = await self._client.files.create(
            file=("trials.jsonl", payload), purpose="batch"
        )
        batch = await self._client.batches.create(
            input_file_id=uploaded.id,
            endpoint=_EMBEDDINGS_URL,
            completion_window="24h",
        )
        return batch.id

    async def _poll(self, batch_id: str, interval_seconds: float) -> str:
        """Block until the batch reaches a terminal state; return its output_file_id."""
        while True:
            batch = await self._client.batches.retrieve(batch_id)
            if batch.status == _TERMINAL_OK:
                if batch.output_file_id is None:
                    raise RuntimeError(f"Batch {batch_id} completed without output")
                return batch.output_file_id
            if batch.status in _TERMINAL_BAD:
                raise RuntimeError(f"Batch {batch_id} ended as {batch.status}")
            await asyncio.sleep(interval_seconds)

    async def fetch(
        self, batch_id: str, *, interval_seconds: float = 10.0
    ) -> dict[str, list[float]]:
        """Wait for completion, then return custom_id -> embedding."""
        output_file_id = await self._poll(batch_id, interval_seconds)
        content = await self._client.files.content(output_file_id)
        return parse_output(content.text)
