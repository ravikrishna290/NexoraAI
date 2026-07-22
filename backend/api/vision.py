from fastapi import APIRouter
from backend.vision.detector import vision_detector

router = APIRouter(prefix="/vision", tags=["Vision Intelligence"])

@router.get("/detections")
def get_vision_detections(limit: int = 10):
    return vision_detector.get_active_detections(limit=limit)

@router.post("/trigger-random")
def trigger_random_vision_event():
    return vision_detector.generate_random_detection()
