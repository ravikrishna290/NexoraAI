"""
Nexora AI Engine — Upgraded RAG Knowledge Base
Uses sentence-transformers for real semantic vector embedding + cosine similarity retrieval.
Falls back to keyword scoring if sentence-transformers is not installed.
"""

import re
import math
from typing import List, Dict, Any, Tuple

try:
    from sentence_transformers import SentenceTransformer
    import numpy as np
    EMBEDDINGS_AVAILABLE = True
except ImportError:
    EMBEDDINGS_AVAILABLE = False


class RegulatoryKnowledgeBase:
    """
    RAG Retrieval System over Industrial Safety Regulations & Incident Knowledge Base.
    
    Primary: Sentence-transformer semantic vector search (cosine similarity)
    Fallback: Keyword overlap scoring
    
    Corpus:
    - OISD-STD-105 (Work Permit System in Petroleum Industry)
    - OSHA 1910.119 (Process Safety Management)
    - The Factories Act 1948
    - Historical Industrial Incident Database
    """

    KNOWLEDGE_DOCUMENTS: List[Dict[str, Any]] = [
        {
            "id": "OISD-STD-105-SEC-6.2",
            "standard": "OISD-STD-105",
            "section": "Section 6.2 — Hot Work Restrictions",
            "text": (
                "No Hot Work (welding, cutting, grinding, open flame) shall be authorized within "
                "15 meters of any active hydrocarbon leak or where atmospheric LEL gas concentration "
                "exceeds 5% LEL. Continuous gas monitoring is mandatory. The permit issuer must confirm "
                "zero LEL readings on a calibrated gas detector before countersigning."
            ),
            "keywords": ["hot work", "welding", "gas", "lel", "hydrocarbon leak", "15m", "open flame", "grinding"],
        },
        {
            "id": "OISD-STD-105-SEC-7.1",
            "standard": "OISD-STD-105",
            "section": "Section 7.1 — Confined Space Entry Requirements",
            "text": (
                "Confined space entry permits are only valid after atmospheric testing for oxygen (19.5–23.5%), "
                "flammable gas (< 10% LEL), and toxic gases (H2S < 10 ppm). A standby person must be stationed "
                "outside the confined space at all times. Entry is prohibited until atmospheric clearance is certified."
            ),
            "keywords": ["confined space", "oxygen", "h2s", "atmospheric testing", "standby", "entry permit"],
        },
        {
            "id": "OSHA-1910-119-K",
            "standard": "OSHA 1910.119(k)",
            "section": "Process Safety Management — Hot Work Permit",
            "text": (
                "The employer shall issue a permit for hot work operations conducted on or near a covered process. "
                "The permit shall document that fire prevention and protection requirements have been implemented "
                "prior to beginning the hot work operations and shall indicate the date(s) authorized for hot work."
            ),
            "keywords": ["osha", "hot work", "process safety", "fire prevention", "employer", "permit"],
        },
        {
            "id": "OSHA-1910-119-D",
            "standard": "OSHA 1910.119(d)",
            "section": "Process Hazard Analysis",
            "text": (
                "The employer shall perform an initial process hazard analysis (PHA) on processes covered by this standard. "
                "The PHA shall be appropriate to the complexity of the process and shall identify, evaluate, and control "
                "hazards involved in the process. Methodologies: What-If, Checklist, HAZOP, FMEA, Fault Tree Analysis."
            ),
            "keywords": ["hazop", "process hazard analysis", "pha", "hazard analysis", "fmea", "fault tree"],
        },
        {
            "id": "FACTORY-ACT-1948-SEC-37",
            "standard": "The Factories Act 1948",
            "section": "Section 37 — Precautions Against Explosive Fumes",
            "text": (
                "Where in any factory any manufacturing process produces dangerous dust, gas, fume or vapor of such "
                "character and extent as to be likely to explode on ignition, all practicable measures shall be taken "
                "to prevent explosion by enclosing plant and equipment in which process is carried on, removal or "
                "prevention of accumulation, and stopping all ignition sources."
            ),
            "keywords": ["factory act", "explosive fumes", "gas", "ignition source", "fume", "vapor", "dust"],
        },
        {
            "id": "OISD-STD-116-SEC-4",
            "standard": "OISD-STD-116",
            "section": "Section 4 — Pump & Compressor Safety",
            "text": (
                "Centrifugal pumps and compressors handling flammable or toxic fluids shall be equipped with "
                "vibration and temperature monitoring systems. Vibration levels exceeding 7.0 mm/s (RMS) indicate "
                "bearing or seal failure and require immediate shutdown and inspection. LOTO procedures shall be "
                "applied before any maintenance activity."
            ),
            "keywords": ["pump", "compressor", "vibration", "bearing", "seal", "loto", "shutdown", "centrifugal"],
        },
        {
            "id": "INCIDENT-2021-04-12",
            "standard": "Historical Incident Database",
            "section": "Hydrocracker Vapor Cloud Explosion (Refinery West, Jamnagar)",
            "text": (
                "Ignition of flammable hydrocarbon vapor cloud released during hot work maintenance on recirculation "
                "pump seal flange under high ambient LEL conditions (24% LEL at 08:12 local time). Root cause: "
                "Failure to correlate SCADA gas telemetry with hot work permit zone. The gas sensor G-104 equivalent "
                "alarm was acknowledged and silenced without field verification. 3 fatalities, 11 injuries. "
                "Total loss: USD 47 million."
            ),
            "keywords": ["hydrocracker", "explosion", "pump seal", "vapor cloud", "welding", "jamnagar", "lel", "fatalities"],
        },
        {
            "id": "INCIDENT-2018-11-03",
            "standard": "Historical Incident Database",
            "section": "Chemical Plant Flash Fire (Vadodara, Gujarat)",
            "text": (
                "Flash fire during shift changeover at chemical plant ethylene unit. Two maintenance workers performing "
                "uncontrolled hot work (grinding) on a pressurized line without valid work permit. LEL sensor was "
                "offline due to calibration maintenance. Crew fatigue (13.5 hr continuous shift) contributed to "
                "procedural non-compliance. 1 fatality, 4 injuries."
            ),
            "keywords": ["flash fire", "grinding", "shift changeover", "work permit", "fatigue", "ethylene", "pressurized"],
        },
    ]

    # Class-level embedding cache (initialized once)
    _model: Any = None
    _doc_embeddings: Any = None

    @classmethod
    def _load_embeddings(cls) -> bool:
        """Load sentence-transformer model and pre-compute document embeddings."""
        if not EMBEDDINGS_AVAILABLE:
            return False
        if cls._model is not None:
            return True
        try:
            # Use lightweight model suitable for industrial text
            cls._model = SentenceTransformer("all-MiniLM-L6-v2")
            corpus = [f"{d['standard']} {d['section']} {d['text']}" for d in cls.KNOWLEDGE_DOCUMENTS]
            cls._doc_embeddings = cls._model.encode(corpus, convert_to_numpy=True, normalize_embeddings=True)
            return True
        except Exception:
            return False

    @classmethod
    def _cosine_similarity(cls, a: "np.ndarray", b: "np.ndarray") -> float:
        """Compute cosine similarity between two normalized vectors."""
        return float(np.dot(a, b))

    @classmethod
    def query_relevant_clauses(cls, query_text: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """
        Retrieves top_k matching regulatory clauses and historical incident records.

        Primary:  Sentence-transformer semantic search (cosine similarity)
        Fallback: Keyword overlap scoring
        """
        # --- Primary: Vector semantic search ---
        if cls._load_embeddings():
            import numpy as np
            query_vec = cls._model.encode([query_text], convert_to_numpy=True, normalize_embeddings=True)[0]
            scores = [cls._cosine_similarity(query_vec, doc_vec) for doc_vec in cls._doc_embeddings]
            ranked_indices = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)
            results = []
            for idx in ranked_indices[:top_k]:
                doc = dict(cls.KNOWLEDGE_DOCUMENTS[idx])
                doc["similarity_score"] = round(scores[idx], 4)
                doc["retrieval_method"] = "semantic_vector"
                results.append(doc)
            return results

        # --- Fallback: Keyword overlap scoring ---
        query_words = set(re.findall(r'\w+', query_text.lower()))
        scored_docs = []
        for doc in cls.KNOWLEDGE_DOCUMENTS:
            score = 0
            for kw in doc["keywords"]:
                if kw in query_text.lower():
                    score += 2
            for word in query_words:
                if word in doc["text"].lower():
                    score += 1
            if score > 0:
                d = dict(doc)
                d["similarity_score"] = round(score / 20, 4)
                d["retrieval_method"] = "keyword_fallback"
                scored_docs.append((score, d))
        scored_docs.sort(key=lambda x: x[0], reverse=True)
        return [doc for _, doc in scored_docs[:top_k]]
