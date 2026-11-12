from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Portfolio
from services.impact_scorer import combine, score_fund

router = APIRouter()

LEADERBOARD = [
    {"name": "Maya Chen", "city": "Manchester", "co2_kg": 186, "score": 84},
    {"name": "Jonah Adeyemi", "city": "London", "co2_kg": 164, "score": 81},
    {"name": "Priya Shah", "city": "Leeds", "co2_kg": 151, "score": 79},
    {"name": "Sam Okonkwo", "city": "Bristol", "co2_kg": 133, "score": 76},
    {"name": "Leila Haddad", "city": "Glasgow", "co2_kg": 121, "score": 74},
]


@router.get("/leaderboard")
def leaderboard():
    return {"rows": LEADERBOARD}


@router.get("/{portfolio_id}")
def impact(portfolio_id: int, db: Session = Depends(get_db)):
    portfolio = db.get(Portfolio, portfolio_id)
    if portfolio is None:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    parts = []
    lines = []
    sdg_weights: dict[int, float] = {}
    for holding in portfolio.holdings:
        metrics = score_fund(holding.fund)
        parts.append((metrics, holding.amount_gbp))
        for sdg in (holding.fund.sdgs or "").split(","):
            if sdg:
                sdg_weights[int(sdg)] = sdg_weights.get(int(sdg), 0) + holding.allocation_pct
        lines.append(
            {
                "fund_id": holding.fund_id,
                "name": holding.fund.name,
                "ticker": holding.fund.ticker,
                "allocation": holding.allocation_pct,
                "amount_gbp": holding.amount_gbp,
                "label": holding.fund.label,
                "impact": {
                    **metrics,
                    "co2_kg": round(metrics["co2_kg"] * holding.amount_gbp / 1000, 2),
                    "kwh": round(metrics["kwh"] * holding.amount_gbp / 1000, 2),
                    "water_l": round(metrics["water_l"] * holding.amount_gbp / 1000, 1),
                    "forest_m2": round(metrics["forest_m2"] * holding.amount_gbp / 1000, 3),
                },
            }
        )
    totals = combine(parts) if parts else None
    return {
        "portfolio_id": portfolio.id,
        "name": portfolio.name,
        "amount_gbp": portfolio.amount_gbp,
        "risk_profile": portfolio.risk_profile,
        "totals": totals,
        "holdings": lines,
        "sdgs": [
            {"sdg": key, "weight": round(value, 1)}
            for key, value in sorted(sdg_weights.items(), key=lambda item: -item[1])
        ],
        "note": "Modelled from published fund metrics per £1,000 for one year. Not a live sensor feed.",
    }
