from __future__ import annotations

from functools import lru_cache

import httpx
from pydantic_ai.retries import AsyncTenacityTransport, RetryConfig, wait_retry_after
from tenacity import retry_if_exception, stop_after_attempt, wait_exponential

from core.config import get_settings

_RETRYABLE_STATUS = {408, 429, 502, 503, 504}
_RETRYABLE_NETWORK = (
    httpx.TimeoutException,
    httpx.ConnectError,
    httpx.ReadError,
    httpx.RemoteProtocolError,
)


def _should_retry(exc: BaseException) -> bool:
    if isinstance(exc, httpx.HTTPStatusError):
        return exc.response.status_code in _RETRYABLE_STATUS
    return isinstance(exc, _RETRYABLE_NETWORK)


def build_retrying_client(
    *, max_retries: int, max_wait: float, read_timeout: float
) -> httpx.AsyncClient:
    """An httpx.AsyncClient that retries transient failures with backoff."""
    transport = AsyncTenacityTransport(
        config=RetryConfig(
            retry=retry_if_exception(_should_retry),
            wait=wait_retry_after(
                fallback_strategy=wait_exponential(multiplier=1, max=max_wait),
                max_wait=max_wait,
            ),
            stop=stop_after_attempt(max_retries + 1),
            reraise=True,
        ),
        validate_response=lambda response: response.raise_for_status(),
    )
    return httpx.AsyncClient(
        transport=transport,
        timeout=httpx.Timeout(read_timeout, connect=10.0),
    )


@lru_cache
def get_retrying_client() -> httpx.AsyncClient:
    """Process-wide shared retrying client (injected into all model providers)."""
    settings = get_settings()
    return build_retrying_client(
        max_retries=settings.llm_max_retries,
        max_wait=settings.llm_retry_max_wait,
        read_timeout=settings.llm_request_timeout,
    )


async def aclose_retrying_client() -> None:
    """Close the shared client (call on app shutdown). No-op if never created."""
    if get_retrying_client.cache_info().currsize:
        await get_retrying_client().aclose()
        get_retrying_client.cache_clear()
