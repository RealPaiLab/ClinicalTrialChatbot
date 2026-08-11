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


def test_promote_relabels_the_tested_version(monkeypatch: pytest.MonkeyPatch) -> None:
    client = MagicMock()
    client.get_prompt.return_value.version = 7
    monkeypatch.setattr(prompts, "get_langfuse_client", lambda: client)

    version = prompts.promote_prompt(
        "clinical-trial-chatbot-system", from_label="staging", to_label="production"
    )

    assert version == 7
    assert client.get_prompt.call_args.kwargs["label"] == "staging"
    # The tested version is re-labeled; nothing new is created from the local constant.
    client.create_prompt.assert_not_called()
    assert client.update_prompt.call_args.kwargs == {
        "name": "clinical-trial-chatbot-system",
        "version": 7,
        "new_labels": ["production"],
    }


def test_promote_raises_when_the_source_label_is_missing(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    client = MagicMock()
    client.get_prompt.side_effect = RuntimeError("no such label")
    monkeypatch.setattr(prompts, "get_langfuse_client", lambda: client)

    with pytest.raises(RuntimeError):
        prompts.promote_prompt(
            "clinical-trial-chatbot-system", from_label="staging", to_label="production"
        )
    client.update_prompt.assert_not_called()


def test_each_agent_fetches_its_own_prompt_name(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    client = MagicMock()
    monkeypatch.setattr(prompts, "get_langfuse_client", lambda: client)
    get_clinical_trials_prompt()
    get_triage_prompt()
    names = [call.args[0] for call in client.get_prompt.call_args_list]
    assert names == ["clinical-trial-chatbot-system", "clinical-trial-chatbot-triage"]
