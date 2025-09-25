from fastapi import APIRouter
from pydantic import BaseModel
from ..services.nlp_service import explain_sentence

router = APIRouter()

class ExplainRequest(BaseModel):
    text: str

@router.post("/")
async def explain(req: ExplainRequest):
    result = explain_sentence(req.text)
    return {"success": True, "input": req.text, "output": result}
