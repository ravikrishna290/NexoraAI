"""
Scenario Execution Engine
Handles live simulation scenarios and dataset replay updates across Digital Twin, Vision, and Risk.
"""

from typing import Dict, Any, Optional
from backend.services.risk_service import risk_engine
from backend.agents.supervisor_agent import supervisor_agent

class SimulationEngine:
    def __init__(self):
        self.active_scenario: str = "NONE"
        self.gas_lel_override: Optional[float] = None
        self.risk_boost: float = 0.0

    def trigger_scenario(self, scenario: str) -> Dict[str, Any]:
        self.active_scenario = scenario

        scenario_map = {
            "GAS_LEAK": {"boost": 35.0, "gas": 28.4, "msg": "Gas leak scenario active — LEL spiked to 28.4% in Zone B4"},
            "FIRE": {"boost": 40.0, "gas": 22.4, "msg": "Fire hazard scenario active — Thermal camera detected open flame in Zone B4"},
            "SMOKE": {"boost": 25.0, "gas": 15.0, "msg": "Smoke hazard scenario active — TVOC spike detected by IoT sensors"},
            "PPE_VIOLATION": {"boost": 10.0, "gas": None, "msg": "PPE violation scenario active — Missing helmet detected on worker W-804"},
            "MACHINE_FAILURE": {"boost": 20.0, "gas": None, "msg": "Machine failure scenario active — AI4I predicts imminent bearing destruction"},
            "MULTI_INCIDENT": {"boost": 55.0, "gas": 32.0, "msg": "MULTI-INCIDENT CRITICAL — Gas leak + Fire hazard + PPE failure in Zone B4"},
            "RESET": {"boost": 0.0, "gas": None, "msg": "Simulation reset to nominal operating state"}
        }

        cfg = scenario_map.get(scenario, {"boost": 0.0, "gas": None, "msg": "Unknown scenario"})
        self.risk_boost = cfg["boost"]
        self.gas_lel_override = cfg["gas"]

        if scenario == "RESET":
            self.active_scenario = "NONE"

        # Re-evaluate multi-agent swarm
        assessment = supervisor_agent.run_swarm_evaluation(scenario_boost=self.risk_boost)

        return {
            "active_scenario": self.active_scenario,
            "gas_lel_override": self.gas_lel_override,
            "risk_boost": self.risk_boost,
            "compound_score": assessment["compound_risk_score"],
            "risk_level": assessment["risk_level"],
            "active_alerts_count": 5 if self.risk_boost > 20 else 1,
            "message": cfg["msg"]
        }

simulation_engine = SimulationEngine()
