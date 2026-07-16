import argparse

from core.langfuse import setup_langfuse
from evals.dataset import DATASET_NAME
from evals.runner.experiment import run_experiment


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Run the clinical-trials eval experiment."
    )
    parser.add_argument("--dataset", default=DATASET_NAME)
    parser.add_argument("--judge-model", default=None)
    parser.add_argument("--run-name", default=None)
    args = parser.parse_args()

    setup_langfuse()
    result = run_experiment(
        dataset_name=args.dataset,
        judge_model=args.judge_model,
        run_name=args.run_name,
    )
    print(result.format())


if __name__ == "__main__":
    main()
