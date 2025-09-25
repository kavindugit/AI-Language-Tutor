from fastapi import APIRouter
from pydantic import BaseModel
from ..services.nlp_service import translate_text

router = APIRouter()

class TranslateRequest(BaseModel):
    text: str
    target_lang: str

@router.post("/")
async def translate(req: TranslateRequest):
    result = translate_text(req.text, req.target_lang)
    return {"success": True, "input": req.text, "lang": req.target_lang, "output": result}
