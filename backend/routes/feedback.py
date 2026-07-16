from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends
from langfuse import Langfuse

from core.config import Settings, get_settings
from core.langfuse import get_langfuse_client, trace_id_from_session
from schemas.feedback import FeedbackRequest

router = APIRouter(prefix="/feedback", tags=["feedback"])

FEEDBACK_SCORE_NAME = "user-feedback"


@router.post("")
async def submit_feedback(
    request: FeedbackRequest,
    langfuse: Annotated[Langfuse, Depends(get_langfuse_client)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> dict[str, str]:
    details = settings.is_development
    langfuse.create_score(
        trace_id=trace_id_from_session(request.session_id),
        observation_id=request.observation_id,
        name=FEEDBACK_SCORE_NAME,
        value=request.score,
        data_type="NUMERIC",
        comment=request.comment if details else None,
        metadata=(
            {"suggested_nct_numbers": request.suggested_nct_numbers}
            if details and request.suggested_nct_numbers
            else None
        ),
        score_id=f"{request.observation_id}-{FEEDBACK_SCORE_NAME}",
    )
    return {"status": "ok"}
