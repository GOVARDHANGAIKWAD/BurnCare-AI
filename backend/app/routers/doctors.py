"""
BurnCare AI - Doctors Router with MongoDB & SQLite Dual-Support
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.mongodb import get_mongo_db, format_doc
from backend.app.models.db_models import Doctor

router = APIRouter(prefix="/api/doctors", tags=["Doctors"])

@router.get("")
def search_doctors(
    city: Optional[str] = Query(None, description="Filter by city name"),
    specialty: Optional[str] = Query(None, description="plastic_surgery or burn_specialist"),
    db_sql: Session = Depends(get_db)
):
    mongo_db = get_mongo_db()
    if mongo_db is not None:
        try:
            query = {}
            if city:
                query["city"] = {"$regex": city, "$options": "i"}
            if specialty:
                query["specialty"] = {"$regex": specialty, "$options": "i"}
            docs = list(mongo_db.doctors.find(query))
            if docs:
                return [
                    {
                        "id": d.get("id", 1),
                        "name": d.get("name", ""),
                        "specialty": d.get("specialty", ""),
                        "hospital_id": d.get("hospital_id"),
                        "phone": d.get("phone", ""),
                        "city": d.get("city", "")
                    }
                    for d in docs
                ]
        except Exception as e:
            print(f"[MongoDB Doctor Query Warning] {e}")

    # Fallback to SQLite
    query = db_sql.query(Doctor)
    if city:
        query = query.filter(Doctor.city.ilike(f"%{city}%"))
    if specialty:
        query = query.filter(Doctor.specialty.ilike(f"%{specialty}%"))

    doctors = query.all()
    results = []
    for d in doctors:
        results.append({
            "id": d.id,
            "name": d.name,
            "specialty": d.specialty,
            "hospital_id": d.hospital_id,
            "phone": d.phone,
            "city": d.city
        })
    return results
