from __future__ import annotations

from langfuse.experiment import EvaluatorFunction, RunEvaluatorFunction


def item_evaluators() -> list[EvaluatorFunction]:
    """The active item-level evaluators for an experiment run."""
    raise NotImplementedError


def run_evaluators() -> list[RunEvaluatorFunction]:
    """The active run-level (aggregate) evaluators for an experiment run."""
    raise NotImplementedError
