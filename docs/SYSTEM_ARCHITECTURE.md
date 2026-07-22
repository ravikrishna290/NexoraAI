# NEXORA — SYSTEM ARCHITECTURE & ENTERPRISE DEPLOYMENT MANUAL

## 1. System Overview

**Nexora** is an Autonomous Industrial Safety Intelligence Platform designed to predict, explain, and mitigate non-linear compound hazards in oil & gas refineries, chemical synthesis plants, and power generation facilities.

---

## 2. Component Architecture & Data Flow

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                            REACT 19 / VITE FRONTEND                              │
│   Dashboard • Digital Twin (P&ID SVG) • Vision AI • Risk Engine • Permits Hub    │
└─────────────────────────┬──────────────────────────────▲─────────────────────────┘
                          │ REST / HTTP (JSON)           │ WebSocket Ticks (2s)
                          ▼                              │
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             FASTAPI BACKEND ENGINE                               │
│  OAuth2 / JWT Auth • Middleware • OpenAPI Router • Background WebSocket Streamer │
└──────┬──────────────────┬──────────────────┬───────────────────┬─────────────────┘
       │                  │                  │                   │
       ▼                  ▼                  ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌────────────────────────┐
│ MULTI-AGENT  │   │ VECTOR RAG   │   │ VISION AI    │   │ POSTGRESQL + REDIS     │
│ LANGGRAPH    │   │ ENGINE       │   │ DETECTOR     │   │ DB Async Sessions      │
│ 6 Domain     │   │ Sentence-    │   │ YOLO v8 +    │   │ Cache & Token Bucket   │
│ Agents +     │   │ Transformers │   │ WebRTC       │   │ Rate Limiter           │
│ Gemini Flash │   │ Vector KB    │   │ Webcam Stream│   │ Audit Log Ledger       │
└──────────────┘   └──────────────┘   └──────────────┘   └────────────────────────┘
```

---

## 3. Core Subsystems

### 3.1 Non-Linear Compound Risk Engine
Calculates total compound risk $R_c$ using normalized base severities $r_i$, weights $w_i$, and cross-domain interaction multipliers $\gamma_{jk}$:

$$R_c = \min\left(99.9\%,\ \left[1 - \prod_{i=1}^{N} (1 - w_i r_i)\right] \times 80 + \sum_{j,k} \gamma_{jk} r_j r_k\right)$$

### 3.2 Multi-Agent Swarm (LangGraph & Gemini 2.0 Flash)
- **`SensorAgent`**: Evaluates SCADA atmospheric gas accumulation ($>20\%$ LEL).
- **`MaintenanceAgent`**: Analyzes AI4I machine telemetry (RPM, torque, tool wear, bearing vibration).
- **`PermitAgent`**: Evaluates spatial overlap between active PTWs and hazard boundaries.
- **`VisionAgent`**: Detects PPE non-compliance and un-cleared personnel in hazard zones.
- **`ComplianceAgent`**: Retrieves vector embeddings over OSHA 1910.119, OISD-105, OISD-116, ISO 45001.
- **`IncidentAgent`**: Matches live telemetry against historical incident database (Jamnagar 2021 VCE).
- **`SupervisorAgent`**: Synthesizes agent state into a **Gemini 2.0 Flash XAI 4-Question Diagnosis**.

---

## 4. Production Deployment Guide

### Single-Command Docker Deployment
```bash
docker-compose up -d --build
```
Access points:
- **Frontend Dashboard**: `http://localhost`
- **FastAPI REST API**: `http://localhost:8000`
- **OpenAPI Swagger Docs**: `http://localhost:8000/api/v1/docs`
- **Prometheus Metrics**: `http://localhost:8000/metrics`
- **Health Probes**: `http://localhost:8000/healthz`
