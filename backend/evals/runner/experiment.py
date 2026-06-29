from __future__ import annotations

from langfuse import get_client
from langfuse.experiment import ExperimentResult

from core.config import get_settings
from core.llm import OpenAIModelName
from evals.adapters.langfuse_evaluators import build_evaluators
from evals.dataset import DATASET_NAME
from evals.task.run_agent import build_task


def _judge_model(model: str | None) -> str:
    """Resolve + validate the judge model against the shared OpenAIModelName enum."""
    return OpenAIModelName(model or get_settings().eval_llm_model).value


def run_experiment(
    *,
    dataset_name: str = DATASET_NAME,
    judge_model: str | None = None,
    run_name: str | None = None,
) -> ExperimentResult:
    """Run the agent over a Langfuse dataset and score it (sync; needs Langfuse up)."""
    dataset = get_client().get_dataset(dataset_name)
    return dataset.run_experiment(
        name=dataset_name,
        run_name=run_name,
        task=build_task(),
        evaluators=build_evaluators(_judge_model(judge_model)),
    )
