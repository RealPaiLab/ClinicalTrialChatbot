"""Run the stages, in order or one at a time.

Each stage can run alone, so anything it needs from an earlier one is loaded on
demand: the canonical records from the last ingest, the plan by re-diffing.
"""

from __future__ import annotations

import uuid
from collections.abc import Awaitable, Callable
from dataclasses import dataclass, field

from rich.console import Console
from rich.table import Table

from core.database import AsyncSessionFactory
from scripts.ctc.canonical import CanonicalTrial, index_trials
from scripts.ctc.config import CtcConfig
from scripts.ctc.paths import latest_canonical_path
from scripts.ctc.sources.api import CtcApiSource
from scripts.ctc.sources.base import TrialSource
from scripts.ctc.stages.build import build
from scripts.ctc.stages.diff import DiffPlan, build_plan, load_live, site_changes
from scripts.ctc.stages.embed import embed
from scripts.ctc.stages.geocode import geocode
from scripts.ctc.stages.ingest import ingest, load_canonical
from scripts.ctc.stages.publish import publish
from scripts.ctc.stages.validate import ValidationFailed, validate
from scripts.ctc.strategies import get_strategy

console = Console()

Rows = list[tuple[str, str]]


@dataclass(frozen=True, slots=True)
class StageOutcome:
    name: str
    rows: Rows


@dataclass
class RunContext:
    config: CtcConfig
    incoming: dict[uuid.UUID, CanonicalTrial] = field(default_factory=dict)
    plan: DiffPlan | None = None

    def source(self) -> TrialSource:
        api = self.config.source.api
        if self.config.source.kind != "api":
            raise ValueError(f"unknown source kind {self.config.source.kind!r}")
        return CtcApiSource(
            base_url=api.base_url,
            search_scope=api.search_scope,
            page_size=api.page_size,
            concurrency=api.concurrency,
        )

    def ensure_incoming(self) -> dict[uuid.UUID, CanonicalTrial]:
        if self.incoming:
            return self.incoming
        path = latest_canonical_path()
        if path is None:
            raise RuntimeError("no canonical dump found; run the ingest stage first")
        console.print(f"[dim]reading {path}[/dim]")
        self.incoming = index_trials(load_canonical(path))
        return self.incoming

    async def ensure_plan(self) -> DiffPlan:
        if self.plan is None:
            await _diff(self)
        assert self.plan is not None
        return self.plan


async def _ingest(context: RunContext) -> StageOutcome:
    trials, result = await ingest(context.source())
    context.incoming = index_trials(trials)
    context.plan = None
    return StageOutcome(
        "ingest",
        [
            ("records served", str(result.trials)),
            ("trials after combining", str(len(context.incoming))),
            ("raw", str(result.raw_path)),
            ("canonical", str(result.canonical_path)),
        ],
    )


async def _diff(context: RunContext) -> StageOutcome:
    incoming = context.ensure_incoming()
    strategy = get_strategy(context.config.diff.strategy)
    async with AsyncSessionFactory() as session:
        live = await load_live(session, strategy)
    plan = build_plan(
        incoming, live, strategy, full_refresh=context.config.diff.full_refresh
    )
    context.plan = plan

    moved = site_changes(incoming, live, plan)
    return StageOutcome(
        "diff",
        [
            ("unchanged", str(len(plan.unchanged))),
            ("changed", str(len(plan.changed))),
            ("added", str(len(plan.added))),
            ("removed", str(len(plan.removed))),
            ("to re-embed", str(len(plan.reembed))),
            ("to geocode", str(len(plan.geocode))),
            ("trials with site movement", str(len(moved))),
        ],
    )


async def _build(context: RunContext) -> StageOutcome:
    settings = context.config.build
    result = await build(
        context.ensure_incoming(),
        await context.ensure_plan(),
        schema=settings.schema_name,
        source=settings.source_schema,
        batch_size=settings.batch_size,
    )
    return StageOutcome(
        "build",
        [
            ("schema", result.schema),
            ("trials", str(result.trials)),
            ("locations", str(result.locations)),
            ("trial sites", str(result.trial_sites)),
            ("vectors carried", str(result.embeddings_carried)),
            ("coordinates carried", str(result.coordinates_carried)),
        ],
    )


