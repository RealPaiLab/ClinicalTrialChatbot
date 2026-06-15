from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Query

from core.dependencies import get_trial_search
from core.embeddings import EmbeddingProvider
from schemas.trial import TrialCitation, TrialFilter
from services.trial_search_service import TrialSearchService

router = APIRouter(prefix="/debug", tags=["debug"])


@router.get("/trials")
async def search_trials(
    trial_search: Annotated[TrialSearchService, Depends(get_trial_search)],
    cancer_types: Annotated[list[str] | None, Query()] = None,
    locations: Annotated[list[str] | None, Query()] = None,
    statuses: Annotated[list[str] | None, Query()] = None,
    phases: Annotated[list[str] | None, Query()] = None,
    query: str | None = None,
    semantic: str | None = None,
    embedding_provider: EmbeddingProvider | None = None,
    limit: int = 10,
    offset: int = 0,
) -> list[TrialCitation]:
    """Browse/search trials."""
    flt = TrialFilter(
        cancer_types=cancer_types or [],
        locations=locations or [],
        statuses=statuses or [],
        phases=phases or [],
    )
    if semantic:
        return await trial_search.semantic_search(
            flt,
            query=semantic,
            provider=embedding_provider,
            limit=limit,
            offset=offset,
        )
    return await trial_search.syntactic_search(
        flt, query=query, limit=limit, offset=offset
    )
