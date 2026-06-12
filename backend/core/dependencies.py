from __future__ import annotations

from functools import lru_cache

from core.database import ReadOnlySessionFactory
from core.embeddings import get_embedder
from repository.conversation.factory import get_conversation_repository
from services.chat_service import ChatService
from services.conversation_service import ConversationService
from services.trial_search_service import TrialSearchService


@lru_cache
def get_chat_service() -> ChatService:
    return ChatService(
        ConversationService(get_conversation_repository()),
        trial_search=get_trial_search(),
    )


def get_trial_search() -> TrialSearchService:
    return TrialSearchService(ReadOnlySessionFactory, embedder=get_embedder())
