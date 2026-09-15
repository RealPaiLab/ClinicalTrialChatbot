from __future__ import annotations

from pathlib import Path

import pytest
import yaml

from scripts.pipeline.config import STAGE_ORDER, PipelineConfig
from scripts.pipeline.orchestrator import STAGES, resolve

PIPELINES = Path(__file__).resolve().parents[1] / "scripts" / "pipelines.yaml"

# The source block has no defaults on purpose: the endpoint is the YAML's to state.
MINIMAL = {
    "source": {
        "kind": "api",
        "base_url": "https://api.example.test",
        "search_scope": "CA",
        "page_size": 100,
        "concurrency": 5,
    }
}


def test_the_shipped_config_parses_and_names_real_stages() -> None:
    """Catches a typo in the committed YAML. `${VAR}` placeholders stay literal:
    the environment is the run's business, not this test's."""
    document = yaml.safe_load(PIPELINES.read_text(encoding="utf-8"))

    for name in ("ctc", "ulc"):
        config = PipelineConfig.model_validate(document[name])
        assert set(config.stages) <= set(STAGES)


def test_each_source_kind_states_only_its_own_settings() -> None:
    """A scraper has no page size and an API has no status allowlist."""
    scrape = {"kind": "scrape", "base_url": "https://x", "concurrency": 2}
    config = PipelineConfig.model_validate({"source": scrape | {"statuses": ["Open"]}})

    assert config.source.kind == "scrape"
    with pytest.raises(ValueError, match="statuses"):
        PipelineConfig.model_validate({"source": scrape})
    with pytest.raises(ValueError):
        PipelineConfig.model_validate({"source": MINIMAL["source"] | {"statuses": []}})


def test_the_declared_stage_order_matches_the_runnable_stages() -> None:
    """The order is stated in config, in the orchestrator and in the YAML."""
    assert tuple(STAGES) == STAGE_ORDER
    assert tuple(PipelineConfig.model_validate(MINIMAL).stages) == STAGE_ORDER


def test_a_config_without_a_source_is_refused() -> None:
    """No default endpoint in code, so a config that names none cannot run."""
    with pytest.raises(ValueError, match="source"):
        PipelineConfig.model_validate({})


def test_an_unknown_key_fails_the_run_rather_than_being_ignored() -> None:
    """A typo in the YAML must not silently leave a setting at its default."""
    with pytest.raises(ValueError):
        PipelineConfig.model_validate(MINIMAL | {"diff": {"full_refesh": True}})


def test_stages_run_in_pipeline_order_however_they_are_requested() -> None:
    config = PipelineConfig.model_validate(MINIMAL)

    assert resolve(config, ["publish", "ingest"]) == ["ingest", "publish"]
    assert resolve(config, None) == config.stages


def test_an_unknown_stage_names_the_ones_that_exist() -> None:
    with pytest.raises(ValueError, match="ingest"):
        resolve(PipelineConfig.model_validate(MINIMAL), ["bogus"])
