"""Create tables, load funds, hash-chain the claims, and train models if needed."""

from __future__ import annotations

import os
import time
from pathlib import Path

import pandas as pd
from sqlalchemy.exc import OperationalError

from database import BASE_DIR, SessionLocal, engine
from database import Base
from deps import hash_password
from models import AuditLog, Fund, Holding, Portfolio, User
from services.audit_chain import seed_chain

DATA = Path(os.getenv("DATA_DIR") or (BASE_DIR.parent / "data"))


def wait_for_database() -> None:
    for attempt in range(30):
        try:
            with engine.connect() as connection:
                connection.exec_driver_sql("SELECT 1")
            return
        except OperationalError:
            if attempt == 29:
                raise
            time.sleep(1)


def ensure_models() -> None:
    green = BASE_DIR / "ml" / "greenwash_model" / "model.joblib"
    forest = BASE_DIR / "ml" / "impact_model" / "impact_rf.joblib"
    tree = BASE_DIR / "ml" / "impact_model" / "risk_tree.joblib"
    if not green.exists():
        from ml.train_greenwash import train as train_green

        train_green()
    if not forest.exists() or not tree.exists():
        from ml.train_impact_scorer import train as train_impact

        train_impact()


def load_funds(db) -> None:
    if db.query(Fund).count():
        return
    frame = pd.read_csv(DATA / "funds_dataset.csv")
    for row in frame.to_dict(orient="records"):
        db.add(Fund(**row))
    db.commit()


def ensure_demo(db) -> None:
    user = db.query(User).filter(User.email == "alex@impactpulse.app").first()
    if user is None:
        user = User(
            email="alex@impactpulse.app",
            name="Alex Rivera",
            password_hash=hash_password("demo1234"),
            risk_profile="Growth",
            age=22,
            horizon_years=8,
            monthly_savings=150,
            drop_reaction="buy",
            climate=5,
            water=2,
            energy=5,
            social=3,
            governance=4,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    if db.query(Portfolio).filter(Portfolio.user_id == user.id).count():
        return
    wanted = {"BOCE": 40, "NWGD": 35, "PEAT": 25}
    funds = {fund.ticker: fund for fund in db.query(Fund).filter(Fund.ticker.in_(wanted)).all()}
    if len(funds) < 3:
        return
    amount = 2400.0
    portfolio = Portfolio(
        user_id=user.id,
        name="Alex's first portfolio",
        amount_gbp=amount,
        risk_profile="Growth",
    )
    db.add(portfolio)
    db.flush()
    for ticker, pct in wanted.items():
        db.add(
            Holding(
                portfolio_id=portfolio.id,
                fund_id=funds[ticker].id,
                allocation_pct=pct,
                amount_gbp=round(amount * pct / 100, 2),
            )
        )
    db.commit()


def init_db() -> None:
    wait_for_database()
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        load_funds(db)
        if db.query(AuditLog).count() == 0:
            funds = db.query(Fund).order_by(Fund.id).all()
            if funds:
                seed_chain(db, funds)
        ensure_demo(db)
    finally:
        db.close()
    ensure_models()
