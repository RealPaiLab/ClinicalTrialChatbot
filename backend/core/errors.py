"""Classify internal exceptions into stable client error codes."""

from __future__ import annotations

from enum import StrEnum

from pydantic_ai.exceptions import (
    ModelHTTPError,
    UnexpectedModelBehavior,
    UsageLimitExceeded,
)


class ChatErrorCode(StrEnum):
    USAGE_LIMIT = "usage_limit"
    MODEL_UNAVAILABLE = "model_unavailable"
    MODEL_ERROR = "model_error"
    GENERIC = "generic"


def error_code(exc: Exception) -> ChatErrorCode:
    if isinstance(exc, UsageLimitExceeded):
        return ChatErrorCode.USAGE_LIMIT
    if isinstance(exc, ModelHTTPError):
        return ChatErrorCode.MODEL_UNAVAILABLE
    if isinstance(exc, UnexpectedModelBehavior):
        return ChatErrorCode.MODEL_ERROR
    return ChatErrorCode.GENERIC
