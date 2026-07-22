"""
Compound Risk Fusion Engine
Non-linear mathematical risk fusion using Gamma cross-domain interaction multipliers.
"""

from typing import List, Dict, Any, Tuple

class CompoundRiskFusionEngine:
    @staticmethod
    def calculate_compound_score(factors: List[Dict[str, Any]]) -> Tuple[float, float, str]:
        if not factors:
            return 5.0, 0.0, "SAFE"

        severity_map = {
            "SAFE": 0.05,
            "LOW": 0.20,
            "WARNING": 0.50,
            "HIGH": 0.80,
            "CRITICAL": 0.98
        }

        # 1. Independent Accumulation
        independence_product = 1.0
        for f in factors:
            r_i = severity_map.get(f.get("severity", "SAFE"), 0.1)
            w_i = f.get("weight", 0.1)
            independence_product *= (1.0 - (w_i * r_i))

        base_risk = (1.0 - independence_product) * 80.0

        # 2. Gamma Interaction Multipliers (Spatial & Temporal Overlaps)
        interaction_boost = 0.0
        has_gas = any("GAS" in f["factor_text"].upper() or "LEL" in f["factor_text"].upper() for f in factors)
        has_hot_work = any("HOT WORK" in f["factor_text"].upper() or "WELDING" in f["factor_text"].upper() for f in factors)
        has_vibration = any("VIBRATION" in f["factor_text"].upper() for f in factors)
        has_vision = any("VISION" in f["factor_text"].upper() or "PPE" in f["factor_text"].upper() for f in factors)

        if has_gas and has_hot_work:
            interaction_boost += 35.0  # Massive spike for gas + welding ignition vector
        if has_gas and has_vibration:
            interaction_boost += 18.0  # Hydrocarbon leak from degraded pump seal
        if has_vision and has_gas:
            interaction_boost += 12.0  # Worker non-compliance in active hazard zone

        final_score = min(99.9, max(0.0, base_risk + interaction_boost))
        risk_velocity = +18.4 if final_score > 75 else +2.1

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

risk_engine = CompoundRiskFusionEngine()
