from __future__ import annotations

import uuid

from pydantic import Field, computed_field

from scripts.ctc.canonical.address import CanonicalAddress
from scripts.ctc.canonical.base import CanonicalBase
from scripts.ctc.canonical.coordinator import CanonicalCoordinator
from scripts.ctc.canonical.fields import Blankable, NamesEn
from scripts.ctc.canonical.identity import derived_id


class CanonicalSite(CanonicalBase):
    source_id: uuid.UUID | None = Field(default=None, alias="id")
    name_en: str
    addresses: list[CanonicalAddress] = Field(default_factory=list)
    state: Blankable = None
    cancer_type_names: NamesEn = Field(default_factory=list, alias="cancerTypes")
    coordinators: list[CanonicalCoordinator] = Field(default_factory=list)

    @computed_field  # type: ignore[prop-decorator]
    @property
    def id(self) -> uuid.UUID:
        return derived_id(self.name_en)

    @property
    def address(self) -> CanonicalAddress | None:
        """The primary address, or the first. Sources ship exactly one so far."""
        if not self.addresses:
            return None
        return next((a for a in self.addresses if a.is_primary), self.addresses[0])
