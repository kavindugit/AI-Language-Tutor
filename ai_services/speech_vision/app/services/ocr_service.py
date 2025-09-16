# ai_services/speech_vision/app/services/ocr_service.py
import io
import os
import base64
import requests
from PIL import Image

# Azure Foundry OCR setup
AZURE_OCR_KEY = (os.getenv("AZURE_OCR_KEY") or "").strip()
AZURE_OCR_MODEL = (os.getenv("AZURE_OCR_MODEL") or "mistral-document-ai-2505").strip()
AZURE_OCR_URL = (os.getenv("AZURE_OCR_URL") or "https://kavindu-ai.services.ai.azure.com/providers/mistral/azure/ocr").strip()

HEADERS = {
    "Authorization": f"Bearer {AZURE_OCR_KEY}",
    "Accept": "application/json",
    "Content-Type": "application/json",
}

class OcrError(Exception):
    pass

def _normalize_to_png_bytes(image_bytes: bytes) -> bytes:
    """Ensure input is PNG bytes (normalize HEIC/CMYK, etc.)."""
    with Image.open(io.BytesIO(image_bytes)) as img:
        buf = io.BytesIO()
        img.convert("RGB").save(buf, format="PNG", optimize=True)
        return buf.getvalue()

def azure_ocr(image_bytes: bytes) -> str:
    """Run OCR using Azure AI Foundry OCR model."""
    if not AZURE_OCR_KEY:
        raise OcrError("AZURE_OCR_KEY not set; cannot use Azure OCR API.")
    if not image_bytes:
        raise OcrError("Empty image bytes.")

    # Normalize and convert to base64
    png_bytes = _normalize_to_png_bytes(image_bytes)
    b64_data = base64.b64encode(png_bytes).decode("utf-8")
    document_url = f"data:image/png;base64,{b64_data}"

    payload = {
        "model": AZURE_OCR_MODEL,
        "document": {
            "type": "document_url",
            "document_name": "input",
            "document_url": document_url
        }
    }

    try:
        resp = requests.post(AZURE_OCR_URL, headers=HEADERS, json=payload, timeout=90)
    except requests.RequestException as e:
        raise OcrError(f"Network error calling Azure OCR API: {e}")

    if not resp.ok:
        snippet = (resp.text or "No body")[:400].replace("\n", "\\n")
        raise OcrError(f"Azure OCR API error ({resp.status_code}): {snippet}")

    data = resp.json()

    # Azure OCR returns JSON with text lines / blocks
    if isinstance(data, dict) and "content" in data:
        return data["content"].strip()
    if isinstance(data, dict) and "text" in data:
        return data["text"].strip()

    # If it returns structured fields (Document Intelligence)
    if isinstance(data, dict):
        return str(data)

    raise OcrError(f"Unexpected Azure OCR response shape: {data}")
