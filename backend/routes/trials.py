from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from core.dependencies import get_trial_search
from schemas.trial import TrialCitation
from services.trial_search_service import TrialSearchService

router = APIRouter(prefix="/trials", tags=["trials"])


@router.get("/{nct_number}")
async def get_trial(
    nct_number: str,
    trial_search: Annotated[TrialSearchService, Depends(get_trial_search)],
) -> TrialCitation:
    trials = await trial_search.get_by_ncts([nct_number])
    if not trials:
        raise HTTPException(status_code=404, detail=f"Trial {nct_number} not found")
    return trials[0]
