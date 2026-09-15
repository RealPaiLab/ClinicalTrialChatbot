from __future__ import annotations

from scripts.pipeline.db.shadow import _build_tables
from scripts.pipeline.db.swap import _generation_name, _move_order, generation_prefix
from scripts.pipeline.db.tables import PIPELINE_TABLE_NAMES, PIPELINE_TABLES
from scripts.pipeline.stages.validate import (
    Check,
    ValidationReport,
    _coverage,
    _drop_pct,
)


def test_dependents_move_before_what_they_reference() -> None:
    """trial_sites points at both other tables, so it has to move first."""
    assert _move_order()[0] == "trial_sites"


def test_the_run_log_is_not_archived_with_the_corpus() -> None:
    """It records when a publish happened, so it has to outlive the swap."""
    assert "ingestion_runs" not in PIPELINE_TABLE_NAMES


def test_the_build_schema_only_holds_the_tables_the_swap_moves() -> None:
    """Anything else on Base would be created in ctc_build and left stranded."""
    assert _build_tables() == [entity.__table__ for entity in PIPELINE_TABLES]


def test_generation_names_sort_newest_last_so_listing_can_order_them() -> None:
    prefix = generation_prefix("ctc")
    name = _generation_name("ctc")

    assert name.startswith(prefix)
    assert sorted([f"{prefix}20260101T000000Z", name])[-1] == name


def test_each_pipeline_archives_under_its_own_prefix() -> None:
    """A shared prefix would let one pipeline's prune drop the other's generations."""
    assert generation_prefix("ctc") != generation_prefix("ulc")
    assert not _generation_name("ulc").startswith(generation_prefix("ctc"))


def test_a_shrinking_corpus_is_measured_against_what_is_live() -> None:
    assert _drop_pct(1000, 950) == 5.0
    assert _drop_pct(1000, 1200) == 0.0
    assert _drop_pct(0, 0) == 0.0


def test_coverage_of_an_empty_table_is_not_a_failure() -> None:
    """A first run has nothing live to compare against."""
    assert _coverage(0, 0) == 1.0
    assert _coverage(146, 148) < 1.0


def test_one_failed_check_fails_the_gate() -> None:
    report = ValidationReport(
        checks=[
            Check("volume", True, ""),
            Check("embedding coverage", False, "regressed"),
        ]
    )

    assert not report.passed
    assert [check.name for check in report.failures] == ["embedding coverage"]
