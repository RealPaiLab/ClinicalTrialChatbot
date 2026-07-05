from __future__ import annotations

import hmac

from fastapi import APIRouter, BackgroundTasks, HTTPException, status

from core.config import get_settings
from evals.dataset import DATASET_NAME
from evals.runner.experiment import run_experiment
from schemas.evals import RemoteExperimentTrigger

router = APIRouter(prefix="/evals", tags=["evals"])


def _as_str(value: object) -> str | None:
    return str(value) if value is not None else None


@router.post("/run", status_code=status.HTTP_202_ACCEPTED)
async def trigger_experiment(
    trigger: RemoteExperimentTrigger, background: BackgroundTasks
) -> dict[str, str]:
    """Langfuse remote-trigger target: ack fast, run the experiment in background."""
    secret = get_settings().eval_webhook_secret
    if not secret:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE)
    provided = str(trigger.payload.get("secret") or "")
    if not hmac.compare_digest(provided, secret):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)

    background.add_task(
        run_experiment,
        dataset_name=trigger.dataset_name or DATASET_NAME,
        judge_model=_as_str(trigger.payload.get("judge_model")),
        run_name=_as_str(trigger.payload.get("run_name")),
    )
    return {"status": "accepted"}
