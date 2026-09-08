"""Line-structure-preserving helpers for translating markdown."""

from __future__ import annotations

import re
from collections.abc import Mapping

# Leading indent plus an optional list marker ("- ", "* ", "1. ").
_LINE_PREFIX = re.compile(r"^(?:\s*(?:[-*+]|\d+[.)])\s+|\s*)")


def _lines(text: str) -> list[tuple[str, str]]:
    """Split into (prefix, prose) pairs, one per line, normalising CRLF."""
    normalised = text.replace("\r\n", "\n").replace("\r", "\n")
    pairs = []
    for line in normalised.split("\n"):
        match = _LINE_PREFIX.match(line)
        end = match.end() if match else 0
        pairs.append((line[:end], line[end:]))
    return pairs


def translatable_lines(text: str) -> list[str]:
    """The prose worth sending to a translator, markers stripped."""
    return [prose for _, prose in _lines(text) if prose.strip()]


def rebuild(text: str, translations: Mapping[str, str]) -> str:
    """Reassemble the text, swapping in translated prose and keeping structure."""
    return "\n".join(
        prefix + (translations.get(prose, prose) if prose.strip() else prose)
        for prefix, prose in _lines(text)
    )
