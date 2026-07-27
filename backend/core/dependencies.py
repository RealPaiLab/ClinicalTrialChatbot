from __future__ import annotations

from functools import lru_cache, partial

from core.config import get_settings
from core.database import ReadOnlySessionFactory, create_isolated_session_factory
from core.embeddings import get_embedder
from core.http_retry import get_retrying_client
from repository.conversation.factory import get_conversation_repository
from services.chat_service import ChatService
from services.conversation_service import ConversationService
from services.trial_search_service import TrialSearchService
from services.turnstile_service import TurnstileService


@lru_cache
def get_chat_service() -> ChatService:
    return ChatService(
        ConversationService(get_conversation_repository()),
        trial_search=get_trial_search(),
    )


@lru_cache
def get_turnstile_service() -> TurnstileService:
    settings = get_settings()
    return TurnstileService(
        enabled=not settings.is_development and bool(settings.turnstile_secret_key),
        secret_key=settings.turnstile_secret_key,
        client=get_retrying_client(),
        ttl_seconds=settings.turnstile_verify_ttl_seconds,
    )


def get_trial_search() -> TrialSearchService:
    return TrialSearchService(ReadOnlySessionFactory, embedder=get_embedder())


def get_isolated_trial_search() -> TrialSearchService:
    """Trial search on a private pool, for callers running in their own event loop."""
    return TrialSearchService(
        create_isolated_session_factory(), embedder=get_embedder()
    )


def get_debug_trial_search() -> TrialSearchService:
    return TrialSearchService(
        ReadOnlySessionFactory,
        embedder=get_embedder(instrument=False),
        embedder_for=partial(get_embedder, instrument=False),
    )
