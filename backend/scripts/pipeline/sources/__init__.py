"""Where records come from; `build_source` picks the source for a config."""

from __future__ import annotations

from scripts.pipeline.config import ApiSourceConfig, SourceConfig
from scripts.pipeline.sources.api import CtcApiSource
from scripts.pipeline.sources.base import PageCallback, SourceRecords, TrialSource
from scripts.pipeline.sources.ulink import UlinkScrapeSource

__all__ = [
    "CtcApiSource",
    "PageCallback",
    "SourceRecords",
    "TrialSource",
    "UlinkScrapeSource",
    "build_source",
]


def build_source(config: SourceConfig) -> TrialSource:
    if isinstance(config, ApiSourceConfig):
        return CtcApiSource(
            base_url=config.base_url,
            search_scope=config.search_scope,
            page_size=config.page_size,
            concurrency=config.concurrency,
        )
    return UlinkScrapeSource(
        base_url=config.base_url,
        statuses=config.statuses,
        concurrency=config.concurrency,
    )
