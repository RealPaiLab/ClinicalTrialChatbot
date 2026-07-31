from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query

from core.dependencies import get_translation_service
from schemas.language import Language
from schemas.translation import TrialTranslation
from services.translation_service import TranslationService

router = APIRouter(prefix="/trials", tags=["translation"])


@router.get("/{nct_number}/translation")
async def get_trial_translation(
    nct_number: str,
    language: Annotated[Language, Query()],
    translation: Annotated[TranslationService, Depends(get_translation_service)],
) -> TrialTranslation:
    result = await translation.translate_trial(nct_number, language)
    if result is None:
        raise HTTPException(status_code=404, detail=f"Trial {nct_number} not found")
    return result
