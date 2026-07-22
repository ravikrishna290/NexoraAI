from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

# --- Auth Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    username: str
    role: str

class LoginRequest(BaseModel):
    username: str
    password: str

# --- Machine Schemas ---
class MachineHealthSchema(BaseModel):
    asset_id: str
    name: str
    product_id: str
    category: str
    zone_id: str
    status: str
    health_score: float
    air_temp_c: float
    process_temp_c: float
    rpm: int
    torque_nm: float
    tool_wear_min: int
    vibration_mm_sec: float
    operating_hours: int
    failure_probability: float
    remaining_useful_life: int
    failure_mode: Optional[str] = None
    machine_failure: bool

# --- Worker Schemas ---
class WorkerSchema(BaseModel):
    id: str
    name: str
    role: str
    zone_id: str
    shift_hours_active: float
    ppe_compliant: bool
    certifications: List[str]
    assigned_permit_id: Optional[str] = None
    vital_status: str

# --- Permit Schemas ---
class PermitSchema(BaseModel):
    permit_id: str
    type: str
    zone_id: str
    zone_name: str
    status: str
    applicant: str
    supervisor: str
    description: str
    risk_level: str
    scheduled_start: str
    scheduled_end: str
    gas_clearance_certified: bool
    loto_applied: bool

# --- Sensor Telemetry Schemas ---
class SensorTelemetrySchema(BaseModel):
    sensor_id: str
    sensor_name: str
    type: str
    value: float
    unit: str = Field(..., alias="unit")
    baseline_min: float
    baseline_max: float
    threshold_warning: float
    threshold_critical: float
    status: str
    last_updated: str
    zone_id: str
    trend: str

# --- Vision Detection Schemas ---
class VisionDetectionSchema(BaseModel):
    id: str
    camera_id: str
    camera_zone: str
    detection_type: str
    sub_type: Optional[str] = None
    confidence: float
    timestamp: str
    risk_boost: float
    worker_name: Optional[str] = None
    image_tag: str
    notified: bool
    severity: str

# --- Incident & Regulatory Schemas ---
class IncidentSchema(BaseModel):
    incident_id: str
    title: str
    unit: str
    date: str
    severity: str
    root_cause: str
    corrective_action: str
    similarity_score: Optional[float] = None

# --- Compound Risk Schemas ---
class FourQuestionDiagnosisSchema(BaseModel):
    what_is_happening: str
    why_is_it_happening: str
    how_dangerous_is_it: str
    what_should_be_done: List[str]

class DomainAgentFactorSchema(BaseModel):
    agent_name: str
    factor_text: str
    weight: float
    severity: str

class CompoundRiskAssessmentSchema(BaseModel):
    assessment_id: str
    timestamp: str
    plant_id: str
    unit_name: str
    zone_id: str
    zone_name: str
    compound_risk_score: float
    risk_velocity: float
    risk_level: str
    confidence_score: float
    target_entity: Dict[str, Any]
    four_questions: FourQuestionDiagnosisSchema
    contributing_factors: List[DomainAgentFactorSchema]
    regulatory_lineage: List[str]
    historical_precedent_match: Optional[Dict[str, Any]] = None
    status: str

# --- Copilot Query Schemas ---
class CopilotQueryRequest(BaseModel):
    prompt: str
    context_zone: Optional[str] = "ZONE-B4"

class CopilotQueryResponse(BaseModel):
    query: str
    answer: str
    confidence: float
    reasoning_chain: List[str]
    source_agents: List[str]
    retrieved_clauses: List[str]
    suggested_actions: List[str]

# --- Simulation Trigger Schemas ---
class SimulationTriggerRequest(BaseModel):
    scenario: str  # GAS_LEAK | FIRE | SMOKE | PPE_VIOLATION | MACHINE_FAILURE | MULTI_INCIDENT | RESET

class SimulationStatusResponse(BaseModel):
    active_scenario: str
    gas_lel_override: Optional[float] = None
    risk_boost: float
    compound_score: float
    risk_level: str
    active_alerts_count: int
    message: str
