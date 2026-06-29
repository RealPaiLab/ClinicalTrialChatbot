from __future__ import annotations

import json
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator


class RemoteExperimentTrigger(BaseModel):
    """Payload Langfuse POSTs when a dataset's remote experiment is triggered."""

    model_config = ConfigDict(extra="ignore", populate_by_name=True)

    dataset_name: str | None = Field(default=None, alias="datasetName")
    dataset_id: str | None = Field(default=None, alias="datasetId")
    payload: dict[str, Any] = Field(default_factory=dict)

    @field_validator("payload", mode="before")
    @classmethod
    def _parse_payload(cls, value: Any) -> Any:
        if isinstance(value, str):
            try:
                return json.loads(value) if value.strip() else {}
            except json.JSONDecodeError:
                return {}
        return value or {}
