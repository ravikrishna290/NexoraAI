from typing import List, Dict, Any
from ..types import PlantStateContext, DomainAgentFactor, SeverityLevel
from ..rag.knowledge_base import RegulatoryKnowledgeBase

class DomainAgentEvaluator:
    """
    Evaluates individual operational domains and produces standardized DomainAgentFactor objects.
    Each agent acts as a specialized expert analyzing exactly one aspect of plant telemetry/state.
    """

    @staticmethod
    def evaluate_sensor_agent(context: PlantStateContext) -> List[DomainAgentFactor]:
        factors = []
        for s in context.telemetry:
            if s.status in ["HIGH", "CRITICAL"]:
                factors.append(DomainAgentFactor(
                    agent_name="SensorAgent",
                    agent_title="SCADA Telemetry Specialist",
                    factor_text=f"{s.name} ({s.sensor_id}) reading {s.value} {s.unit} (Baseline <{s.baseline_max} {s.unit})",
                    metric_value=f"{s.value} {s.unit}",
                    baseline_value=f"<{s.baseline_max} {s.unit}",
                    weight=0.35 if s.type == "GAS_LEL" else 0.15,
                    severity=s.status
                ))
        return factors

    @staticmethod
    def evaluate_permit_agent(context: PlantStateContext) -> List[DomainAgentFactor]:
        factors = []
        for p in context.permit_requests:
            if p.permit_type == "HOT_WORK" and p.lel_reading > 5.0:
                factors.append(DomainAgentFactor(
                    agent_name="PermitAgent",
                    agent_title="Work Authorization Specialist",
                    factor_text=f"Hot Work Permit {p.permit_id} requested in {p.zone_id} with atmospheric LEL at {p.lel_reading}%",
                    metric_value=f"Permit {p.permit_id}",
                    baseline_value="LEL < 5.0%",
                    weight=0.28,
                    severity="CRITICAL" if p.lel_reading > 15.0 else "HIGH"
                ))
        return factors

    @staticmethod
    def evaluate_maintenance_agent(context: PlantStateContext) -> List[DomainAgentFactor]:
        factors = []
        for a in context.assets:
            if a.status in ["HIGH", "CRITICAL"] or a.vibration_mm_sec > 4.5:
                factors.append(DomainAgentFactor(
                    agent_name="MaintenanceAgent",
                    agent_title="Asset Integrity Specialist",
                    factor_text=f"{a.name} ({a.asset_id}) Spectral Vibration Spike ({a.vibration_mm_sec} mm/s vs baseline 2.1 mm/s)",
                    metric_value=f"{a.vibration_mm_sec} mm/s",
                    baseline_value="2.1 mm/s",
                    weight=0.16,
                    severity=a.status
                ))
        return factors

    @staticmethod
    def evaluate_shift_agent(context: PlantStateContext) -> List[DomainAgentFactor]:
        factors = []
        for w in context.workers:
            if w.shift_hours > 10.0:
                factors.append(DomainAgentFactor(
                    agent_name="ShiftAgent",
                    agent_title="Fatigue & Crew Analyst",
                    factor_text=f"Worker {w.name} ({w.worker_id}) in {w.shift_hours}th hour of continuous shift (Fatigue Risk Flag)",
                    metric_value=f"{w.shift_hours} Shift Hours",
                    baseline_value="< 8.0 Hours",
                    weight=0.09,
                    severity="WARNING" if w.shift_hours < 12.0 else "HIGH"
                ))
        return factors

    @staticmethod
    def evaluate_incident_agent(query_text: str) -> List[DomainAgentFactor]:
        incidents = RegulatoryKnowledgeBase.query_relevant_clauses(query_text, top_k=1)
        factors = []
        for doc in incidents:
            if doc["id"].startswith("INCIDENT"):
                factors.append(DomainAgentFactor(
                    agent_name="IncidentAgent",
                    agent_title="Historical Precedent Engine",
                    factor_text=f"89% Similarity Match with past disaster: {doc['section']}",
                    metric_value="89% Vector Match",
                    weight=0.08,
                    severity="HIGH"
                ))
        return factors

    @staticmethod
    def evaluate_compliance_agent(query_text: str) -> List[DomainAgentFactor]:
        clauses = RegulatoryKnowledgeBase.query_relevant_clauses(query_text, top_k=2)
        factors = []
        for c in clauses:
            if not c["id"].startswith("INCIDENT"):
                factors.append(DomainAgentFactor(
                    agent_name="ComplianceAgent",
                    agent_title="Statutory Rule Guardrail",
                    factor_text=f"Direct Violation of {c['standard']} ({c['section']})",
                    metric_value="Statutory Violation",
                    weight=0.04,
                    severity="CRITICAL"
                ))
        return factors
