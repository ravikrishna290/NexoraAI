from fastapi import APIRouter
from backend.database.db_session import db
from backend.services.dataset_service import dataset_service

router = APIRouter(prefix="/sensors", tags=["Sensors"])

@router.get("")
def get_sensors():
    return db.sensors

@router.get("/smoke-iot")
def get_smoke_iot():
    return dataset_service.get_smoke_fire_snapshot()
