"""The source-agnostic trial record, and the projection of it that reaches the DB."""

from scripts.pipeline.canonical.address import CanonicalAddress
from scripts.pipeline.canonical.base import CanonicalBase
from scripts.pipeline.canonical.collect import index_trials
from scripts.pipeline.canonical.coordinator import CanonicalCoordinator
from scripts.pipeline.canonical.identity import ID_NAMESPACE, derived_id
from scripts.pipeline.canonical.normalize import BLANKS, clean, norm_text
from scripts.pipeline.canonical.rows import (
    LOCATION_COLUMNS,
    SITE_COLUMNS,
    TRIAL_COLUMNS,
    LocationRow,
    SiteRow,
    TrialRow,
    collect_location_rows,
    to_coordinator_rows,
    to_location_rows,
    to_site_rows,
    to_trial_row,
)
from scripts.pipeline.canonical.site import CanonicalSite
from scripts.pipeline.canonical.trial import CanonicalTrial

__all__ = [
    "BLANKS",
    "ID_NAMESPACE",
    "LOCATION_COLUMNS",
    "SITE_COLUMNS",
    "TRIAL_COLUMNS",
    "CanonicalAddress",
    "CanonicalBase",
    "CanonicalCoordinator",
    "CanonicalSite",
    "CanonicalTrial",
    "LocationRow",
    "SiteRow",
    "TrialRow",
    "clean",
    "collect_location_rows",
    "derived_id",
    "index_trials",
    "norm_text",
    "to_coordinator_rows",
    "to_location_rows",
    "to_site_rows",
    "to_trial_row",
]
