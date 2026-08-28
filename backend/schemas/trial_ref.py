from __future__ import annotations

import re
import uuid

REF_PREFIX = "CTC-"
REF_LENGTH = 8
REF_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"

TRIAL_REF_PATTERN = re.compile(rf"{REF_PREFIX}[{REF_ALPHABET}]{{{REF_LENGTH}}}")


def derived_ref(trial_id: uuid.UUID) -> str:
    """The ref for a trial id, e.g. "CTC-7K2M4QX9"."""
    bits = trial_id.int >> (128 - 5 * REF_LENGTH)
    chars = [
        REF_ALPHABET[(bits >> (5 * i)) & 0x1F] for i in reversed(range(REF_LENGTH))
    ]
    return REF_PREFIX + "".join(chars)


def is_trial_ref(value: str) -> bool:
    """Whether a string is a whole trial ref (not merely containing one)."""
    return TRIAL_REF_PATTERN.fullmatch(value.strip().upper()) is not None
