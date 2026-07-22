"""
Incident Domain Agent — Historical incident precedent matching.
"""
from typing import List, Dict, Any
from backend.database.db_session import db

class IncidentAgent:
    @staticmethod
    def evaluate() -> List[Dict[str, Any]]:
        factors = []
        for inc in db.incidents:
            factors.append({
                "agent_name": "IncidentAgent",
                "factor_text": f"Historical Precedent Match ({inc['incident_id']}): {inc['title']} ({int(inc['similarity_score']*100)}% match). {inc['root_cause']}",
                "weight": 0.10,
                "severity": inc["severity"]
            })
        return factors
