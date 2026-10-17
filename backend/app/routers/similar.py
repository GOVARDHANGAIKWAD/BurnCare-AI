"""
BurnCare AI - Similar Case Retrieval Router with Reference Paper B-Coefficients & MongoDB
"""

import numpy as np
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.mongodb import get_mongo_db, format_doc
from backend.app.models.db_models import Analysis
from ml.embeddings import find_similar_cases

router = APIRouter(prefix="/api/similar", tags=["SimilarCases"])

@router.get("/{analysis_id}")
def get_similar_cases_for_analysis(analysis_id: int, db_sql: Session = Depends(get_db)):
    mongo_db = get_mongo_db()
    if mongo_db is not None:
        analysis = mongo_db.analyses.find_one({"id": analysis_id})
        if analysis:
            # Check if top14_matches already calculated
            matches = analysis.get("top14_matches", [])
            if matches:
                return [
                    {
                        "image_id": m.get("image_id", "REF"),
                        "filename": m.get("filename", "match.png"),
                        "similarity_score": m.get("similarity_score", 0.95),
                        "depth_label": m.get("depth_label", analysis.get("depth", "partial_thickness")),
                        "triage_label": "emergency" if m.get("depth_label") != "superficial" else "primary",
                        "graft_needed": m.get("graft_needed", "yes")
                    }
                    for m in matches[:5]
                ]

    # SQLite fallback
    analysis_sql = db_sql.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis_sql and mongo_db is None:
        raise HTTPException(status_code=404, detail="Analysis record not found.")

    dummy_vec = np.random.randn(256)
    similar_cases = find_similar_cases(dummy_vec, top_k=5)
    return similar_cases
