import os
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

# Hugging Face OCR (optional)
from transformers import TrOCRProcessor, VisionEncoderDecoderModel
from PIL import Image
import torch

HF_API_TOKEN = os.getenv("HF_API_TOKEN")
HF_OCR_MODEL = os.getenv("HF_OCR_MODEL", "microsoft/trocr-base-stage1")

app = FastAPI(title="Speech & Vision Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)

# Try loading OCR model only if token is set
ocr_processor, ocr_model = None, None
if HF_API_TOKEN:
    try:
        ocr_processor = TrOCRProcessor.from_pretrained(HF_OCR_MODEL, token=HF_API_TOKEN)
        ocr_model = VisionEncoderDecoderModel.from_pretrained(HF_OCR_MODEL, token=HF_API_TOKEN)
        print(f"✅ OCR model {HF_OCR_MODEL} loaded")
    except Exception as e:
        print("⚠️ Failed to load OCR model:", str(e))

@app.get("/healthz")
def healthz():
    return {"ok": True, "service": "speech_vision"}

@app.get("/readyz")
def readyz():
    return {"ready": bool(ocr_model), "ocr_model": HF_OCR_MODEL if ocr_model else "not_loaded"}

@app.post("/ocr")
async def ocr(file: UploadFile = File(...)):
    content = await file.read()
    if not ocr_model:
        return {
            "success": True,
            "filename": file.filename,
            "text": f"(dummy OCR) received {len(content)} bytes",
        }

    try:
        # Open image
        image = Image.open(io.BytesIO(content)).convert("RGB")
        # Preprocess
        pixel_values = ocr_processor(images=image, return_tensors="pt").pixel_values
        # Generate text
        generated_ids = ocr_model.generate(pixel_values)
        text = ocr_processor.batch_decode(generated_ids, skip_special_tokens=True)[0]

        return {
            "success": True,
            "filename": file.filename,
            "text": text.strip()
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "filename": file.filename
        }
