"""
ChromaDB & Sentence-Transformers Vector Knowledge Store for Nexora.
"""

import os
from typing import List, Dict, Any
from sentence_transformers import SentenceTransformer
from backend.utils.logger import logger

REGULATORY_DOCS = [
    {
        "id": "OISD-105-SEC-6.2",
        "standard": "OISD-STD-105",
        "section": "Section 6.2",
        "title": "Work Permit Gas Testing Criteria",
        "content": "Hot work shall not be permitted if combustible gas concentration exceeds 5% of Lower Explosive Limit (LEL) in the vicinity (<15m) of the work location."
    },
    {
        "id": "OSHA-1910.119-K",
        "standard": "OSHA 1910.119",
        "section": "Paragraph (k)",
        "title": "Process Safety Management Hot Work Permit",
        "content": "Hot work permits must document that fire prevention methods have been implemented before welding or cutting begins in proximity to flammable chemical processes."
    },
    {
        "id": "ISO-45001-8.1.2",
        "standard": "ISO 45001",
        "section": "Section 8.1.2",
        "title": "Eliminating Hazards and Reducing OH&S Risks",
        "content": "Organizations shall apply hierarchy of controls: eliminate hazard, substitute, engineering controls, administrative controls, and PPE."
    },
    {
        "id": "NFPA-850-CH-5",
        "standard": "NFPA 850",
        "section": "Chapter 5",
        "title": "Fire Protection for Power Plants and Refineries",
        "content": "Automatic deluge systems and emergency evacuation isolation valves must trip upon dual-detector LEL gas accumulation >20% LEL."
    }
]

class VectorKnowledgeStore:
    def __init__(self):
        self.model = SentenceTransformer("all-MiniLM-L6-v2")
        self.docs = REGULATORY_DOCS
        self.doc_embeddings = self.model.encode([d["content"] for d in self.docs], normalize_embeddings=True)
        logger.info(f"[VectorKB] Vector knowledge store initialized with {len(self.docs)} regulatory clauses.")

    def search_similar(self, query: str, top_k: int = 2) -> List[Dict[str, Any]]:
        """Search vector database using cosine similarity embeddings."""
        query_embedding = self.model.encode([query], normalize_embeddings=True)
        import numpy as np
        similarities = np.dot(self.doc_embeddings, query_embedding.T).flatten()
        top_indices = np.argsort(similarities)[::-1][:top_k]

        results = []
        for idx in top_indices:
            doc = self.docs[idx].copy()
            doc["score"] = float(similarities[idx])
            results.append(doc)
        return results

# Global singleton
vector_kb = VectorKnowledgeStore()
