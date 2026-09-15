"""Where records come from. `build_source` is the registry: one factory per
config type, so a new source kind is a config class plus a registration here."""

from __future__ import annotations

from functools import singledispatch

from scripts.pipeline.config import ApiSourceConfig, ScrapeSourceConfig, SourceConfig
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


@singledispatch
def build_source(config: SourceConfig) -> TrialSource:
    raise ValueError(f"unknown source config {type(config).__name__}")


@build_source.register
def _(config: ApiSourceConfig) -> TrialSource:
    return CtcApiSource(
        base_url=config.base_url,
        search_scope=config.search_scope,
        page_size=config.page_size,
        concurrency=config.concurrency,
    )


@build_source.register
def _(config: ScrapeSourceConfig) -> TrialSource:
    return UlinkScrapeSource(
        base_url=config.base_url,
        statuses=config.statuses,
        concurrency=config.concurrency,
    )
