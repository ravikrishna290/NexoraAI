from fastapi import APIRouter

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("")
def get_analytics_metrics():
    return {
        "plant_id": "PLANT-01",
        "hydrocracker_unit_2": {
            "overall_safety_index": 4.2,  # out of 100
            "zero_harm_days": 184,
            "total_permits_evaluated": 1240,
            "permits_rejected_safety_system": 42,
            "top_risk_zones": [
                {"zone_id": "ZONE-B4", "name": "Reactor Feed Area B4", "risk_level": "CRITICAL", "avg_lel": 22.4},
                {"zone_id": "ZONE-C2", "name": "Separator Zone C2", "risk_level": "WARNING", "avg_lel": 3.4},
                {"zone_id": "ZONE-A1", "name": "Distillation Area A1", "risk_level": "SAFE", "avg_lel": 0.8}
            ]
        }
    }
