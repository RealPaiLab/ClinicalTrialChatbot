"""Publish the agent, triage and translation prompts to Langfuse (labeled)."""

from __future__ import annotations

import argparse

from langfuse import get_client

from agents.clinical_trials.prompts import LOCAL_CLINICAL_TRIALS_PROMPT
from agents.input_triage.prompts import LOCAL_TRIAGE_PROMPT
from agents.translation.prompts import LOCAL_TRANSLATION_PROMPT
from core.config import Settings, get_settings
from core.prompts import publish_prompt

PROMPT_KEYS = ("clinical-trials", "triage", "translation")


def _targets(settings: Settings) -> dict[str, tuple[str, str]]:
    """Publishable prompts by CLI key, as (Langfuse name, local content)."""
    return {
        "clinical-trials": (
            settings.langfuse_clinical_trials_prompt_name,
            LOCAL_CLINICAL_TRIALS_PROMPT,
        ),
        "triage": (settings.langfuse_triage_prompt_name, LOCAL_TRIAGE_PROMPT),
        "translation": (
            settings.langfuse_translation_prompt_name,
            LOCAL_TRANSLATION_PROMPT,
        ),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--prompt",
        action="append",
        dest="prompts",
        choices=PROMPT_KEYS,
        help="Which prompt to publish; repeatable. Defaults to all of them.",
    )
    args = parser.parse_args()

    settings = get_settings()
    targets = _targets(settings)
    if not get_client().auth_check():
        raise SystemExit("Langfuse auth failed; check credentials and host.")

    for key in args.prompts or PROMPT_KEYS:
        name, content = targets[key]
        publish_prompt(name, content)


if __name__ == "__main__":
    main()
