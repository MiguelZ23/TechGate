"""Transparent placeholder scoring that can later wrap OCR and an AI model."""
import re
from dataclasses import dataclass
from .models import AnalysisResponse

@dataclass(frozen=True)
class Signal:
    patterns: tuple[str, ...]
    points: int
    reason: str

SIGNALS = (
    Signal((r"urgent", r"immediately", r"act now", r"today", r"final notice"), 18, "The message uses urgency or pressure to make you act quickly."),
    Signal((r"password", r"verification code", r"security code", r"social security", r"ssn"), 30, "It asks for private account or identity information."),
    Signal((r"gift card", r"crypto", r"bitcoin", r"wire transfer", r"payment"), 28, "It mentions a payment method commonly used in scams."),
    Signal((r"click (?:here|the link)", r"verify (?:your )?account", r"sign in", r"log in"), 22, "It directs you to follow a link or sign in to an account."),
    Signal((r"account (?:will be )?(?:locked|closed|disabled|suspended)", r"unusual activity", r"package.*held"), 22, "It threatens an account or service consequence."),
    Signal((r"you(?:'ve| have) won", r"winner", r"claim (?:your )?(?:prize|reward)", r"refund"), 20, "It offers an unexpected prize, reward, or refund."),
)
URL_PATTERN = re.compile(r"(?:https?://|www\.)\S+", re.IGNORECASE)
SHORTENER_PATTERN = re.compile(r"\b(?:bit\.ly|tinyurl\.com|t\.co|rb\.gy|is\.gd)/", re.IGNORECASE)

def analyze_text(text: str) -> AnalysisResponse:
    normalized = " ".join(text.lower().split())
    score, reasons = 5, []
    for signal in SIGNALS:
        if any(re.search(pattern, normalized) for pattern in signal.patterns):
            score += signal.points
            reasons.append(signal.reason)
    if URL_PATTERN.search(normalized):
        score += 12; reasons.append("The message includes a link; its destination should be verified independently.")
    if SHORTENER_PATTERN.search(normalized):
        score += 18; reasons.append("The link uses a shortened address that hides its true destination.")
    if normalized.count("!") >= 2 or text.strip().isupper():
        score += 8; reasons.append("The formatting adds pressure or alarm.")
    score = min(score, 100)
    if score >= 60:
        level, summary = "high", "This message shows several common scam or phishing warning signs. Do not interact with it yet."
        actions = ["Do not click links, scan QR codes, reply, or send money.", "Contact the organization using a phone number or website you find independently.", "Block or report the sender after confirming the message is fraudulent."]
    elif score >= 30:
        level, summary = "medium", "Some details deserve a closer look before you trust or respond to this message."
        actions = ["Pause before clicking links or sharing information.", "Open the organization’s official app or website yourself to check the claim.", "Ask a trusted person or the organization’s official support team if you are unsure."]
    else:
        level, summary = "low", "We found few common warning signs, but you should still verify unexpected requests."
        actions = ["Confirm the sender if the request was unexpected.", "Use an official app or saved website instead of links in the message.", "Never share passwords or one-time verification codes."]
    if not reasons: reasons = ["No strong urgency, payment, credential, or suspicious-link language was detected."]
    return AnalysisResponse(risk_level=level, score=score, summary=summary, reasons=reasons[:4], actions=actions)

def analyze_image_placeholder(filename: str | None) -> AnalysisResponse:
    return AnalysisResponse(risk_level="medium", score=45, summary="The image was received, but screenshot text extraction is still in demo mode.", reasons=["The current MVP has not read the text inside this image yet.", f"The uploaded file ({filename or 'image'}) is ready for a future OCR and vision-analysis step."], actions=["Do not click links or share sensitive information until the message is verified.", "For a more specific demo result, paste the message text into the Paste message tab.", "Contact the claimed sender through an official channel if the request is urgent."])
