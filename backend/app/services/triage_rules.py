"""
BurnCare AI - Clinical 3-Tier Safety Net & Disaster Triage Engine
Categories:
1. CRITICAL (Very Emergency) - Immediate specialist ICU/Burn Center referral required
2. EMERGENCY - Urgent hospital emergency room assessment required
3. PRIMARY (Normal Patient) - Primary first-aid & outpatient dressing protocol

Features:
- Anatomical sensitivity mapping (Face/Airway/Genitals = Extreme; Hands/Feet/Joints = High; Limbs/Torso = Moderate)
- Parkland Formula IV Fluid Resuscitation calculation: 4 mL x Weight(kg) x % TBSA
- Emergency Medical Kit recommendation for doctors & paramedics in mass casualty fire disasters
"""

SENSITIVITY_MAP = {
    "face": {"level": "CRITICAL EXTREME", "score": 10, "risk": "Airway obstruction, vision impairment, severe facial scarring"},
    "neck": {"level": "CRITICAL EXTREME", "score": 9, "risk": "Airway constriction, major vascular compromise"},
    "genitals": {"level": "CRITICAL EXTREME", "score": 9, "risk": "Urethral stricture, severe infection risk, loss of function"},
    "hands": {"level": "HIGH SENSITIVITY", "score": 8, "risk": "Contracture, permanent loss of fine motor dexterity"},
    "feet": {"level": "HIGH SENSITIVITY", "score": 8, "risk": "Weight-bearing disability, deep tissue contracture"},
    "joint": {"level": "HIGH SENSITIVITY", "score": 8, "risk": "Joint ankylosis, restricted mobility"},
    "torso": {"level": "MODERATE SENSITIVITY", "score": 6, "risk": "Restrictive chest eschar, pulmonary restriction"},
    "arm": {"level": "MODERATE SENSITIVITY", "score": 5, "risk": "Circumferential vascular compromise"},
    "leg": {"level": "MODERATE SENSITIVITY", "score": 5, "risk": "Deep vein thrombosis, mobility restriction"}
}

def calculate_parkland_fluids(weight_kg: float, tbsa_percent: float) -> dict:
    """Calculates IV Fluid Resuscitation requirement using Parkland Formula (4 mL x kg x %TBSA in 24 hrs)."""
    total_ml = 4.0 * weight_kg * tbsa_percent
    first_8_hours_ml = total_ml / 2.0
    next_16_hours_ml = total_ml / 2.0
    return {
        "total_24h_ml": round(total_ml, 1),
        "first_8h_rate_ml_hr": round(first_8_hours_ml / 8.0, 1),
        "next_16h_rate_ml_hr": round(next_16_hours_ml / 16.0, 1),
        "fluid_type": "Lactated Ringer's Solution (LR)"
    }

def get_medical_kit_recommendations(triage_level: str) -> dict:
    """Provides emergency medical kit checklist to assist doctors and paramedics in fire disaster incidents."""
    if triage_level == "CRITICAL":
        return {
            "urgency": "IMMEDIATE SPECIALIST INTERVENTION",
            "recommended_facility": "Regional Trauma Burn Center / ICU",
            "medical_kit": [
                "Endotracheal Intubation Tray & Portable Mechanical Ventilator (Airway Protection)",
                "IV Cannula 14G/16G (Dual Large-Bore Access for Parkland IV Fluids)",
                "Lactated Ringer's Solution (5,000 mL+ 24h supply)",
                "IV Analgesia (Fentanyl / Morphine Titration)",
                "Sterile Burn Sheeting & Silver Sulfadiazine (SSD) 1% Cream",
                "Escharotomy Surgical Tray (for circumferential chest/limb burns)",
                "Foley Catheter with Urometer (Urine output monitoring target 0.5–1 mL/kg/h)",
                "Tetanus Toxoid Booster Injection"
            ],
            "paramedic_actions": "Secure airway immediately. Start dual large-bore IVs. Keep patient warm. Do not delay emergency transport."
        }
    elif triage_level == "EMERGENCY":
        return {
            "urgency": "URGENT HOSPITAL TRANSFER (Within 1-2 Hours)",
            "recommended_facility": "General Hospital Emergency Department",
            "medical_kit": [
                "Sterile Non-Stick Gauze & Paraffin Tulle Dressings",
                "Normal Saline 0.9% / Lactated Ringer's IV Infusion",
                "Oral / IV Analgesics (Paracetamol 1g IV / Tramadol)",
                "Topical Antimicrobial Cream (Mupirocin / Silver Nitrate)",
                "Elastic Bandages (Loose circumferential wrapping)",
                "Pulse Oximeter & Supplemental O2 Mask (4-6 L/min)",
                "Tetanus Toxoid Vaccine"
            ],
            "paramedic_actions": "Cool burn with running water for 20 mins. Apply loose sterile wrap. Administer oral/IV analgesia. Transport to hospital."
        }
    else: # PRIMARY / NORMAL
        return {
            "urgency": "PRIMARY OUTPATIENT CARE",
            "recommended_facility": "Primary Health Center / Home Care",
            "medical_kit": [
                "Cool Running Tap Water (20 min application)",
                "Clean Food-Grade Cling Film or Non-Stick Sterile Pads",
                "Hydrogel Burn Dressing Pads",
                "Oral Analgesics (Paracetamol 500mg / Ibuprofen 400mg)",
                "Aloe Vera Gel / Chlorhexidine Antiseptic Lotion",
                "Adhesive Medical Tape"
            ],
            "paramedic_actions": "Cool wound immediately under tap water for 20 minutes. Cover loosely with cling film. Instruct patient on infection watch."
        }

