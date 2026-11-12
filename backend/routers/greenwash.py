from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import Fund
from schemas import GreenwashIn
from services.audit_chain import append_event, serialise
from services.greenwash_detector import check_claim

router = APIRouter()


@router.post("/check")
def check(body: GreenwashIn, db: Session = Depends(get_db)):
    result = check_claim(body.text.strip())
    fund = None
    if body.fund_id:
        fund = db.get(Fund, body.fund_id)
    elif body.fund_name:
        fund = db.query(Fund).filter(Fund.name.ilike(body.fund_name.strip())).first()
    audit = None
    if fund is not None:
        row = append_event(
            db,
            fund.id,
            body.text.strip(),
            "Investor check via Greenwash Shield",
            f"shield_{result['label']}",
        )
        db.commit()
        audit = serialise(row, fund.name)
    result["fund"] = None if fund is None else {"id": fund.id, "name": fund.name, "ticker": fund.ticker}
    result["audit"] = audit
    return result
