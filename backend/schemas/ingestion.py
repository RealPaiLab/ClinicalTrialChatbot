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
    """`published_at` is the OLDEST published source, so the badge never
    overstates how fresh the whole corpus is; None means nothing was ever
    published. `sources` says it per registry."""

    published_at: datetime | None = None
    sources: list[SourceFreshness] = Field(default_factory=list)
