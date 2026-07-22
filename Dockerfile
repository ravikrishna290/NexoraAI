# Multi-stage Dockerfile for Nexora FastAPI Enterprise Backend
FROM python:3.10-slim as builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

FROM python:3.10-slim as runner

WORKDIR /app

COPY --from=builder /install /usr/local
COPY . .

EXPOSE 8000

ENV PYTHONUNBUFFERED=1
ENV GOOGLE_API_KEY=""

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
