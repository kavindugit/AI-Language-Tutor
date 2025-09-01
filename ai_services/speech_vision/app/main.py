# ai_services/speech_vision/app/main.py
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import os, io, base64
import httpx
from PIL import Image

app = FastAPI(title="Speech & Vision Service", version="0.1.0")

STARTED_AT = None
HF_API_TOKEN = os.getenv("HF_API_TOKEN", "").strip()
# Lightweight readiness flag (could expand for model loads etc.)
READY = True

@app.on_event("startup")
async def on_startup():
    global STARTED_AT
    STARTED_AT = os.times().elapsed

@app.get("/healthz")
async def healthz():
    return {"ok": True, "service": "speech_vision", "uptime_s": os.times().elapsed - (STARTED_AT or 0)}

@app.get("/readyz")
async def readyz():
    # Add checks like OCR/ASR models warmed, GPU, etc.
    return {"ready": READY, "ocr": "hf_api" if HF_API_TOKEN else "disabled"}

@app.post("/ocr")
async def ocr(file: UploadFile = File(...)):
    """
    OCR an image:
    - If HF_API_TOKEN provided, uses Hugging Face Inference API (don’t forget to set a model).
    - Otherwise returns 501 (not implemented) so service still runs during dev.
    """
    if not HF_API_TOKEN:
        raise HTTPException(status_code=501, detail="OCR not configured (HF_API_TOKEN missing).")

    # NOTE: pick a lightweight OCR or image-to-text model. Example: "microsoft/trocr-base-printed" (may vary)
    model = os.getenv("HF_OCR_MODEL", "microsoft/trocr-base-printed")
    try:
        raw = await file.read()
        # Some HF endpoints can take raw image bytes; fallback to base64 when needed
        image = Image.open(io.BytesIO(raw)).convert("RGB")
        buf = io.BytesIO()
        image.save(buf, format="PNG")
        buf.seek(0)

        headers = {"Authorization": f"Bearer {HF_API_TOKEN}"}
        # Many image-to-text endpoints accept raw image bytes as body
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(
                f"https://api-inference.huggingface.co/models/{model}",
                headers=headers,
                content=buf.getvalue(),
            )
            if resp.status_code != 200:
                raise HTTPException(status_code=502, detail=f"HF API error: {resp.text}")
            data = resp.json()
        # Response shape depends on model; try to normalize basic cases:
        # - Some return [{"generated_text": "..."}]
        # - Others return a string or token list.
        text = ""
        if isinstance(data, list):
            # take first generated_text if present
            for item in data:
                if isinstance(item, dict) and "generated_text" in item:
                    text = item["generated_text"]
                    break
        if not text and isinstance(data, dict):
            text = data.get("generated_text") or data.get("text") or ""

        return {"text": text or "", "model": model}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
