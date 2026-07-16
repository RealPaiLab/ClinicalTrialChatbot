from __future__ import annotations

import json
from collections.abc import AsyncIterator
from typing import Annotated

from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse

from core.dependencies import get_chat_service, get_turnstile_service
from core.errors import ChatErrorCode, error_code
from schemas.chat import ChatRequest, ChatResult
from services.chat_service import ChatService
from services.turnstile_service import TurnstileService

router = APIRouter(prefix="/chat", tags=["chat"])


def _sse(payload: dict[str, object]) -> str:
    return f"data: {json.dumps(payload)}\n\n"


@router.post("/stream")
async def stream_chat(
    request: ChatRequest,
    http_request: Request,
    chat_service: Annotated[ChatService, Depends(get_chat_service)],
    turnstile: Annotated[TurnstileService, Depends(get_turnstile_service)],
) -> StreamingResponse:
    client_ip: str | None = getattr(http_request.state, "client_ip", None)
    verified = await turnstile.ensure_verified(
        request.verification_id or request.session_id,
        request.turnstile_token,
        client_ip,
    )

    async def event_stream() -> AsyncIterator[str]:
        if not verified:
            yield _sse({"type": "error", "data": ChatErrorCode.TURNSTILE_FAILED.value})
            return
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
