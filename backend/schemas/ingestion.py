from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class DataFreshness(BaseModel):
    """When the live corpus was last published. None means it never has been."""

    published_at: datetime | None = None
