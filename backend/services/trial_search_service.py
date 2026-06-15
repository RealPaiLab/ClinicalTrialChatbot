"""Trial search business logic"""

from __future__ import annotations

import unicodedata

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from core.config import get_settings
from core.embeddings import QueryEmbedder
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


def _fold(text: str) -> str:
    """Lowercase and strip accents (NFKD + drop combining marks)."""
    nfkd = unicodedata.normalize("NFKD", text)
    return "".join(c for c in nfkd if not unicodedata.combining(c)).lower()


def _site_matches_location(site: TrialSite, locations: list[str]) -> bool:
    if not locations:
        return True
    loc = site.location
    haystack = _fold(" ".join(x for x in (loc.city, loc.province, loc.name_en) if x))
    return any(_fold(term) in haystack for term in locations)


def _site_matches_cancer(site: TrialSite, cancer_types: list[str]) -> bool:
    if not cancer_types:
        return True
    haystack = _fold(" ".join(site.cancer_type_names))
    return any(_fold(term) in haystack for term in cancer_types)


def _site_in_province(site: TrialSite, province: str | None) -> bool:
    if not province:
        return True
    prov = site.location.province
    return prov is not None and _fold(province) in _fold(prov)


def _to_citation(
    trial: Trial,
    locations: list[str],
    cancer_types: list[str],
    restrict_province: str | None = None,
) -> TrialCitation:
    """Map an ORM trial to a citation, keeping only sites matching the filters."""
    sites = [
        s
        for s in trial.sites
        if _site_matches_location(s, locations)
        and _site_matches_cancer(s, cancer_types)
        and _site_in_province(s, restrict_province)
    ]
    return TrialCitation(
        nct_number=trial.nct_number,
        acronym_or_protocol_id=trial.acronym_or_protocol_id,
        short_title_en=trial.short_title_en,
        official_title_en=trial.official_title_en,
        description_en=trial.description_en,
        inclusion_criteria_en=trial.inclusion_criteria_en,
        exclusion_criteria_en=trial.exclusion_criteria_en,
        phases=list(trial.phases or []),
        treatment_type_names=list(trial.treatment_type_names or []),
        intervention_names=list(trial.intervention_names or []),
        treatment_lines=list(trial.treatment_lines or []),
        sites=[_to_site_info(s) for s in sites],
    )


class TrialSearchService:
    """Search facade over TrialRepository"""

    def __init__(
        self,
        session_factory: async_sessionmaker[AsyncSession],
        *,
        embedder: QueryEmbedder | None = None,
    ) -> None:
        self._session_factory = session_factory
        self._embedder = embedder
        settings = get_settings()
        self._default_limit = settings.search_default_limit
        self._restrict_province = (settings.restrict_to_province or "").strip() or None

    def _repository(self, session: AsyncSession) -> TrialRepository:
        return TrialRepository(session, restrict_to_province=self._restrict_province)

    def _filtered_citations(
        self, trials: list[Trial], flt: TrialFilter
    ) -> list[TrialCitation]:
        """Map trials to citations; drop trials with no site left after filtering."""
        citations = [
            _to_citation(t, flt.locations, flt.cancer_types, self._restrict_province)
            for t in trials
        ]
        site_filtered = bool(
            flt.locations or flt.cancer_types or self._restrict_province
        )
        return [c for c in citations if c.sites or not site_filtered]

    async def syntactic_search(
        self,
        flt: TrialFilter,
        *,
        query: str | None = None,
        limit: int | None = None,
        offset: int = 0,
    ) -> list[TrialCitation]:
        """Lexical search over the filters, optionally narrowed by a free-text query;
        returns only sites matching the filters."""
        async with self._session_factory() as session:
            trials = await self._repository(session).syntactic_search(
                flt, query=query, limit=limit or self._default_limit, offset=offset
            )
            return self._filtered_citations(trials, flt)

    async def semantic_search(
        self,
        flt: TrialFilter,
        *,
        query: str,
        limit: int | None = None,
        offset: int = 0,
    ) -> list[TrialCitation]:
        """Meaning-based search: hard filters narrow candidates, the query
        embedding ranks them by clinical fit; returns only matching sites."""
        if self._embedder is None:
            raise RuntimeError(
                "TrialSearchService was built without an embedder; "
                "semantic search is unavailable"
            )
        vector = await self._embedder.embed_query(query)
        async with self._session_factory() as session:
            trials = await self._repository(session).semantic_search(
                flt,
                query_embedding=vector,
                limit=limit or self._default_limit,
                offset=offset,
            )
            return self._filtered_citations(trials, flt)

    async def get_by_ncts(self, nct_numbers: list[str]) -> list[TrialCitation]:
        """Fetch full details for trials by NCT number."""
        async with self._session_factory() as session:
            trials = await self._repository(session).get_by_ncts(nct_numbers)
            return [_to_citation(t, [], [], self._restrict_province) for t in trials]
