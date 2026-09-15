from __future__ import annotations

import re
import uuid

from schemas.source import SourceCode

REF_LENGTH = 8
REF_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"

REF_PREFIXES: tuple[str, ...] = tuple(f"{code.upper()}-" for code in SourceCode)

TRIAL_REF_PATTERN = re.compile(
    rf"(?:{'|'.join(REF_PREFIXES)})[{REF_ALPHABET}]{{{REF_LENGTH}}}"
)


def derived_ref(trial_id: uuid.UUID, source: SourceCode) -> str:
    """The ref for a trial id, e.g. "CTC-7K2M4QX9". The prefix names the source
    that owns the listing; the rest is the id, so both sources spell one trial
    the same way past the dash."""
    bits = trial_id.int >> (128 - 5 * REF_LENGTH)
    chars = [
        REF_ALPHABET[(bits >> (5 * i)) & 0x1F] for i in reversed(range(REF_LENGTH))
    ]
    return f"{source.upper()}-" + "".join(chars)


def is_trial_ref(value: str) -> bool:
    """Whether a string is a whole trial ref (not merely containing one)."""
    return TRIAL_REF_PATTERN.fullmatch(value.strip().upper()) is not None
