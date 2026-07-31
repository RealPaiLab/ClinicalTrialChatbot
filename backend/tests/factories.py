from __future__ import annotations

from collections.abc import Sequence
from contextlib import asynccontextmanager
from typing import Any
from unittest.mock import AsyncMock, MagicMock

from pydantic_ai import RunContext
from pydantic_ai.models.test import TestModel
from pydantic_ai.usage import RunUsage
from redis.exceptions import RedisError

from agents.clinical_trials.dependencies import AgentDeps
from evals.schemas.expected import ExpectedOutput
from evals.schemas.sample import EvalSample
from evals.schemas.tool_call import ToolCall
from evals.schemas.turn import Turn
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

    async def syntactic_search(
        self,
        flt: object,
        *,
        query: str | None = None,
        limit: int | None = None,
        offset: int = 0,
    ) -> list[TrialCitation]:
        self.calls.append(("syntactic_search", flt))
        return list(self.results)

    async def semantic_search(
        self,
        flt: object,
        *,
        query: str,
        limit: int | None = None,
    ) -> list[TrialCitation]:
        self.calls.append(("semantic_search", query))
        return list(self.results)

    async def get_by_ncts(self, nct_numbers: list[str]) -> list[TrialCitation]:
        self.calls.append(("get_by_ncts", nct_numbers))
        return [self.by_nct[n] for n in nct_numbers if n in self.by_nct]


class StubEmbedder:
    """In-memory QueryEmbedder; records queries, returns a canned vector."""

    def __init__(self, vector: list[float] | None = None) -> None:
        self.vector = vector if vector is not None else [0.1] * 1024
        self.queries: list[str] = []

    async def embed_query(self, text: str) -> list[float]:
        self.queries.append(text)
        return self.vector

    async def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return [self.vector for _ in texts]


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


class StubTranslationProvider:
    """Translation provider that prefixes each text; records every batch."""

    def __init__(self, *, fail: bool = False) -> None:
        self.fail = fail
        self.batches: list[tuple[list[str], str]] = []

    async def translate(self, texts: list[str], target: Any) -> list[str]:
        if self.fail:
            raise RuntimeError("provider down")
        self.batches.append((list(texts), str(target)))
        return [f"[{target}] {text}" for text in texts]

    async def aclose(self) -> None:
        return None

    @property
    def translated_texts(self) -> list[str]:
        return [text for batch, _ in self.batches for text in batch]


class FakeRedis:
    """Minimal async Redis double supporting mget and a setex pipeline."""

    def __init__(self, *, fail: bool = False) -> None:
        self.store: dict[str, str] = {}
        self.fail = fail

    async def mget(self, keys: Sequence[str]) -> list[bytes | None]:
        if self.fail:
            raise RedisError("redis down")
        return [
            self.store[k].encode("utf-8") if k in self.store else None for k in keys
        ]

    def pipeline(self, transaction: bool = True) -> Any:
        outer = self

        class _Pipe:
            def __init__(self) -> None:
                self.queued: list[tuple[str, str]] = []

            async def __aenter__(self) -> Any:
                return self

            async def __aexit__(self, *exc: object) -> None:
                return None

            def setex(self, key: str, ttl: int, value: str) -> None:
                self.queued.append((key, value))

            async def execute(self) -> None:
                if outer.fail:
                    raise RedisError("redis down")
                outer.store.update(dict(self.queued))

        return _Pipe()


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


def make_eval_sample(
    *,
    question: str = "breast cancer trials recruiting in Quebec",
    nct_numbers: Sequence[str] = ("NCT01", "NCT02"),
    expected_tools: Sequence[ToolCall] | None = None,
    glossary_terms: Sequence[str] = ("metastatic",),
    reference_facts: Sequence[str] | None = ("NCT01 is recruiting in Quebec.",),
) -> EvalSample:
    """Build a fully-populated single-turn EvalSample for eval-schema tests."""
    if expected_tools is None:
        expected_tools = [
            ToolCall(
                name="syntactic_search",
                args={"cancer_types": ["breast"], "locations": ["Quebec"]},
            )
        ]
    return EvalSample(
        input=[Turn(role="user", content=question)],
        expected=ExpectedOutput(
            nct_numbers=list(nct_numbers),
            expected_tools=list(expected_tools),
            glossary_terms=list(glossary_terms),
            reference_facts=list(reference_facts)
            if reference_facts is not None
            else None,
        ),
    )
