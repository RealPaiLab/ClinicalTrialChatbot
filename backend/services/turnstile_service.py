"""Gate chat turns behind a once-per-session Turnstile check."""

from __future__ import annotations

import time

import httpx

from core.turnstile import verify_turnstile_token


class TurnstileService:
    """Verifies Turnstile tokens and remembers cleared sessions (in-memory, TTL)."""

    def __init__(
        self,
        *,
        enabled: bool,
        secret_key: str,
        client: httpx.AsyncClient,
        ttl_seconds: int,
    ) -> None:
        self._enabled = enabled
        self._secret_key = secret_key
        self._client = client
        self._ttl_seconds = ttl_seconds
        self._cleared: dict[str, float] = {}

    @property
    def enabled(self) -> bool:
        return self._enabled

    def _is_cleared(self, session_id: str) -> bool:
        expires_at = self._cleared.get(session_id)
        if expires_at is None:
            return False
        if time.monotonic() >= expires_at:
            del self._cleared[session_id]
            return False
        return True

    async def ensure_verified(
        self, session_id: str, token: str | None, remote_ip: str | None
    ) -> bool:
        """True if the session may proceed. Verifies once, then caches per session."""
        if not self._enabled:
            return True
        if self._is_cleared(session_id):
            return True
        if not token:
            return False
        verified = await verify_turnstile_token(
            self._client,
            secret_key=self._secret_key,
            token=token,
            remote_ip=remote_ip,
        )
        if verified:
            self._cleared[session_id] = time.monotonic() + self._ttl_seconds
        return verified
