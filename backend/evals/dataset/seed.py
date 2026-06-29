from __future__ import annotations

from pathlib import Path

from langfuse import get_client

from evals.dataset.mapping import to_langfuse_item
from evals.dataset.sources.file_source import FileDatasetSource

_SEED_PATH = Path(__file__).parent / "data" / "seed.yaml"


def seed_dataset(dataset_name: str) -> int:
    """Idempotently upsert seed.yaml samples into Langfuse; return the count."""
    client = get_client()
    client.create_dataset(name=dataset_name)
    samples = FileDatasetSource(_SEED_PATH).load()
    for index, sample in enumerate(samples):
        payload = to_langfuse_item(sample)
        client.create_dataset_item(
            dataset_name=dataset_name,
            id=f"{dataset_name}-{index:03d}",
            input=payload["input"],
            expected_output=payload["expected_output"],
        )
    return len(samples)
