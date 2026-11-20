"""API integration tests using FastAPI TestClient."""

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health_endpoint():
    """Verify health endpoint returns online status and Qiskit versions."""
    response = client.get("/api/health")
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["status"] == "success"
    data = json_data["data"]
    assert data["backend_status"] == "online"
    assert "qiskit_version" in data
    assert data["aer_operational"] is True


def test_password_generate_endpoint():
    """Verify /api/generate produces valid quantum password."""
    payload = {
        "length": 16,
        "uppercase": True,
        "lowercase": True,
        "numbers": True,
        "symbols": True,
        "count": 2,
    }
    response = client.post("/api/generate", json=payload)
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["status"] == "success"
    data = json_data["data"]
    assert len(data["passwords"]) == 2
    assert len(data["passwords"][0]) == 16
    assert data["character_set_size"] > 0
    assert data["theoretical_entropy_bits"] > 70


def test_circuit_simulate_endpoint():
    """Verify /api/circuit/simulate runs custom user circuit."""
    payload = {
        "num_qubits": 2,
        "gates": [
            {"name": "h", "target": 0},
            {"name": "cx", "control": 0, "target": 1},
        ],
        "shots": 200,
    }
    response = client.post("/api/circuit/simulate", json=payload)
    assert response.status_code == 200
    json_data = response.json()
    data = json_data["data"]
    assert "counts" in data
    assert sum(data["counts"].values()) == 200
    assert "circuit" in data
    assert len(data["histogram"]) > 0


def test_measurement_run_endpoint():
    """Verify /api/measurement/run executes Bloch state measurement."""
    payload = {
        "theta": 1.5708,  # pi/2 -> 50/50 superposition
        "phi": 0.0,
        "apply_h": False,
        "apply_x": False,
        "shots": 500,
    }
    response = client.post("/api/measurement/run", json=payload)
    assert response.status_code == 200
    json_data = response.json()
    data = json_data["data"]
    assert "counts" in data
    assert "single_qubit_stats" in data
    assert "bloch_coordinates" in data


def test_conversion_endpoint():
    """Verify /api/conversion/convert executes three-stage pipeline."""
    payload = {
        "binary_string": "101100101101001011010010110100101101001011010010",
        "chunk_size": 6,
        "encoding_mode": "binary",
    }
    response = client.post("/api/conversion/convert", json=payload)
    assert response.status_code == 200
    json_data = response.json()
    data = json_data["data"]
    assert "stage1_tokens" in data
    assert "stage2_chunks" in data
    assert "stage3_password" in data
    assert "stats" in data


def test_password_analyze_endpoint():
    """Verify /api/password/analyze returns cryptographic telemetry."""
    payload = {"password": "CorrectHorseBatteryStaple#2026"}
    response = client.post("/api/password/analyze", json=payload)
    assert response.status_code == 200
    json_data = response.json()
    data = json_data["data"]
    assert data["length"] == len(payload["password"])
    assert data["theoretical_entropy_bits"] > 100
    assert "strength" in data


def test_comparison_endpoint():
    """Verify /api/comparison/run benchmarks classical vs quantum."""
    payload = {
        "password_length": 16,
        "iterations": 2,
    }
    response = client.post("/api/comparison/run", json=payload)
    assert response.status_code == 200
    json_data = response.json()
    data = json_data["data"]
    assert "classical_duration_ms" in data
    assert "quantum_duration_ms" in data
    assert len(data["comparison_table"]) > 0
