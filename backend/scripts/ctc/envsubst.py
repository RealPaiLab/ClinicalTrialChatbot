from __future__ import annotations

import os
import re

PATTERN = re.compile(r"\$\{([A-Za-z_][A-Za-z0-9_]*)(?::-([^}]*))?\}")


class MissingVariable(RuntimeError):
    """A config referenced a variable that is unset and has no default."""


def _replace(match: re.Match[str]) -> str:
    name, default = match.group(1), match.group(2)
    value = os.environ.get(name)
    if value is not None:
        return value
    if default is not None:
        return default
    raise MissingVariable(f"{name} is referenced by the pipeline config but unset")


def expand(value: object) -> object:
    """Substitute environment variables through a parsed YAML document."""
    if isinstance(value, str):
        return PATTERN.sub(_replace, value)
    if isinstance(value, dict):
        return {key: expand(item) for key, item in value.items()}
    if isinstance(value, list):
        return [expand(item) for item in value]
    return value
