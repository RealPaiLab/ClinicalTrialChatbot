from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from core.dependencies import get_trial_search
from schemas.trial import TrialCitation
from services.trial_search_service import TrialSearchService

router = APIRouter(prefix="/trials", tags=["trials"])


@router.get("/{trial_ref}")
async def get_trial(
    trial_ref: str,
    trial_search: Annotated[TrialSearchService, Depends(get_trial_search)],
) -> TrialCitation:
    trials = await trial_search.get_by_refs([trial_ref.strip().upper()])
    if not trials:
        raise HTTPException(status_code=404, detail=f"Trial {trial_ref} not found")
    return trials[0]