async def _geocode(context: RunContext) -> StageOutcome:
    result = await geocode(
        schema=context.config.build.schema_name,
        concurrency=context.config.geocode.concurrency,
        limit=context.config.geocode.limit,
    )
    return StageOutcome(
        "geocode",
        [
            ("requested", str(result.requested)),
            ("resolved", str(result.resolved)),
            ("unresolved", str(result.unresolved)),
        ],
    )


async def _embed(context: RunContext) -> StageOutcome:
    settings = context.config.embed
    result = await embed(
        provider=settings.provider,
        schema=context.config.build.schema_name,
        batch_size=settings.batch_size,
        force=settings.force,
        limit=settings.limit,
        batch_id=settings.batch_id,
    )
    rows: Rows = [
        ("provider", result.provider.value),
        ("pending", str(result.pending)),
        ("embedded", str(result.embedded)),
    ]
    if result.batch_id:
        rows.append(("batch", result.batch_id))
    return StageOutcome("embed", rows)


async def _validate(context: RunContext) -> StageOutcome:
    settings = context.config.validate_
    report = await validate(
        schema=context.config.build.schema_name,
        live=context.config.build.source_schema,
        max_trial_drop_pct=settings.max_trial_drop_pct,
        max_location_drop_pct=settings.max_location_drop_pct,
        max_site_drop_pct=settings.max_site_drop_pct,
        min_geocode_coverage=settings.min_geocode_coverage,
        min_embed_coverage=settings.min_embedding_coverage,
        coverage_must_not_regress=settings.coverage_must_not_regress,
        provider=context.config.embed.provider,
    )
    rows: Rows = [
        (
            f"{'[green]pass[/green]' if check.passed else '[red]FAIL[/red]'}  "
            f"{check.name}",
            check.detail,
        )
        for check in report.checks
    ]
    outcome = StageOutcome("validate", rows)
    if not report.passed:
        _render(outcome)
        failed = ", ".join(check.name for check in report.failures)
        raise ValidationFailed(f"not publishing: {failed}")
    return outcome


async def _publish(context: RunContext) -> StageOutcome:
    settings = context.config.publish
    result = await publish(
        build=context.config.build.schema_name,
        live=context.config.build.source_schema,
        keep=settings.keep_generations,
        lock_timeout=settings.lock_timeout,
    )
    return StageOutcome(
        "publish",
        [
            ("archived as", result.archived),
            ("pruned", str(len(result.pruned))),
            ("generations kept", str(len(result.retained))),
        ],
    )


STAGES: dict[str, Callable[[RunContext], Awaitable[StageOutcome]]] = {
    "ingest": _ingest,
    "diff": _diff,
    "build": _build,
    "geocode": _geocode,
    "embed": _embed,
    "validate": _validate,
    "publish": _publish,
}


def _render(outcome: StageOutcome) -> None:
    table = Table(title=outcome.name, show_header=False, box=None, title_justify="left")
    for label, value in outcome.rows:
        table.add_row(label, value)
    console.print(table)
    console.print()


def resolve(config: CtcConfig, requested: list[str] | None) -> list[str]:
    """Which stages to run, always in the pipeline's declared order."""
    chosen = requested or config.stages
    unknown = [name for name in chosen if name not in STAGES]
    if unknown:
        raise ValueError(
            f"unknown stage(s) {', '.join(unknown)}; known: {', '.join(STAGES)}"
        )
    return [name for name in config.stages if name in set(chosen)]


async def run(config: CtcConfig, stages: list[str] | None = None) -> None:
    context = RunContext(config=config)
    for name in resolve(config, stages):
        _render(await STAGES[name](context))
