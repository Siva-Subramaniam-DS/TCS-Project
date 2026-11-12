"""Random Forest impact score. Reported physical metrics stay on the fund record."""

from __future__ import annotations

from pathlib import Path

import joblib
import numpy as np

MODEL_PATH = Path(__file__).resolve().parents[1] / "ml" / "impact_model" / "impact_rf.joblib"
RISK_ORDER = {"Conservative": 0, "Balanced": 1, "Growth": 2}

_model = None


def feature_row(fund) -> list[float]:
    return [
        float(fund.climate or 0),
        float(fund.water or 0),
        float(fund.energy or 0),
        float(fund.social or 0),
        float(fund.governance or 0),
        float(fund.expense_ratio or 0),
        float(np.log1p(fund.aum_gbp_m or 0)),
        float(RISK_ORDER.get(fund.risk or "Balanced", 1)),
    ]


def formula_score(co2: float, kwh: float, water: float, forest: float, governance: float) -> int:
    raw = (
        40 * min(co2 / 50, 1.2)
        + 30 * min(kwh / 220, 1.2)
        + 15 * min(water / 2000, 1.2)
        + 10 * min(forest / 1.2, 1.2)
        + 5 * (governance / 5)
    )
    return int(max(1, min(99, round(raw))))


def load_model():
    global _model
    if _model is None and MODEL_PATH.exists():
        _model = joblib.load(MODEL_PATH)
    return _model


def score_fund(fund) -> dict:
    co2 = float(fund.co2_kg_per_1k or 0)
    kwh = float(fund.kwh_per_1k or 0)
    water = float(fund.water_l_per_1k or 0)
    forest = float(fund.forest_m2_per_1k or 0)
    published = formula_score(co2, kwh, water, forest, float(fund.governance or 0))
    predicted = published
    model = load_model()
    if model is not None:
        predicted = int(max(1, min(99, round(float(model.predict([feature_row(fund)])[0])))))
    return {
        "co2_kg": round(co2, 2),
        "kwh": round(kwh, 2),
        "water_l": round(water, 2),
        "forest_m2": round(forest, 3),
        "score": published,
        "model_score": predicted,
    }


def scale(metrics: dict, amount_gbp: float) -> dict:
    factor = amount_gbp / 1000.0
    return {
        "co2_kg": round(metrics["co2_kg"] * factor, 2),
        "kwh": round(metrics["kwh"] * factor, 2),
        "water_l": round(metrics["water_l"] * factor, 1),
        "forest_m2": round(metrics["forest_m2"] * factor, 3),
        "score": metrics["score"],
        "model_score": metrics["model_score"],
    }


def combine(parts: list[tuple[dict, float]]) -> dict:
    """parts: (per-£1000 metrics, amount_gbp)"""
    total_amount = sum(amount for _, amount in parts) or 1
    totals = {"co2_kg": 0.0, "kwh": 0.0, "water_l": 0.0, "forest_m2": 0.0}
    weighted_score = 0.0
    weighted_model = 0.0
    for metrics, amount in parts:
        scaled = scale(metrics, amount)
        for key in totals:
            totals[key] += scaled[key]
        weighted_score += metrics["score"] * amount
        weighted_model += metrics["model_score"] * amount
    totals = {key: round(value, 2) for key, value in totals.items()}
    totals["score"] = int(round(weighted_score / total_amount))
    totals["model_score"] = int(round(weighted_model / total_amount))
    day = 365.0
    totals["per_day"] = {
        "co2_kg": round(totals["co2_kg"] / day, 3),
        "kwh": round(totals["kwh"] / day, 2),
        "water_l": round(totals["water_l"] / day, 1),
        "forest_m2": round(totals["forest_m2"] / day, 4),
    }
    return totals
