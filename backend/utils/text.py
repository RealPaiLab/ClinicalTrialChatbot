"""Shared text helpers."""

from __future__ import annotations

import unicodedata


def fold(text: str) -> str:
    """Lowercase and strip accents (NFKD + drop combining marks)."""
    nfkd = unicodedata.normalize("NFKD", text)
    return "".join(c for c in nfkd if not unicodedata.combining(c)).lower()
