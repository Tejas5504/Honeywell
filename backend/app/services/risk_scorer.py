from app.models.schemas import AttackType

def compute_risk_score(isolation_score: float, reasons: list, attack_type: str) -> float:
    """
    Compute final risk score (0-100) based on ML anomaly score and rule-based reasons.
    """
    # isolation_score is normalized anomaly score from IsolationForest
    base_score = max(0.0, min(100.0, isolation_score))
    
    # Boost by reasons
    reason_boost = len(reasons) * 5.0
    
    # Boost by attack severity
    attack_boost = 0.0
    if attack_type == AttackType.BRUTE_FORCE.value:
        attack_boost = 10.0
    elif attack_type == AttackType.IMPOSSIBLE_TRAVEL.value:
        attack_boost = 15.0
    elif attack_type == AttackType.CREDENTIAL_STUFFING.value:
        attack_boost = 20.0
    elif attack_type == AttackType.LATERAL_MOVEMENT.value:
        attack_boost = 25.0
    elif attack_type == AttackType.LOW_AND_SLOW_EXFILTRATION.value:
        attack_boost = 18.0
    
    final_score = base_score + reason_boost + attack_boost
    return max(0.0, min(100.0, final_score))

def get_severity(risk_score: float) -> str:
    """
    Get severity label for a given risk score.
    """
    if risk_score >= 80:
        return "CRITICAL"
    elif risk_score >= 60:
        return "HIGH"
    elif risk_score >= 40:
        return "MEDIUM"
    return "LOW"