def evaluate_triage_rules_3tier(
    ml_predicted_triage: str,
    ml_predicted_depth: str,
    ml_confidence: float,
    questionnaire: dict = None
) -> tuple[str, list[str], dict, dict]:
    """
    Evaluates 3-Tier Triage Level: 'CRITICAL', 'EMERGENCY', or 'PRIMARY'
    Returns (triage_level, reasons, sensitivity_info, medical_kit)
    """
    reasons = []
    is_critical = False
    is_emergency = False

    q = questionnaire or {}
    body_region = str(q.get("body_region", "arm")).lower()
    cause = str(q.get("cause", "flame")).lower()
    age = q.get("age", 30)
    larger_than_palm = q.get("larger_than_palm", False)
    breathing_difficulty = q.get("breathing_difficulty", False)
    unconscious_or_shock = q.get("unconscious_or_shock", False)

    # 1. Sensitivity Analysis
    sens_info = SENSITIVITY_MAP.get(body_region, SENSITIVITY_MAP["arm"])

    # 2. Check CRITICAL (Very Emergency) Escalations
    if breathing_difficulty or unconscious_or_shock:
        is_critical = True
        reasons.append("CRITICAL: Airway involvement, inhalation risk, or systemic shock detected.")

    if body_region in ["face", "neck", "genitals"] and ml_predicted_depth in ["partial_thickness", "full_thickness"]:
        is_critical = True
        reasons.append(f"CRITICAL: High-risk burn to extreme sensitivity zone ({body_region.capitalize()}).")

    if ml_predicted_depth == "full_thickness" and (larger_than_palm or cause in ["chemical", "electrical"]):
        is_critical = True
        reasons.append(f"CRITICAL: Full-thickness burn with high-risk mechanism ({cause.capitalize()}) or extensive area.")

    # 3. Check EMERGENCY Escalations
    if not is_critical:
        if ml_predicted_triage.lower() == "emergency" or ml_predicted_depth == "full_thickness":
            is_emergency = True
            reasons.append("EMERGENCY: Deep tissue involvement requiring urgent medical care.")

        if ml_confidence < 0.70:
            is_emergency = True
            reasons.append(f"EMERGENCY: Low model confidence uncertainty ({ml_confidence*100:.1f}%) - safety escalation.")

        if body_region in ["face", "neck", "genitals", "hands", "feet", "joint"]:
            is_emergency = True
            reasons.append(f"EMERGENCY: Burn to functional high-sensitivity anatomical area ({body_region.capitalize()}).")

        if cause in ["chemical", "electrical"]:
            is_emergency = True
            reasons.append(f"EMERGENCY: High-risk injury mechanism ({cause.capitalize()}).")

        try:
            age_val = int(age)
            if age_val < 5 or age_val > 60:
                is_emergency = True
                reasons.append(f"EMERGENCY: Vulnerable age category ({age_val} years old).")
        except ValueError:
            pass

        if larger_than_palm:
            is_emergency = True
            reasons.append("EMERGENCY: Burn area larger than patient's palm size (~1%+ TBSA).")

    # Determine Final Triage Level
    if is_critical:
        final_triage = "CRITICAL"
    elif is_emergency or ml_predicted_triage.lower() == "emergency":
        final_triage = "EMERGENCY"
    else:
        final_triage = "PRIMARY"
        reasons.append("PRIMARY: Minor superficial burn eligible for outpatient cooling & home first-aid.")

    # Get Emergency Medical Kit Protocol
    med_kit = get_medical_kit_recommendations(final_triage)

    # Estimate Parkland IV Fluids (assuming default 70kg weight & 1% per palm size)
    est_tbsa = 15.0 if final_triage == "CRITICAL" else (5.0 if final_triage == "EMERGENCY" else 1.0)
    parkland_fluids = calculate_parkland_fluids(weight_kg=70.0, tbsa_percent=est_tbsa)
    med_kit["parkland_fluids"] = parkland_fluids

    return final_triage, reasons, sens_info, med_kit

def evaluate_triage_rules(
    ml_predicted_triage: str,
    ml_predicted_depth: str,
    ml_confidence: float,
    questionnaire: dict = None
) -> tuple[str, list[str]]:
    """Backward-compatible wrapper for test suite."""
    triage, reasons, _, _ = evaluate_triage_rules_3tier(ml_predicted_triage, ml_predicted_depth, ml_confidence, questionnaire)
    return triage, reasons

