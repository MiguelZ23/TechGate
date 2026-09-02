from app.scoring import analyze_text

def test_high_risk_message() -> None:
    result = analyze_text("URGENT! Your account will be locked today. Click here to verify your password!")
    assert result.risk_level == "high" and result.score >= 60 and len(result.reasons) >= 2

def test_low_risk_message() -> None:
    result = analyze_text("Dinner is at six. See you at home.")
    assert result.risk_level == "low" and result.score < 30

def test_score_is_capped() -> None:
    result = analyze_text("URGENT! Final notice! Pay with bitcoin gift card. Click here and send your password to claim your prize at bit.ly/example!!")
    assert result.score == 100
