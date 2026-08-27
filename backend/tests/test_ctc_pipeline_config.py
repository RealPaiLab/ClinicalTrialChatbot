from __future__ import annotations

from pathlib import Path

import pytest
import yaml

from scripts.ctc.config import CtcConfig
from scripts.ctc.envsubst import MissingVariable, expand
from scripts.ctc.orchestrator import STAGES, resolve

PIPELINES = Path(__file__).resolve().parents[1] / "scripts" / "pipelines.yaml"


def test_the_shipped_config_parses_and_names_real_stages() -> None:
    document = yaml.safe_load(PIPELINES.read_text(encoding="utf-8"))
    config = CtcConfig.model_validate(expand(document["ctc"]))

    assert set(config.stages) <= set(STAGES)


def test_an_unknown_key_fails_the_run_rather_than_being_ignored() -> None:
    """A typo in the YAML must not silently leave a setting at its default."""
    with pytest.raises(ValueError):
        CtcConfig.model_validate({"diff": {"full_refesh": True}})


def test_stages_run_in_pipeline_order_however_they_are_requested() -> None:
    config = CtcConfig.model_validate({})

    assert resolve(config, ["publish", "ingest"]) == ["ingest", "publish"]
    assert resolve(config, None) == config.stages


def test_an_unknown_stage_names_the_ones_that_exist() -> None:
    with pytest.raises(ValueError, match="ingest"):
        resolve(CtcConfig.model_validate({}), ["bogus"])


def test_a_referenced_variable_with_no_value_stops_the_run(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.delenv("CTC_TEST_VAR", raising=False)
    assert expand("${CTC_TEST_VAR:-fallback}") == "fallback"

    with pytest.raises(MissingVariable):
        expand({"api": {"base_url": "${CTC_TEST_VAR}"}})

    monkeypatch.setenv("CTC_TEST_VAR", "from-env")
    assert expand(["${CTC_TEST_VAR}", 5]) == ["from-env", 5]
