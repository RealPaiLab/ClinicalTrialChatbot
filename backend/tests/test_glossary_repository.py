from collections.abc import Callable

import httpx

from repository.glossary_repository import GlossaryRepository
from schemas.glossary import GlossarySource

_GLOSSARY_HIT = {
    "results": [
        {"termName": "metastatic", "definition": {"text": "the spread of cancer."}}
    ]
}


def _repo(handler: Callable[[httpx.Request], httpx.Response]) -> GlossaryRepository:
    return GlossaryRepository(transport=httpx.MockTransport(handler))


async def test_cancer_terms_uses_patient_glossary() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        assert "/Terms/search/Cancer.gov/Patient/en/" in str(request.url)
        return httpx.Response(200, json=_GLOSSARY_HIT)

    result = await _repo(handler).define("metastatic", GlossarySource.CANCER_TERMS)

    assert result[0].term == "metastatic"
    assert result[0].source is GlossarySource.CANCER_TERMS
    assert "spread of cancer" in result[0].definition


async def test_genetics_uses_health_professional_glossary() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        assert "/Terms/search/Genetics/HealthProfessional/en/" in str(request.url)
        return httpx.Response(
            200,
            json={
                "results": [
                    {
                        "termName": "allele",
                        "definition": {"text": "a version of a gene"},
                    }
                ]
            },
        )

    result = await _repo(handler).define("allele", GlossarySource.GENETICS)

    assert result[0].term == "allele"
    assert result[0].source is GlossarySource.GENETICS


async def test_drugs_use_drug_search_and_resolve_brand_name() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        url = str(request.url)
        assert "/Drugs/search" in url
        assert "query=gleevec" in url
        return httpx.Response(
            200,
            json={
                "results": [
                    {
                        "name": "imatinib mesylate",
                        "definition": {"text": "a kinase inhibitor."},
                    }
                ]
            },
        )

    result = await _repo(handler).define("gleevec", GlossarySource.DRUGS)

    assert result[0].term == "imatinib mesylate"
    assert result[0].source is GlossarySource.DRUGS
    assert "kinase inhibitor" in result[0].definition


async def test_returns_empty_on_http_error() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(500)

    assert await _repo(handler).define("x", GlossarySource.CANCER_TERMS) == []


async def test_returns_empty_for_blank_term() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        raise AssertionError("should not call the API for a blank term")

    assert await _repo(handler).define("   ", GlossarySource.DRUGS) == []
