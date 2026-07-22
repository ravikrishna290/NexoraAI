from fastapi import APIRouter
from backend.services.dataset_service import dataset_service

router = APIRouter(prefix="/machines", tags=["Machines"])

@router.get("/health")
def get_machine_health(asset_id: str = "PUMP-P102"):
    return dataset_service.get_machine_health(asset_id)

@router.get("/dataset-records")
def get_ai4i_records(limit: int = 50):
    return dataset_service.ai4i_records[:limit]
