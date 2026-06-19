from __future__ import annotations

from collections.abc import AsyncIterator

from langfuse import propagate_attributes

from agents.clinical_trials.agent import get_clinical_trials_agent
from agents.clinical_trials.dependencies import AgentDeps, TrialSearch
from agents.clinical_trials.output import AgentResponse
from core.langfuse import get_langfuse_client, trace_id_from_session
from repository.glossary_repository import GlossaryRepository
from schemas.chat import ChatResult
from services.conversation_service import ConversationService

StreamItem = AgentResponse | ChatResult


class ChatService:
    """Runs the clinical-trials agent for a session and streams the turn."""

    def __init__(
        self, conversation_service: ConversationService, trial_search: TrialSearch
    ) -> None:
        self._conversation_service = conversation_service
        self._trial_search = trial_search
        self._agent = get_clinical_trials_agent()
        self._langfuse = get_langfuse_client()

    def _to_chat_result(self, output: AgentResponse, deps: AgentDeps) -> ChatResult:
        trials = [
            deps.fetched_trials[nct]
            for nct in output.used_nct_numbers
            if nct in deps.fetched_trials
        ]
        return ChatResult(
            message=output.message,
            trials=trials,
            follow_up_questions=output.follow_up_questions,
        )

    async def stream_chat(
        self, session_id: str, user_message: str
    ) -> AsyncIterator[StreamItem]:
        deps = AgentDeps(
            trial_search=self._trial_search,
            glossary=GlossaryRepository(),
        )
        history = await self._conversation_service.get_history(session_id)

        with (
            propagate_attributes(session_id=session_id),
            self._langfuse.start_as_current_observation(
                trace_context={"trace_id": trace_id_from_session(session_id)},
                name="chat-turn",
                as_type="span",
                input=user_message,
            ) as span,
        ):
            async with self._agent.run_stream(
                user_message, deps=deps, message_history=history or None
            ) as result:
                async for partial in result.stream_output(debounce_by=0.05):
                    yield partial
                output = await result.get_output()
                messages = result.all_messages()

            await self._conversation_service.save_history(session_id, messages)
            chat_result = self._to_chat_result(output, deps)
            observation_id = self._langfuse.get_current_observation_id()
            chat_result.observation_id = observation_id or ""
            span.update(output=chat_result.message)
            yield chat_result

    async def reset(self, session_id: str) -> None:
        """Clear a session's history (e.g. the CLI 'new' command)."""
        await self._conversation_service.reset(session_id)
