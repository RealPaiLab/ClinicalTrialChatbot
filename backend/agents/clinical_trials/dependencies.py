"""Runtime dependencies injected into the clinical-trials agent."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Protocol

from schemas.glossary import GlossaryDefinition, GlossarySource
from schemas.memory import ConversationMemory
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

    async def semantic_search(
        self,
        flt: TrialFilter,
        *,
        query: str,
        limit: int | None = None,
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
    # NCTs already surfaced by tools in earlier turns: guardrail only, never returned
    known_ncts: set[str] = field(default_factory=set)
    tool_calls: int = 0
    seen_calls: set[str] = field(default_factory=set)
    refusal_directive: str | None = None
    verified_context: str | None = None
    memory: ConversationMemory = field(default_factory=ConversationMemory)
    turn_index: int = 1
    memory_calls: int = 0
    hallucinated_ncts: list[str] = field(default_factory=list)
