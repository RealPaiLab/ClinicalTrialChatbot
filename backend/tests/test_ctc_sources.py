from __future__ import annotations

from collections.abc import Callable

import httpx

from scripts.ctc.sources import CtcApiSource

BASE_URL = "https://api.example.test/api/studies"

Handler = Callable[[httpx.Request], httpx.Response]


def trial(source_id: str, nct: str, acronym: str) -> dict[str, object]:
    return {
        "id": source_id,
        "nctNumber": nct,
        "acronymOrProtocolId": acronym,
        "shortTitleEn": "A trial",
        "updatedAt": "2026-08-21T17:45:56.916749+00:00",
        "sites": [
            {
                "id": "a13daf58-cb15-4b8c-867e-4e8c8ed3c842",
                "nameEn": "Cross Cancer Institute",
                "addresses": [{"city": "Edmonton", "province": "Alberta"}],
                "state": "recruiting",
                "cancerTypes": [{"nameEn": "Sarcoma"}],
            }
        ],
    }


def build_source(handler: Handler, pages: list[int]) -> CtcApiSource:
    return CtcApiSource(
        base_url=BASE_URL,
        page_size=2,
        on_page=pages.append,
        transport=httpx.MockTransport(handler),
    )


async def test_every_page_is_fetched_and_parsed() -> None:
    served = [
        trial("11111111-1111-1111-1111-111111111111", "NCT01", "A-1"),
        trial("22222222-2222-2222-2222-222222222222", "NCT02", "A-2"),
        trial("33333333-3333-3333-3333-333333333333", "NCT03", "A-3"),
    ]

    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path.endswith("/count"):
            return httpx.Response(200, json={"totalCount": len(served)})
        page = int(request.url.params["page"])
        return httpx.Response(200, json={"studies": served[page * 2 : page * 2 + 2]})

    pages: list[int] = []
    records = await build_source(handler, pages).load()

    assert len(pages) == 2
    assert len(records.raw) == 3
    assert sorted(t.nct_number or "" for t in records.trials) == [
        "NCT01",
        "NCT02",
        "NCT03",
    ]
    assert records.trials[0].sites[0].cancer_type_names == ["Sarcoma"]


async def test_the_raw_payload_is_kept_alongside_the_records() -> None:
    """Capture stays lossless: coordinators have no column but must survive."""
    served = trial("11111111-1111-1111-1111-111111111111", "NCT01", "A-1")
    served["sites"][0]["coordinators"] = [{"email": "coordinator@example.org"}]  # type: ignore[index]

    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path.endswith("/count"):
            return httpx.Response(200, json={"totalCount": 1})
        return httpx.Response(200, json={"studies": [served]})

    records = await build_source(handler, []).load()

    assert records.raw == [served]
    assert records.trials[0].sites[0].coordinators[0].email == "coordinator@example.org"


async def test_a_trial_served_on_two_pages_is_kept_once() -> None:
    """Paging repeats a record when the corpus shifts mid-fetch."""
    repeated = trial("11111111-1111-1111-1111-111111111111", "NCT01", "A-1")

    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path.endswith("/count"):
            return httpx.Response(200, json={"totalCount": 4})
        return httpx.Response(200, json={"studies": [repeated]})

    records = await build_source(handler, []).load()

    assert len(records.raw) == 1
    assert len(records.trials) == 1
