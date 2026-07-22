import sys
import json
import os
import warnings

# Suppress noisy non-critical warnings
warnings.filterwarnings("ignore", category=FutureWarning)
os.environ.setdefault("HF_HUB_DISABLE_IMPLICIT_TOKEN", "1")
os.environ.setdefault("TOKENIZERS_PARALLELISM", "false")

# Force UTF-8 stdout on Windows (prevents UnicodeEncodeError for Greek/special chars)
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

from ai_engine.types import (
    PlantStateContext,
    TelemetryPoint,
    PermitContext,
    AssetContext,
    WorkerContext
)
from ai_engine.langgraph.workflow import NexoraLangGraphEngine

def generate_simulated_plant_context() -> PlantStateContext:
    """Generates realistic industrial plant telemetry context for demonstration."""
    return PlantStateContext(
        plant_id="PLANT-01",
        unit_name="Hydrocracker Unit 2",
        telemetry=[
            TelemetryPoint(
                sensor_id="G-104",
                name="LEL Gas Sensor B4-04",
                type="GAS_LEL",
                value=22.4,
                unit="% LEL",
                baseline_max=5.0,
                threshold_warning=10.0,
                threshold_critical=20.0,
                status="CRITICAL",
                zone_id="ZONE-B4"
            ),
            TelemetryPoint(
                sensor_id="V-102",
                name="Pump P-102 Spectral Vibration Sensor",
                type="VIBRATION",
                value=8.4,
                unit="mm/s",
                baseline_max=2.5,
                threshold_warning=4.5,
                threshold_critical=7.0,
                status="CRITICAL",
                zone_id="ZONE-B4"
            )
        ],
        permit_requests=[
            PermitContext(
                permit_id="PTW-2026-8409",
                applicant_name="Vikram Sharma",
                department="Mechanical Maintenance",
                permit_type="HOT_WORK",
                zone_id="ZONE-B4",
                description="Hot work welding on Pump P-102 recirculation line flange",
                lel_reading=22.4,
                o2_percentage=20.8,
                loto_verified=True
            )
        ],
        assets=[
            AssetContext(
                asset_id="PUMP-P102",
                name="Hydrocracker Charge Pump P-102",
                zone_id="ZONE-B4",
                health_score=42.0,
                vibration_mm_sec=8.4,
                temperature_c=84.2,
                status="CRITICAL"
            )
        ],
        workers=[
            WorkerContext(
                worker_id="W-804",
                name="Vikram Sharma",
                zone_id="ZONE-B4",
                shift_hours=11.2,
                ppe_compliant=True,
                vital_status="ELEVATED_HEART_RATE"
            )
        ],
        ambient_weather={
            "temperature_c": 36.5,
            "wind_speed_kmh": 22.0,
            "humidity_pct": 68
        }
    )

def run_ai_intelligence_engine():
    print("=" * 80)
    print("NEXORA AI INTELLIGENCE ENGINE -- LANGGRAPH MULTI-AGENT SWARM EVALUATION")
    print("=" * 80)

    context = generate_simulated_plant_context()
    print(f"\n[+] Ingested Plant Context: {context.plant_id} ({context.unit_name})")
    print(f"[+] Active Telemetry Anomalies: Sensor G-104 ({context.telemetry[0].value}% LEL), Pump P-102 ({context.telemetry[1].value} mm/s)")
    print(f"[+] Active Work Permit Request: {context.permit_requests[0].permit_id} ({context.permit_requests[0].permit_type})")

    print("\n[+] Executing LangGraph Swarm Nodes...")
    assessment = NexoraLangGraphEngine.execute_workflow(context)

    print("\n" + "=" * 80)
    print(f"COMPOUND RISK ASSESSMENT RESULT: {assessment.compound_risk_score}% ({assessment.risk_level})")
    print(f"Confidence Score: {assessment.confidence_score * 100}% | Risk Velocity: {assessment.risk_velocity}%/hr")
    print("=" * 80)

    print("\n--- EXPLAINABLE AI (XAI) 4-QUESTION DIAGNOSIS ---")
    print(f"1. WHAT IS HAPPENING?\n   {assessment.four_questions.what_is_happening}")
    print(f"\n2. WHY IS IT HAPPENING?\n   {assessment.four_questions.why_is_it_happening}")
    print(f"\n3. HOW DANGEROUS IS IT?\n   {assessment.four_questions.how_dangerous_is_it}")
    print("\n4. WHAT SHOULD BE DONE?")
    for step in assessment.four_questions.what_should_be_done:
        print(f"   * {step}")

    print("\n--- CONTRIBUTING MULTI-AGENT DOMAIN FACTORS ---")
    for f in assessment.contributing_factors:
        print(f"   [{f.agent_name}] {f.factor_text} (Weight: {int(f.weight*100)}% | Severity: {f.severity})")

    print("\n--- REGULATORY LINEAGE ---")
    for reg in assessment.regulatory_lineage:
        print(f"   [STATUTORY RULE] {reg}")

    if assessment.historical_precedent_match:
        print(f"\n--- HISTORICAL INCIDENT PRECEDENT MATCH ---")
        print(f"   [INCIDENT MATCH] {assessment.historical_precedent_match['incident_id']}: {assessment.historical_precedent_match['title']} ({int(assessment.historical_precedent_match['similarity_score']*100)}% Match)")

    return assessment

if __name__ == "__main__":
    run_ai_intelligence_engine()
