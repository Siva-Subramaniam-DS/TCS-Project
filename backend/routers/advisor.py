from fastapi import APIRouter

from schemas import ChatIn
from services.jargon_simplifier import explain

router = APIRouter()


@router.post("/chat")
def chat(body: ChatIn):
    history = [item.model_dump() for item in body.history]
    return explain(body.message.strip(), history, body.context)
