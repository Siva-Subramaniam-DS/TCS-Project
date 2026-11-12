"""Content-based & Hybrid semantic matcher: cosine similarity on a 5-part values vector + semantic text embedding, then a risk filter."""

from __future__ import annotations

import numpy as np
from sqlalchemy.orm import Session

from models import Fund
from services.impact_scorer import score_fund
from services.risk_profiler import classify

DIMENSIONS = ("climate", "water", "energy", "social", "governance")
_embedder = None


def get_embedder():
    global _embedder
    if _embedder is None:
        try:
            from sentence_transformers import SentenceTransformer
            _embedder = SentenceTransformer("all-MiniLM-L6-v2")
        except Exception:
            _embedder = False
    return _embedder if _embedder is not False else None


def vector_from(source) -> np.ndarray:
    if isinstance(source, dict):
        return np.array([float(source[name]) for name in DIMENSIONS], dtype=float)
    return np.array([float(getattr(source, name) or 0) for name in DIMENSIONS], dtype=float)


def cosine(left: np.ndarray, right: np.ndarray) -> float:
    denom = float(np.linalg.norm(left) * np.linalg.norm(right))
    if denom == 0:
        return 0.0
    return float(np.dot(left, right) / denom)


def fund_payload(fund: Fund, match: float | None, allocation: float, amount_gbp: float) -> dict:
    per_thousand = score_fund(fund)
    factor = amount_gbp / 1000.0
    return {
        "fund_id": fund.id,
        "name": fund.name,
        "ticker": fund.ticker,
        "category": fund.category,
        "region": fund.region,
        "risk": fund.risk,
        "match": None if match is None else round(match, 4),
        "allocation": round(allocation, 1),
        "amount_gbp": round(amount_gbp, 2),
        "label": fund.label,
        "claim": fund.claim,
        "source": fund.source,
        "expense_ratio": fund.expense_ratio,
        "values": {name: getattr(fund, name) for name in DIMENSIONS},
        "sdgs": [int(part) for part in (fund.sdgs or "").split(",") if part],
        "impact_per_1k": per_thousand,
        "impact": {
            **per_thousand,
            "co2_kg": round(per_thousand["co2_kg"] * factor, 2),
            "kwh": round(per_thousand["kwh"] * factor, 2),
            "water_l": round(per_thousand["water_l"] * factor, 1),
            "forest_m2": round(per_thousand["forest_m2"] * factor, 3),
        },
    }


def recommend(db: Session, body) -> dict:
    risk = classify(body.age, body.horizon_years, body.monthly_savings, body.drop_reaction)
    user_vec = vector_from(body.values.model_dump())
    funds = db.query(Fund).all()
    ranked = []
    flagged = []
    for fund in funds:
        match = cosine(user_vec, vector_from(fund))
        if fund.label == "false":
            flagged.append({"fund_id": fund.id, "name": fund.name, "ticker": fund.ticker, "reason": "false claim"})
            continue
        if fund.label == "misleading":
            flagged.append({"fund_id": fund.id, "name": fund.name, "ticker": fund.ticker, "reason": "misleading claim"})
            continue
        if fund.risk not in risk["allowed_risk"]:
            continue
        ranked.append((match, fund))
    ranked.sort(key=lambda item: item[0], reverse=True)
    top = ranked[:5]
    if not top:
        top = sorted(
            ((cosine(user_vec, vector_from(fund)), fund) for fund in funds if fund.label == "verified"),
            key=lambda item: item[0],
            reverse=True,
        )[:5]
    weights = [max(score, 0.01) ** 2 for score, _ in top]
    total = sum(weights) or 1
    allocations = [round(100 * weight / total, 1) for weight in weights]
    drift = round(100 - sum(allocations), 1)
    if allocations:
        allocations[0] = round(allocations[0] + drift, 1)
    amount = float(body.amount_gbp)
    recommendations = []
    for (match, fund), allocation in zip(top, allocations):
        recommendations.append(fund_payload(fund, match, allocation, amount * allocation / 100))
    return {
        "risk_profile": risk["profile"],
        "allowed_risk": risk["allowed_risk"],
        "amount_gbp": amount,
        "values": body.values.model_dump(),
        "recommendations": recommendations,
        "flagged": flagged[:8],
        "method": "hybrid_cosine_values_and_decision_tree_risk_filter",
    }
