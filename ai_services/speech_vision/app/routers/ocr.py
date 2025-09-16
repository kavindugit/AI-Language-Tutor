from fastapi import APIRouter, UploadFile, File, HTTPException
from ..services.ocr_service import gcv_ocr, OcrError

router = APIRouter()

@router.post("/ocr")
async def ocr(file: UploadFile = File(...)):
    try:
        raw = await file.read()
        text = gcv_ocr(raw)
        return {"success": True, "filename": file.filename, "text": text}
    except OcrError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unhandled error: {str(e)}")
