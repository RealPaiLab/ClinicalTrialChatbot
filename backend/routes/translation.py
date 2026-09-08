from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query

from core.dependencies import get_translation_service
from schemas.language import Language
from schemas.translation import TrialTranslation
from services.translation_service import TranslationService

router = APIRouter(prefix="/trials", tags=["translation"])


@router.get("/{trial_ref}/translation")
async def get_trial_translation(
    trial_ref: str,
    language: Annotated[Language, Query()],
    translation: Annotated[TranslationService, Depends(get_translation_service)],
    cached_only: Annotated[
        bool,
        Query(),
    ] = False,
) -> TrialTranslation:
    result = await translation.translate_trial(
        trial_ref, language, cached_only=cached_only
    )
    if result is None:
        raise HTTPException(status_code=404, detail=f"Trial {trial_ref} not found")
    return result
