"""The tables this pipeline builds, archives and publishes."""

from models import Location, Trial, TrialSite

PIPELINE_TABLES = (Location, Trial, TrialSite)

PIPELINE_TABLE_NAMES: tuple[str, ...] = tuple(
    entity.__tablename__ for entity in PIPELINE_TABLES
)
