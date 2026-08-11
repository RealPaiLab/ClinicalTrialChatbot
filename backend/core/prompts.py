"""Langfuse prompt versioning: labeled fetch with a local fallback, plus seeding."""

from __future__ import annotations

from core.config import get_settings
from core.langfuse import get_langfuse_client
from core.logger import get_logger

logger = get_logger(__name__)


def fetch_prompt(name: str, fallback: str) -> str:
    """Return the Langfuse-versioned prompt, falling back to the local constant."""
    settings = get_settings()
    try:
        prompt = get_langfuse_client().get_prompt(
            name, label=settings.langfuse_prompt_label
        )
        return str(prompt.compile())
    except Exception as exc:
        logger.warning("Using local prompt %r (Langfuse fetch failed): %s", name, exc)
        return fallback


def seed_prompt(name: str, content: str) -> None:
    """Seed the Langfuse prompt on first run if it is not there yet."""
    settings = get_settings()
    if not settings.langfuse_seed_prompt:
        return
    client = get_langfuse_client()
    label = settings.langfuse_prompt_label
    try:
        client.get_prompt(name, label=label)
        return
    except Exception:
        pass
    try:
        if not client.auth_check():
            logger.warning("Prompt seed skipped: Langfuse is not reachable.")
            return
        client.create_prompt(name=name, prompt=content, labels=[label], type="text")
        logger.info("Seeded Langfuse prompt %r with label %r.", name, label)
    except Exception as exc:
        logger.warning("Prompt seed skipped (Langfuse unavailable): %s", exc)


def promote_prompt(name: str, *, from_label: str, to_label: str) -> int:
    """Move `to_label` onto the exact version that currently carries `from_label`."""
    client = get_langfuse_client()
    prompt = client.get_prompt(name, label=from_label, cache_ttl_seconds=0)
    version = int(prompt.version)
    client.update_prompt(name=name, version=version, new_labels=[to_label])
    logger.info(
        "Promoted prompt %r v%d from label %r to %r.",
        name,
        version,
        from_label,
        to_label,
    )
    return version


def publish_prompt(name: str, content: str) -> None:
    """Publish a new labeled version of the prompt (used by bootstrap_prompt.py)."""
    settings = get_settings()
    client = get_langfuse_client()
    client.create_prompt(
        name=name,
        prompt=content,
        labels=[settings.langfuse_prompt_label],
        type="text",
    )
    logger.info(
        "Published prompt %r with label %r.", name, settings.langfuse_prompt_label
    )
