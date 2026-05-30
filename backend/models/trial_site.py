from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import ARRAY, ForeignKey, Index, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
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
        UniqueConstraint(
            "trial_id", "location_id", name="uq_trial_sites_trial_location"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    trial_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("trials.id", ondelete="CASCADE"), nullable=False
    )
    location_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("locations.id", ondelete="CASCADE"),
        nullable=False,
    )
    state: Mapped[str | None] = mapped_column(Text, nullable=True)
    cancer_type_names: Mapped[list[str]] = mapped_column(
        ARRAY(Text), nullable=False, server_default="{}"
    )

    trial: Mapped[Trial] = relationship("Trial", back_populates="sites")
    location: Mapped[Location] = relationship("Location", back_populates="sites")
