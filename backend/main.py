"""
Main FastAPI Application Entrypoint
Nexora Industrial Safety Intelligence Platform — Production Backend.
Includes REST APIs, WebSocket Streamer, Multi-Agent Swarm, RAG, and Simulation Engine.
"""

import sys
import asyncio
import warnings
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

# Force UTF-8 encoding on Windows
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

warnings.filterwarnings("ignore", category=FutureWarning)

from backend.config import settings
from backend.utils.logger import logger
from backend.api.router import api_router
from backend.websocket.connection_manager import ws_manager
from backend.services.dataset_service import dataset_service
from backend.agents.supervisor_agent import supervisor_agent
from backend.simulation.scenario_runner import simulation_engine


async def background_telemetry_broadcaster():
    """Background task broadcasting live telemetry & risk updates over WebSocket every 2 seconds."""
    while True:
        try:
            await asyncio.sleep(2)
            if ws_manager.active_connections:
                machine = dataset_service.get_machine_health("PUMP-P102")
                smoke = dataset_service.get_smoke_fire_snapshot()
                assessment = supervisor_agent.run_swarm_evaluation(scenario_boost=simulation_engine.risk_boost)
                
                payload = {
                    "event_type": "TELEMETRY_TICK",
                    "timestamp": asyncio.get_event_loop().time(),
                    "active_scenario": simulation_engine.active_scenario,
                    "machine_health": machine,
                    "smoke_snapshot": smoke,
                    "compound_risk_score": assessment["compound_risk_score"],
                    "risk_level": assessment["risk_level"],
                    "four_questions": assessment["four_questions"]
                }
                await ws_manager.broadcast(payload)
        except asyncio.CancelledError:
            break
        except Exception as e:
            logger.error(f"[WebSocket Broadcast Error]: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("================================================================================")
    logger.info(f"STARTING {settings.PROJECT_NAME} v{settings.VERSION}")
    logger.info("================================================================================")
    
    # Start background WebSocket broadcaster
    broadcaster_task = asyncio.create_task(background_telemetry_broadcaster())
    
    yield
    
    logger.info("SHUTTING DOWN NEXORA BACKEND SERVICES...")
    broadcaster_task.cancel()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan,
)

from backend.utils.observability import router as obs_router
from backend.middleware.rate_limit import RateLimitMiddleware

# Rate Limiting & OWASP Middleware
app.add_middleware(RateLimitMiddleware)

# Include Observability Endpoints (/healthz, /readyz, /metrics)
app.include_router(obs_router)

# Include v1 REST Router
app.include_router(api_router)


@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "ONLINE",
        "docs": f"{settings.API_V1_STR}/docs",
        "websocket": "/ws/live"
    }


@app.websocket("/ws/live")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming client commands if needed
            logger.info(f"[WebSocket Received]: {data}")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
