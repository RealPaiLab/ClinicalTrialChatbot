from unittest.mock import MagicMock

import pytest

from agents.clinical_trials import prompts
from agents.clinical_trials.prompts import LOCAL_SYSTEM_PROMPT, get_system_prompt


def test_falls_back_to_local_when_langfuse_unavailable(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    def boom() -> object:
        raise RuntimeError("langfuse down")

    monkeypatch.setattr(prompts, "get_langfuse_client", boom)
    assert get_system_prompt() == LOCAL_SYSTEM_PROMPT


def test_uses_langfuse_prompt_when_available(monkeypatch: pytest.MonkeyPatch) -> None:
    client = MagicMock()
    client.get_prompt.return_value.compile.return_value = "FETCHED PROMPT"
    monkeypatch.setattr(prompts, "get_langfuse_client", lambda: client)
    assert get_system_prompt() == "FETCHED PROMPT"
