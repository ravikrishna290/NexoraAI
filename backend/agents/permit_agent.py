"""
Permit Domain Agent — Work Permit cross-matching.
"""
from typing import List, Dict, Any
from backend.database.db_session import db

class PermitAgent:
    @staticmethod
    def evaluate() -> List[Dict[str, Any]]:
        factors = []
        for p in db.permits:
            if p["type"] == "HOT_WORK" and p["status"] in ["PENDING_APPROVAL", "APPROVED"]:
                factors.append({
                    "agent_name": "PermitAgent",
                    "factor_text": f"Hot Work Permit {p['permit_id']} requested in {p['zone_id']} for {p['description']}",
                    "weight": 0.28,
                    "severity": "CRITICAL"
                })
        return factors
