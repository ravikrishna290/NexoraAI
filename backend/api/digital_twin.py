from fastapi import APIRouter
from backend.database.db_session import db
from backend.services.dataset_service import dataset_service

router = APIRouter(prefix="/digital-twin", tags=["Digital Twin"])

@router.get("/graph")
def get_digital_twin_graph():
    return {
        "plant_id": "PLANT-01",
        "plant_name": "Refinery Alpha (Gujarat Complex)",
        "active_unit": "Hydrocracker Unit 2",
        "sensors": db.sensors,
        "workers": db.workers,
        "permits": db.permits,
        "machine_health": dataset_service.get_machine_health("PUMP-P102")
    }
