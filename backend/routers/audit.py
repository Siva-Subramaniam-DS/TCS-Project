from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import AuditLog, Fund
from services.audit_chain import serialise, verify_chain

router = APIRouter()


@router.get("/{fund_id}")
def fund_audit(fund_id: int, db: Session = Depends(get_db)):
    fund = db.get(Fund, fund_id)
    if fund is None:
        raise HTTPException(status_code=404, detail="Fund not found")
    full = db.query(AuditLog).order_by(AuditLog.id.asc()).all()
    rows = [row for row in full if row.fund_id == fund_id]
    return {
        "fund": {
            "id": fund.id,
            "name": fund.name,
            "ticker": fund.ticker,
            "label": fund.label,
            "claim": fund.claim,
            "source": fund.source,
        },
        "events": [serialise(row, fund.name) for row in rows],
        "integrity": verify_chain(full),
    }
