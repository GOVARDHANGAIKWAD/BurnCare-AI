from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr

# Auth Schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    email: str
    full_name: Optional[str] = None
    role: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    role: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Analysis Schemas
class QuestionnaireInput(BaseModel):
    age: Optional[int] = 30
    body_region: Optional[str] = "arm" # face, neck, hands, feet, genitals, joint, arm, leg, torso
    cause: Optional[str] = "flame" # flame, scald, hot_object, chemical, electrical
    larger_than_palm: Optional[bool] = False
    breathing_difficulty: Optional[bool] = False
    unconscious_or_shock: Optional[bool] = False
    severe_pain: Optional[bool] = True

class AnalysisResponse(BaseModel):
    id: int
    image_url: str
    heatmap_url: Optional[str] = None
    depth: str # superficial, partial_thickness, full_thickness
    depth_confidence: float
    triage: str # primary, emergency
    triage_reasons: List[str]
    questionnaire: Optional[Dict[str, Any]] = None
    graft_needed: str # yes / no
    created_at: datetime
    
    class Config:
        from_attributes = True

# Hospital & Doctor Schemas
class DoctorResponse(BaseModel):
    id: int
    name: str
    specialty: str
    phone: Optional[str] = None
    city: str
    
    class Config:
        from_attributes = True

class HospitalResponse(BaseModel):
    id: int
    name: str
    type: str
    city: str
    lat: float
    lng: float
    phone: Optional[str] = None
    address: Optional[str] = None
    has_burn_unit: bool
    distance_km: Optional[float] = None
    doctors: List[DoctorResponse] = []
    
    class Config:
        from_attributes = True

# First-Aid Schema
class FirstAidStep(BaseModel):
    order: int
    title: str
    instruction: str
    duration_minutes: Optional[int] = None
    warning: Optional[str] = None
    do_dont: Optional[str] = None

class FirstAidResponse(BaseModel):
    severity: str
    steps: List[FirstAidStep]
