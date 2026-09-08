from __future__ import annotations

import uuid

from scripts.ctc.canonical.base import CanonicalBase
from scripts.ctc.canonical.fields import Blankable


class CanonicalAddress(CanonicalBase):
    id: uuid.UUID | None = None
    street: Blankable = None
    city: Blankable = None
    province: Blankable = None
    zipcode: Blankable = None
    is_primary: bool = False

    def as_text(self) -> str | None:
        """The one-line address the `locations.address` column holds."""
        parts = [self.street, self.city, self.province, self.zipcode]
        return ", ".join(part for part in parts if part) or None
