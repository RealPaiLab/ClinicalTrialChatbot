from __future__ import annotations

from langfuse.api import DatasetItem

from evals.schemas.output import AgentEvalOutput


async def run_agent_on_item(*, item: DatasetItem) -> AgentEvalOutput:
    """Run the clinical-trials agent over one dataset item (the experiment task)."""
    raise NotImplementedError
