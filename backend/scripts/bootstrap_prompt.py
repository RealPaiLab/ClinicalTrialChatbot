"""Publish the agent + triage system prompts to Langfuse (new labeled versions)."""

from __future__ import annotations

from langfuse import get_client

from agents.clinical_trials.prompts import LOCAL_CLINICAL_TRIALS_PROMPT
from agents.input_triage.prompts import LOCAL_TRIAGE_PROMPT
from core.config import get_settings
from core.prompts import publish_prompt


def main() -> None:
    settings = get_settings()
    if not get_client().auth_check():
        raise SystemExit("Langfuse auth failed; check credentials and host.")
    publish_prompt(
        settings.langfuse_clinical_trials_prompt_name, LOCAL_CLINICAL_TRIALS_PROMPT
    )
    publish_prompt(settings.langfuse_triage_prompt_name, LOCAL_TRIAGE_PROMPT)


if __name__ == "__main__":
    main()
