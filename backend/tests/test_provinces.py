from schemas.provinces import canonical_province


def test_canonical_province_recognizes_provinces_accent_insensitive() -> None:
    assert canonical_province("Ontario") == "Ontario"
    assert canonical_province("  quebec ") == "Quebec"
    assert canonical_province("Québec") == "Quebec"
    assert canonical_province("british columbia") == "British Columbia"


def test_canonical_province_returns_none_for_cities() -> None:
    assert canonical_province("Ottawa") is None
    assert canonical_province("Toronto") is None
    assert canonical_province("Montréal") is None
