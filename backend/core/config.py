from functools import lru_cache

from pydantic import computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


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
    ollama_base_url: str = "http://localhost:11434/v1"
    openai_api_key: str | None = None

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
