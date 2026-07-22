"""
Automated Pytest Suite for Nexora API Endpoints.
"""

import pytest
import httpx

BASE_URL = "http://127.0.0.1:8000"
TIMEOUT = 30.0

@pytest.fixture
def client():
    with httpx.Client(base_url=BASE_URL, timeout=TIMEOUT) as c:
        yield c

def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ONLINE"
    assert "Nexora" in data["platform"]

def test_healthz_probe(client):
    response = client.get("/healthz")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "HEALTHY"

def test_readyz_probe(client):
    response = client.get("/readyz")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "READY"

def test_prometheus_metrics(client):
    response = client.get("/metrics")
    assert response.status_code == 200
    assert "nexora_compound_risk_index" in response.text

def test_auth_login(client):
    response = client.post("/api/v1/auth/login", json={"username": "karan.mehta", "password": "password"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_machines_health(client):
    response = client.get("/api/v1/machines/health")
    assert response.status_code == 200
    data = response.json()
    assert "failure_probability" in data
    assert "rpm" in data

def test_risk_assessment(client):
    response = client.get("/api/v1/risk/assessment")
    assert response.status_code == 200
    data = response.json()
    assert data["compound_risk_score"] > 50
    assert "four_questions" in data

def test_copilot_query(client):
    response = client.post("/api/v1/copilot/query", json={"prompt": "Why was permit PTW-8409 rejected?"})
    assert response.status_code == 200
    data = response.json()
    assert len(data["answer"]) > 10

def test_simulation_trigger(client):
    response = client.post("/api/v1/simulation/trigger", json={"scenario": "FIRE"})
    assert response.status_code == 200
    data = response.json()
    assert data["compound_score"] > 50
