from __future__ import annotations

from langfuse.experiment import ExperimentResult


def run_experiment(run_name: str | None = None) -> ExperimentResult:
    """Run the dataset experiment via dataset.run_experiment and return the result."""
    raise NotImplementedError
