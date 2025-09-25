from fastapi import APIRouter
from pydantic import BaseModel
from ..services.nlp_service import correct_grammar

router = APIRouter()

class GrammarRequest(BaseModel):
    text: str

@router.post("/")
async def grammar(req: GrammarRequest):
    result = correct_grammar(req.text)
    return {"success": True, "input": req.text, "output": result}
