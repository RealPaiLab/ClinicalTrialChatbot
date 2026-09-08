from __future__ import annotations

from collections.abc import AsyncIterator

from langfuse import LangfuseSpan, propagate_attributes
from pydantic_ai.messages import ModelMessage

from agents.clinical_trials.agent import get_clinical_trials_agent
from agents.clinical_trials.dependencies import AgentDeps, TrialSearch
from agents.clinical_trials.guards import (
    conversation_nct_numbers,
    conversation_trial_refs,
    prefetch_referenced_trials,
    refusal_directive,
)
from agents.clinical_trials.output import AgentResponse
from agents.input_triage.agent import get_input_triage_agent
from agents.input_triage.output import RequestCategory, TriageDecision
from agents.input_triage.refusal import refusal_reason
from core.config import get_settings
from core.langfuse import get_langfuse_client, trace_id_from_session
from core.logger import get_logger
from repository.glossary_repository import GlossaryRepository
from schemas.chat import ChatResult
from services.conversation_service import (
    ConversationService,
    turn_count,
    user_facing_turns,
)
from services.vocabulary_service import VocabularyService

logger = get_logger(__name__)

StreamItem = AgentResponse | ChatResult


class ChatService:
    """Runs the clinical-trials agent for a session and streams the turn."""

    def __init__(
        self,
        conversation_service: ConversationService,
        trial_search: TrialSearch,
        vocabulary: VocabularyService | None = None,
    ) -> None:
        self._conversation_service = conversation_service
        self._trial_search = trial_search
        self._vocabulary = vocabulary
        self._clinical_agent = get_clinical_trials_agent()
        self._triage_agent = get_input_triage_agent()
        self._langfuse = get_langfuse_client()
        settings = get_settings()
        self._capture_content = settings.capture_patient_text
        self._triage_history_turns = settings.triage_history_turns

    async def _triage_turn(
        self, user_message: str, history: list[ModelMessage]
    ) -> tuple[TriageDecision, RequestCategory | None]:
        window = user_facing_turns(history, self._triage_history_turns)
        try:
            verdict = (
                await self._triage_agent.run(
                    user_message, message_history=window or None
                )
            ).output
            return verdict.decision, verdict.category
        except Exception as exc:
            logger.warning("Input triage failed, allowing turn: %s", type(exc).__name__)
            return TriageDecision.ALLOW, None

    def _to_chat_result(self, output: AgentResponse, deps: AgentDeps) -> ChatResult:
        trials = [
            deps.fetched_trials[ref]
            for ref in output.used_trial_refs
            if ref in deps.fetched_trials
        ]
        return ChatResult(
            message=output.message,
            trials=trials,
            follow_up_questions=output.follow_up_questions,
        )

    def _report_hallucination(
        self, span: LangfuseSpan, session_id: str, identifiers: list[str]
    ) -> None:
        """Flag a turn whose reply invented a trial, in logs and on the trace."""
        logger.warning(
            "Hallucinated trial identifiers (session=%s): %s", session_id, identifiers
        )
        span.update(
            level="WARNING",
            status_message=f"hallucinated trial: {', '.join(identifiers)}",
            metadata={"hallucinated_trials": identifiers},
        )

    async def stream_chat(
        self, session_id: str, user_message: str
    ) -> AsyncIterator[StreamItem]:
        deps = AgentDeps(
            trial_search=self._trial_search,
            glossary=GlossaryRepository(),
        )

        with (
            propagate_attributes(session_id=session_id),
            self._langfuse.start_as_current_observation(
                trace_context={"trace_id": trace_id_from_session(session_id)},
                name="chat-turn",
                as_type="span",
                input=user_message if self._capture_content else None,
            ) as span,
        ):
            try:
                if self._vocabulary is not None:
                    await self._vocabulary.refresh()
                history = await self._conversation_service.get_history(session_id)
                deps.known_refs = conversation_trial_refs(history)
                deps.known_ncts = conversation_nct_numbers(history)
                deps.memory = await self._conversation_service.get_memory(session_id)
                deps.turn_index = turn_count(history) + 1
                decision, category = await self._triage_turn(user_message, history)
                if decision is TriageDecision.REFUSE and category is not None:
                    deps.refusal_directive = refusal_directive(refusal_reason(category))
                else:
                    await prefetch_referenced_trials(deps, user_message)
                span.update(
                    metadata={
                        "triage_decision": decision.value,
                        "triage_category": category.value if category else None,
                    }
                )
                async with self._clinical_agent.run_stream(
                    user_message, deps=deps, message_history=history or None
                ) as result:
                    async for partial in result.stream_output(debounce_by=0.05):
                        yield partial
                    output = await result.get_output()
                    messages = result.all_messages()

                await self._conversation_service.save_history(session_id, messages)
                await self._conversation_service.save_memory(session_id, deps.memory)
                chat_result = self._to_chat_result(output, deps)
                observation_id = self._langfuse.get_current_observation_id() or ""
                chat_result.observation_id = observation_id
                if self._capture_content:
                    span.update(output=chat_result.message)
                if deps.hallucinated_refs:
                    self._report_hallucination(span, session_id, deps.hallucinated_refs)
                yield chat_result
            except Exception as exc:
                logger.exception(
                    "Chat turn failed (session=%s): %s", session_id, type(exc).__name__
                )
                span.update(
                    level="ERROR",
                    status_message=(
                        str(exc) if self._capture_content else type(exc).__name__
                    ),
                )
                raise

    async def reset(self, session_id: str) -> None:
        """Clear a session's history (e.g. the CLI 'new' command)."""
        await self._conversation_service.reset(session_id)
