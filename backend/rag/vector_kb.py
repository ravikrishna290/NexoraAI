"""
Regulatory RAG Knowledge Base
Vector search over OSHA 1910.119, OISD-105, OISD-116, The Factories Act 1948, ISO 45001, NFPA 850, and Historical Incidents.
Uses sentence-transformers cosine similarity with fallback to keyword scoring.
"""

import re
from typing import List, Dict, Any

try:
    from sentence_transformers import SentenceTransformer
    import numpy as np
    EMBEDDINGS_AVAILABLE = True
except ImportError:
    EMBEDDINGS_AVAILABLE = False


class RegulatoryRAGEngine:
    KNOWLEDGE_DOCUMENTS: List[Dict[str, Any]] = [
        {
            "id": "OISD-STD-105-SEC-6.2",
            "standard": "OISD-STD-105",
            "section": "Section 6.2 — Hot Work Restrictions",
            "text": (
                "No Hot Work (welding, cutting, grinding, open flame) shall be authorized within "
                "15 meters of any active hydrocarbon leak or where atmospheric LEL gas concentration "
                "exceeds 5% LEL. Continuous gas monitoring is mandatory. Zero LEL clearance certified."
            ),
            "keywords": ["hot work", "welding", "gas", "lel", "hydrocarbon leak", "15m", "open flame"],
        },
        {
            "id": "OISD-STD-116-SEC-4",
            "standard": "OISD-STD-116",
            "section": "Section 4 — Pump & Compressor Mechanical Safety",
            "text": (
                "Centrifugal pumps handling flammable liquids shall have vibration monitoring. "
                "Vibration spectral peaks exceeding 7.0 mm/s indicate mechanical seal degradation. "
                "Immediate LOTO and isolation required."
            ),
            "keywords": ["pump", "compressor", "vibration", "bearing", "seal", "loto", "shutdown"],
        },
        {
            "id": "OSHA-1910-119-K",
            "standard": "OSHA 29 CFR 1910.119(k)",
            "section": "Process Safety Management — Hot Work Permit",
            "text": (
                "The employer shall issue a permit for hot work operations conducted on or near a covered process. "
                "Permit shall document fire prevention precautions implemented prior to work authorization."
            ),
            "keywords": ["osha", "hot work", "process safety", "fire prevention", "permit"],
        },
        {
            "id": "FACTORY-ACT-1948-SEC-37",
            "standard": "The Factories Act 1948",
            "section": "Section 37 — Explosive Fumes & Gases",
            "text": (
                "Where manufacturing process produces explosive dust, gas or vapor, all measures shall be taken "
                "to enclose plant, prevent accumulation, and eliminate ignition sources."
            ),
            "keywords": ["factory act", "explosive fumes", "gas", "ignition source", "fume", "vapor"],
        },
        {
            "id": "ISO-45001-SEC-8.1.2",
            "standard": "ISO 45001:2018",
            "section": "Clause 8.1.2 — Eliminating Hazards & Reducing OH&S Risks",
            "text": (
                "The organization shall establish, implement and maintain a process for the elimination of hazards "
                "and reduction of OH&S risks using hierarchy of controls: Eliminate, Substitute, Engineering controls, Administrative, PPE."
            ),
            "keywords": ["iso 45001", "hazard elimination", "hierarchy of controls", "oh&s risk", "ppe"],
        },
        {
            "id": "NFPA-850-CH-5",
            "standard": "NFPA 850",
            "section": "Chapter 5 — Fire Protection for Electric Generating Plants & Hydrocarbon Facilities",
            "text": (
                "Automatic fixed water spray or vapor dispersion exhaust systems shall be installed over high-hazard "
                "hydrocarbon pump areas to dilute flammable concentrations below LFL."
            ),
            "keywords": ["nfpa 850", "fire protection", "vapor dispersion", "exhaust", "hydrocarbon pump"],
        },
        {
            "id": "INCIDENT-2021-04-12",
            "standard": "Historical Incident Database",
            "section": "Hydrocracker Vapor Cloud Explosion (Jamnagar Complex)",
            "text": (
                "Ignition of flammable hydrocarbon vapor cloud released during hot work maintenance on recirculation pump seal flange "
                "under elevated LEL (24% LEL). Root cause: Failure to correlate SCADA gas telemetry with hot work permit zone."
            ),
            "keywords": ["hydrocracker", "explosion", "pump seal", "vapor cloud", "welding", "jamnagar", "lel"],
        }
    ]

    _model: Any = None
    _embeddings: Any = None

    @classmethod
    def _init_embeddings(cls):
        if not EMBEDDINGS_AVAILABLE:
            return False
        if cls._model is not None:
            return True
        try:
            cls._model = SentenceTransformer("all-MiniLM-L6-v2")
            texts = [f"{d['standard']} {d['section']} {d['text']}" for d in cls.KNOWLEDGE_DOCUMENTS]
            cls._embeddings = cls._model.encode(texts, convert_to_numpy=True, normalize_embeddings=True)
            return True
        except Exception:
            return False

    @classmethod
    def query(cls, query_text: str, top_k: int = 3) -> List[Dict[str, Any]]:
        if cls._init_embeddings():
            q_vec = cls._model.encode([query_text], convert_to_numpy=True, normalize_embeddings=True)[0]
            scores = [float(np.dot(q_vec, d_vec)) for d_vec in cls._embeddings]
            ranked = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)
            results = []
            for idx in ranked[:top_k]:
                doc = dict(cls.KNOWLEDGE_DOCUMENTS[idx])
                doc["similarity_score"] = round(scores[idx], 4)
                doc["retrieval_method"] = "semantic_vector"
                results.append(doc)
            return results

        # Keyword fallback
        query_words = set(re.findall(r'\w+', query_text.lower()))
        scored = []
        for doc in cls.KNOWLEDGE_DOCUMENTS:
            score = 0
            for kw in doc["keywords"]:
                if kw in query_text.lower(): score += 2
            for w in query_words:
                if w in doc["text"].lower(): score += 1
            if score > 0:
                d = dict(doc)
                d["similarity_score"] = round(score / 15.0, 4)
                d["retrieval_method"] = "keyword_fallback"
                scored.append((score, d))
        scored.sort(key=lambda x: x[0], reverse=True)
        return [doc for _, doc in scored[:top_k]]

rag_engine = RegulatoryRAGEngine()
