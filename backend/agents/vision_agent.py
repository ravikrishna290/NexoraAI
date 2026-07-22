"""
Vision Domain Agent
Evaluates live AI Vision hazard detections (PPE violations, smoke, fire, restricted zone entry).
"""

from typing import List, Dict, Any
from backend.vision.detector import vision_detector

class VisionAgent:
    @staticmethod
    def evaluate() -> List[Dict[str, Any]]:
        factors = []
        active_detections = vision_detector.get_active_detections(limit=5)
        
        for det in active_detections:
            factors.append({
                "agent_name": "VisionAgent",
                "factor_text": f"Vision AI [{det['camera_id']} - {det['camera_zone']}]: {det['image_tag']} ({det['confidence']}% confidence)",
                "weight": 0.20 if det["detection_type"] == "FIRE_DETECTED" else 0.12,
                "severity": det["severity"]
            })
            
        return factors
