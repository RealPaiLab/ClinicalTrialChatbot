from __future__ import annotations

import json
from collections.abc import AsyncIterator
from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from core.dependencies import get_chat_service
from core.errors import error_code
from schemas.chat import ChatRequest, ChatResult
from services.chat_service import ChatService

router = APIRouter(prefix="/chat", tags=["chat"])


def _sse(payload: dict[str, object]) -> str:
    return f"data: {json.dumps(payload)}\n\n"


@router.post("/stream")
async def stream_chat(
    request: ChatRequest,
    chat_service: Annotated[ChatService, Depends(get_chat_service)],
) -> StreamingResponse:
    async def event_stream() -> AsyncIterator[str]:
        try:
            async for item in chat_service.stream_chat(
                request.session_id, request.user_message
            ):
                event_type = (
                    "ChatResult" if isinstance(item, ChatResult) else "AgentResponse"
                )
                yield _sse({"type": event_type, "data": item.model_dump()})
        except Exception as exc:
            yield _sse({"type": "error", "data": error_code(exc).value})

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
