"""
BurnCare AI - Hospitals Router with MongoDB & SQLite Dual-Support
"""

from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.mongodb import get_mongo_db, format_doc
from backend.app.models.db_models import Hospital
from backend.app.services.hospital_service import haversine_distance, fetch_openstreetmap_hospitals

router = APIRouter(prefix="/api/hospitals", tags=["Hospitals"])

@router.get("/nearby")
def get_nearby_hospitals(
    lat: float = Query(..., description="Latitude coordinate"),
    lng: float = Query(..., description="Longitude coordinate"),
    radius_km: float = Query(35.0, description="Search radius in kilometers"),
    db_sql: Session = Depends(get_db)
):
    results = []
    mongo_db = get_mongo_db()

    if mongo_db is not None:
        try:
            hospitals = list(mongo_db.hospitals.find({}))
            doctors_list = list(mongo_db.doctors.find({}))

            # Group doctors by hospital_id
            docs_by_hosp = {}
            for d in doctors_list:
                hid = d.get("hospital_id")
                if hid not in docs_by_hosp:
                    docs_by_hosp[hid] = []
                docs_by_hosp[hid].append({
                    "id": d.get("id", 1),
                    "name": d.get("name", ""),
                    "specialty": d.get("specialty", ""),
                    "phone": d.get("phone", ""),
                    "city": d.get("city", "")
                })

            for h in hospitals:
                dist = haversine_distance(lat, lng, h["lat"], h["lng"])
                if dist <= radius_km:
                    hid = h.get("id", 1)
                    results.append({
                        "id": hid,
                        "name": h["name"],
                        "type": h.get("type", "General Hospital"),
                        "city": h["city"],
                        "lat": h["lat"],
                        "lng": h["lng"],
                        "phone": h.get("phone", ""),
                        "address": h.get("address", ""),
                        "has_burn_unit": h.get("has_burn_unit", False),
                        "distance_km": round(dist, 2),
                        "doctors": docs_by_hosp.get(hid, [])
                    })
        except Exception as e:
            print(f"[MongoDB Hospital Query Warning] {e}")

    # Fallback to SQLite if MongoDB had no records
    if not results:
        sql_hospitals = db_sql.query(Hospital).all()
        for h in sql_hospitals:
            dist = haversine_distance(lat, lng, h.lat, h.lng)
            if dist <= radius_km:
                doctors = [
                    {
                        "id": d.id,
                        "name": d.name,
                        "specialty": d.specialty,
                        "phone": d.phone,
                        "city": d.city
                    }
                    for d in h.doctors
                ]
                results.append({
                    "id": h.id,
                    "name": h.name,
                    "type": h.type,
                    "city": h.city,
                    "lat": h.lat,
                    "lng": h.lng,
                    "phone": h.phone,
                    "address": h.address,
                    "has_burn_unit": h.has_burn_unit,
                    "distance_km": round(dist, 2),
                    "doctors": doctors
                })

    # Sort local results by distance
    results.sort(key=lambda x: x["distance_km"])

    # Fallback to OpenStreetMap Overpass API if few local DB results found
    if len(results) < 3:
        osm_hospitals = fetch_openstreetmap_hospitals(lat, lng, radius_km=radius_km)
        existing_names = set(r["name"].lower() for r in results)
        for osm_h in osm_hospitals:
            if osm_h["name"].lower() not in existing_names:
                results.append(osm_h)
                existing_names.add(osm_h["name"].lower())

        results.sort(key=lambda x: x["distance_km"])

    return results
