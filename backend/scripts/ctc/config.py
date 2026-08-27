"""The `ctc` block of `pipelines.yaml`, validated on load."""

from __future__ import annotations

from pathlib import Path

from pydantic import BaseModel, ConfigDict, Field

from core.embeddings import EmbeddingProvider
from scripts.ctc.db.shadow import BUILD_SCHEMA, LIVE_SCHEMA
from scripts.ctc.db.swap import DEFAULT_KEEP_GENERATIONS, DEFAULT_LOCK_TIMEOUT
from scripts.ctc.paths import DATA_DIR
from scripts.ctc.sources.api import (
    DEFAULT_BASE_URL,
    DEFAULT_CONCURRENCY,
    DEFAULT_PAGE_SIZE,
    DEFAULT_SEARCH_SCOPE,
)
from scripts.ctc.stages import geocode as geocode_stage
from scripts.ctc.stages import validate as validate_stage

STAGE_ORDER: tuple[str, ...] = (
    "ingest",
    "diff",
    "build",
    "geocode",
    "embed",
    "validate",
    "publish",
)


class Strict(BaseModel):
    """A typo in the YAML should fail the run, not be silently ignored."""

    model_config = ConfigDict(extra="forbid")


class ApiSourceConfig(Strict):
    base_url: str = DEFAULT_BASE_URL
    search_scope: str = DEFAULT_SEARCH_SCOPE
    page_size: int = DEFAULT_PAGE_SIZE
    concurrency: int = DEFAULT_CONCURRENCY


class SourceConfig(Strict):
    kind: str = "api"
    api: ApiSourceConfig = Field(default_factory=ApiSourceConfig)
    output_dir: Path = DATA_DIR


class DiffConfig(Strict):
    strategy: str = "timestamp"
    full_refresh: bool = False


class BuildConfig(Strict):
    schema_name: str = Field(default=BUILD_SCHEMA, alias="schema")
    source_schema: str = LIVE_SCHEMA
    batch_size: int = 500


class GeocodeConfig(Strict):
    concurrency: int = geocode_stage.DEFAULT_CONCURRENCY
    limit: int | None = None


class EmbedConfig(Strict):
    provider: EmbeddingProvider | None = None
    batch_size: int | None = None
    limit: int | None = None
    batch_id: str | None = None
    force: bool = False


class ValidateConfig(Strict):
    max_trial_drop_pct: float = validate_stage.DEFAULT_MAX_DROP_PCT
    max_location_drop_pct: float = validate_stage.DEFAULT_MAX_DROP_PCT
    max_site_drop_pct: float = validate_stage.DEFAULT_MAX_DROP_PCT
    min_geocode_coverage: float = validate_stage.DEFAULT_MIN_GEOCODE_COVERAGE
    min_embedding_coverage: float = validate_stage.DEFAULT_MIN_EMBEDDING_COVERAGE
    coverage_must_not_regress: bool = True


class PublishConfig(Strict):
    keep_generations: int = DEFAULT_KEEP_GENERATIONS
    lock_timeout: str = DEFAULT_LOCK_TIMEOUT


class CtcConfig(Strict):
    source: SourceConfig = Field(default_factory=SourceConfig)
    diff: DiffConfig = Field(default_factory=DiffConfig)
    build: BuildConfig = Field(default_factory=BuildConfig)
    geocode: GeocodeConfig = Field(default_factory=GeocodeConfig)
    embed: EmbedConfig = Field(default_factory=EmbedConfig)
    validate_: ValidateConfig = Field(default_factory=ValidateConfig, alias="validate")
    publish: PublishConfig = Field(default_factory=PublishConfig)
    stages: list[str] = Field(default_factory=lambda: list(STAGE_ORDER))
