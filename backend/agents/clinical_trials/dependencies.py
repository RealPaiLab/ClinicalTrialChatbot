"""Runtime dependencies injected into the clinical-trials agent."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Protocol

from schemas.trial import TrialCitation, TrialFilter


class TrialSearch(Protocol):
    """Search interface the tools need."""

    async def search(
        self, flt: TrialFilter, *, limit: int | None = None
    ) -> list[TrialCitation]: ...

    async def keyword_search(
        self, query: str, *, limit: int | None = None
    ) -> list[TrialCitation]: ...

    async def get_by_ncts(self, nct_numbers: list[str]) -> list[TrialCitation]: ...


@dataclass
class AgentDeps:
    """Per-run dependencies; tools read the search service and record fetched trials."""

    trial_search: TrialSearch
    fetched_trials: dict[str, TrialCitation] = field(default_factory=dict)
