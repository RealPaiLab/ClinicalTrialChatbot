from __future__ import annotations

from scripts.pipeline.stages.geocode import (
    GeocodeResult,
    parse_coordinates,
    parse_region,
)


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


def test_a_point_reverse_geocodes_to_its_city_and_province() -> None:
    """Coordinates without an address still yield the region the filters need."""
    payload = {
        "features": [
            {
                "properties": {
                    "context": {
                        "place": {"name": "Montréal"},
                        "region": {"name": "Quebec", "region_code": "QC"},
                    }
                }
            }
        ]
    }

    assert parse_region(payload) == ("Montréal", "Quebec")
    assert parse_region({"features": [{"properties": {"context": {}}}]}) is None
