from fastapi import APIRouter
from backend.database.db_session import db

router = APIRouter(prefix="/permits", tags=["Permits Hub"])

@router.get("")
def get_permits():
    return db.permits

@router.post("/{permit_id}/reject")
def reject_permit(permit_id: str):
    for p in db.permits:
        if p["permit_id"] == permit_id:
            p["status"] = "REJECTED"
            p["risk_level"] = "SAFE"
            return {"status": "SUCCESS", "message": f"Permit {permit_id} REJECTED by Safety Officer"}
    return {"status": "NOT_FOUND", "message": "Permit not found"}
