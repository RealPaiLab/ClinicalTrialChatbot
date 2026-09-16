"""Pure functions over one listing page: every field is inline in the HTML."""

from __future__ import annotations

import json
import re
from collections.abc import Iterator
from itertools import count

from selectolax.parser import HTMLParser, Node

from scripts.pipeline.canonical import clean
from scripts.pipeline.sources.ulink.records import (
    UlinkCentre,
    UlinkContact,
    UlinkRecord,
)

ENTRY = "div.fiche-info"
DIRECT_LINK = "i.fa-link[data-content]"
PAGER_LINK = "ul.pagination a[href]"
PATHOLOGY_OPTION = "select[name=pathology] option"
CENTRE_PANEL = "div.centers-list div.panel"

_NID = re.compile(r"[?&]nid=(\d+)")
_PAGE = re.compile(r"[?&]page=(\d+)")
_NCT = re.compile(r"NCT\d{8}")
_EMAIL = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
_CENTERS_LIST = "var centers_list = "
_TEXT = "-text"
_BULLET = r"\s*(?:-|\d+\.) "
# A blank line between two bullets is list markup leaking through, not a paragraph.
_BULLET_GAP = re.compile(rf"(?m)^({_BULLET}.*)\n\n(?={_BULLET})")
_BLOCKS = frozenset({"p", "div", "h4", "h5", "h6", "ul", "ol", "table", "tr"})

# Table cell labels, as the page spells them.
_FIELDS: dict[str, str] = {
    "Diagnosis": "diagnosis",
    "Study Status": "status",
    "Phase": "phase",
    "Age": "age",
    "Randomisation": "randomisation",
    "Line of treatment": "treatment_lines",
    "Routes of Treatment Administration": "routes",
    "Last Posted Update": "last_posted",
    "ClinicalTrials.gov #": "nct_number",
}
_SIDEBARS: dict[str, str] = {
    "International Sponsor": "sponsor",
    "Principal Investigators for Canadian Sites": "investigators",
}
_SECTIONS: dict[str, str] = {
    "Study Description": "description",
    "Inclusion Criteria": "inclusion_criteria",
    "Exclusion Criteria": "exclusion_criteria",
}


class ParseError(ValueError):
    """The page no longer looks the way the parser expects."""


def _optional(text: str) -> str | None:
    return clean(text.replace("\xa0", " ")) or None


def _emit(node: Node, depth: int, out: list[str], marker: str) -> None:
    """Block structure as line breaks, lists as indented bullets, inline as-is."""
    tag = node.tag
    if tag == _TEXT:
        out.append(re.sub(r"\s+", " ", node.text().replace("\xa0", " ")))
    elif tag == "br":
        out.append("\n")
    elif tag == "li":
        out.append(f"\n{'  ' * depth}{marker} ")
        _children(node, depth + 1, out)
    elif tag in _BLOCKS:
        out.append("\n")
        _children(node, depth, out)
        out.append("\n")
    else:
        _children(node, depth, out)


def _children(node: Node, depth: int, out: list[str]) -> None:
    numbering = count(1)
    for child in node.iter(include_text=True):
        numbered = node.tag == "ol" and child.tag == "li"
        _emit(child, depth, out, f"{next(numbering)}." if numbered else "-")


def block_text(nodes: list[Node]) -> str | None:
    """The readable text of a run of sibling nodes, blank lines between blocks."""
    out: list[str] = []
    for node in nodes:
        _emit(node, 0, out, "-")
    lines = [line.rstrip() for line in "".join(out).split("\n")]
    text = re.sub(r"\n{3,}", "\n\n", "\n".join(lines))
    return _optional(_BULLET_GAP.sub(r"\1\n", text))


def _cells(entry: Node) -> dict[str, str | None]:
    """Label/value pairs in the facts table; a `colspan` value is still one pair."""
    values: dict[str, str | None] = {}
    for row in entry.css("table tr"):
        cells = [cell.text() for cell in row.css("td")]
        for label, value in zip(cells[::2], cells[1::2], strict=False):
            field = _FIELDS.get(clean(label))
            if field:
                values[field] = _optional(value)
    return values


def _sidebars(entry: Node) -> dict[str, str | None]:
    """The sponsor and investigator boxes: a heading, then bare text."""
    values: dict[str, str | None] = {}
    for box in entry.css("div.content > div.row > div.col-sm-6"):
        heading = box.css_first("h5")
        if heading is None:
            continue
        field = _SIDEBARS.get(clean(heading.text()))
        heading.decompose()
        if field:
            values[field] = _optional(box.text())
    return values


def _sections(entry: Node) -> dict[str, list[Node]]:
    """Runs of siblings between the `h5` headings under `div.content`."""
    content = entry.css_first("div.content")
    if content is None:
        raise ParseError("entry has no content block")
    sections: dict[str, list[Node]] = {}
    current: list[Node] | None = None
    for child in content.iter():
        if child.tag == "h5":
            current = sections.setdefault(clean(child.text()), [])
        elif current is not None:
            current.append(child)
    return sections


