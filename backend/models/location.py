from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Double, Index, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base

if TYPE_CHECKING:
    from models.trial_site import TrialSite


class Location(Base):
    __tablename__ = "locations"
    __table_args__ = (
        Index("ix_locations_city", "city"),
        Index("ix_locations_province", "province"),
        Index("ix_locations_city_province", "city", "province"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    name_en: Mapped[str] = mapped_column(Text, nullable=False)
    name_fr: Mapped[str | None] = mapped_column(Text, nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    city: Mapped[str | None] = mapped_column(Text, nullable=True)
    province: Mapped[str | None] = mapped_column(Text, nullable=True)
    lat: Mapped[float | None] = mapped_column(Double, nullable=True)
    lon: Mapped[float | None] = mapped_column(Double, nullable=True)

    sites: Mapped[list[TrialSite]] = relationship(
        "TrialSite", back_populates="location", lazy="select"
    )
