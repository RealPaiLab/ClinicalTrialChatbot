from __future__ import annotations

import httpx
from pydantic_ai.retries import AsyncTenacityTransport, RetryConfig, wait_retry_after
from tenacity import retry_if_exception, stop_after_attempt, wait_exponential

_RETRYABLE_STATUS = {408, 409, 429, 500, 502, 503, 504}
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
