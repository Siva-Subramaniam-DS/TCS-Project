from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from deps import get_current_user
from models import Fund, Holding, Portfolio, User
from schemas import RecommendIn, SavePortfolioIn
from services.impact_scorer import combine, score_fund
from services.recommendation_engine import fund_payload, recommend

router = APIRouter()


def _portfolio_dict(portfolio: Portfolio) -> dict:
    parts = []
    holdings = []
    for holding in portfolio.holdings:
        metrics = score_fund(holding.fund)
        parts.append((metrics, holding.amount_gbp))
        holdings.append(
            fund_payload(holding.fund, None, holding.allocation_pct, holding.amount_gbp)
        )
    return {
        "id": portfolio.id,
        "user_id": portfolio.user_id,
        "name": portfolio.name,
        "amount_gbp": portfolio.amount_gbp,
        "risk_profile": portfolio.risk_profile,
        "holdings": holdings,
        "impact": combine(parts) if parts else None,
    }


@router.post("/recommend")
def recommend_portfolio(body: RecommendIn, db: Session = Depends(get_db)):
    return recommend(db, body)


@router.post("/save")
def save_portfolio(
    body: SavePortfolioIn,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_current_user),
):
    user_id = user.id if user else body.user_id
    if user_id is None:
        demo = db.query(User).filter(User.email == "alex@impactpulse.app").first()
        if demo is None:
            raise HTTPException(status_code=400, detail="No user to attach this portfolio to")
        user_id = demo.id
    owner = db.get(User, user_id)
    if owner is None:
        raise HTTPException(status_code=404, detail="User not found")
    if body.risk_profile:
        owner.risk_profile = body.risk_profile
    total = sum(item.allocation_pct for item in body.allocations) or 1
    portfolio = Portfolio(
        user_id=user_id,
        name=body.name,
        amount_gbp=body.amount_gbp,
        risk_profile=body.risk_profile,
    )
    db.add(portfolio)
    db.flush()
    for item in body.allocations:
        fund = db.get(Fund, item.fund_id)
        if fund is None:
            raise HTTPException(status_code=404, detail=f"Fund {item.fund_id} not found")
        pct = item.allocation_pct / total * 100
        db.add(
            Holding(
                portfolio_id=portfolio.id,
                fund_id=fund.id,
                allocation_pct=round(pct, 2),
                amount_gbp=round(body.amount_gbp * pct / 100, 2),
            )
        )
    db.commit()
    db.refresh(portfolio)
    return _portfolio_dict(portfolio)


@router.get("/{user_id}")
def get_portfolio(user_id: int, db: Session = Depends(get_db)):
    portfolio = (
        db.query(Portfolio)
        .filter(Portfolio.user_id == user_id)
        .order_by(Portfolio.id.desc())
        .first()
    )
    if portfolio is None:
        raise HTTPException(status_code=404, detail="No portfolio yet")
    return _portfolio_dict(portfolio)
