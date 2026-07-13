from __future__ import annotations

import httpx

from core.logger import get_logger

logger = get_logger(__name__)

SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"


async def verify_turnstile_token(
    client: httpx.AsyncClient,
    *,
    secret_key: str,
    token: str,
    remote_ip: str | None = None,
) -> bool:
    """Validate a Turnstile token via Siteverify. Fail-closed on any error."""
    data = {"secret": secret_key, "response": token}
    if remote_ip:
        data["remoteip"] = remote_ip
    try:
        response = await client.post(SITEVERIFY_URL, data=data)
        payload = response.json()
    except (httpx.HTTPError, ValueError) as exc:
        logger.warning("Turnstile verification errored: %s", type(exc).__name__)
        return False
    success = bool(payload.get("success", False))
    if not success:
        logger.info("Turnstile rejected token: %s", payload.get("error-codes"))
    return success
