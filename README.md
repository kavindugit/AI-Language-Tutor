# 🌐 AI Language Tutor --- Full Project Plan

> **Goal:** Build a production‑ready AI language tutor that doubles as a
> **career showcase** for AI Engineering.\
> This project demonstrates **MCP, Docker, Kubernetes, Hugging Face
> APIs, AWS/Azure cloud, cloud databases, data pipelines, software
> engineering practices, NLP, and computer vision** in one coherent
> system.

------------------------------------------------------------------------

## 🚀 Vision & MVP Scope

**Vision:** A personal AI tutor that adapts to CEFR level (A1--C2),
practices conversation, fixes grammar, explains, understands images, and
tracks progress.

**MVP Includes:** - Streaming chat with grammar/explain/translate
toggles - Sessions & history persistence - Vocabulary deck with spaced
repetition - Lesson plan + progress - Quizzes (MCQ, fill‑in‑blank) -
Auth (JWT), XP, streaks, dashboard

**Post‑MVP (Portfolio Extras):** - Roleplay scenarios (mic + speech) -
Pronunciation scoring (Whisper/phoneme feedback) - Image‑to‑lesson tasks
(OCR + captioning) - Data pipeline + analytics dashboards - Badges,
leaderboard, adaptive pathing - Classroom/teacher mode

------------------------------------------------------------------------

## 🏗️ Architecture Overview

**Frontend (React + Tailwind)** - Chat UI with streaming tokens -
Lessons, vocab deck, quizzes, progress - Image upload for CV tasks

**Backend (Node/Express)** - REST + SSE endpoints - JWT auth,
vocab/lesson/session APIs - MCP client to call MCP servers

**MCP Servers** - `tutor-content`: lessons/progress tools -
`tutor-knowledge`: grammar/vector search - `speech-vision`: audio
transcription + image description

**AI Models** - Hugging Face APIs (NLP + Vision) - Optional OpenAI/Azure
OpenAI - Vector DB (pgvector/Qdrant)

**Data Layer** - Cloud DB (MongoDB Atlas / RDS / CosmosDB) - Object
store (S3/Azure Blob) - Redis cache, Kafka/Event Hubs for events

**Infra & DevOps** - Docker containers for all services - Kubernetes
(EKS/AKS) with Helm + Terraform - GitHub Actions CI/CD (lint → test →
build → scan → deploy) - Prometheus, Grafana, Sentry, Trivy

**Data Pipeline** - Events → Kafka/Kinesis/Event Hubs - Airflow/Prefect
nightly jobs - Data lake in S3/Blob, warehouse in
Redshift/Synapse/BigQuery - Superset/Metabase dashboards

------------------------------------------------------------------------

## 📂 Repo Structure

    /ai-language-tutor
      /frontend     # Vite React
      /backend      # Express API
      /servers/mcp  # MCP servers (content, knowledge, speech-vision)
      /worker       # Python worker for OCR, CV
      /infra        # Helm charts, Terraform, CI/CD
      README.md

------------------------------------------------------------------------

## 🔐 API Contract v1

**Auth** - `POST /auth/register` - `POST /auth/login` -
`POST /auth/refresh` - `GET /me`

**Sessions & Messages** - `POST /v1/sessions` - `GET /v1/sessions` -
`GET /v1/sessions/:id/history`

**Chat** - `POST /v1/chat` → SSE stream `{ type, text }`

**Vocab** - `GET /v1/vocab` - `POST /v1/vocab` - `POST /v1/vocab/review`

**Lessons** - `GET /v1/lessons` - `POST /v1/lessons/progress`

**Health** - `GET /healthz`

------------------------------------------------------------------------

## 🗄️ Data Models (Mongo/Postgres)

-   **users**: email, name, xp, streak, level, targetLanguage
-   **sessions**: title, lastActivityAt
-   **messages**: sessionId, role, text, createdAt
-   **vocab**: term, meaning, strength (0--1), lastReviewedAt
-   **lessons**: code, title, level, content
-   **lesson_progress**: userId, lessonCode, done, doneAt
-   **embeddings**: text, embedding\[\], kind, meta

------------------------------------------------------------------------

## 📆 Milestones (6 Sprints)

### Sprint 0 --- Foundations

-   Monorepo setup, Dockerfiles, Helm charts
-   Terraform for EKS/AKS
-   GitHub Actions CI/CD
-   Health endpoint

### Sprint 1 --- API v1 + SSE

-   Auth with JWT + refresh cookies
-   Sessions/messages persistence
-   Streaming `/v1/chat`
-   Observability basics

### Sprint 2 --- MCP Servers

-   `tutor-content`, `tutor-knowledge`, `speech-vision`
-   Backend MCP client integration
-   Helm deploys

