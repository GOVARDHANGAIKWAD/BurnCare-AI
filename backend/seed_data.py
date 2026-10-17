"""
BurnCare AI - Comprehensive Database Seed Script
Populates:
1. Default Admin user
2. WHO/Red Cross First-Aid Guides
3. Hospitals & Specialized Plastic Surgeons
4. 30 Realistic Demo Patient Medical Records (spanning past 30 days) for Disaster Queue Dashboard
"""
import os
import sys
import random
import datetime

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from backend.app.database import SessionLocal, engine, Base
from backend.app.models.db_models import Hospital, Doctor, FirstAidGuide, User, Analysis
from backend.app.services.auth_service import hash_password
from backend.app.routers.firstaid import DEFAULT_FIRSTAID_GUIDES

SAMPLE_PATIENT_NAMES = [
    "Rajesh Kumar", "Priya Sharma", "Amitabh Varma", "Sunita Deshmukh", "Vikramaditya Singh",
    "Ananya Iyer", "Karan Patel", "Sneha Rao", "Manish Malhotra", "Deepika Padukone",
    "Rohan Kulkarni", "Meera Nair", "Arjun Reddy", "Kavita Joshi", "Siddharth Malhotra",
    "Pooja Hegde", "Aditya Roy", "Divya Agarwal", "Nikhil D'Souza", "Shreya Ghoshal",
    "Aakash Banerjee", "Tanvi Shah", "Gaurav Gupta", "Neha Kakkar", "Varun Dhawan",
    "Ritu Karidhal", "Sanjay Dutt", "Harini Subrahmanyam", "Farhan Akhtar", "Zoya Akhtar"
]

BODY_REGIONS = ["face", "neck", "hands", "feet", "genitals", "joint", "torso", "arm", "leg"]
CAUSES = ["flame", "scald", "chemical", "electrical", "hot_object"]
DEPTHS = ["superficial", "partial_thickness", "full_thickness"]

