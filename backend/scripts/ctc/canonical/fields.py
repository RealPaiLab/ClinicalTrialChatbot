"""Annotated field types: the shapes a source wraps values in, unwrapped on parse."""

from __future__ import annotations

from collections.abc import Sequence
from functools import partial
from typing import Annotated

from pydantic import BeforeValidator

from scripts.ctc.canonical.normalize import clean


def _labels(key: str, value: object) -> list[str]:
    """`[{'nameEn': 'Sarcoma'}, ...]` -> `['Sarcoma', ...]`, blanks dropped."""
    if not isinstance(value, Sequence) or isinstance(value, str | bytes):
        return []
    labels: list[str] = []
    for entry in value:
        raw = entry.get(key) if isinstance(entry, dict) else entry
        label = clean(raw)
        if label:
            labels.append(label)
    return labels


def _label(key: str, value: object) -> str | None:
    """`{'nameEn': 'Interventional'}` -> `'Interventional'`."""
    raw = value.get(key) if isinstance(value, dict) else value
    return clean(raw) or None


def _strings(value: object) -> list[str]:
    if not isinstance(value, Sequence) or isinstance(value, str | bytes):
        return []
    return [text for text in (clean(entry) for entry in value) if text]


NamesEn = Annotated[list[str], BeforeValidator(partial(_labels, "nameEn"))]
Names = Annotated[list[str], BeforeValidator(partial(_labels, "name"))]
NameEn = Annotated[str | None, BeforeValidator(partial(_label, "nameEn"))]
Name = Annotated[str | None, BeforeValidator(partial(_label, "name"))]
Strings = Annotated[list[str], BeforeValidator(_strings)]
Blankable = Annotated[str | None, BeforeValidator(lambda v: clean(v) or None)]
