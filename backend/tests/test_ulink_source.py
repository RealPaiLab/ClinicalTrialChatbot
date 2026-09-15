from __future__ import annotations

from pathlib import Path

import httpx
from selectolax.parser import HTMLParser

from scripts.pipeline.sources.ulink import UlinkScrapeSource
from scripts.pipeline.sources.ulink.mapping import to_canonical
from scripts.pipeline.sources.ulink.parse import _contacts, parse_listing

FIXTURES = Path(__file__).parent / "fixtures" / "ulink"
FIRST_PAGE = (FIXTURES / "trials-page-0.html").read_text(encoding="utf-8")
LAST_PAGE = (FIXTURES / "trials-page-14.html").read_text(encoding="utf-8")
NEUROBLASTOMA = (FIXTURES / "trials-neuroblastoma-page-0.html").read_text(
    encoding="utf-8"
)
EMPTY_LISTING = "<html><body><div class='fiches-list'></div></body></html>"


def test_every_entry_on_a_page_is_parsed_with_its_facts_and_centres() -> None:
    """Facts come from the table, coordinates from the map script, and the
    criteria keep their list structure as indented bullets."""
    records = parse_listing(FIRST_PAGE)

    assert len(records) == 8
    assert all(record.nct_number for record in records)
    first = records[0]
    assert first.nid == "473"
    assert first.protocol_id == "EPG-HU1418-201"
    assert first.title.startswith("A Phase 2/3 Study to Characterize")
    assert (first.status, first.phase, first.last_posted) == (
        "Open",
        "II/III",
        "2026-08-14",
    )
    assert first.age == "18 Months to 18 Years"
    assert first.description is not None
    assert "\n\nThe study is in 2 parts." in first.description
    assert first.inclusion_criteria is not None
    assert first.inclusion_criteria.startswith("- Are ≥18 months to <18 years")
    assert "\n  - BM function:" in first.inclusion_criteria

    centre = first.centres[0]
    assert centre.name == "The Hospital for Sick Children"
    assert (centre.lat, centre.lon) == (43.6532, -79.347)
    assert [c.role for c in centre.contacts] == [
        "Medical contact",
        "Social worker/patient navigator contact",
        "Clinical research contact",
    ]


def test_contacts_pair_a_name_with_the_address_that_follows_it() -> None:
    """Entries hand-write this block, so names and links come in every layout."""
    body = HTMLParser(
        """<div class="panel-body">
        <h5>Medical contact</h5>
        <p><strong>&nbsp; Sarcoma -</strong>&nbsp;<strong>Dr. Jane Doe</strong></p>
        <p>&nbsp;<a href="mailto:stale@example.org">jane.doe@example.org</a></p>
        <div><b>Dr. John Roe</b></div>
        <div><b>Sam Poe</b></div>
        <div><a href="mailto:sam.poe@example.org">sam.poe@example.org</a></div>
        <h5>Social worker/patient navigator contact</h5>
        N/A
        <h5>Clinical research contact</h5>
        <p><a href="mailto:research@example.org">Research office</a></p>
        </div>"""
    ).css_first("div.panel-body")
    assert body is not None

    assert [(c.role, c.name, c.email) for c in _contacts(body)] == [
        ("Medical contact", "Sarcoma - Dr. Jane Doe", "jane.doe@example.org"),
        ("Medical contact", "Dr. John Roe", None),
        ("Medical contact", "Sam Poe", "sam.poe@example.org"),
        ("Clinical research contact", None, "research@example.org"),
    ]


def test_the_record_maps_onto_the_canonical_shape() -> None:
    record = parse_listing(FIRST_PAGE)[0].model_copy(
        update={"cancer_types": ["Neuroblastoma"]}
    )
    trial = to_canonical(record)

    assert trial.nct_number == "NCT07549321"
    assert trial.phases == ["PHASE2", "PHASE3"]
    assert trial.treatment_lines == [
        "First line treatment",
        "Disease relapse or progression",
    ]
    assert trial.age_range_text == "18 Months to 18 Years"
    assert trial.source_key == "473"
    assert trial.source_updated_at is not None
    assert trial.source_updated_at.isoformat() == "2026-08-14T00:00:00+00:00"

    site = trial.sites[0]
    assert site.state == "recruiting"
    assert site.cancer_type_names == ["Neuroblastoma"]
    assert (site.lat, site.lon) == (43.6532, -79.347)
    assert site.address is None
    assert len(site.coordinators) == 3


def _handler(request: httpx.Request) -> httpx.Response:
    """Page 0 leads to the last page; the tail pages all serve the same entries."""
    pathology = request.url.params.get("pathology")
    if pathology == "Neuroblastoma":
        return httpx.Response(200, text=NEUROBLASTOMA)
    if pathology is not None:
        return httpx.Response(200, text=EMPTY_LISTING)
    page = int(request.url.params["page"])
    return httpx.Response(200, text=FIRST_PAGE if page == 0 else LAST_PAGE)


async def test_every_listing_is_status_filtered_and_tags_come_from_the_index() -> None:
    """The site filters by status server-side, so nothing else is ever read, and
    a diagnosis is what its own filter says, not the free-text cell."""
    statuses: set[str | None] = set()

    def handler(request: httpx.Request) -> httpx.Response:
        statuses.add(request.url.params.get("statut"))
        return _handler(request)

    source = UlinkScrapeSource(
        base_url="https://u-link.test",
        statuses=["Open"],
        transport=httpx.MockTransport(handler),
    )

    records = await source.load()

    assert statuses == {"Open"}
    assert len(records.raw) == len(records.trials) == 13

    by_nct = {trial.nct_number: trial for trial in records.trials}
    assert by_nct["NCT07549321"].sites[0].cancer_type_names == ["Neuroblastoma"]
    assert by_nct["NCT06666348"].sites[0].cancer_type_names == []
