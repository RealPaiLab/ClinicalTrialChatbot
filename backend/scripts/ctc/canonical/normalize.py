"""Text normalization shared by every source: the rules that decide what is blank."""

from __future__ import annotations

import re

BLANKS = frozenset({"", "none", "na", "n/a", "null", "-"})


def clean(value: object) -> str:
    """A raw cell/field value as a stripped string ('' for anything blank-ish)."""
    if value is None:
        return ""
    text = str(value).strip()
    return "" if text.lower() in BLANKS else text


def norm_text(value: object) -> str:
    """Lowercase, unify line endings and collapse whitespace."""
    raw = clean(value)
    if not raw:
        return ""
    return re.sub(r"\s+", " ", raw.replace("\r\n", "\n")).strip().lower()
