"""One fetch's record list as the set of trials the database will hold."""

from __future__ import annotations

import uuid
from collections.abc import Iterable

from scripts.ctc.canonical.site import CanonicalSite
from scripts.ctc.canonical.trial import CanonicalTrial


def _combine_records(first: CanonicalTrial, second: CanonicalTrial) -> CanonicalTrial:
    """Both records are current and each lists its own protocol's sites."""
    sites: dict[uuid.UUID, CanonicalSite] = {site.id: site for site in first.sites}
    for site in second.sites:
        sites.setdefault(site.id, site)
    newest = max(
        (t.source_updated_at for t in (first, second) if t.source_updated_at),
        default=None,
    )
    return first.model_copy(
        update={"sites": list(sites.values()), "source_updated_at": newest}
    )


def index_trials(trials: Iterable[CanonicalTrial]) -> dict[uuid.UUID, CanonicalTrial]:
    """Trials by primary key."""
    indexed: dict[uuid.UUID, CanonicalTrial] = {}
    for trial in trials:
        existing = indexed.get(trial.id)
        indexed[trial.id] = _combine_records(existing, trial) if existing else trial
    return indexed
