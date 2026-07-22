from fastapi import APIRouter
from backend.database.db_session import db

router = APIRouter(prefix="/workers", tags=["Workers"])

@router.get("")
def get_workers():
    return db.workers
