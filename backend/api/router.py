from fastapi import APIRouter
from backend.api import (
    auth, machines, workers, permits, sensors,
    incidents, digital_twin, vision, copilot,
    risk, simulation, analytics
)

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(machines.router)
api_router.include_router(workers.router)
api_router.include_router(permits.router)
api_router.include_router(sensors.router)
api_router.include_router(incidents.router)
api_router.include_router(digital_twin.router)
api_router.include_router(vision.router)
api_router.include_router(copilot.router)
api_router.include_router(risk.router)
api_router.include_router(simulation.router)
api_router.include_router(analytics.router)
