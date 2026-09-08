from __future__ import annotations

from scripts.ctc.stages.geocode import GeocodeResult, parse_coordinates


def test_geojson_coordinates_are_lon_first() -> None:
    """Storing them in the served order would put every Canadian site off Africa."""
    payload = {"features": [{"geometry": {"coordinates": [-79.4, 43.6]}}]}

    assert parse_coordinates(payload) == (43.6, -79.4)


def test_an_address_mapbox_cannot_place_yields_nothing() -> None:
    assert parse_coordinates({"features": []}) is None
    assert parse_coordinates({"features": [{"geometry": {}}]}) is None
    assert parse_coordinates({}) is None


def test_unresolved_addresses_are_reported_not_hidden() -> None:
    assert GeocodeResult(requested=148, resolved=146).unresolved == 2
