from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field

from schemas.source import SourceCode


class SourceFreshness(BaseModel):
    """When one registry's corpus was last published. None means never."""

    source: SourceCode
    name: str
    published_at: datetime | None = None


class DataFreshness(BaseModel):
    """`published_at` is the oldest published source; `sources` dates each registry."""

    published_at: datetime | None = None
    sources: list[SourceFreshness] = Field(default_factory=list)
