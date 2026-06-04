"""Trial search business logic"""

from __future__ import annotations

from core.config import get_settings
from models.trial import Trial
from models.trial_site import TrialSite
from repository.trial_repository import TrialRepository
from schemas.trial import TrialCitation, TrialFilter, TrialSiteInfo


def _to_site_info(site: TrialSite) -> TrialSiteInfo:
    loc = site.location
    return TrialSiteInfo(
        name_en=loc.name_en,
        address=loc.address,
        city=loc.city,
        province=loc.province,
        lat=loc.lat,
        lon=loc.lon,
        state=site.state,
        cancer_type_names=list(site.cancer_type_names),
    )


def _to_citation(trial: Trial) -> TrialCitation:
    return TrialCitation(
        nct_number=trial.nct_number,
        acronym_or_protocol_id=trial.acronym_or_protocol_id,
        short_title_en=trial.short_title_en,
        official_title_en=trial.official_title_en,
        description_en=trial.description_en,
        phases=list(trial.phases),
        sites=[_to_site_info(s) for s in trial.sites],
    )


class TrialSearchService:
    """Search facade over TrialRepository"""

    def __init__(self, trial_repository: TrialRepository) -> None:
        self._trial_repository = trial_repository
        self._default_limit = get_settings().search_default_limit

    async def search(
        self, flt: TrialFilter, *, limit: int | None = None
    ) -> list[TrialCitation]:
        """Structured search by cancer type, location, status, and phase."""
        trials = await self._trial_repository.filter_trials(
            flt, limit=limit or self._default_limit
        )
        return [_to_citation(t) for t in trials]

    async def keyword_search(
        self, query: str, *, limit: int | None = None
    ) -> list[TrialCitation]:
        """Substring search for vague or symptom-based queries."""
        trials = await self._trial_repository.keyword_search(
            query, limit=limit or self._default_limit
        )
        return [_to_citation(t) for t in trials]

    async def get_by_nct(self, nct_number: str) -> TrialCitation | None:
        """Fetch full details for one trial by NCT number."""
        trial = await self._trial_repository.get_by_nct(nct_number)
        return _to_citation(trial) if trial else None
