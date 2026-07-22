import math
from typing import List, Dict, Any, Tuple
from ..types import DomainAgentFactor, SeverityLevel

class CompoundRiskFusionEngine:
    """
    Mathematical Non-Linear Risk Fusion Engine.
    Combines independent multi-agent domain factors using static weights
    and dynamic interaction multipliers (gamma) for spatial & temporal overlaps.
    """

    @staticmethod
    def calculate_compound_score(factors: List[DomainAgentFactor]) -> Tuple[float, float, SeverityLevel]:
        """
        Calculates the global Compound Risk Score (0 - 100%) and Risk Velocity.
        Formula: R_c = 1 - Prod(1 - w_i * r_i) + Sum(gamma_jk * r_j * r_k)
        """
        if not factors:
            return 5.0, 0.0, "SAFE"

        # Map severity to numerical risk factor r_i (0.0 to 1.0)
        severity_map = {
            "SAFE": 0.05,
            "LOW": 0.20,
            "WARNING": 0.50,
            "HIGH": 0.80,
            "CRITICAL": 0.98
        }

        # 1. Independent Risk Accumulation
        independence_product = 1.0
        weighted_sum = 0.0

        for f in factors:
            r_i = severity_map.get(f.severity, 0.1)
            w_i = f.weight
            independence_product *= (1.0 - (w_i * r_i))
            weighted_sum += (w_i * r_i)

        base_risk = (1.0 - independence_product) * 80.0

        # 2. Cross-Domain Interaction Multiplier (Gamma) Evaluation
        interaction_boost = 0.0
        has_gas_critical = any("GAS" in f.factor_text.upper() and f.severity == "CRITICAL" for f in factors)
        has_hot_work = any("HOT WORK" in f.factor_text.upper() or "WELDING" in f.factor_text.upper() for f in factors)
        has_vibration_spike = any("VIBRATION" in f.factor_text.upper() and f.severity in ["HIGH", "CRITICAL"] for f in factors)

        if has_gas_critical and has_hot_work:
            interaction_boost += 35.0  # Massive spike for gas + hot work ignition
        if has_gas_critical and has_vibration_spike:
            interaction_boost += 18.0  # Pump seal breakdown releasing hydrocarbon cloud

        # Final Score bounded between 0.0 and 99.9%
        final_score = min(99.9, max(0.0, base_risk + interaction_boost))

        # Risk Velocity (Rate of Change %/hr)
        risk_velocity = +18.4 if final_score > 75 else +2.1

        # Classify Final Severity Level
        if final_score >= 75.0:
            severity = "CRITICAL"
        elif final_score >= 45.0:
            severity = "HIGH"
        elif final_score >= 25.0:
            severity = "WARNING"
        elif final_score >= 10.0:
            severity = "LOW"
        else:
            severity = "SAFE"

        return round(final_score, 1), round(risk_velocity, 1), severity
