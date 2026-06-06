from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from pgvector.sqlalchemy import Vector
from sqlalchemy import ARRAY, Index, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base

if TYPE_CHECKING:
    from models.trial_site import TrialSite


class Trial(Base):
    __tablename__ = "trials"
    __table_args__ = (
        Index("ix_trials_phases_gin", "phases", postgresql_using="gin"),
        Index(
            "ix_trials_treatment_type_names_gin",
            "treatment_type_names",
            postgresql_using="gin",
        ),
        Index(
            "ix_trials_intervention_names_gin",
            "intervention_names",
            postgresql_using="gin",
        ),
        # HNSW index created after seeding (requires non-null vectors).
        # Uncomment once embeddings are populated:
        # Index(
        #     "ix_trials_embedding_hnsw",
        #     "embedding",
        #     postgresql_using="hnsw",
        #     postgresql_with={"m": 16, "ef_construction": 64},
        #     postgresql_ops={"embedding": "vector_cosine_ops"},
        # ),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    acronym_or_protocol_id: Mapped[str | None] = mapped_column(Text, nullable=True)
    nct_number: Mapped[str | None] = mapped_column(Text, nullable=True)

    short_title_en: Mapped[str | None] = mapped_column(Text, nullable=True)
    short_title_fr: Mapped[str | None] = mapped_column(Text, nullable=True)
    official_title_en: Mapped[str | None] = mapped_column(Text, nullable=True)
    official_title_fr: Mapped[str | None] = mapped_column(Text, nullable=True)
    description_en: Mapped[str | None] = mapped_column(Text, nullable=True)
    description_fr: Mapped[str | None] = mapped_column(Text, nullable=True)
    inclusion_criteria_en: Mapped[str | None] = mapped_column(Text, nullable=True)
    inclusion_criteria_fr: Mapped[str | None] = mapped_column(Text, nullable=True)
    exclusion_criteria_en: Mapped[str | None] = mapped_column(Text, nullable=True)
    exclusion_criteria_fr: Mapped[str | None] = mapped_column(Text, nullable=True)

    phases: Mapped[list[str]] = mapped_column(
        ARRAY(Text), nullable=False, server_default="{}"
    )
    treatment_type_names: Mapped[list[str]] = mapped_column(
        ARRAY(Text), nullable=False, server_default="{}"
    )
    intervention_names: Mapped[list[str]] = mapped_column(
        ARRAY(Text), nullable=False, server_default="{}"
    )
    treatment_lines: Mapped[list[str]] = mapped_column(
        ARRAY(Text), nullable=False, server_default="{}"
    )

    study_type: Mapped[str | None] = mapped_column(Text, nullable=True)
    purpose: Mapped[str | None] = mapped_column(Text, nullable=True)
    sponsor_name: Mapped[str | None] = mapped_column(Text, nullable=True)

    embedding: Mapped[list[float] | None] = mapped_column(Vector(1024), nullable=True)

    sites: Mapped[list[TrialSite]] = relationship(
        "TrialSite", back_populates="trial", lazy="select"
    )
