import os
import json
import urllib.request
import urllib.error
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend.app.config import settings

router = APIRouter(prefix="/api", tags=["AI Doctor Assistant"])

class ChatMessage(BaseModel):
    role: str # "user" or "assistant" or "system"
    content: str

class ChatRequest(BaseModel):
    message: str
    api_key: Optional[str] = None
    history: Optional[List[ChatMessage]] = []
    context: Optional[Dict[str, Any]] = None

SYSTEM_DOCTOR_PROMPT = """You are Dr. BurnCare AI, an expert Clinical Burn Specialist & Emergency Triage Specialist Doctor.
When a patient or paramedic describes a disease, burn condition, skin lesion, or disaster scenario, provide structured, compassionate, and authoritative medical guidance.

Format your responses with clear markdown headings and sections:
1. 🩺 **Clinical Assessment & Diagnosis Context**
2. ⚠️ **Immediate Precautions & Safety Measures**
3. 🩹 **Step-by-Step Emergency First-Aid**
4. 💊 **Recommended Medications & Dressings** (e.g., Paracetamol/Ibuprofen for pain, Silver Sulfadiazine 1%, Mupirocin, Hydrogel, Sterile wraps)
5. 🚨 **Red-Flag Warning Signs (When to Call Ambulance / Seek ICU Care)**

Maintain a professional, reassuring medical tone. Include appropriate medical disclaimers."""

def generate_clinical_fallback_response(query: str, context: Optional[Dict[str, Any]] = None) -> str:
    q_lower = query.lower()
    
    # Context-aware extraction
    triage_info = ""
    if context:
        triage = context.get("triage", "UNSPECIFIED")
        depth = context.get("depth", "unspecified").replace("_", " ")
        triage_info = f"\n*Current Scan Record: Triage Level = {triage}, Depth = {depth}*\n"

    # Keywords matching
    is_chemical = "chemical" in q_lower or "acid" in q_lower or "alkali" in q_lower
    is_electrical = "electrical" in q_lower or "shock" in q_lower or "current" in q_lower or "wire" in q_lower
    is_scald = "scald" in q_lower or "water" in q_lower or "steam" in q_lower or "oil" in q_lower or "hot liquid" in q_lower
    is_face = "face" in q_lower or "facial" in q_lower or "eye" in q_lower or "mouth" in q_lower or "neck" in q_lower
    is_infection = "infection" in q_lower or "pus" in q_lower or "fever" in q_lower or "smell" in q_lower or "redness" in q_lower or "swelling" in q_lower
    is_medication = "medicine" in q_lower or "medication" in q_lower or "drug" in q_lower or "cream" in q_lower or "ointment" in q_lower or "pill" in q_lower or "pain" in q_lower

    if is_infection:
        return f"""🩺 **Dr. BurnCare AI — Wound Infection Clinical Protocol**
{triage_info}
### ⚠️ Key Precautions
- **Do NOT pop blisters** or strip dead skin manually.
- Avoid applying home remedies (butter, toothpaste, ice, or unsterilized oils).
- Keep the affected area clean, elevated, and protected with non-stick sterile gauze.

### 💊 Recommended Medications & Dressings
- **Topical Antimicrobial Cream:** Silver Sulfadiazine 1% Cream or Mupirocin 2% Ointment applied twice daily under sterile wrap.
- **Pain Relief:** Paracetamol (500mg–1000mg every 6h) or Ibuprofen (400mg every 8h after food).
- **Systemic Antibiotics:** Oral Amoxicillin-Clavulanate or Cephalexin (only upon doctor prescription).

### 🚨 Red-Flag Infection Signs (Seek Immediate Hospital Care)
- Spreading redness (>2 cm beyond burn border) or red streaks.
- Foul-smelling purulent discharge or pus.
- High fever (>38.5°C / 101.3°F), chills, or confusion."""

    if is_face:
        return f"""🩺 **Dr. BurnCare AI — Facial & Airway Burn Protocol**
{triage_info}
### ⚠️ CRITICAL PRECAUTIONS (High Vulnerability Zone)
- **Airway Warning:** Facial and neck burns carry a high risk of respiratory inhalation injury and airway swelling.
- **Eye Care:** Flush eyes immediately with sterile saline or clean lukewarm water if exposed to heat/steam.
- Do NOT apply heavy oily ointments around eyes or nasal passages.

### 🩹 Immediate Actions
1. Sit upright to reduce facial swelling.
2. Apply clean cloth soaked in cool (not freezing) water for 15–20 minutes.
3. Loosely cover with non-stick sterile paraffin gauze.

### 💊 Recommended Medications
- **Eye Protection:** Lubricating artificial tear drops or Erythromycin eye ointment.
- **Analgesia:** Oral Paracetamol 1g every 6 hours.
- **Topical Antiseptic:** Chlorhexidine wash followed by thin Mupirocin cream.

### 🚨 RUSH TO EMERGENCY ROOM IF:
- Hoarseness in voice, coughing up black soot, or shortness of breath.
- Eyelid swelling preventing eye opening."""

    if is_chemical or is_electrical:
        mechanism = "Chemical Agent" if is_chemical else "Electrical Current"
        return f"""🩺 **Dr. BurnCare AI — {mechanism} Emergency Protocol**
{triage_info}
### ⚠️ URGENT PRECAUTIONS
- **{mechanism} injuries are deceptive!** Internal tissue destruction is often much deeper than visible skin changes.
- For chemical burns: Brush off dry powder chemicals FIRST, then continuously flush with running tap water for at least 20–30 minutes.
- For electrical burns: Ensure power source is disconnected. Check cardiac pulse and breathing immediately.

### 💊 Recommended Clinical Management
- Continuous IV Fluid Resuscitation (Parkland formula protocol).
- Tetanus Toxoid Booster (0.5 mL IM).
- Analgesia via IV Morphine or Oral Paracetamol/Tramadol under paramedic care.

### 🚨 IMMEDIATE ACTION: Call 112 / 108 Ambulance immediately for hospital trauma transfer."""

    if is_scald:
        return f"""🩺 **Dr. BurnCare AI — Scald Burn First-Aid & Treatment Guide**
{triage_info}
### ⚠️ Precautions
- Remove wet clothing soaked in hot liquid immediately, UNLESS stuck to skin.
- Do NOT apply ice directly, as extreme cold causes vasospasm and deepens tissue injury.

### 🩹 Step-by-Step First-Aid
1. **Cooling:** Hold under cool running tap water (15°C–20°C) for 20 full minutes.
2. **Covering:** Wrap loosely in clean food-grade cling film or sterile non-adherent dressing.

### 💊 Recommended Medications & Care
- **Pain Management:** Ibuprofen 400mg every 8 hours or Paracetamol 650mg.
- **Wound Dressing:** Hydrogel pads or Silver Sulfadiazine 1% Cream (if non-facial).
- **Hydration:** Drink plenty of oral rehydration fluids (ORS).

### 🚨 Consult a physician if burn is larger than patient's palm or blisters exceed 2 cm."""

    # Default Clinical Doctor Response
    return f"""🩺 **Dr. BurnCare AI — Clinical Doctor Guidance**
{triage_info}
Thank you for consulting Dr. BurnCare AI. Based on your description (*"{query}"*), here is the clinical triage & treatment protocol:

### ⚠️ Essential Precautions
- **Immediate Cooling:** Cool the affected area under clean running tap water for **20 minutes**.
- **Protect Skin Integrity:** Do NOT pop blisters, rub the wound, or apply ice, butter, or unapproved home paste.
- **Sterile Protection:** Cover the wound loosely with clean food-grade plastic wrap or sterile non-adherent dressing.

### 💊 Recommended Medications & Supplies
1. **Pain Relief:** Paracetamol (500mg–1g every 6h) or Ibuprofen (400mg every 8h with food).
2. **Topical Antiseptic Cream:** Silver Sulfadiazine 1% Cream or Mupirocin 2% Ointment applied under sterile dressing.
3. **Fluid Care:** Maintain high oral fluid intake or Parkland IV fluids for larger burns.

### 🚨 When to Rush to Emergency Room (112 / 108):
- Burns affecting the **Face, Hands, Feet, Genitals, or Major Joints**.
- Airway difficulty, soot around nose/mouth, or hoarse voice.
- Burn area larger than 5–10% of total body surface area."""

