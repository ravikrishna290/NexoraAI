"""
Maintenance Domain Agent
Evaluates equipment mechanical health using AI4I Predictive Maintenance dataset.
"""

from typing import List, Dict, Any
from backend.services.dataset_service import dataset_service

class MaintenanceAgent:
    @staticmethod
    def evaluate(asset_id: str = "PUMP-P102") -> List[Dict[str, Any]]:
        health = dataset_service.get_machine_health(asset_id)
        factors = []

        if health["machine_failure"] or health["vibration_mm_sec"] > 4.5:
            factors.append({
                "agent_name": "MaintenanceAgent",
                "factor_text": (
                    f"{health['name']} ({health['asset_id']}) Spectral Vibration Spike "
                    f"({health['vibration_mm_sec']} mm/s vs baseline 2.5 mm/s), "
                    f"Tool Wear {health['tool_wear_min']} min, Torque {health['torque_nm']} Nm. "
                    f"Failure Probability: {health['failure_probability']}%. Mode: {health['failure_mode'] or 'Seal Failure'}"
                ),
                "weight": 0.16,
                "severity": "CRITICAL" if health["machine_failure"] or health["vibration_mm_sec"] > 7.0 else "HIGH"
            })
        return factors
