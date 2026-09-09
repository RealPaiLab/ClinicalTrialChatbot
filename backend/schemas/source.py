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
