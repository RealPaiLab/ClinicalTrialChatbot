import os

os.environ.setdefault("LANGFUSE_TRACING_ENABLED", "False")
os.environ.setdefault("LANGFUSE_PUBLIC_KEY", "pk-test")
os.environ.setdefault("LANGFUSE_SECRET_KEY", "sk-test")

import pytest  # noqa: E402
from pydantic_ai.models.test import TestModel  # noqa: E402

import agents.clinical_trials.agent as agent_module  # noqa: E402


@pytest.fixture(autouse=True)
def _mock_llm(monkeypatch: pytest.MonkeyPatch) -> None:
    """Build the agent with a TestModel so no real provider/network is touched."""
    monkeypatch.setattr(agent_module, "get_llm", lambda *a, **k: TestModel())
    agent_module.get_clinical_trials_agent.cache_clear()
