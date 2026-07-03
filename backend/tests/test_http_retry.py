import httpx
from pydantic_ai.retries import AsyncTenacityTransport

from core.http_retry import (
    _should_retry,
    aclose_retrying_client,
    build_retrying_client,
    get_retrying_client,
)


def _status_error(status_code: int) -> httpx.HTTPStatusError:
    request = httpx.Request("POST", "http://test/v1/chat")
    response = httpx.Response(status_code, request=request)
    return httpx.HTTPStatusError("err", request=request, response=response)


def test_retries_transient_statuses() -> None:
    assert _should_retry(_status_error(429))
    assert _should_retry(_status_error(503))
    assert _should_retry(_status_error(504))


def test_does_not_retry_non_idempotent_or_client_errors() -> None:
    assert not _should_retry(_status_error(400))
    assert not _should_retry(_status_error(404))
    assert not _should_retry(_status_error(409))
    assert not _should_retry(_status_error(500))


def test_retries_transient_network_errors() -> None:
    request = httpx.Request("POST", "http://test/v1/chat")
    assert _should_retry(httpx.ConnectError("refused", request=request))
    assert _should_retry(httpx.ReadTimeout("slow", request=request))


def test_does_not_retry_unrelated_exceptions() -> None:
    assert not _should_retry(ValueError("nope"))


def test_build_retrying_client_uses_tenacity_transport() -> None:
    client = build_retrying_client(max_retries=3, max_wait=10.0, read_timeout=30.0)
    assert isinstance(client._transport, AsyncTenacityTransport)


async def test_shared_client_is_singleton_and_closes() -> None:
    get_retrying_client.cache_clear()
    client = get_retrying_client()
    assert get_retrying_client() is client
    assert get_retrying_client.cache_info().currsize == 1

    await aclose_retrying_client()
    assert get_retrying_client.cache_info().currsize == 0
    assert client.is_closed
