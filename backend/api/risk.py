from fastapi import APIRouter
from backend.agents.supervisor_agent import supervisor_agent
from backend.simulation.scenario_runner import simulation_engine

router = APIRouter(prefix="/risk", tags=["Compound Risk Engine"])

@router.get("/assessment")
def get_compound_risk_assessment():
    return supervisor_agent.run_swarm_evaluation(scenario_boost=simulation_engine.risk_boost)
