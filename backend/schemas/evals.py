from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class RemoteExperimentTrigger(BaseModel):
    """Payload Langfuse POSTs when a dataset's remote experiment is triggered."""

    model_config = ConfigDict(extra="ignore", populate_by_name=True)

    dataset_name: str | None = Field(default=None, alias="datasetName")
    dataset_id: str | None = Field(default=None, alias="datasetId")
    payload: dict[str, Any] = Field(default_factory=dict)
