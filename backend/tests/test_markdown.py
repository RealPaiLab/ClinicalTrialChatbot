from utils.markdown import rebuild, translatable_lines

BULLETS = "Main criteria:\r\n\r\n* Has a diagnosis\r\n* Has measurable disease"


def upper(text: str) -> dict[str, str]:
    return {line: line.upper() for line in translatable_lines(text)}


def test_markers_and_blank_lines_are_not_sent_to_the_provider() -> None:
    assert translatable_lines(BULLETS) == [
        "Main criteria:",
        "Has a diagnosis",
        "Has measurable disease",
    ]


def test_bullets_survive_translation() -> None:
    out = rebuild(BULLETS, upper(BULLETS))
    assert out == "MAIN CRITERIA:\n\n* HAS A DIAGNOSIS\n* HAS MEASURABLE DISEASE"


def test_indented_and_numbered_markers_are_preserved() -> None:
    text = "Intro\n  * nested item\n1. first\n2) second"
    assert translatable_lines(text) == ["Intro", "nested item", "first", "second"]
    assert rebuild(text, upper(text)) == "INTRO\n  * NESTED ITEM\n1. FIRST\n2) SECOND"


def test_crlf_is_normalised_without_losing_breaks() -> None:
    assert rebuild("a\r\n\r\nb", {"a": "x", "b": "y"}) == "x\n\ny"


def test_untranslated_lines_fall_back_to_the_original() -> None:
    assert rebuild(BULLETS, {}) == BULLETS.replace("\r\n", "\n")


def test_a_merged_line_can_no_longer_swallow_a_bullet() -> None:
    """The real failure: NMT joined two list items, orphaning the second marker."""
    translations = {
        "Peripheral neuropathy": "Periphere Neuropathie Grad 2 * Hornhauterkrankung",
        "Has corneal disease": "Hat eine Hornhauterkrankung",
    }
    out = rebuild("* Peripheral neuropathy\n* Has corneal disease", translations)
    assert out.split("\n") == [
        "* Periphere Neuropathie Grad 2 * Hornhauterkrankung",
        "* Hat eine Hornhauterkrankung",
    ]
    # Even when the provider mangles one line, every bullet keeps its own marker.
    assert all(line.startswith("* ") for line in out.split("\n"))
