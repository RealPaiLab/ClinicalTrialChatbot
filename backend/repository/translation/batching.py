"""Request-sized batching shared by the translation providers."""

from __future__ import annotations

from collections.abc import Iterator


def batches(
    texts: list[str], *, max_codepoints: int, max_segments: int
) -> Iterator[list[str]]:
    """Split texts into request-sized batches, keeping order."""
    batch: list[str] = []
    size = 0
    for text in texts:
        if batch and (size + len(text) > max_codepoints or len(batch) >= max_segments):
            yield batch
            batch, size = [], 0
        batch.append(text)
        size += len(text)
    if batch:
        yield batch
