from core.langfuse import setup_langfuse
from evals.dataset import DATASET_NAME
from evals.dataset.seed import seed_dataset


def main() -> None:
    setup_langfuse()
    count = seed_dataset(DATASET_NAME)
    print(f"Seeded {count} samples into Langfuse dataset '{DATASET_NAME}'.")


if __name__ == "__main__":
    main()