### Sprint 3 --- NLP/CV + HF Integration

-   Hugging Face APIs (grammar, NER, captioning)
-   OCR pipeline (Textract/Azure OCR or Tesseract)
-   FE: image-to-lesson exercises

### Sprint 4 --- Data Pipeline & Analytics

-   Events → Kafka/Kinesis/Event Hubs
-   Airflow/Prefect jobs
-   Dashboards in Metabase/Superset

### Sprint 5 --- Security, Perf, Polish

-   Rate limits, WAF, input validation
-   Load testing, autoscaling (HPA)
-   A11y + responsive FE
-   Backups + runbooks

------------------------------------------------------------------------

## 🧩 Unique Differentiators

-   **MCP-first architecture** → extensible, tool-based tutor (rare
    today)
-   **Multimodal learning** → NLP + CV + STT/TTS in one flow
-   **Data pipeline adaptivity** → lessons adapt to weaknesses over time
-   **Full SWE discipline** → CI/CD, security, monitoring, IaC
-   **Portfolio story** → shows breadth across AI + infra + software eng

------------------------------------------------------------------------

## 📉 Risk Register (Barriers & Mitigation)

  ----------------------------------------------------------------------------
  Area        Barrier         Impact          Mitigation           Focus
  ----------- --------------- --------------- -------------------- -----------
  AI/NLP      LLM latency &   Bad UX,         Use SSE, cache,      🔴 High
              cost            expensive       fallback smaller     
                                              models               

  AI/NLP      Grammar         Wrong feedback  Hybrid LLM + RAG     🔴 High
              correction                      notes                
              quality                                              

  CV          OCR noise       Wrong vocab     Use reliable APIs,   🟠 Med
                                              manual correction UI 

  Speech      Pronunciation   Misleading      Start with STT       🟠 Med
              scoring limits  feedback        similarity → phoneme 
                                              scoring later        

  Infra       K8s complexity  Deploy delays   Start with Docker    🔴 High
                                              Compose, migrate to  
                                              K8s                  

  Infra       Cloud costs     Unsustainable   Free tiers,          🔴 High
                                              scale-down, HF free  
                                              endpoints            

  Security    JWT flaws       Account hijack  Short-lived tokens + 🔴 High
                                              refresh +            
                                              rate-limits          

  Security    API key leaks   Abuse & costs   Secret Manager / Key 🔴 High
                                              Vault                

  Product     Too many        User overwhelm  Default sane         🟠 Med
              toggles                         settings             

  Portfolio   Scope creep     Unfinished repo Follow sprint plan   🔴 High
                                              strictly             
  ----------------------------------------------------------------------------

------------------------------------------------------------------------

## 🎯 Focus Areas

-   **High**: AI quality, chat UX, infra (K8s/Docker), security, repo
    polish\
-   **Medium**: OCR/CV tasks, speech feedback, MCP servers beyond 1--2\
-   **Low (later)**: pipelines/analytics, badges, classroom features

------------------------------------------------------------------------

## 📊 Observability & Analytics

-   Logs: Pino, Loki/ELK
-   Metrics: Prometheus + Grafana
-   Errors: Sentry
-   Dashboards: Metabase/Superset

------------------------------------------------------------------------

## 🛡️ Security Practices

-   JWT access + httpOnly refresh cookies
-   CORS allowlist
-   Input validation (Zod)
-   Rate limiting (IP + userId)
-   Secrets in Vault/Key Vault/Secrets Manager

------------------------------------------------------------------------

## ✅ Definition of Done

-   APIs validated with Zod, unit + integration tests
-   FE has loading/error states, mobile responsive
-   Logs + metrics present, CI/CD pipelines green
-   Documentation + architecture diagrams included

------------------------------------------------------------------------

## 📚 Portfolio Checklist

-   MCP → custom servers + client bridge
-   Docker → multi-stage builds + Trivy scans
-   K8s → Helm charts, HPA, ingress, secrets
-   Hugging Face → inference API usage
-   Cloud (AWS/Azure) → IaC + services
-   Data pipeline → Airflow DAG + dashboards
-   SWE → tests, CI/CD, docs
-   NLP → grammar, translation, NER
-   CV → OCR + caption-to-lesson feature

------------------------------------------------------------------------

## 📌 Today's Action Items

-   Choose cloud track (AWS/Azure)
-   Scaffold Dockerfiles for FE/BE/worker
-   Helm charts + dev values; ingress + TLS
-   Terraform stack for VPC + cluster
-   Implement `/healthz` + `/auth/*`
-   Start `tutor-content` MCP server skeleton

------------------------------------------------------------------------

© 2025 --- AI Language Tutor Project
