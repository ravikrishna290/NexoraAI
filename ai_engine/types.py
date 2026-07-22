from typing import List, Dict, Any, Optional, Literal
from pydantic import BaseModel, Field
from datetime import datetime

SeverityLevel = Literal["SAFE", "LOW", "WARNING", "HIGH", "CRITICAL"]

class TelemetryPoint(BaseModel):
    sensor_id: str
    name: str
    type: str # GAS_LEL, PRESSURE, TEMPERATURE, VIBRATION, HUMIDITY
    value: float
    unit: str
    baseline_max: float
    threshold_warning: float
    threshold_critical: float
    status: SeverityLevel
    zone_id: str

class PermitContext(BaseModel):
    permit_id: str
    applicant_name: str
    department: str
    permit_type: Literal["HOT_WORK", "CONFINED_SPACE", "HEIGHT_WORK", "ELECTRICAL"]
    zone_id: str
    description: str
    lel_reading: float
    o2_percentage: float
    loto_verified: bool

class AssetContext(BaseModel):
    asset_id: str
    name: str
    zone_id: str
    health_score: float # 0 - 100
    vibration_mm_sec: float
    temperature_c: float
    status: SeverityLevel

class WorkerContext(BaseModel):
    worker_id: str
    name: str
    zone_id: str
    shift_hours: float
    ppe_compliant: bool
    vital_status: str

class PlantStateContext(BaseModel):
    plant_id: str
    unit_name: str
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    telemetry: List[TelemetryPoint]
    permit_requests: List[PermitContext]
    assets: List[AssetContext]
    workers: List[WorkerContext]
    ambient_weather: Dict[str, Any]

class DomainAgentFactor(BaseModel):
    agent_name: str
    agent_title: str
    factor_text: str
    metric_value: Optional[str] = None
    baseline_value: Optional[str] = None
    weight: float
    severity: SeverityLevel

class FourQuestionDiagnosis(BaseModel):
    what_is_happening: str
    why_is_it_happening: str
    how_dangerous_is_it: str
    what_should_be_done: List[str]

class RecommendedMitigationStep(BaseModel):
    step: int
    action_title: str
    description: str
    urgency: Literal["IMMEDIATE", "HIGH", "MEDIUM"]
    automated_action: str
    target_entity_id: Optional[str] = None

class CompoundRiskAssessmentOutput(BaseModel):
    assessment_id: str
    timestamp: str
    plant_id: str
    unit_name: str
    zone_id: str
    zone_name: str
    compound_risk_score: float # 0.0 to 100.0
    risk_velocity: float # dR/dt
    risk_level: SeverityLevel
    confidence_score: float # 0.00 to 1.00
    target_entity: Dict[str, Any]
    four_questions: FourQuestionDiagnosis
    contributing_factors: List[DomainAgentFactor]
    regulatory_lineage: List[str]
    historical_precedent_match: Optional[Dict[str, Any]] = None
    mitigations: List[RecommendedMitigationStep]
    status: Literal["UNRESOLVED", "UNDER_REVIEW", "MITIGATED", "REJECTED"]
