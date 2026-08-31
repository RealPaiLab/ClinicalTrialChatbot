from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import ARRAY, ForeignKey, Index, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base

if TYPE_CHECKING:
    from models.location import Location
    from models.trial import Trial


class TrialSite(Base):
    __tablename__ = "trial_sites"
    __table_args__ = (
        Index("ix_trial_sites_state", "state"),
        Index(
            "ix_trial_sites_cancer_type_names_gin",
            "cancer_type_names",
            postgresql_using="gin",
        ),
    )

    trial_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("trials.id", ondelete="CASCADE"),
        primary_key=True,
    )
    location_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("locations.id", ondelete="CASCADE"),
        primary_key=True,
    )
    state: Mapped[str | None] = mapped_column(Text, nullable=True)
    cancer_type_names: Mapped[list[str]] = mapped_column(
        ARRAY(Text), nullable=False, server_default="{}"
    )
    coordinators: Mapped[list[dict[str, str | None]]] = mapped_column(
        JSONB, nullable=False, server_default="[]", deferred=True
    )

    trial: Mapped[Trial] = relationship("Trial", back_populates="sites")
    location: Mapped[Location] = relationship("Location", back_populates="sites")
