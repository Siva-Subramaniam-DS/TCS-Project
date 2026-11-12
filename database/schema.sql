-- ImpactPulse PostgreSQL schema
-- The API also creates these tables via SQLAlchemy on startup.

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(120) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    risk_profile VARCHAR(32),
    age INTEGER,
    horizon_years INTEGER,
    monthly_savings DOUBLE PRECISION,
    drop_reaction VARCHAR(16),
    climate DOUBLE PRECISION,
    water DOUBLE PRECISION,
    energy DOUBLE PRECISION,
    social DOUBLE PRECISION,
    governance DOUBLE PRECISION,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS funds (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    ticker VARCHAR(16) UNIQUE NOT NULL,
    category VARCHAR(80),
    region VARCHAR(80),
    risk VARCHAR(32),
    climate DOUBLE PRECISION,
    water DOUBLE PRECISION,
    energy DOUBLE PRECISION,
    social DOUBLE PRECISION,
    governance DOUBLE PRECISION,
    expense_ratio DOUBLE PRECISION,
    aum_gbp_m DOUBLE PRECISION,
    co2_kg_per_1k DOUBLE PRECISION,
    kwh_per_1k DOUBLE PRECISION,
    water_l_per_1k DOUBLE PRECISION,
    forest_m2_per_1k DOUBLE PRECISION,
    sdgs VARCHAR(40),
    claim TEXT,
    source VARCHAR(255),
    label VARCHAR(32)
);

CREATE TABLE IF NOT EXISTS portfolios (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(120),
    amount_gbp DOUBLE PRECISION,
    risk_profile VARCHAR(32),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS holdings (
    id SERIAL PRIMARY KEY,
    portfolio_id INTEGER REFERENCES portfolios(id) ON DELETE CASCADE,
    fund_id INTEGER REFERENCES funds(id),
    allocation_pct DOUBLE PRECISION,
    amount_gbp DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    fund_id INTEGER REFERENCES funds(id),
    claim TEXT,
    source VARCHAR(255),
    event_type VARCHAR(64),
    created_at VARCHAR(40),
    prev_hash VARCHAR(64),
    hash VARCHAR(64)
);

CREATE INDEX IF NOT EXISTS idx_holdings_portfolio ON holdings(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_audit_fund ON audit_logs(fund_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_user ON portfolios(user_id);
