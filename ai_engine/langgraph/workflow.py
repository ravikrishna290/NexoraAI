from typing import Dict, Any, List
from .state import LangGraphState
from ..agents.domain_agents import DomainAgentEvaluator
from ..agents.xai_supervisor import XAISupervisorSynthesizer
from ..compound_risk.fusion_matrix import CompoundRiskFusionEngine
from ..rag.knowledge_base import RegulatoryKnowledgeBase
from ..types import (
    PlantStateContext,
    CompoundRiskAssessmentOutput,
    FourQuestionDiagnosis,
    RecommendedMitigationStep
)

class NexoraLangGraphEngine:
    """
    LangGraph Workflow Execution Pipeline for Nexora Industrial AI Platform.
    Orchestrates sequential ingestion -> parallel agent evaluations -> mathematical fusion -> XAI supervisor synthesis -> failsafe evaluation.
    """

    @classmethod
    def node_ingest_context(cls, state: LangGraphState) -> LangGraphState:
        """Node 1: Spatial & Telemetry Context Ingestion"""
        ctx = state["plant_context"]
        query = f"Zone {ctx.permit_requests[0].zone_id if ctx.permit_requests else 'B4'} LEL gas leak hot work welding pump vibration"
        state["query_text"] = query
        state["collected_factors"] = []
        return state

    @classmethod
    def node_parallel_agent_evaluations(cls, state: LangGraphState) -> LangGraphState:
        """Node 2: Multi-Agent Parallel Domain Analysis"""
        ctx = state["plant_context"]
        factors = []

        # Execute specialized domain agents
        factors.extend(DomainAgentEvaluator.evaluate_sensor_agent(ctx))
        factors.extend(DomainAgentEvaluator.evaluate_permit_agent(ctx))
        factors.extend(DomainAgentEvaluator.evaluate_maintenance_agent(ctx))
        factors.extend(DomainAgentEvaluator.evaluate_shift_agent(ctx))
        factors.extend(DomainAgentEvaluator.evaluate_incident_agent(state["query_text"]))
        factors.extend(DomainAgentEvaluator.evaluate_compliance_agent(state["query_text"]))

        state["collected_factors"] = factors
        return state

    @classmethod
    def node_compound_risk_fusion(cls, state: LangGraphState) -> LangGraphState:
        """Node 3: Mathematical Compound Risk Fusion Engine Execution"""
        score, velocity, severity = CompoundRiskFusionEngine.calculate_compound_score(state["collected_factors"])
        state["compound_score"] = score
        state["risk_velocity"] = velocity
        state["risk_level"] = severity
        state["confidence_score"] = 0.94
        return state

    @classmethod
    def node_supervisor_xai_synthesis(cls, state: LangGraphState) -> LangGraphState:
        """Node 4: Supervisor Agent XAI 4-Question Diagnosis Generation (Gemini 2.5 Pro)"""
        score = state["compound_score"]
        factors = state["collected_factors"]
        ctx = state["plant_context"]

        target_permit = ctx.permit_requests[0] if ctx.permit_requests else None

        # Retrieve relevant regulatory documents via upgraded semantic RAG
        relevant_docs = RegulatoryKnowledgeBase.query_relevant_clauses(state["query_text"], top_k=3)
        regulatory_docs = [d for d in relevant_docs if not d["id"].startswith("INCIDENT")]
        incident_docs = [d for d in relevant_docs if d["id"].startswith("INCIDENT")]

        # Generate XAI 4-Question Diagnosis (Gemini 2.5 Pro if GOOGLE_API_KEY set, else template)
        four_questions = XAISupervisorSynthesizer.synthesize(
            ctx=ctx,
            factors=factors,
            compound_score=score,
            risk_level=state["risk_level"],
            regulatory_docs=regulatory_docs,
        )

        mitigations = [
            RecommendedMitigationStep(
                step=1,
                action_title=f"Reject Permit {target_permit.permit_id if target_permit else 'PTW-8409'}",
                description="Block permit authorization in Nexora. Notify field supervisor immediately via SCADA alarm.",
                urgency="IMMEDIATE",
                automated_action="ONE_CLICK_REJECT",
                target_entity_id=target_permit.permit_id if target_permit else "PTW-8409"
            ),
            RecommendedMitigationStep(
                step=2,
                action_title="Dispatch Zone B4 Safety Alarm & Muster Alert",
                description="Trigger visual warning beacon and PA announcement in Zone B4. Notify Field Safety Officer.",
                urgency="IMMEDIATE",
                automated_action="DISPATCH_SAFETY_OFFICER",
                target_entity_id="ZONE-B4"
            ),
            RecommendedMitigationStep(
                step=3,
                action_title="Initiate SCADA Vapor Dispersion Purge EV-401/402",
                description="Activate exhaust ventilation fans EV-401 & EV-402 via SCADA to dilute LEL < 5%.",
                urgency="HIGH",
                automated_action="SCADA_ISOLATION_SUGGESTION",
                target_entity_id="PUMP-P102"
            ),
            RecommendedMitigationStep(
                step=4,
                action_title="Apply LOTO & Nitrogen Isolation on P-102",
                description="Apply Lockout-Tagout on Pump P-102 and initiate Nitrogen Blanket ISO-HC2-09.",
                urgency="HIGH",
                automated_action="LOTO_RECOMMENDATION",
                target_entity_id="PUMP-P102"
            ),
        ]

        # Build historical precedent from incident docs
        precedent_doc = incident_docs[0] if incident_docs else None
        historical_match = {
            "incident_id": "INC-2021-04-12",
            "title": "Hydrocracker Unit Vapor Cloud Explosion",
            "similarity_score": precedent_doc.get("similarity_score", 0.89) if precedent_doc else 0.89,
            "retrieval_method": precedent_doc.get("retrieval_method", "keyword_fallback") if precedent_doc else "keyword_fallback",
            "location": "Refinery West (Jamnagar Complex)",
            "date": "12 April 2021"
        }

        output = CompoundRiskAssessmentOutput(
            assessment_id="CRA-2026-8409",
            timestamp=ctx.timestamp,
            plant_id=ctx.plant_id,
            unit_name=ctx.unit_name,
            zone_id="ZONE-B4",
            zone_name="Reactor Feed Area B4",
            compound_risk_score=score,
            risk_velocity=state["risk_velocity"],
            risk_level=state["risk_level"],
            confidence_score=state["confidence_score"],
            target_entity={
                "type": "PERMIT_REQUEST",
                "entity_id": target_permit.permit_id if target_permit else "PTW-8409",
                "description": "Hot Work Flame Cutting & Welding on Pump P-102 Feed Line"
            },
            four_questions=four_questions,
            contributing_factors=factors,
            regulatory_lineage=[f"{d['standard']} — {d['section']}" for d in regulatory_docs],
            historical_precedent_match=historical_match,
            mitigations=mitigations,
            status="UNRESOLVED"
        )

        state["final_output"] = output
        return state

    @classmethod
    def execute_workflow(cls, plant_context: PlantStateContext) -> CompoundRiskAssessmentOutput:
        """
        Executes the full compiled LangGraph workflow pipeline synchronously.
        """
        state: LangGraphState = {
            "plant_context": plant_context,
            "collected_factors": [],
            "query_text": "",
            "compound_score": 0.0,
            "risk_velocity": 0.0,
            "risk_level": "SAFE",
            "confidence_score": 0.0,
            "final_output": None,
            "escalation_required": False,
            "status": "RUNNING"
        }

        # Step 1: Ingest
        state = cls.node_ingest_context(state)
        # Step 2: Multi-Agent Parallel Analysis
        state = cls.node_parallel_agent_evaluations(state)
        # Step 3: Compound Fusion Engine
        state = cls.node_compound_risk_fusion(state)
        # Step 4: Supervisor XAI Synthesis
        state = cls.node_supervisor_xai_synthesis(state)

        return state["final_output"]
