from typing import Any, cast

import pytest

from core.embeddings import EmbeddingProvider
from schemas.provinces import split_locations
from schemas.trial import TrialFilter
from services.trial_search_service import (
    TrialSearchService,
    _site_matches_cancer,
    _site_matches_location,
    _site_matches_status,
    _to_citation,
)
from tests.factories import FakeSessionFactory, StubEmbedder, make_orm_trial
from utils.text import fold


def test_fold_strips_accents() -> None:
    assert fold("Montréal") == "montreal"
    assert fold("QUÉBEC") == "quebec"


def test_site_matches_location_is_accent_insensitive() -> None:
    site = make_orm_trial("NCT-1").sites[0]
    assert _site_matches_location(site, ["montreal"]) is True
    assert _site_matches_location(site, ["toronto"]) is False
    assert _site_matches_location(site, []) is True


def test_split_locations_separates_a_city_province_pair() -> None:
    """A "City, Province" term must not be read as one very unusual city name."""
    assert split_locations(["London, Ontario"]) == (["London"], ["Ontario"])
    assert split_locations(["Ontario"]) == ([], ["Ontario"])
    assert split_locations(["London"]) == (["London"], [])
    assert split_locations(["Toronto,"]) == (["Toronto"], [])


def test_site_matches_location_accepts_a_city_province_pair() -> None:
    london = make_orm_trial("NCT-1", sites=[("London", "Ontario", ())]).sites[0]
    toronto = make_orm_trial("NCT-1", sites=[("Toronto", "Ontario", ())]).sites[0]

    assert _site_matches_location(london, ["London, Ontario"]) is True
    assert _site_matches_location(toronto, ["London, Ontario"]) is False


def test_site_matches_location_city_and_province_narrow_not_widen() -> None:
    ottawa = make_orm_trial("NCT-1", sites=[("Ottawa", "Ontario", ())]).sites[0]
    toronto = make_orm_trial("NCT-1", sites=[("Toronto", "Ontario", ())]).sites[0]
    # naming the parent province alongside the city must not keep the other city
    assert _site_matches_location(ottawa, ["Ottawa", "Ontario"]) is True
    assert _site_matches_location(toronto, ["Ottawa", "Ontario"]) is False


def test_to_citation_city_and_province_keeps_only_that_city() -> None:
    trial = make_orm_trial(
        "NCT-1",
        sites=[
            ("Ottawa", "Ontario", ("Breast Cancer",)),
            ("Toronto", "Ontario", ("Breast Cancer",)),
            ("London", "Ontario", ("Breast Cancer",)),
        ],
    )
    citation = _to_citation(trial, ["Ottawa", "Ontario"], [])
    assert [s.city for s in citation.sites] == ["Ottawa"]


def test_site_matches_cancer() -> None:
    site = make_orm_trial("NCT-1").sites[0]
    assert _site_matches_cancer(site, ["breast"]) is True
    assert _site_matches_cancer(site, ["lung"]) is False
    assert _site_matches_cancer(site, []) is True


def test_site_matches_status() -> None:
    site = make_orm_trial("NCT-1").sites[0]
    site.state = "recruiting"
    assert _site_matches_status(site, ["recruiting"]) is True
    assert _site_matches_status(site, ["opening_soon"]) is False
    assert _site_matches_status(site, []) is True


def test_to_citation_keeps_only_matching_status_sites() -> None:
    trial = make_orm_trial(
        "NCT-1",
        sites=[
            ("Montréal", "Quebec", ("Breast Cancer",)),
            ("Toronto", "Ontario", ("Lung Cancer",)),
        ],
    )
    trial.sites[0].state = "recruiting"
    trial.sites[1].state = "opening_soon"
    citation = _to_citation(trial, [], [], ["opening_soon"])
    assert len(citation.sites) == 1
    assert citation.sites[0].state == "opening_soon"


def test_to_citation_keeps_only_matching_sites() -> None:
    trial = make_orm_trial(
        "NCT-1",
        sites=[
            ("Montréal", "Quebec", ("Breast Cancer",)),
            ("Toronto", "Ontario", ("Lung Cancer",)),
        ],
    )
    citation = _to_citation(trial, ["quebec"], ["breast"])
    assert len(citation.sites) == 1
    assert citation.sites[0].city == "Montréal"


def test_to_citation_exposes_eligibility_and_treatment_context() -> None:
    trial = make_orm_trial("NCT-1")
    citation = _to_citation(trial, [], [])
    assert citation.inclusion_criteria_en
    assert citation.exclusion_criteria_en
    assert citation.treatment_type_names == ["Immunotherapy"]
    assert citation.intervention_names == ["DrugX"]
    assert citation.treatment_lines == ["First Line"]


async def test_syntactic_search_drops_trials_with_no_matching_site() -> None:
    trials = [
        make_orm_trial("NCT-match", sites=[("Montréal", "Quebec", ("Breast Cancer",))]),
        make_orm_trial("NCT-other", sites=[("Toronto", "Ontario", ("Lung Cancer",))]),
    ]
    service = TrialSearchService(cast(Any, FakeSessionFactory(trials)))
    result = await service.syntactic_search(
        TrialFilter(locations=["quebec"], cancer_types=["breast"])
    )
    assert [c.nct_number for c in result] == ["NCT-match"]


async def test_syntactic_search_with_query_keeps_unfiltered_sites() -> None:
    trial = make_orm_trial("NCT-1", sites=[("Toronto", "Ontario", ("Lung Cancer",))])
    service = TrialSearchService(cast(Any, FakeSessionFactory([trial])))
    result = await service.syntactic_search(TrialFilter(), query="lung")
    assert len(result) == 1
    assert len(result[0].sites) == 1


async def test_semantic_search_embeds_query_and_maps_citations() -> None:
    trial = make_orm_trial("NCT-1")
    embedder = StubEmbedder()
    service = TrialSearchService(
        cast(Any, FakeSessionFactory([trial])), embedder=embedder
    )
    result = await service.semantic_search(TrialFilter(), query="metastatic lung")
    assert embedder.queries == ["metastatic lung"]
    assert [c.nct_number for c in result] == ["NCT-1"]


async def test_semantic_search_drops_trials_with_no_matching_site() -> None:
    trials = [
        make_orm_trial("NCT-match", sites=[("Montréal", "Quebec", ("Breast Cancer",))]),
        make_orm_trial("NCT-other", sites=[("Toronto", "Ontario", ("Lung Cancer",))]),
    ]
    service = TrialSearchService(
        cast(Any, FakeSessionFactory(trials)), embedder=StubEmbedder()
    )
    result = await service.semantic_search(
        TrialFilter(locations=["quebec"], cancer_types=["breast"]), query="breast"
    )
    assert [c.nct_number for c in result] == ["NCT-match"]


async def test_semantic_search_without_embedder_raises() -> None:
    service = TrialSearchService(cast(Any, FakeSessionFactory()))
    with pytest.raises(RuntimeError, match="embedder"):
        await service.semantic_search(TrialFilter(), query="anything")


async def test_semantic_search_provider_override_uses_embedder_for() -> None:
    trial = make_orm_trial("NCT-1")
    default = StubEmbedder()
    other = StubEmbedder()
    service = TrialSearchService(
        cast(Any, FakeSessionFactory([trial])),
        embedder=default,
        embedder_for=lambda _provider: other,
    )
    override = next(p for p in EmbeddingProvider if p != service._default_provider)
    await service.semantic_search(
        TrialFilter(), query="metastatic lung", provider=override
    )
    assert other.queries == ["metastatic lung"]
    assert default.queries == []
