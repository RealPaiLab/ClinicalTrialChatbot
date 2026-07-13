from __future__ import annotations

from starlette.datastructures import Headers
from starlette.types import ASGIApp, Receive, Scope, Send


def _client_ip_from_scope(scope: Scope) -> str | None:
    """Real client IP, preferring the proxy headers our edge nginx sets."""
    headers = Headers(scope=scope)
    real_ip = headers.get("x-real-ip")
    if real_ip:
        return real_ip.strip()
    forwarded = headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    client = scope.get("client")
    return client[0] if client else None


class ClientIPMiddleware:
    """Resolves the client IP once into request.state.client_ip."""

    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] == "http":
            state = scope.setdefault("state", {})
            state["client_ip"] = _client_ip_from_scope(scope)
        await self.app(scope, receive, send)
