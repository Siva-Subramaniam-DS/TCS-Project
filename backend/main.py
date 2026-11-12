from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import get_db
from models import Fund
from routers import advisor, audit, auth, greenwash, impact, portfolio
from services.bootstrap import init_db
from services.impact_scorer import score_fund

app = FastAPI(
    title="ImpactPulse API",
    version="1.0.0",
    description="Verified impact investment platform for the HSBC Sustainathon challenge.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup() -> None:
    init_db()


@app.get("/")
def root():
    return {"name": "ImpactPulse", "docs": "/docs", "health": "/health"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/funds")
def list_funds(db: Session = Depends(get_db)):
    funds = db.query(Fund).order_by(Fund.name).all()
    return [
        {
            "id": fund.id,
            "name": fund.name,
            "ticker": fund.ticker,
            "category": fund.category,
            "region": fund.region,
            "risk": fund.risk,
            "label": fund.label,
            "claim": fund.claim,
            "source": fund.source,
            "sdgs": [int(part) for part in (fund.sdgs or "").split(",") if part],
            "impact_per_1k": score_fund(fund),
        }
        for fund in funds
    ]


app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(portfolio.router, prefix="/portfolio", tags=["portfolio"])
app.include_router(impact.router, prefix="/impact", tags=["impact"])
app.include_router(greenwash.router, prefix="/greenwash", tags=["greenwash"])
app.include_router(advisor.router, prefix="/advisor", tags=["advisor"])
app.include_router(audit.router, prefix="/audit", tags=["audit"])
