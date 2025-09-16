# ai_services/speech_vision/app/main.py
import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()  # load env vars from .env

# Import our Azure OCR wrapper
from .services.ocr_service import azure_ocr, OcrError

APP_VERSION = os.getenv("APP_VERSION", "0.3.0")

AZURE_OCR_KEY = os.getenv("AZURE_OCR_KEY")
AZURE_OCR_MODEL = os.getenv("AZURE_OCR_MODEL", "mistral-document-ai-2505")
AZURE_OCR_URL = os.getenv("AZURE_OCR_URL")

app = FastAPI(title="Speech & Vision Service")

# CORS (dev-friendly; tighten later in prod)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/healthz")
def healthz():
    return {"ok": True, "service": "speech_vision"}


@app.get("/readyz")
def readyz():
    """Ready if Azure OCR key + URL are set."""
    return {
        "ready": bool(AZURE_OCR_KEY and AZURE_OCR_URL),
        "mode": "azure_ai_foundry" if (AZURE_OCR_KEY and AZURE_OCR_URL) else "dummy",
        "model": AZURE_OCR_MODEL,
    }


@app.get("/version")
def version():
    return {"version": APP_VERSION, "service": "speech_vision"}


@app.post("/ocr")
async def ocr(file: UploadFile = File(...)):
    """OCR endpoint. Uses Azure AI Foundry OCR if configured; otherwise dummy."""
    blob = await file.read()
    if not blob:
        raise HTTPException(status_code=400, detail="Empty file.")

    # Dummy fallback when no Azure OCR credentials are set
    if not (AZURE_OCR_KEY and AZURE_OCR_URL):
        return {
            "success": True,
            "filename": file.filename,
            "text": f"(dummy OCR) received {len(blob)} bytes",
        }

    try:
        text = azure_ocr(blob)  # call Azure Foundry OCR
        return {"success": True, "filename": file.filename, "text": text}
    except OcrError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unhandled error: {str(e)}")
