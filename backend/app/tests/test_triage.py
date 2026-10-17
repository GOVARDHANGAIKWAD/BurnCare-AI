import pytest
from backend.app.services.triage_rules import evaluate_triage_rules

def test_rule_engine_never_downgrades_emergency():
    """CRITICAL SAFETY TEST: Rule engine must NEVER downgrade an ML predicted EMERGENCY to PRIMARY."""
    final_triage, reasons = evaluate_triage_rules(
        ml_predicted_triage="emergency",
        ml_predicted_depth="superficial",
        ml_confidence=0.99,
        questionnaire={"body_region": "arm", "cause": "scald", "age": 30}
    )
    assert final_triage == "EMERGENCY", "Rule engine illegally downgraded emergency prediction!"

def test_low_confidence_escalation():
    """Low confidence (<70%) must trigger EMERGENCY escalation even for superficial primary predictions."""
    final_triage, reasons = evaluate_triage_rules(
        ml_predicted_triage="primary",
        ml_predicted_depth="superficial",
        ml_confidence=0.62, # Low confidence
        questionnaire={"body_region": "arm", "cause": "scald", "age": 30}
    )
    assert final_triage == "EMERGENCY", "Low confidence failed to escalate to emergency!"
    assert any("uncertainty" in r.lower() for r in reasons)

def test_critical_body_region_escalation():
    """Face, hands, feet, genitals, joint involvement must escalate to EMERGENCY."""
    for region in ["face", "neck", "hands", "feet", "genitals", "joint"]:
        final_triage, reasons = evaluate_triage_rules(
            ml_predicted_triage="primary",
            ml_predicted_depth="superficial",
            ml_confidence=0.95,
            questionnaire={"body_region": region, "cause": "scald", "age": 28}
        )
        assert final_triage == "EMERGENCY", f"Critical body region '{region}' failed to escalate!"

def test_chemical_electrical_burn_escalation():
    """Chemical or electrical burns must escalate to EMERGENCY."""
    for cause in ["chemical", "electrical"]:
        final_triage, reasons = evaluate_triage_rules(
            ml_predicted_triage="primary",
            ml_predicted_depth="superficial",
            ml_confidence=0.95,
            questionnaire={"body_region": "arm", "cause": cause, "age": 28}
        )
        assert final_triage == "EMERGENCY", f"High-risk cause '{cause}' failed to escalate!"

def test_child_or_elderly_age_escalation():
    """Children under 5 and adults over 60 must escalate to EMERGENCY."""
    for age in [3, 72]:
        final_triage, reasons = evaluate_triage_rules(
            ml_predicted_triage="primary",
            ml_predicted_depth="superficial",
            ml_confidence=0.95,
            questionnaire={"body_region": "arm", "cause": "scald", "age": age}
        )
        assert final_triage == "EMERGENCY", f"Vulnerable age {age} failed to escalate!"
