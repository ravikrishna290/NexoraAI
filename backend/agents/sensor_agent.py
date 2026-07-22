"""
Sensor Domain Agent — SCADA telemetry anomalies.
"""
from typing import List, Dict, Any
from backend.database.db_session import db

class SensorAgent:
    @staticmethod
    def evaluate() -> List[Dict[str, Any]]:
        factors = []
        for s in db.sensors:
            if s["status"] in ["HIGH", "CRITICAL"]:
                factors.append({
                    "agent_name": "SensorAgent",
                    "factor_text": f"{s['sensor_name']} ({s['sensor_id']}) reading {s['value']} {s['unit']} (Baseline {s['baseline_min']}-{s['baseline_max']} {s['unit']})",
                    "weight": 0.35 if s["type"] == "GAS_LEL" else 0.15,
                    "severity": s["status"]
                })
        return factors
