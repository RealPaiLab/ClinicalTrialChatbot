from enum import StrEnum
from functools import lru_cache

from pydantic import computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Environment(StrEnum):
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    postgres_user: str = "ctc"
    postgres_password: str = "ctcpassword"
    postgres_db: str = "ctc_db"
    postgres_host: str = "localhost"
    postgres_port: int = 5432

    llm_provider: str = "ollama"
    llm_model: str = "qwen3"
    triage_llm_model: str | None = None
    triage_history_turns: int = 3
    ollama_base_url: str = "http://localhost:11434/v1"
    openai_api_key: str | None = None

    eval_llm_model: str = "gpt-5.4-mini"
    eval_webhook_secret: str | None = None
    eval_max_concurrency: int = 8
    eval_http_max_connections: int = 8

    embedding_provider: str = "openai"
    embedding_model: str = "text-embedding-3-large"
    embedding_batch_size: int = 16
    embedding_warmup: bool = False

    environment: Environment = Environment.DEVELOPMENT
    cors_allow_origins: list[str] = [
        "http://localhost:5173",
        "http://localhost:4173",
    ]
    langfuse_public_key: str | None = None
    langfuse_secret_key: str | None = None
    langfuse_host: str = "http://localhost:3000"
    langfuse_clinical_trials_prompt_name: str = "clinical-trial-chatbot-system"
    langfuse_triage_prompt_name: str = "clinical-trial-chatbot-triage"
    langfuse_translation_prompt_name: str = "clinical-trial-chatbot-translation"
    langfuse_prompt_label: str = "production"
    langfuse_seed_prompt: bool = True
    langfuse_capture_content: bool | None = None

    conversation_store: str = "memory"
    redis_url: str = "redis://localhost:6379/0"
    conversation_ttl_seconds: int = 3600

    translation_provider: str = "google"
    google_project_id: str | None = None
    # Falls back to llm_model when unset, like triage_llm_model.
    translation_llm_model: str | None = None
    translation_llm_retries: int = 2
    translation_llm_concurrency: int = 10
    translation_llm_fallback_max_lines: int = 20
    translation_request_timeout: float = 30.0
    # Cache keys are content-hashed, so they can never serve stale text and a
    # long TTL is strictly cheaper against a paid API. 30 days.
    translation_cache_ttl_seconds: int = 2_592_000

    search_default_limit: int = 5
    restrict_to_province: str | None = None

    turnstile_secret_key: str = ""
    turnstile_verify_ttl_seconds: int = 3600

    agent_tool_calls_limit: int = 10

    llm_max_retries: int = 3
    llm_retry_max_wait: float = 30.0
    llm_request_timeout: float = 60.0

    nci_glossary_base_url: str = "https://webapis.cancer.gov/glossary/v1"
    nci_drug_dictionary_base_url: str = "https://webapis.cancer.gov/drugdictionary/v1"

    @property
    def is_production(self) -> bool:
        return self.environment is Environment.PRODUCTION

    @property
    def capture_patient_text(self) -> bool:
        if self.langfuse_capture_content is not None:
            return self.langfuse_capture_content
        return not self.is_production

    @computed_field  # type: ignore[prop-decorator]
    @property
    def database_url(self) -> str:
        return (
            f"postgresql+asyncpg://{self.postgres_user}:{self.postgres_password}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()
