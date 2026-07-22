"""
Vision AI Detection Engine
Simulates YOLO v8 / Vision AI inference over camera feeds.
Detects PPE non-compliance, smoke/fire hazards, restricted zone entry, and worker tracking.
Generates bounding boxes, confidence scores, and evidence snapshot metadata.
"""

import time
import random
from typing import List, Dict, Any, Optional

CAMERA_NODES = [
    {"id": "CAM-C01", "zone": "Zone A1", "name": "Distillation Area — West Entry"},
    {"id": "CAM-C02", "zone": "Zone A1", "name": "Pump P-201 Area"},
    {"id": "CAM-C03", "zone": "Zone B4", "name": "Reactor Feed — Hot Work Zone"},
    {"id": "CAM-C04", "zone": "Zone B4", "name": "Pump P-102 Critical Zone"},
    {"id": "CAM-C05", "zone": "Zone B4", "name": "Gas Sensor AT-G104 Proximity"},
    {"id": "CAM-C06", "zone": "Zone C2", "name": "Separator V-401 Area"},
]

VISION_RISK_MAP = {
    "FIRE_DETECTED": 40.0,
    "SMOKE_DETECTED": 25.0,
    "RESTRICTED_ZONE_ENTRY": 18.0,
    "PPE_VIOLATION": 10.0,
    "WORKER_DOWN": 30.0,
    "ALL_CLEAR": 0.0,
}

class VisionDetector:
    def __init__(self):
        self.detections_buffer: List[Dict[str, Any]] = []
        self._seed_initial_detections()

    def _seed_initial_detections(self):
        now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        self.detections_buffer = [
            {
                "id": f"VIS-{int(time.time())}-1",
                "camera_id": "CAM-C03",
                "camera_zone": "Zone B4",
                "detection_type": "PPE_VIOLATION",
                "sub_type": "HELMET_MISSING",
                "confidence": 98.4,
                "timestamp": now,
                "risk_boost": 10.0,
                "worker_name": "Vikram Sharma (W-804)",
                "image_tag": "Worker without helmet within 8m of hot work welding area",
                "notified": True,
                "severity": "HIGH",
                "bounding_box": {"x": 28, "y": 22, "w": 44, "h": 54}
            },
            {
                "id": f"VIS-{int(time.time())}-2",
                "camera_id": "CAM-C04",
                "camera_zone": "Zone B4",
                "detection_type": "RESTRICTED_ZONE_ENTRY",
                "sub_type": None,
                "confidence": 99.1,
                "timestamp": now,
                "risk_boost": 18.0,
                "worker_name": "Vikram Sharma (W-804)",
                "image_tag": "Unauthorized entry into gas hazard zone near Pump P-102",
                "notified": True,
                "severity": "CRITICAL",
                "bounding_box": {"x": 15, "y": 30, "w": 50, "h": 60}
            },
            {
                "id": f"VIS-{int(time.time())}-3",
                "camera_id": "CAM-C01",
                "camera_zone": "Zone A1",
                "detection_type": "PPE_VIOLATION",
                "sub_type": "GLOVES_MISSING",
                "confidence": 89.2,
                "timestamp": now,
                "risk_boost": 10.0,
                "worker_name": "Rajesh Kumar (W-809)",
                "image_tag": "Chemical gloves missing during equipment handling",
                "notified": False,
                "severity": "WARNING",
                "bounding_box": {"x": 35, "y": 25, "w": 30, "h": 45}
            }
        ]

    def get_active_detections(self, limit: int = 10) -> List[Dict[str, Any]]:
        return self.detections_buffer[:limit]

    def generate_random_detection(self) -> Dict[str, Any]:
        cam = random.choice(CAMERA_NODES)
        det_type = random.choice(["PPE_VIOLATION", "RESTRICTED_ZONE_ENTRY", "SMOKE_DETECTED", "PPE_VIOLATION"])
        
        sub_type = None
        if det_type == "PPE_VIOLATION":
            sub_type = random.choice(["HELMET_MISSING", "VEST_MISSING", "GLOVES_MISSING", "GOGGLES_MISSING"])

        confidence = round(random.uniform(85.0, 99.5), 1)
        now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        risk_boost = VISION_RISK_MAP.get(det_type, 10.0)

        detection = {
            "id": f"VIS-{int(time.time())}-{random.randint(100,999)}",
            "camera_id": cam["id"],
            "camera_zone": cam["zone"],
            "detection_type": det_type,
            "sub_type": sub_type,
            "confidence": confidence,
            "timestamp": now,
            "risk_boost": risk_boost,
            "worker_name": random.choice(["Vikram Sharma (W-804)", "Rajesh Kumar (W-809)", "Priya Nair (W-302)"]),
            "image_tag": f"{det_type.replace('_', ' ')} detected by {cam['id']} in {cam['zone']}",
            "notified": True,
            "severity": "CRITICAL" if det_type in ["FIRE_DETECTED", "RESTRICTED_ZONE_ENTRY"] else "HIGH",
            "bounding_box": {"x": random.randint(10, 40), "y": random.randint(15, 35), "w": 40, "h": 50}
        }

        self.detections_buffer.insert(0, detection)
        if len(self.detections_buffer) > 30:
            self.detections_buffer.pop()

        return detection

vision_detector = VisionDetector()
