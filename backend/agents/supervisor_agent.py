"""
Supervisor Agent & LangGraph Swarm Orchestrator
Executes parallel multi-agent evaluations and generates Explainable AI (XAI) 4-Question Diagnosis
via Google Gemini (google.genai SDK) with structured fallback.
"""

import os
import json
from typing import List, Dict, Any, Optional

from backend.agents.sensor_agent import SensorAgent
from backend.agents.permit_agent import PermitAgent
from backend.agents.maintenance_agent import MaintenanceAgent
from backend.agents.vision_agent import VisionAgent
from backend.agents.compliance_agent import ComplianceAgent
from backend.agents.incident_agent import IncidentAgent
from backend.services.risk_service import risk_engine
from backend.rag.vector_kb import rag_engine

try:
    from google import genai
    from google.genai import types as genai_types
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False


class SupervisorAgent:
    SYSTEM_PROMPT = """You are NEXORA, an Industrial AI Safety Intelligence System.
Provide an explainable 4-Question Diagnosis in strict JSON format:
{
  "what_is_happening": "Paragraph describing physical telemetry state with exact sensor IDs, values, and zone IDs.",
  "why_is_it_happening": "Paragraph detailing causal chain, mechanical failure modes, and PTW spatial overlap.",
  "how_dangerous_is_it": "Paragraph detailing Compound Risk score %, time to escalation, and consequence.",
  "what_should_be_done": ["Immediate mitigation step 1", "Step 2", "Step 3"]
}"""

    @classmethod
    def run_swarm_evaluation(cls, scenario_boost: float = 0.0) -> Dict[str, Any]:
        # 1. Collect multi-agent factor evidence
        factors: List[Dict[str, Any]] = []
        factors.extend(SensorAgent.evaluate())
        factors.extend(PermitAgent.evaluate())
        factors.extend(MaintenanceAgent.evaluate())
        factors.extend(VisionAgent.evaluate())
        factors.extend(ComplianceAgent.evaluate())
        factors.extend(IncidentAgent.evaluate())

        # 2. Mathematical Compound Risk Fusion
        score, velocity, severity = risk_engine.calculate_compound_score(factors)
        if scenario_boost > 0:
            score = min(99.9, score + scenario_boost)
            if score >= 75: severity = "CRITICAL"

        # 3. Retrieve Regulatory RAG Clauses
        relevant_docs = rag_engine.query("hot work gas LEL pump vibration", top_k=2)

        # 4. Generate XAI Diagnosis (Gemini if key set, else template)
        api_key = os.environ.get("GOOGLE_API_KEY", "")
        four_q = None

        if GEMINI_AVAILABLE and api_key:
            four_q = cls._synthesize_gemini(factors, score, severity, relevant_docs, api_key)

        if not four_q:
            four_q = cls._synthesize_template(factors, score, severity)

        return {
            "assessment_id": "CRA-2026-8409",
            "timestamp": "2026-07-22T08:15:00Z",
            "plant_id": "PLANT-01",
            "unit_name": "Hydrocracker Unit 2",
            "zone_id": "ZONE-B4",
            "zone_name": "Reactor Feed Area B4",
            "compound_risk_score": score,
            "risk_velocity": velocity,
            "risk_level": severity,
            "confidence_score": 0.94,
            "target_entity": {
                "type": "PERMIT_REQUEST",
                "entity_id": "PTW-2026-8409",
                "description": "Hot Work Flame Cutting & Welding on Pump P-102 Feed Line"
            },
            "four_questions": four_q,
            "contributing_factors": factors,
            "regulatory_lineage": [f"{d['standard']} — {d['section']}" for d in relevant_docs if not d["id"].startswith("INCIDENT")],
            "historical_precedent_match": {
                "incident_id": "INC-2021-04-12",
                "title": "Hydrocracker Unit Vapor Cloud Explosion",
                "similarity_score": 0.89,
                "location": "Refinery West (Jamnagar Complex)",
                "date": "12 April 2021"
            },
            "status": "UNRESOLVED"
        }

    @classmethod
    def _synthesize_gemini(cls, factors, score, severity, docs, api_key) -> Optional[Dict[str, Any]]:
        for model_name in ["gemini-flash-lite-latest", "gemini-2.0-flash", "gemini-2.0-flash-lite"]:
            try:
                client = genai.Client(api_key=api_key)
                summary = "\n".join(f"- [{f['agent_name']}] {f['factor_text']}" for f in factors)
                prompt = f"FACTORS:\n{summary}\nCOMPOUND SCORE: {score}% ({severity})"
                
                resp = client.models.generate_content(
                    model=model_name,
                    contents=cls.SYSTEM_PROMPT + "\n\n" + prompt,
                    config=genai_types.GenerateContentConfig(temperature=0.2, max_output_tokens=1024)
                )
                text = resp.text.strip()
                if text.startswith("```"): text = "\n".join(text.split("\n")[1:-1])
                return json.loads(text)
            except Exception as e:
                continue
        return None

    @classmethod
    def _synthesize_template(cls, factors, score, severity) -> Dict[str, Any]:
        return {
            "what_is_happening": "Atmospheric flammable gas concentration in ZONE-B4 has reached 22.4% LEL, measured by SCADA sensor G-104. Simultaneously, Hydrocracker Charge Pump P-102 spectral vibration reads 8.4 mm/s, indicating bearing seal failure.",
            "why_is_it_happening": "Mechanical seal degradation on Pump P-102 releasing hydrocarbon vapor into Zone B4, overlapping spatially (<8m) with requested Hot Work Permit PTW-2026-8409 and worker fatigue (W-804 at 11.2 hrs).",
            "how_dangerous_is_it": f"Compound Risk Score: {score}% ({severity}). High probability of vapor cloud ignition (89% similarity to 2021 Jamnagar Hydrocracker incident). Estimated thermal escalation <3 minutes upon ignition.",
            "what_should_be_done": [
                "IMMEDIATELY reject Work Permit PTW-2026-8409 in Nexora permit system.",
                "Trip Pump P-102 feed line from control room and activate SCADA exhaust ventilation purge (EV-401/402).",
                "Evacuate non-essential personnel from Zone B4 and dispatch safety officer with SCBA gear."
            ]
        }

supervisor_agent = SupervisorAgent()
