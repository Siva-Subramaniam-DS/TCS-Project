"""SHA-256 hash-linked audit log. Each row commits to the previous hash."""

from __future__ import annotations

import hashlib
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from models import AuditLog, Fund

GENESIS = "0" * 64


def payload(fund_id: int, claim: str, source: str, created_at: str, prev_hash: str) -> str:
    return f"{fund_id}|{claim}|{source}|{created_at}|{prev_hash}"


def sha256(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def append_event(
    db: Session,
    fund_id: int,
    claim: str,
    source: str,
    event_type: str,
    created_at: str | None = None,
) -> AuditLog:
    last = db.query(AuditLog).order_by(AuditLog.id.desc()).first()
    prev = last.hash if last else GENESIS
    stamp = created_at or datetime.utcnow().replace(microsecond=0).isoformat() + "Z"
    digest = sha256(payload(fund_id, claim, source, stamp, prev))
    row = AuditLog(
        fund_id=fund_id,
        claim=claim,
        source=source,
        event_type=event_type,
        created_at=stamp,
        prev_hash=prev,
        hash=digest,
    )
    db.add(row)
    db.flush()
    return row


def verify_chain(rows: list[AuditLog]) -> dict:
    prev = GENESIS
    for index, row in enumerate(rows):
        expected = sha256(payload(row.fund_id, row.claim, row.source, row.created_at, prev))
        if row.prev_hash != prev or row.hash != expected:
            return {
                "intact": False,
                "broken_at": row.id,
                "checked": index,
                "length": len(rows),
            }
        prev = row.hash
    return {"intact": True, "broken_at": None, "checked": len(rows), "length": len(rows)}


def seed_chain(db: Session, funds: list[Fund]) -> None:
    """Two events per fund, stamped in the past so the timeline has history."""
    start = datetime(2024, 11, 1, 9, 0, 0)
    for index, fund in enumerate(funds):
        published = (start + timedelta(hours=index)).isoformat() + "Z"
        reviewed = (start + timedelta(hours=index, minutes=20)).isoformat() + "Z"
        append_event(
            db,
            fund.id,
            fund.claim or "",
            fund.source or "Issuer",
            "claim_published",
            published,
        )
        append_event(
            db,
            fund.id,
            f"ImpactPulse review labelled this claim {fund.label}.",
            "ImpactPulse greenwash shield",
            "claim_reviewed",
            reviewed,
        )
    db.commit()


def serialise(row: AuditLog, fund_name: str | None = None) -> dict:
    return {
        "id": row.id,
        "fund_id": row.fund_id,
        "fund_name": fund_name,
        "claim": row.claim,
        "source": row.source,
        "event_type": row.event_type,
        "created_at": row.created_at,
        "prev_hash": row.prev_hash,
        "hash": row.hash,
    }
