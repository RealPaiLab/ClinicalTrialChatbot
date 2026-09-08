from __future__ import annotations

import uuid

from scripts.ctc.canonical.base import CanonicalBase
from scripts.ctc.canonical.fields import Blankable


class CanonicalCoordinator(CanonicalBase):
    """Captured, never loaded: personal data stays out of the database."""

    id: uuid.UUID | None = None
    first_name: Blankable = None
    last_name: Blankable = None
    email: Blankable = None
    phone_number: Blankable = None
    phone_extension: Blankable = None