def seed_database():
    print("Initializing BurnCare AI database tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # 1. Admin User
        admin = db.query(User).filter(User.email == "admin@burncare.ai").first()
        if not admin:
            admin_user = User(
                email="admin@burncare.ai",
                hashed_password=hash_password("Admin@123456"),
                full_name="Dr. Clinical Director (Admin)",
                role="admin"
            )
            db.add(admin_user)
            print("Seeded Admin user: admin@burncare.ai")

        # 2. First-Aid Guides
        for severity, guide_data in DEFAULT_FIRSTAID_GUIDES.items():
            existing = db.query(FirstAidGuide).filter(FirstAidGuide.severity == severity).first()
            if not existing:
                guide = FirstAidGuide(severity=severity, steps=guide_data["steps"])
                db.add(guide)

        # 3. Hospitals & Doctors
        sample_hospitals = [
            {
                "name": "Surya Burn & Plastic Surgery Center",
                "type": "Specialized Burn Center",
                "city": "Pune",
                "lat": 18.5204,
                "lng": 73.8567,
                "phone": "+91 20 2612 3456",
                "address": "Rasta Peth, Near Apollo Pharmacy, Pune, Maharashtra 411011",
                "has_burn_unit": True,
                "doctors": [
                    {"name": "Dr. Rajesh Sharma", "specialty": "burn_specialist", "phone": "+91 98220 11223"},
                    {"name": "Dr. Ananya Deshmukh", "specialty": "plastic_surgery", "phone": "+91 98220 44556"}
                ]
            },
            {
                "name": "Sassoon General Hospital (Government Trauma & Burn ICU)",
                "type": "Tertiary Care Hospital",
                "city": "Pune",
                "lat": 18.5289,
                "lng": 73.8744,
                "phone": "+91 20 2612 8000",
                "address": "Near Pune Railway Station, Pune, Maharashtra 411001",
                "has_burn_unit": True,
                "doctors": [
                    {"name": "Dr. Vikram Patil", "specialty": "burn_specialist", "phone": "+91 98900 77889"}
                ]
            },
            {
                "name": "Victoria Hospital Burn Care Center (BMCRI)",
                "type": "State Burn Trauma Center",
                "city": "Bengaluru",
                "lat": 12.9634,
                "lng": 77.5750,
                "phone": "+91 80 2670 1150",
                "address": "Fort, Near KR Market, Bengaluru, Karnataka 560002",
                "has_burn_unit": True,
                "doctors": [
                    {"name": "Dr. K. S. Murthy", "specialty": "plastic_surgery", "phone": "+91 98450 12345"},
                    {"name": "Dr. Sunita Rao", "specialty": "burn_specialist", "phone": "+91 98450 67890"}
                ]
            },
            {
                "name": "Manipal Hospital Whitefield",
                "type": "Multispecialty Hospital",
                "city": "Bengaluru",
                "lat": 12.9863,
                "lng": 77.7345,
                "phone": "+91 80 2502 4444",
                "address": "ITPL Main Road, Whitefield, Bengaluru, Karnataka 560066",
                "has_burn_unit": True,
                "doctors": [
                    {"name": "Dr. Arvind Hegde", "specialty": "plastic_surgery", "phone": "+91 98800 33445"}
                ]
            },
            {
                "name": "KEM Hospital Burn & Reconstruction Unit",
                "type": "Premier Academic Burn Center",
                "city": "Mumbai",
                "lat": 19.0026,
                "lng": 72.8423,
                "phone": "+91 22 2410 7000",
                "address": "Acharya Donde Marg, Parel, Mumbai, Maharashtra 400012",
                "has_burn_unit": True,
                "doctors": [
                    {"name": "Dr. Milind Wagh", "specialty": "burn_specialist", "phone": "+91 98200 99887"}
                ]
            },
            {
                "name": "AIIMS New Delhi Burn & Plastic Surgery Trauma Center",
                "type": "National Apex Burn Institute",
                "city": "Delhi",
                "lat": 28.5672,
                "lng": 77.2100,
                "phone": "+91 11 2658 8500",
                "address": "Ansari Nagar, New Delhi 110029",
                "has_burn_unit": True,
                "doctors": [
                    {"name": "Dr. Maneesh Singhal", "specialty": "plastic_surgery", "phone": "+91 98100 11223"}
                ]
            }
        ]

        for h_data in sample_hospitals:
            existing_h = db.query(Hospital).filter(Hospital.name == h_data["name"]).first()
            if not existing_h:
                h_obj = Hospital(
                    name=h_data["name"],
                    type=h_data["type"],
                    city=h_data["city"],
                    lat=h_data["lat"],
                    lng=h_data["lng"],
                    phone=h_data["phone"],
                    address=h_data["address"],
                    has_burn_unit=h_data["has_burn_unit"]
                )
                db.add(h_obj)
                db.commit()
                db.refresh(h_obj)
                
                for d_data in h_data["doctors"]:
                    d_obj = Doctor(
                        name=d_data["name"],
                        specialty=d_data["specialty"],
                        hospital_id=h_obj.id,
                        phone=d_data["phone"],
                        city=h_data["city"]
                    )
                    db.add(d_obj)
                db.commit()

        # 4. Seed 30 Demo Patient Medical Records (spanning past 30 days)
        existing_analyses_count = db.query(Analysis).count()
        if existing_analyses_count < 20:
            print("Seeding 30 realistic demo patient medical records spanning past 30 days...")
            now = datetime.datetime.utcnow()
            
            for idx, name in enumerate(SAMPLE_PATIENT_NAMES):
                days_ago = random.randint(0, 30)
                scan_date = now - datetime.timedelta(days=days_ago, hours=random.randint(1, 23))
                
                region = random.choice(BODY_REGIONS)
                cause = random.choice(CAUSES)
                depth = random.choice(DEPTHS)
                
                # Assign 3-tier triage
                if region in ["face", "neck", "genitals"] or depth == "full_thickness" or cause in ["chemical", "electrical"]:
                    triage = "CRITICAL" if (region in ["face", "neck"] or cause == "chemical") else "EMERGENCY"
                    reasons = [f"Specialist referral: {region.capitalize()} involvement or {cause.capitalize()} injury mechanism."]
                    graft = "yes"
                elif depth == "partial_thickness":
                    triage = "EMERGENCY"
                    reasons = ["Urgent hospital transfer: Partial-thickness dermal destruction."]
                    graft = "yes" if random.random() > 0.5 else "no"
                else:
                    triage = "PRIMARY"
                    reasons = ["Primary outpatient care: Superficial minor epidermal burn."]
                    graft = "no"

                confidence = round(random.uniform(0.78, 0.98), 3)

                a_record = Analysis(
                    image_path=f"upload_demo_{idx+1:02d}.png",
                    original_filename=f"{name.replace(' ', '_')}_burn.png",
                    depth=depth,
                    depth_confidence=confidence,
                    triage=triage,
                    triage_reasons=reasons,
                    heatmap_path=f"heatmap_demo_{idx+1:02d}.png",
                    questionnaire={
                        "patient_name": name,
                        "weight_kg": random.randint(50, 95),
                        "age": random.randint(4, 75),
                        "body_region": region,
                        "cause": cause,
                        "larger_than_palm": (triage != "PRIMARY"),
                        "breathing_difficulty": (triage == "CRITICAL"),
                        "unconscious_or_shock": (triage == "CRITICAL" and random.random() > 0.6)
                    },
                    graft_needed=graft,
                    created_at=scan_date
                )
                db.add(a_record)

            db.commit()
            print("Successfully seeded 30 demo patient medical records!")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
