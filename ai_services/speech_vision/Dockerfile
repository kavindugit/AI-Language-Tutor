# ai_services/speech_vision/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# System deps (pillow needs some), curl for debugging if needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    libjpeg62-turbo libpng16-16 ca-certificates \
 && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY app /app/app

EXPOSE 8001
ENV PORT=8001

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
