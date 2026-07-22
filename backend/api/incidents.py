from fastapi import APIRouter
from backend.database.db_session import db

router = APIRouter(prefix="/incidents", tags=["Incidents & RCA"])

@router.get("")
def get_incidents():
    return db.incidents
