"""Publish the system prompt to Langfuse (creates a new labeled version)."""

from __future__ import annotations

from langfuse import get_client

from agents.clinical_trials.prompts import LOCAL_SYSTEM_PROMPT
from core.config import get_settings
from core.logger import get_logger

logger = get_logger(__name__)


def main() -> None:
    settings = get_settings()
    client = get_client()
    if not client.auth_check():
        raise SystemExit("Langfuse auth failed; check credentials and host.")
    client.create_prompt(
        name=settings.langfuse_prompt_name,
        prompt=LOCAL_SYSTEM_PROMPT,
        labels=[settings.langfuse_prompt_label],
        type="text",
    )
    logger.info(
        "Published prompt %r with label %r.",
        settings.langfuse_prompt_name,
        settings.langfuse_prompt_label,
    )


if __name__ == "__main__":
    main()
