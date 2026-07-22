from fastapi import APIRouter
from backend.schemas.api_schemas import SimulationTriggerRequest, SimulationStatusResponse
from backend.simulation.scenario_runner import simulation_engine

router = APIRouter(prefix="/simulation", tags=["Simulation Engine"])

@router.post("/trigger", response_model=SimulationStatusResponse)
def trigger_simulation_scenario(req: SimulationTriggerRequest):
    result = simulation_engine.trigger_scenario(req.scenario)
    return SimulationStatusResponse(**result)
