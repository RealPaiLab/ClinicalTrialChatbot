from __future__ import annotations

from langfuse import get_client
from langfuse.experiment import ExperimentResult

from core.config import get_settings
from evals.adapters.langfuse_evaluators import build_evaluators
from evals.dataset import DATASET_NAME
from evals.runner.judge import build_judge_model
from evals.task.run_agent import build_task


def run_experiment(
    *,
    dataset_name: str = DATASET_NAME,
    judge_model: str | None = None,
    run_name: str | None = None,
) -> ExperimentResult:
    """Run the agent over a Langfuse dataset and score it (sync; needs Langfuse up)."""
    settings = get_settings()
    dataset = get_client().get_dataset(dataset_name)
    return dataset.run_experiment(
        name=dataset_name,
        run_name=run_name,
        task=build_task(),
        evaluators=build_evaluators(build_judge_model(judge_model)),
        max_concurrency=settings.eval_max_concurrency,
    )
