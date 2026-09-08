"""Promote the prompt version validated on staging onto another label."""

from __future__ import annotations

import argparse

from langfuse import get_client

from core.config import get_settings
from core.prompts import promote_prompt


def main() -> None:
    settings = get_settings()
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--from-label", default="staging")
    parser.add_argument("--to-label", default="production")
    parser.add_argument(
        "--name",
        action="append",
        dest="names",
        help="Prompt name; repeatable. Defaults to every prompt the app fetches.",
    )
    args = parser.parse_args()

    names = args.names or [
        settings.langfuse_clinical_trials_prompt_name,
        settings.langfuse_triage_prompt_name,
    ]
    if not get_client().auth_check():
        raise SystemExit("Langfuse auth failed; check credentials and host.")

    for name in names:
        try:
            promote_prompt(name, from_label=args.from_label, to_label=args.to_label)
        except Exception as exc:
            raise SystemExit(
                f"Could not promote {name!r} from {args.from_label!r}: {exc}"
            ) from exc


if __name__ == "__main__":
    main()
