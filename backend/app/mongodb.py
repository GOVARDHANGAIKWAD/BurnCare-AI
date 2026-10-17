"""
BurnCare AI - MongoDB Connection & Data Access Layer
Provides high-performance document storage in MongoDB for:
- 5,000 to 10,000+ patient-isolated records (analyses & patients)
- Clinical burn diagnostics (LUV moments, Kurtosis, Skewness, B-coefficients)
- Hospitals, Doctors, First-Aid guides, and Users
"""

import os
import datetime
from typing import Optional, List, Dict, Any
from bson import ObjectId
from pymongo import MongoClient, ASCENDING, DESCENDING
from backend.app.config import settings

class MongoDBManager:
    _instance = None
    _client = None
    _db = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MongoDBManager, cls).__new__(cls)
            cls._instance._init_connection()
        return cls._instance

    def _init_connection(self):
        try:
            self._client = MongoClient(
                settings.MONGODB_URL,
                serverSelectionTimeoutMS=3000,
                connectTimeoutMS=3000,
                maxPoolSize=50
            )
            # Test connection
            self._client.admin.command('ping')
            self._db = self._client[settings.MONGODB_DB_NAME]
            print(f"[MongoDB] Connected successfully to database '{settings.MONGODB_DB_NAME}' at {settings.MONGODB_URL}")
            self._ensure_indexes()
        except Exception as e:
            print(f"[MongoDB Warning] Connection failed: {e}. Running with fallback mode.")
            self._db = None

    def get_db(self):
        if self._db is None:
            self._init_connection()
        return self._db

    def is_connected(self) -> bool:
        try:
            if self._client:
                self._client.admin.command('ping')
                return True
        except Exception:
            pass
        return False

    def _ensure_indexes(self):
        if self._db is None:
            return
        try:
            # Users
            self._db.users.create_index([("email", ASCENDING)], unique=True)
            
            # Analyses
            self._db.analyses.create_index([("id", ASCENDING)], unique=True)
            self._db.analyses.create_index([("patient_id", ASCENDING)])
            self._db.analyses.create_index([("created_at", DESCENDING)])
            self._db.analyses.create_index([("triage", ASCENDING)])
            self._db.analyses.create_index([("depth", ASCENDING)])

            # Patients
            self._db.patients.create_index([("patient_id", ASCENDING)], unique=True)

            # Hospitals & Doctors
            self._db.hospitals.create_index([("city", ASCENDING)])
            self._db.doctors.create_index([("city", ASCENDING)])
            self._db.doctors.create_index([("specialty", ASCENDING)])

            # First Aid
            self._db.firstaid_guides.create_index([("severity", ASCENDING)], unique=True)
        except Exception as e:
            print(f"[MongoDB] Index creation warning: {e}")

mongo_manager = MongoDBManager()

def get_mongo_db():
    return mongo_manager.get_db()

def format_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Helper to convert MongoDB document to JSON-serializable dict with standard 'id' field."""
    if not doc:
        return {}
    res = dict(doc)
    if "_id" in res:
        mongo_id = str(res.pop("_id"))
        if "id" not in res:
            res["id"] = mongo_id
    # Format datetimes
    for k, v in list(res.items()):
        if isinstance(v, (datetime.datetime, datetime.date)):
            res[k] = v.isoformat()
    return res

def get_next_analysis_id() -> int:
    """Generates the next sequential integer ID for analysis records."""
    db = get_mongo_db()
    if db is None:
        return 1
    last = db.analyses.find_one(sort=[("id", DESCENDING)])
    if last and "id" in last and isinstance(last["id"], int):
        return last["id"] + 1
    return 1
