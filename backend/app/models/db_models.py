import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    role = Column(String, default="user") # 'user' or 'admin'
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    analyses = relationship("Analysis", back_populates="user")

class Analysis(Base):
    __tablename__ = "analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    image_path = Column(String, nullable=False)
    original_filename = Column(String, nullable=True)
    depth = Column(String, nullable=False) # superficial / partial_thickness / full_thickness
    depth_confidence = Column(Float, nullable=False)
    triage = Column(String, nullable=False) # primary / emergency
    triage_reasons = Column(JSON, nullable=True) # List of reasons for escalation
    heatmap_path = Column(String, nullable=True)
    questionnaire = Column(JSON, nullable=True) # Submitted clinical questionnaire
    graft_needed = Column(String, nullable=True) # yes / no
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="analyses")

class Hospital(Base):
    __tablename__ = "hospitals"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, default="General Hospital") # Burn Center / Tertiary Hospital
    city = Column(String, nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    has_burn_unit = Column(Boolean, default=False)
    
    doctors = relationship("Doctor", back_populates="hospital")

class Doctor(Base):
    __tablename__ = "doctors"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    specialty = Column(String, nullable=False) # plastic_surgery / burn_specialist
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=True)
    phone = Column(String, nullable=True)
    city = Column(String, nullable=False)
    
    hospital = relationship("Hospital", back_populates="doctors")

class FirstAidGuide(Base):
    __tablename__ = "firstaid_guides"
    
    id = Column(Integer, primary_key=True, index=True)
    severity = Column(String, unique=True, nullable=False) # primary or emergency
    steps = Column(JSON, nullable=False) # List of [{order, title, instruction, duration_minutes, warning, do_dont}]
