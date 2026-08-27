"""Whether a served record differs from the stored one."""

from __future__ import annotations

import uuid
from collections.abc import Mapping
from typing import Protocol

from sqlalchemy.ext.asyncio import AsyncSession

from scripts.ctc.canonical import CanonicalTrial


class ChangeStrategy[LiveState](Protocol):
    """A strategy owns both halves: what to read from live, and how to compare it.

    `LiveState` is whatever it needs to remember about a stored trial.
    """

    name: str

    async def snapshot(self, session: AsyncSession) -> Mapping[uuid.UUID, LiveState]:
        """The stored state of every live trial, keyed by primary key."""
        ...

    def has_changed(self, incoming: CanonicalTrial, live: LiveState) -> bool: ...
