"""
Compliance Domain Agent — RAG regulatory lineage retrieval.
"""
from typing import List, Dict, Any
from backend.rag.vector_kb import rag_engine

class ComplianceAgent:
    @staticmethod
    def evaluate(query: str = "hot work gas LEL pump vibration") -> List[Dict[str, Any]]:
        factors = []
        clauses = rag_engine.query(query, top_k=2)
        for c in clauses:
            factors.append({
                "agent_name": "ComplianceAgent",
                "factor_text": f"Direct Violation Risk of {c['standard']} ({c['section']}): {c['text'][:120]}...",
                "weight": 0.08,
                "severity": "CRITICAL" if "OISD" in c["standard"] or "OSHA" in c["standard"] else "HIGH"
            })
        return factors
