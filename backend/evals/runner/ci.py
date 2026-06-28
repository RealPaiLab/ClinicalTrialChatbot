from __future__ import annotations

from langfuse.experiment import ExperimentResult, RunnerContext


def experiment(context: RunnerContext) -> ExperimentResult:
    """Entry point for the langfuse/experiment-action CI run.

    Runs the experiment via the injected context and raises
    RegressionError(result=..., metric=..., value=..., threshold=...) below threshold.
    """
    raise NotImplementedError
