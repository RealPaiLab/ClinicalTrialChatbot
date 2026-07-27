from unittest.mock import MagicMock

import pytest

from agents.clinical_trials.prompts import (
    LOCAL_CLINICAL_TRIALS_PROMPT,
    get_clinical_trials_prompt,
)
from agents.input_triage.prompts import LOCAL_TRIAGE_PROMPT, get_triage_prompt
from core import prompts


def test_falls_back_to_local_when_langfuse_unavailable(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    def boom() -> object:
        raise RuntimeError("langfuse down")

    monkeypatch.setattr(prompts, "get_langfuse_client", boom)
    assert get_clinical_trials_prompt() == LOCAL_CLINICAL_TRIALS_PROMPT
    assert get_triage_prompt() == LOCAL_TRIAGE_PROMPT


def test_uses_langfuse_prompt_when_available(monkeypatch: pytest.MonkeyPatch) -> None:
    client = MagicMock()
    client.get_prompt.return_value.compile.return_value = "FETCHED PROMPT"
    monkeypatch.setattr(prompts, "get_langfuse_client", lambda: client)
    assert get_clinical_trials_prompt() == "FETCHED PROMPT"
    assert get_triage_prompt() == "FETCHED PROMPT"


def test_each_agent_fetches_its_own_prompt_name(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    client = MagicMock()
    monkeypatch.setattr(prompts, "get_langfuse_client", lambda: client)
    get_clinical_trials_prompt()
    get_triage_prompt()
    names = [call.args[0] for call in client.get_prompt.call_args_list]
    assert names == ["clinical-trial-chatbot-system", "clinical-trial-chatbot-triage"]