def _title(entry: Node) -> tuple[str | None, str]:
    """`CODE - Title`; the code carries stray zero-width spaces on some entries."""
    heading = entry.css_first("div.header h4")
    if heading is None:
        raise ParseError("entry has no title")
    text = clean(heading.text().replace("​", ""))
    code, separator, title = text.partition(" - ")
    if not separator:
        return None, text
    return clean(code) or None, clean(title)


def _nid(entry: Node) -> str:
    link = entry.css_first(DIRECT_LINK)
    match = _NID.search(link.attributes.get("data-content") or "") if link else None
    if match is None:
        raise ParseError("entry has no direct link")
    return match.group(1)


def _email(anchor: Node) -> str | None:
    """The link text is the address a human sees; the href is sometimes stale."""
    text = clean(anchor.text())
    if _EMAIL.match(text):
        return text
    href = anchor.attributes.get("href") or ""
    return href.removeprefix("mailto:").strip() or None


def _contacts(body: Node) -> Iterator[UlinkContact]:
    """Role headings, then bold names each followed by a mailto link, in order."""
    role = ""
    waiting: str | None = None
    for child in body.iter(include_text=True):
        if child.tag == "h5":
            if waiting:
                yield UlinkContact(role=role, name=waiting)
            role, waiting = clean(child.text()), None
            continue
        if child.tag == _TEXT:
            continue
        name = _optional(" ".join(n.text() for n in child.css("strong, b")))
        anchor = child.css_first("a[href^='mailto:']")
        if name:
            if waiting:
                yield UlinkContact(role=role, name=waiting)
            waiting = name
        if anchor is not None:
            yield UlinkContact(role=role, name=waiting, email=_email(anchor))
            waiting = None
    if waiting:
        yield UlinkContact(role=role, name=waiting)


def _centres(
    entry: Node, coordinates: dict[str, tuple[float, float]]
) -> list[UlinkCentre]:
    centres: list[UlinkCentre] = []
    for panel in entry.css(CENTRE_PANEL):
        heading = panel.css_first("div.panel-heading a")
        collapse = panel.css_first("div.panel-collapse")
        if heading is None or collapse is None:
            raise ParseError("centre panel without heading or body")
        centre_id = collapse.attributes.get("id") or ""
        body = panel.css_first("div.panel-body")
        lat, lon = coordinates.get(centre_id, (None, None))
        centres.append(
            UlinkCentre(
                id=centre_id,
                name=clean(heading.text()),
                lat=lat,
                lon=lon,
                contacts=list(_contacts(body)) if body is not None else [],
            )
        )
    return centres


def parse_coordinates(tree: HTMLParser) -> dict[str, tuple[float, float]]:
    """The map script: centre element id to (lat, lon), across every entry."""
    for script in tree.css("script"):
        text = script.text().strip()
        if not text.startswith(_CENTERS_LIST + "{"):
            continue
        payload = json.loads(text.removeprefix(_CENTERS_LIST).rstrip(";"))
        return {
            centre["id"]: (float(centre["latitude"]), float(centre["longitude"]))
            for centres in payload.values()
            for centre in centres
        }
    return {}


def parse_entry(
    entry: Node, coordinates: dict[str, tuple[float, float]]
) -> UlinkRecord:
    code, title = _title(entry)
    cells = _cells(entry)
    sections = _sections(entry)
    nct = cells.get("nct_number")
    return UlinkRecord.model_validate(
        {
            **cells,
            **_sidebars(entry),
            **{
                field: block_text(sections.get(heading, []))
                for heading, field in _SECTIONS.items()
            },
            "nid": _nid(entry),
            "protocol_id": code,
            "title": title,
            "nct_number": nct if nct and _NCT.fullmatch(nct) else None,
            "centres": _centres(entry, coordinates),
        }
    )


def parse_listing(html: str) -> list[UlinkRecord]:
    tree = HTMLParser(html)
    coordinates = parse_coordinates(tree)
    return [parse_entry(entry, coordinates) for entry in tree.css(ENTRY)]


def parse_nids(html: str) -> list[str]:
    """Which entries a page lists, without parsing them."""
    return [_nid(entry) for entry in HTMLParser(html).css(ENTRY)]


def last_page(html: str) -> int:
    """The highest page the pager links to; a single page has no pager."""
    pages = [
        int(match.group(1))
        for link in HTMLParser(html).css(PAGER_LINK)
        for match in [_PAGE.search(link.attributes.get("href") or "")]
        if match
    ]
    return max(pages, default=0)


def parse_pathologies(html: str) -> list[str]:
    """The search form's controlled diagnosis vocabulary."""
    return [
        value
        for option in HTMLParser(html).css(PATHOLOGY_OPTION)
        if (value := clean(option.attributes.get("value") or ""))
    ]
