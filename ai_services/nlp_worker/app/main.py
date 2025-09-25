from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from routers import grammar, translate, explain

app = FastAPI(title="NLP Worker")

# CORS for dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/healthz")
def healthz():
    return {"ok": True, "service": "nlp_worker"}

@app.get("/version")
def version():
    return {"version": os.getenv("APP_VERSION", "0.1.0")}

# Routers
app.include_router(grammar.router, prefix="/grammar", tags=["Grammar"])
app.include_router(translate.router, prefix="/translate", tags=["Translation"])
app.include_router(explain.router, prefix="/explain", tags=["Explanation"])
