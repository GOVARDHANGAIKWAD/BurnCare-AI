"""
BurnCare AI - First-Aid Guidelines Router with MongoDB & SQLite Dual-Support
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.mongodb import get_mongo_db, format_doc
from backend.app.models.db_models import FirstAidGuide

router = APIRouter(prefix="/api/firstaid", tags=["FirstAid"])

DEFAULT_FIRSTAID_GUIDES = {
    "primary": {
        "severity": "primary",
        "steps": [
            {
                "order": 1,
                "title": "Stop the Burning Process Immediately",
                "instruction": "Remove patient from the heat source. Extinguish flames, disconnect electricity, or brush off dry chemical powders. Carefully remove hot or smouldering clothing unless stuck to the skin.",
                "duration_minutes": 1,
                "warning": "Do NOT force off clothing that is stuck tightly to burned skin.",
                "do_dont": "DO move to safety. DON'T pull stuck fabric."
            },
            {
                "order": 2,
                "title": "Cool Burn with Cool Running Water for 20 Minutes",
                "instruction": "Hold the burn under cool, clean running tap water (15–25°C) for a full 20 minutes. This stops heat from penetrating deeper tissue layers.",
                "duration_minutes": 20,
                "warning": "Do NOT use ice, ice water, butter, toothpaste, oil, or home remedies.",
                "do_dont": "DO use cool tap water. DON'T apply ice or grease."
            },
            {
                "order": 3,
                "title": "Remove Jewelry & Constricting Items",
                "instruction": "Gently slip off rings, bangles, watches, and tight clothing near the burn area before swelling begins.",
                "duration_minutes": 2,
                "warning": "Swelling occurs rapidly after thermal injury.",
                "do_dont": "DO remove rings early."
            },
            {
                "order": 4,
                "title": "Cover Burn Loosely with Clean Cling Film or Sterile Dressing",
                "instruction": "Apply clear food-grade cling film lengthways over the wound (do not wrap circumferentially tight), or use a clean non-stick sterile gauze bandage.",
                "duration_minutes": 3,
                "warning": "Do NOT burst blisters. Blisters protect against bacterial infection.",
                "do_dont": "DO cover loosely. DON'T pop blisters."
            },
            {
                "order": 5,
                "title": "Pain Relief & Outpatient Follow-up",
                "instruction": "Over-the-counter pain relief such as Paracetamol or Ibuprofen may be taken as per label or doctor's advice. Inspect wound in 24–48 hours for signs of infection (pus, bad odor, increasing redness, fever).",
                "duration_minutes": 0,
                "warning": "Consult a physician if pain worsens or infection signs develop.",
                "do_dont": "DO follow medical dosing guidelines."
            }
        ]
    },
    "emergency": {
        "severity": "emergency",
        "steps": [
            {
                "order": 1,
                "title": "Call Emergency Services Immediately (112 / 108)",
                "instruction": "Dial 112 (India/Global) or 108 emergency ambulance service immediately. State the location, patient age, and extent of burn injury.",
                "duration_minutes": 1,
                "warning": "Immediate advanced trauma care and specialized burn center admission required.",
                "do_dont": "DO call emergency services first."
            },
            {
                "order": 2,
                "title": "Check Airway, Breathing & Circulation (ABC)",
                "instruction": "Ensure the airway is open. Look for soot around nostrils/mouth, facial burns, or gasping. Position patient sitting upright if breathing is difficult.",
                "duration_minutes": 0,
                "warning": "Inhalation injury causes rapid airway swelling. High mortality risk.",
                "do_dont": "DO keep patient upright if conscious."
            },
            {
                "order": 3,
                "title": "Cool Small/Moderate Burns Gently While Waiting",
                "instruction": "Cool affected skin with cool running water ONLY if it does not delay emergency transport and if hypothermia risk is low.",
                "duration_minutes": 10,
                "warning": "Do NOT overcool large burns (>20% TBSA) in children or elderly as hypothermia will occur.",
                "do_dont": "DO keep patient warm with a clean blanket."
            },
            {
                "order": 4,
                "title": "Cover Burn with Clean Sheet & Treat for Shock",
                "instruction": "Cover burn with a clean dry sheet or sterile towel. Keep patient warm and elevate burned limbs if safe. Do NOT give food or oral liquids.",
                "duration_minutes": 0,
                "warning": "Do NOT give anything by mouth before emergency surgery/anesthesia.",
                "do_dont": "DO keep warm. DON'T give food or water."
            }
        ]
    }
}

@router.get("")
def get_firstaid_guidelines(severity: str = "primary", db_sql: Session = Depends(get_db)):
    sev = severity.lower()
    mongo_db = get_mongo_db()
    if mongo_db is not None:
        guide = mongo_db.firstaid_guides.find_one({"severity": sev})
        if guide:
            return {"severity": guide.get("severity", sev), "steps": guide.get("steps", [])}

    sql_guide = db_sql.query(FirstAidGuide).filter(FirstAidGuide.severity == sev).first()
    if sql_guide:
        return {"severity": sql_guide.severity, "steps": sql_guide.steps}

    if sev in DEFAULT_FIRSTAID_GUIDES:
        return DEFAULT_FIRSTAID_GUIDES[sev]

    return DEFAULT_FIRSTAID_GUIDES["primary"]
