import httpx
from pydantic_ai.retries import AsyncTenacityTransport

from core.http_retry import _should_retry, build_retrying_client


def _status_error(status_code: int) -> httpx.HTTPStatusError:
    request = httpx.Request("POST", "http://test/v1/chat")
    response = httpx.Response(status_code, request=request)
    return httpx.HTTPStatusError("err", request=request, response=response)


def test_retries_retryable_statuses() -> None:
    assert _should_retry(_status_error(429))
    assert _should_retry(_status_error(503))


def test_does_not_retry_client_errors() -> None:
    assert not _should_retry(_status_error(400))
    assert not _should_retry(_status_error(404))


def test_retries_transient_network_errors() -> None:
    request = httpx.Request("POST", "http://test/v1/chat")
    assert _should_retry(httpx.ConnectError("refused", request=request))
    assert _should_retry(httpx.ReadTimeout("slow", request=request))


def test_does_not_retry_unrelated_exceptions() -> None:
    assert not _should_retry(ValueError("nope"))


def test_build_retrying_client_uses_tenacity_transport() -> None:
    client = build_retrying_client(max_retries=3, max_wait=10.0, read_timeout=30.0)
    assert isinstance(client._transport, AsyncTenacityTransport)
