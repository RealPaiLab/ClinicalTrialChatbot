"""Trial search business logic"""

from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

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

    def __init__(self, session_factory: async_sessionmaker[AsyncSession]) -> None:
        self._session_factory = session_factory
        self._default_limit = get_settings().search_default_limit

    async def search(
        self, flt: TrialFilter, *, limit: int | None = None
    ) -> list[TrialCitation]:
        """Structured search by cancer type, location, status, and phase."""
        async with self._session_factory() as session:
            trials = await TrialRepository(session).filter_trials(
                flt, limit=limit or self._default_limit
            )
            return [_to_citation(t) for t in trials]

    async def keyword_search(
        self, query: str, *, limit: int | None = None
    ) -> list[TrialCitation]:
        """Substring search for vague or symptom-based queries."""
        async with self._session_factory() as session:
            trials = await TrialRepository(session).keyword_search(
                query, limit=limit or self._default_limit
            )
            return [_to_citation(t) for t in trials]

    async def get_by_ncts(self, nct_numbers: list[str]) -> list[TrialCitation]:
        """Fetch full details for trials by NCT number."""
        async with self._session_factory() as session:
            trials = await TrialRepository(session).get_by_ncts(nct_numbers)
            return [_to_citation(t) for t in trials]
