from __future__ import annotations

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CanonicalBase(BaseModel):
    """camelCase in, snake_case out: source payloads parse without a mapping layer."""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
