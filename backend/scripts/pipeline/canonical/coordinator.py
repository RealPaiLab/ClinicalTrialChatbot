from __future__ import annotations

import uuid

from scripts.pipeline.canonical.base import CanonicalBase
from scripts.pipeline.canonical.fields import Blankable


class CanonicalCoordinator(CanonicalBase):
    """A person or office a patient can contact at a site."""

    id: uuid.UUID | None = None
    full_name: Blankable = None
    email: Blankable = None
    phone_number: Blankable = None
    phone_extension: Blankable = None
