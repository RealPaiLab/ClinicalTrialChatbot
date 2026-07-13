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
        secret_key: str,
        client: httpx.AsyncClient,
        ttl_seconds: int,
    ) -> None:
        self._enabled = bool(secret_key)
        self._secret_key = secret_key
        self._client = client
        self._ttl_seconds = ttl_seconds
        self._cleared: dict[str, float] = {}
        self._next_purge = 0.0

    @property
    def enabled(self) -> bool:
        return self._enabled

    def _is_cleared(self, client_key: str) -> bool:
        expires_at = self._cleared.get(client_key)
        if expires_at is None:
            return False
        if time.monotonic() >= expires_at:
            del self._cleared[client_key]
            return False
        return True

    def _purge_expired(self) -> None:
        """Best-effort sweep of expired sessions that never returned (throttled)."""
        now = time.monotonic()
        if now < self._next_purge:
            return
        self._next_purge = now + self._ttl_seconds
        self._cleared = {sid: exp for sid, exp in self._cleared.items() if exp > now}

    async def ensure_verified(
        self, client_key: str, token: str | None, remote_ip: str | None
    ) -> bool:
        """True if the client may proceed. Verifies once, then caches per client."""
        if not self._enabled:
            return True
        if self._is_cleared(client_key):
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
            self._purge_expired()
            self._cleared[client_key] = time.monotonic() + self._ttl_seconds
        return verified
