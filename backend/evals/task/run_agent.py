from __future__ import annotations

from collections.abc import Awaitable, Callable
from typing import Any

from langfuse.api import DatasetItem
from pydantic_ai import Agent
from pydantic_ai.messages import (
    ModelMessage,
    ModelRequest,
    ModelResponse,
    TextPart,
    ToolCallPart,
    UserPromptPart,
)

from agents.clinical_trials.agent import get_clinical_trials_agent
from agents.clinical_trials.dependencies import AgentDeps, GlossaryLookup, TrialSearch
from agents.clinical_trials.output import AgentResponse
from core.dependencies import get_trial_search
from evals.schemas.output import AgentEvalOutput
from evals.schemas.tool_call import ToolCall
from evals.schemas.turn import Turn
from repository.glossary_repository import GlossaryRepository
from schemas.trial import TrialCitation

TaskFn = Callable[..., Awaitable[AgentEvalOutput]]


def _to_history(turns: list[Turn]) -> list[ModelMessage]:
    history: list[ModelMessage] = []
    for turn in turns:
        if turn.role == "user":
            history.append(ModelRequest(parts=[UserPromptPart(content=turn.content)]))
        else:
            history.append(ModelResponse(parts=[TextPart(content=turn.content)]))
    return history


def _split(turns: list[Turn]) -> tuple[str, list[ModelMessage]]:
    """Final user turn is the prompt; everything before it is replayed as history."""
    last_user = next(
        (i for i in range(len(turns) - 1, -1, -1) if turns[i].role == "user"), None
    )
    if last_user is None:
        raise ValueError("sample has no user turn")
    return turns[last_user].content, _to_history(turns[:last_user])


def _render_trial(citation: TrialCitation) -> str:
    parts = [
        citation.short_title_en or citation.official_title_en,
        citation.description_en,
        citation.inclusion_criteria_en,
    ]
    body = "\n".join(part for part in parts if part)
    return f"{citation.nct_number}: {body}" if citation.nct_number else body


def _tool_calls(messages: list[ModelMessage]) -> list[ToolCall]:
    return [
        ToolCall(name=part.tool_name, args=part.args_as_dict())
        for message in messages
        for part in message.parts
        if isinstance(part, ToolCallPart)
    ]


def build_task(
    *,
    agent: Agent[AgentDeps, AgentResponse] | None = None,
    trial_search: TrialSearch | None = None,
    glossary: GlossaryLookup | None = None,
) -> TaskFn:
    """Build the experiment task; deps default to the real ones (stub them in tests)."""

    async def run_agent_on_item(*, item: DatasetItem, **_: Any) -> AgentEvalOutput:
        the_agent = agent or get_clinical_trials_agent()
        deps = AgentDeps(
            trial_search=trial_search or get_trial_search(),
            glossary=glossary or GlossaryRepository(),
        )
        turns = [Turn.model_validate(t) for t in (item.input or [])]
        prompt, history = _split(turns)

        result = await the_agent.run(prompt, deps=deps, message_history=history)
        output = result.output

        return AgentEvalOutput(
            answer=output.message,
            contexts=[_render_trial(c) for c in deps.fetched_trials.values()],
            retrieved_ncts=list(deps.fetched_trials),
            used_ncts=output.used_nct_numbers,
            tool_calls=_tool_calls(result.all_messages()),
        )

    return run_agent_on_item
