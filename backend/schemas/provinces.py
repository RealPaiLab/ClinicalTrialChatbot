from __future__ import annotations

from utils.text import fold

CANADIAN_PROVINCES: tuple[str, ...] = (
    "Alberta",
    "British Columbia",
    "Manitoba",
    "New Brunswick",
    "Newfoundland and Labrador",
    "Northwest Territories",
    "Nova Scotia",
    "Nunavut",
    "Ontario",
    "Prince Edward Island",
    "Quebec",
    "Saskatchewan",
    "Yukon",
)


_CANONICAL_BY_KEY: dict[str, str] = {fold(name): name for name in CANADIAN_PROVINCES}


def canonical_province(term: str) -> str | None:
    """Return the canonical province name if `term` names one, else None (a city)."""
    return _CANONICAL_BY_KEY.get(fold(term.strip()))


def split_locations(locations: list[str]) -> tuple[list[str], list[str]]:
    """Partition location terms into (cities, provinces); provinces are canonical."""
    cities: list[str] = []
    provinces: list[str] = []
    for term in locations:
        canonical = canonical_province(term)
        if canonical is not None:
            provinces.append(canonical)
        else:
            cities.append(term)
    return cities, provinces
