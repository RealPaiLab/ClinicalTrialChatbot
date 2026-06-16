from typing import Any, cast

import pytest

from core.embeddings import EmbeddingProvider
from schemas.trial import TrialFilter
from services.trial_search_service import (
    TrialSearchService,
    _fold,
    _site_matches_cancer,
    _site_matches_location,
    _site_matches_status,
    _to_citation,
)
from tests.factories import FakeSessionFactory, StubEmbedder, make_orm_trial


def test_fold_strips_accents() -> None:
    assert _fold("Montréal") == "montreal"
    assert _fold("QUÉBEC") == "quebec"


def test_site_matches_location_is_accent_insensitive() -> None:
    site = make_orm_trial("NCT-1").sites[0]
    assert _site_matches_location(site, ["montreal"]) is True
    assert _site_matches_location(site, ["toronto"]) is False
    assert _site_matches_location(site, []) is True


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
