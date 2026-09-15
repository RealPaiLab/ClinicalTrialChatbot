"""Primary keys, derived from the business key rather than taken from the source."""

from __future__ import annotations

import uuid

from scripts.ctc.canonical.normalize import norm_text

ID_NAMESPACE = uuid.UUID("6f6a1a3e-0a1f-5c2b-9d5e-0d1a2b3c4d5e")


def derived_id(*parts: str | None) -> uuid.UUID:
    """The business key is the acronym/protocol ID plus the NCT number, or the
    site name."""
    return uuid.uuid5(ID_NAMESPACE, "|".join(norm_text(part) for part in parts))
