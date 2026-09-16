"""Which rows belong to which source, as SQL the stages share."""

from __future__ import annotations

from sqlalchemy import ColumnElement, and_, exists, select
from sqlalchemy.orm import InstrumentedAttribute

from models import TrialSite


def lists_source(data_source: str) -> ColumnElement[bool]:
    """Array containment, so the GIN index on data_sources does the work."""
    return TrialSite.data_sources.contains([data_source])


def listed_by(
    trial_id: InstrumentedAttribute[object], data_source: str
) -> ColumnElement[bool]:
    """True for a trial this source lists at least one centre for."""
    return exists(
        select(1).where(and_(TrialSite.trial_id == trial_id, lists_source(data_source)))
    )
