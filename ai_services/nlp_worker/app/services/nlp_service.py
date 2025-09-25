import os
import requests

HF_API_KEY = os.getenv("HF_API_KEY")
HF_MODEL_GRAMMAR = os.getenv("HF_MODEL", "pszemraj/flan-t5-base-grammar-synthesis")
HF_MODEL_TRANSLATION = "Helsinki-NLP/opus-mt-en-ROMANCE"  # example: EN → ES/FR/PT/IT
HF_MODEL_EXPLAIN = "google/flan-t5-base"  # generic explanation model

HEADERS = {"Authorization": f"Bearer {HF_API_KEY}"}

def _query_hf(model: str, payload: dict):
    url = f"https://api-inference.huggingface.co/models/{model}"
    resp = requests.post(url, headers=HEADERS, json=payload, timeout=60)
    if not resp.ok:
        raise Exception(f"HuggingFace API error {resp.status_code}: {resp.text}")
    data = resp.json()
    if isinstance(data, list) and "generated_text" in data[0]:
        return data[0]["generated_text"]
    return str(data)

def correct_grammar(text: str) -> str:
    prompt = f"Correct grammar: {text}"
    return _query_hf(HF_MODEL_GRAMMAR, {"inputs": prompt})

def translate_text(text: str, target_lang: str) -> str:
    prompt = f"Translate this into {target_lang}: {text}"
    return _query_hf(HF_MODEL_TRANSLATION, {"inputs": prompt})

def explain_sentence(text: str) -> str:
    prompt = f"Explain the grammar and meaning of this sentence: {text}"
    return _query_hf(HF_MODEL_EXPLAIN, {"inputs": prompt})
