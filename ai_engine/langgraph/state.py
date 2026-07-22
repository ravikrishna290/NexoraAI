from typing import List, Dict, Any, TypedDict
from ..types import PlantStateContext, DomainAgentFactor, CompoundRiskAssessmentOutput

class LangGraphState(TypedDict):
    """
    TypedDict representing the state passed through the LangGraph Multi-Agent Swarm execution graph.
    """
    plant_context: PlantStateContext
    collected_factors: List[DomainAgentFactor]
    query_text: str
    compound_score: float
    risk_velocity: float
    risk_level: str
    confidence_score: float
    final_output: CompoundRiskAssessmentOutput
    escalation_required: bool
    status: str
