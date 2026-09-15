from __future__ import annotations

from enum import StrEnum


class SourceCode(StrEnum):
    """Where a trial listing came from. One code per ingestion pipeline."""

    CTC = "ctc"
    ULC = "ulc"


SOURCE_NAMES: dict[SourceCode, str] = {
    SourceCode.CTC: "Cancer Trials Canada",
    SourceCode.ULC: "U-Link",
}

DEFAULT_SOURCE = SourceCode.CTC

# When two corpora list the same trial, the earlier one owns the shared narrative.
SOURCE_PRECEDENCE: tuple[SourceCode, ...] = (SourceCode.CTC, SourceCode.ULC)


def rank(source: str) -> int:
    """Lower wins. An unknown source ranks last rather than raising mid-pipeline."""
    codes = [code.value for code in SOURCE_PRECEDENCE]
    return codes.index(source) if source in codes else len(codes)