@router.post("/chat")
async def ai_doctor_chat(payload: ChatRequest):
    if not payload.message or not payload.message.strip():
        raise HTTPException(status_code=400, detail="Chat message cannot be empty.")

    api_key = payload.api_key or os.getenv("OPENAI_API_KEY") or settings.OPENAI_API_KEY

    # If API Key is present, attempt live OpenAI API call
    if api_key and api_key.startswith("sk-"):
        try:
            messages = [{"role": "system", "content": SYSTEM_DOCTOR_PROMPT}]
            if payload.context:
                ctx_str = f"Current Patient Context: Triage Level = {payload.context.get('triage')}, Depth = {payload.context.get('depth')}, Questionnaire = {json.dumps(payload.context.get('questionnaire', {}))}"
                messages.append({"role": "system", "content": ctx_str})
                
            for hist in (payload.history or []):
                messages.append({"role": hist.role, "content": hist.content})
                
            messages.append({"role": "user", "content": payload.message})

            req_data = json.dumps({
                "model": "gpt-3.5-turbo",
                "messages": messages,
                "temperature": 0.5,
                "max_tokens": 800
            }).encode("utf-8")

            req = urllib.request.Request(
                "https://api.openai.com/v1/chat/completions",
                data=req_data,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {api_key}"
                },
                method="POST"
            )

            with urllib.request.urlopen(req, timeout=12) as response:
                res_body = response.read().decode("utf-8")
                res_json = json.loads(res_body)
                reply = res_json["choices"][0]["message"]["content"]
                return {
                    "reply": reply,
                    "source": "OpenAI ChatGPT API (Live Doctor Model)",
                    "has_key": True
                }
        except Exception as e:
            # Fallback cleanly if API key error or network issue
            fallback_reply = generate_clinical_fallback_response(payload.message, payload.context)
            return {
                "reply": fallback_reply,
                "source": "BurnCare Clinical Rule Engine (Fallback Doctor)",
                "has_key": True,
                "error_detail": str(e)
            }

    # No API Key provided -> use Clinical Rule Engine
    fallback_reply = generate_clinical_fallback_response(payload.message, payload.context)
    return {
        "reply": fallback_reply,
        "source": "BurnCare Clinical AI Doctor Assistant",
        "has_key": False
    }
