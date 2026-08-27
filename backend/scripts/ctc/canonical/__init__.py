"""The source-agnostic trial record, and the projection of it that reaches the DB."""

from scripts.ctc.canonical.address import CanonicalAddress
from scripts.ctc.canonical.base import CanonicalBase
from scripts.ctc.canonical.collect import index_trials
from scripts.ctc.canonical.coordinator import CanonicalCoordinator
from scripts.ctc.canonical.identity import ID_NAMESPACE, derived_id
from scripts.ctc.canonical.normalize import BLANKS, clean, norm_text
from scripts.ctc.canonical.rows import (
    LOCATION_COLUMNS,
    SITE_COLUMNS,
    TRIAL_COLUMNS,
    LocationRow,
    SiteRow,
    TrialRow,
    to_location_rows,
    to_site_rows,
    to_trial_row,
)
from scripts.ctc.canonical.site import CanonicalSite
from scripts.ctc.canonical.trial import CanonicalTrial

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
    "derived_id",
    "index_trials",
    "norm_text",
    "to_location_rows",
    "to_site_rows",
    "to_trial_row",
]
