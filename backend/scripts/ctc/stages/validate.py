"""The gate: what must hold before a build is allowed to replace the live tables."""

from __future__ import annotations

from dataclasses import dataclass, field

from sqlalchemy import func, select
from sqlalchemy.orm import DeclarativeBase, InstrumentedAttribute

from core.embeddings import EmbeddingProvider
from core.embeddings.columns import EMBEDDING_COLUMNS, resolve_provider
from models import Location, Trial
from scripts.ctc.db.shadow import BUILD_SCHEMA, LIVE_SCHEMA, counts, shadow_connection

DEFAULT_MAX_DROP_PCT = 5.0
DEFAULT_MIN_GEOCODE_COVERAGE = 0.95
DEFAULT_MIN_EMBEDDING_COVERAGE = 0.99


@dataclass(frozen=True, slots=True)
class Check:
    name: str
    passed: bool
    detail: str


@dataclass(frozen=True, slots=True)
class ValidationReport:
    checks: list[Check] = field(default_factory=list)

    @property
    def passed(self) -> bool:
        return all(check.passed for check in self.checks)

    @property
    def failures(self) -> list[Check]:
        return [check for check in self.checks if not check.passed]


class ValidationFailed(RuntimeError):
    """Raised instead of publishing a build that did not pass the gate."""


def _drop_pct(live: int, build: int) -> float:
    return 0.0 if live == 0 else max(0.0, (live - build) / live * 100)


def _coverage(filled: int, total: int) -> float:
    return 1.0 if total == 0 else filled / total


async def _column_coverage(
    schema: str, table: type[DeclarativeBase], column: InstrumentedAttribute[object]
) -> tuple[int, int]:
    """`count(column)` counts non-nulls, `count(*)` counts rows."""
    statement = select(func.count(column), func.count()).select_from(table)
    async with shadow_connection(schema) as connection:
        filled, total = (await connection.execute(statement)).one()
        return filled, total


async def validate(
    *,
    schema: str = BUILD_SCHEMA,
    live: str = LIVE_SCHEMA,
    max_trial_drop_pct: float = DEFAULT_MAX_DROP_PCT,
    max_location_drop_pct: float = DEFAULT_MAX_DROP_PCT,
    max_site_drop_pct: float = DEFAULT_MAX_DROP_PCT,
    min_geocode_coverage: float = DEFAULT_MIN_GEOCODE_COVERAGE,
    min_embed_coverage: float = DEFAULT_MIN_EMBEDDING_COVERAGE,
    coverage_must_not_regress: bool = True,
    provider: EmbeddingProvider | None = None,
) -> ValidationReport:
    active = resolve_provider(provider)

    build_counts = await counts(schema)
    live_counts = await counts(live)
    checks: list[Check] = []

    if build_counts["trials"] == 0:
        checks.append(Check("non-empty", False, "the build holds no trials"))
    else:
        checks.append(
            Check("non-empty", True, f"{build_counts['trials']} trials built")
        )

    for table, limit in (
        ("trials", max_trial_drop_pct),
        ("locations", max_location_drop_pct),
        ("trial_sites", max_site_drop_pct),
    ):
        dropped = _drop_pct(live_counts[table], build_counts[table])
        checks.append(
            Check(
                f"{table} volume",
                dropped <= limit,
                f"{live_counts[table]} -> {build_counts[table]} "
                f"({dropped:.1f}% drop, limit {limit:.1f}%)",
            )
        )

    for name, entity, column, minimum in (
        ("geocode coverage", Location, Location.lat, min_geocode_coverage),
        ("embedding coverage", Trial, EMBEDDING_COLUMNS[active], min_embed_coverage),
    ):
        build_filled, build_total = await _column_coverage(schema, entity, column)
        live_filled, live_total = await _column_coverage(live, entity, column)
        build_ratio = _coverage(build_filled, build_total)
        live_ratio = _coverage(live_filled, live_total)

        regressed = coverage_must_not_regress and build_ratio < live_ratio
        checks.append(
            Check(
                name,
                build_ratio >= minimum and not regressed,
                f"{build_filled}/{build_total} ({build_ratio:.1%}), "
                f"live {live_ratio:.1%}, minimum {minimum:.1%}"
                + (" — regressed" if regressed else ""),
            )
        )

    return ValidationReport(checks=checks)
