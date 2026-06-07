from __future__ import annotations

from collections.abc import Sequence
from contextlib import asynccontextmanager
from typing import Any
from unittest.mock import AsyncMock, MagicMock

from pydantic_ai import RunContext
from pydantic_ai.models.test import TestModel
from pydantic_ai.usage import RunUsage

from agents.clinical_trials.dependencies import AgentDeps
from models.location import Location
from models.trial import Trial
from models.trial_site import TrialSite
from schemas.glossary import GlossaryDefinition, GlossarySource
from schemas.trial import TrialCitation, TrialSiteInfo


def make_citation(
    nct: str,
    *,
    title: str = "A trial",
    cancer: Sequence[str] = ("Breast Cancer",),
    city: str = "Montréal",
    province: str = "Quebec",
    state: str = "Recruiting",
    phases: Sequence[str] = ("PHASE3",),
) -> TrialCitation:
    """Build a TrialCitation DTO with one site."""
    return TrialCitation(
        nct_number=nct,
        short_title_en=title,
        phases=list(phases),
        sites=[
            TrialSiteInfo(
                name_en="Site",
                city=city,
                province=province,
                state=state,
                cancer_type_names=list(cancer),
            )
        ],
    )


def make_orm_trial(
    nct: str,
    *,
    sites: Sequence[tuple[str, str, Sequence[str]]] = (
        ("Montréal", "Quebec", ("Breast Cancer",)),
    ),
    phases: Sequence[str] = ("PHASE3",),
) -> Trial:
    """Build an in-memory ORM Trial; each site is (city, province, cancer_types)."""
    trial = Trial(
        nct_number=nct,
        short_title_en="A trial",
        inclusion_criteria_en="Adults with the condition.",
        exclusion_criteria_en="Prior treatment in the last year.",
        phases=list(phases),
        treatment_type_names=["Immunotherapy"],
        intervention_names=["DrugX"],
        treatment_lines=["First Line"],
    )
    trial.sites = [
        TrialSite(
            state="Recruiting",
            cancer_type_names=list(cancers),
            location=Location(name_en="Site", city=city, province=province),
        )
        for city, province, cancers in sites
    ]
    return trial


class StubTrialSearch:
    """In-memory TrialSearch implementation; records calls, returns canned data."""

    def __init__(
        self,
        results: Sequence[TrialCitation] = (),
        by_nct: dict[str, TrialCitation] | None = None,
    ) -> None:
        self.results = list(results)
        self.by_nct = dict(by_nct or {})
        self.calls: list[tuple[str, object]] = []

    async def search(
        self, flt: object, *, limit: int | None = None
    ) -> list[TrialCitation]:
        self.calls.append(("search", flt))
        return list(self.results)

    async def keyword_search(
        self, query: str, *, limit: int | None = None
    ) -> list[TrialCitation]:
        self.calls.append(("keyword_search", query))
        return list(self.results)

    async def get_by_ncts(self, nct_numbers: list[str]) -> list[TrialCitation]:
        self.calls.append(("get_by_ncts", nct_numbers))
        return [self.by_nct[n] for n in nct_numbers if n in self.by_nct]


class StubGlossary:
    """In-memory GlossaryLookup; records calls, returns canned definitions."""

    def __init__(self, results: Sequence[GlossaryDefinition] = ()) -> None:
        self.results = list(results)
        self.calls: list[tuple[str, GlossarySource]] = []

    async def define(
        self, term: str, source: GlossarySource
    ) -> list[GlossaryDefinition]:
        self.calls.append((term, source))
        return list(self.results)


class FakeSessionFactory:
    """Async session factory whose session returns canned rows from execute()."""

    def __init__(self, rows: Sequence[object] = ()) -> None:
        rows = list(rows)
        self.result = MagicMock()
        scalars = self.result.scalars.return_value.unique.return_value
        scalars.all.return_value = rows
        scalars.one_or_none.return_value = rows[0] if rows else None
        self.session = MagicMock()
        self.session.execute = AsyncMock(return_value=self.result)

    def __call__(self) -> Any:
        session = self.session

        @asynccontextmanager
        async def _cm() -> Any:
            yield session

        return _cm()

    @property
    def last_statement(self) -> Any:
        """The SQLAlchemy statement passed to the most recent execute() call."""
        return self.session.execute.await_args.args[0]


def make_test_model(
    *, output: dict[str, Any] | None = None, call_tools: Any = "all"
) -> TestModel:
    """A mock LLM (TestModel) with optional forced output and tool-call selection."""
    kwargs: dict[str, Any] = {"call_tools": call_tools}
    if output is not None:
        kwargs["custom_output_args"] = output
    return TestModel(**kwargs)


def make_run_context(deps: AgentDeps) -> RunContext[AgentDeps]:
    """A minimal RunContext for calling tools directly."""
    return RunContext(deps=deps, model=TestModel(), usage=RunUsage())
