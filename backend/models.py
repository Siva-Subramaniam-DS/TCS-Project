from datetime import datetime

from sqlalchemy import Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    password_hash: Mapped[str] = mapped_column(String(255))
    risk_profile: Mapped[str | None] = mapped_column(String(32), nullable=True)
    age: Mapped[int | None] = mapped_column(Integer, nullable=True)
    horizon_years: Mapped[int | None] = mapped_column(Integer, nullable=True)
    monthly_savings: Mapped[float | None] = mapped_column(Float, nullable=True)
    drop_reaction: Mapped[str | None] = mapped_column(String(16), nullable=True)
    climate: Mapped[float | None] = mapped_column(Float, nullable=True)
    water: Mapped[float | None] = mapped_column(Float, nullable=True)
    energy: Mapped[float | None] = mapped_column(Float, nullable=True)
    social: Mapped[float | None] = mapped_column(Float, nullable=True)
    governance: Mapped[float | None] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    portfolios: Mapped[list["Portfolio"]] = relationship(back_populates="user")


class Fund(Base):
    __tablename__ = "funds"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    ticker: Mapped[str] = mapped_column(String(16), unique=True, index=True)
    category: Mapped[str | None] = mapped_column(String(80))
    region: Mapped[str | None] = mapped_column(String(80))
    risk: Mapped[str | None] = mapped_column(String(32))
    climate: Mapped[float | None] = mapped_column(Float)
    water: Mapped[float | None] = mapped_column(Float)
    energy: Mapped[float | None] = mapped_column(Float)
    social: Mapped[float | None] = mapped_column(Float)
    governance: Mapped[float | None] = mapped_column(Float)
    expense_ratio: Mapped[float | None] = mapped_column(Float)
    aum_gbp_m: Mapped[float | None] = mapped_column(Float)
    co2_kg_per_1k: Mapped[float | None] = mapped_column(Float)
    kwh_per_1k: Mapped[float | None] = mapped_column(Float)
    water_l_per_1k: Mapped[float | None] = mapped_column(Float)
    forest_m2_per_1k: Mapped[float | None] = mapped_column(Float)
    sdgs: Mapped[str | None] = mapped_column(String(40))
    claim: Mapped[str | None] = mapped_column(Text)
    source: Mapped[str | None] = mapped_column(String(255))
    label: Mapped[str | None] = mapped_column(String(32))


class Portfolio(Base):
    __tablename__ = "portfolios"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    name: Mapped[str] = mapped_column(String(120), default="My Impact Portfolio")
    amount_gbp: Mapped[float] = mapped_column(Float, default=1000)
    risk_profile: Mapped[str | None] = mapped_column(String(32), nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    user: Mapped[User] = relationship(back_populates="portfolios")
    holdings: Mapped[list["Holding"]] = relationship(back_populates="portfolio", cascade="all, delete-orphan")


class Holding(Base):
    __tablename__ = "holdings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    portfolio_id: Mapped[int] = mapped_column(ForeignKey("portfolios.id"))
    fund_id: Mapped[int] = mapped_column(ForeignKey("funds.id"))
    allocation_pct: Mapped[float] = mapped_column(Float)
    amount_gbp: Mapped[float] = mapped_column(Float)
    portfolio: Mapped[Portfolio] = relationship(back_populates="holdings")
    fund: Mapped[Fund] = relationship()


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    fund_id: Mapped[int] = mapped_column(ForeignKey("funds.id"), index=True)
    claim: Mapped[str] = mapped_column(Text)
    source: Mapped[str] = mapped_column(String(255))
    event_type: Mapped[str] = mapped_column(String(64))
    created_at: Mapped[str] = mapped_column(String(40))
    prev_hash: Mapped[str] = mapped_column(String(64))
    hash: Mapped[str] = mapped_column(String(64))
    fund: Mapped[Fund] = relationship()
