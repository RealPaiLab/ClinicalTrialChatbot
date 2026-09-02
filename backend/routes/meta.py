from typing import Annotated

from fastapi import APIRouter, Depends

from core.dependencies import get_data_freshness_service
from schemas.ingestion import DataFreshness
from services.data_freshness_service import DataFreshnessService

router = APIRouter(prefix="/meta", tags=["meta"])


@router.get("/data-freshness")
async def data_freshness(
    service: Annotated[DataFreshnessService, Depends(get_data_freshness_service)],
) -> DataFreshness:
    """When the corpus was last published."""
    return await service.get()
