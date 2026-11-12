"""Decision tree risk bucket: Conservative, Balanced, or Growth."""

from __future__ import annotations

from pathlib import Path

import joblib

MODEL_PATH = Path(__file__).resolve().parents[1] / "ml" / "impact_model" / "risk_tree.joblib"
LABELS = ["Conservative", "Balanced", "Growth"]
DROP = {"sell": 0, "hold": 1, "buy": 2}

_model = None


def features(age: int, horizon_years: int, monthly_savings: float, drop_reaction: str) -> list[float]:
    return [
        float(age),
        float(horizon_years),
        float(monthly_savings),
        float(DROP.get(drop_reaction, 1)),
    ]


def rule_profile(age: int, horizon_years: int, monthly_savings: float, drop_reaction: str) -> str:
    # Conservative is checked first, including age, so it wins over a long horizon.
    if drop_reaction == "sell" or horizon_years <= 2 or (age >= 45 and drop_reaction != "buy"):
        return "Conservative"
    if (drop_reaction == "buy" and horizon_years >= 7) or (horizon_years >= 8 and monthly_savings >= 200):
        return "Growth"
    return "Balanced"


def load_model():
    global _model
    if _model is None and MODEL_PATH.exists():
        _model = joblib.load(MODEL_PATH)
    return _model


def classify(age: int, horizon_years: int, monthly_savings: float, drop_reaction: str) -> dict:
    fallback = rule_profile(age, horizon_years, monthly_savings, drop_reaction)
    model = load_model()
    profile = fallback
    if model is not None:
        index = int(model.predict([features(age, horizon_years, monthly_savings, drop_reaction)])[0])
        profile = LABELS[index]
    allowed = {
        "Conservative": {"Conservative"},
        "Balanced": {"Conservative", "Balanced"},
        "Growth": {"Conservative", "Balanced", "Growth"},
    }[profile]
    return {"profile": profile, "allowed_risk": sorted(allowed), "rule_profile": fallback}
