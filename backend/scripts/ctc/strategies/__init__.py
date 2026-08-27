"""The change strategies a pipeline can name in its config."""

from collections.abc import Callable
from typing import cast

from scripts.ctc.strategies.base import ChangeStrategy
from scripts.ctc.strategies.timestamp import TimestampStrategy

StrategyFactory = Callable[[], ChangeStrategy[object]]

STRATEGIES: dict[str, StrategyFactory] = {
    TimestampStrategy.name: cast(StrategyFactory, TimestampStrategy),
}


def get_strategy(name: str) -> ChangeStrategy[object]:
    factory = STRATEGIES.get(name)
    if factory is None:
        known = ", ".join(sorted(STRATEGIES))
        raise ValueError(f"unknown change strategy {name!r} (known: {known})")
    return factory()


__all__ = ["STRATEGIES", "ChangeStrategy", "TimestampStrategy", "get_strategy"]
