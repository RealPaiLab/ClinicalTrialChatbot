"""Trial search business logic"""

from __future__ import annotations

from collections.abc import Callable

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from core.config import get_settings
from core.embeddings import EmbeddingProvider, QueryEmbedder, get_embedder
from models.trial import Trial
from models.trial_site import TrialSite
from repository.trial_repository import TrialRepository
from schemas.provinces import split_locations
from schemas.trial import TrialCitation, TrialFilter, TrialSiteInfo
from utils.text import fold


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


def _site_matches_location(site: TrialSite, locations: list[str]) -> bool:
    if not locations:
        return True
    cities, provinces = split_locations(locations)
    loc = site.location
    if cities:
        city_hay = fold(" ".join(x for x in (loc.city, loc.name_en) if x))
        if not any(fold(c) in city_hay for c in cities):
            return False
    if provinces:
        province_hay = fold(loc.province or "")
        if not any(fold(p) in province_hay for p in provinces):
            return False
    return True


def _site_matches_cancer(site: TrialSite, cancer_types: list[str]) -> bool:
    if not cancer_types:
        return True
    haystack = fold(" ".join(site.cancer_type_names))
    return any(fold(term) in haystack for term in cancer_types)


def _site_in_province(site: TrialSite, province: str | None) -> bool:
    if not province:
        return True
    prov = site.location.province
    return prov is not None and fold(province) in fold(prov)


def _site_matches_status(site: TrialSite, statuses: list[str]) -> bool:
    if not statuses:
        return True
    if not site.state:
        return False
    haystack = fold(site.state)
    return any(fold(term) in haystack for term in statuses)


def _to_citation(
    trial: Trial,
    locations: list[str],
    cancer_types: list[str],
    statuses: list[str] | None = None,
    restrict_province: str | None = None,
) -> TrialCitation:
    """Map an ORM trial to a citation, keeping only sites matching the filters."""
    sites = [
        s
        for s in trial.sites
        if _site_matches_location(s, locations)
        and _site_matches_cancer(s, cancer_types)
        and _site_matches_status(s, statuses or [])
        and _site_in_province(s, restrict_province)
    ]
    return TrialCitation(
        trial_ref=trial.trial_ref,
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
        disease_stages=list(trial.disease_stages or []),
        sites=[_to_site_info(s) for s in sites],
    )


class TrialSearchService:
    """Search facade over TrialRepository"""

    def __init__(
        self,
        session_factory: async_sessionmaker[AsyncSession],
        *,
        embedder: QueryEmbedder | None = None,
        embedder_for: Callable[[EmbeddingProvider], QueryEmbedder] = get_embedder,
    ) -> None:
        self._session_factory = session_factory
        self._embedder = embedder
        self._embedder_for = embedder_for
        settings = get_settings()
        self._default_limit = settings.search_default_limit
        self._restrict_province = (settings.restrict_to_province or "").strip() or None
        self._default_provider = EmbeddingProvider(settings.embedding_provider)

    def _repository(self, session: AsyncSession) -> TrialRepository:
        return TrialRepository(session, restrict_to_province=self._restrict_province)

    def _filtered_citations(
        self, trials: list[Trial], flt: TrialFilter
    ) -> list[TrialCitation]:
        """Map trials to citations; drop trials with no site left after filtering."""
        citations = [
            _to_citation(
                t,
                flt.locations,
                flt.cancer_types,
                flt.statuses,
                self._restrict_province,
            )
            for t in trials
        ]
        site_filtered = bool(
            flt.locations or flt.cancer_types or flt.statuses or self._restrict_province
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
        provider: EmbeddingProvider | None = None,
        limit: int | None = None,
        offset: int = 0,
    ) -> list[TrialCitation]:
        """Meaning-based search: hard filters narrow candidates, the query
        embedding ranks them by clinical fit; returns only matching sites."""
        prov = provider or self._default_provider
        if prov == self._default_provider and self._embedder is not None:
            embedder = self._embedder
        elif prov == self._default_provider:
            raise RuntimeError(
                "TrialSearchService was built without an embedder; "
                "semantic search is unavailable"
            )
        else:
            embedder = self._embedder_for(prov)
        vector = await embedder.embed_query(query)
        async with self._session_factory() as session:
            trials = await self._repository(session).semantic_search(
                flt,
                query_embedding=vector,
                provider=prov,
                limit=limit or self._default_limit,
                offset=offset,
            )
            return self._filtered_citations(trials, flt)

    async def get_by_refs(self, trial_refs: list[str]) -> list[TrialCitation]:
        """Fetch full details for trials by ref."""
        async with self._session_factory() as session:
            trials = await self._repository(session).get_by_refs(trial_refs)
            return self._details(trials)

    async def get_by_ncts(self, nct_numbers: list[str]) -> list[TrialCitation]:
        """Fetch full details for the trials carrying these registry numbers."""
        async with self._session_factory() as session:
            trials = await self._repository(session).get_by_ncts(nct_numbers)
            return self._details(trials)

    def _details(self, trials: list[Trial]) -> list[TrialCitation]:
        return [
            _to_citation(t, [], [], restrict_province=self._restrict_province)
            for t in trials
        ]
