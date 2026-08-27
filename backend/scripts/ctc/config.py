"""The `ctc` block of `pipelines.yaml`, validated on load."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field

from core.embeddings import EmbeddingProvider

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
    base_url: str
    search_scope: str
    page_size: int
    concurrency: int


class SourceConfig(Strict):
    kind: str = "api"
    api: ApiSourceConfig


class DiffConfig(Strict):
    strategy: str = "timestamp"
    full_refresh: bool = False


class BuildConfig(Strict):
    schema_name: str = Field(default="ctc_build", alias="schema")
    source_schema: str = "public"
    batch_size: int = 500


class GeocodeConfig(Strict):
    concurrency: int = 20
    limit: int | None = None


class EmbedConfig(Strict):
    provider: EmbeddingProvider | None = None
    batch_size: int | None = None
    limit: int | None = None
    batch_id: str | None = None
    force: bool = False


class ValidateConfig(Strict):
    max_trial_drop_pct: float = 5.0
    max_location_drop_pct: float = 5.0
    max_site_drop_pct: float = 5.0
    min_geocode_coverage: float = 0.95
    min_embedding_coverage: float = 0.99
    coverage_must_not_regress: bool = True


class PublishConfig(Strict):
    keep_generations: int = 3
    lock_timeout: str = "5s"


class CtcConfig(Strict):
    source: SourceConfig
    diff: DiffConfig = Field(default_factory=DiffConfig)
    build: BuildConfig = Field(default_factory=BuildConfig)
    geocode: GeocodeConfig = Field(default_factory=GeocodeConfig)
    embed: EmbedConfig = Field(default_factory=EmbedConfig)
    validate_: ValidateConfig = Field(default_factory=ValidateConfig, alias="validate")
    publish: PublishConfig = Field(default_factory=PublishConfig)
    stages: list[str] = Field(default_factory=lambda: list(STAGE_ORDER))
