"""Runtime dependencies injected into the clinical-trials agent."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Protocol

from schemas.glossary import GlossaryDefinition, GlossarySource
from schemas.trial import TrialCitation, TrialFilter


class TrialSearch(Protocol):
    """Search interface the tools need."""

    async def syntactic_search(
        self,
        flt: TrialFilter,
        *,
        query: str | None = None,
        limit: int | None = None,
        offset: int = 0,
    ) -> list[TrialCitation]: ...

    async def get_by_ncts(self, nct_numbers: list[str]) -> list[TrialCitation]: ...


class GlossaryLookup(Protocol):
    """Plain-language term-definition lookup the tools need."""

    async def define(
        self, term: str, source: GlossarySource
    ) -> list[GlossaryDefinition]: ...


class _NullGlossary:
    """Default no-op glossary so deps work without a configured lookup."""

    async def define(
        self, term: str, source: GlossarySource
    ) -> list[GlossaryDefinition]:
        return []


@dataclass
class AgentDeps:
    """Per-run dependencies; tools read the search service and record fetched trials."""

    trial_search: TrialSearch
    glossary: GlossaryLookup = field(default_factory=_NullGlossary)
    fetched_trials: dict[str, TrialCitation] = field(default_factory=dict)
    tool_calls: int = 0
    seen_calls: set[str] = field(default_factory=set)
