"""Quantum measurement and Bloch sphere state analysis endpoint."""

from fastapi import APIRouter, HTTPException
from api.schemas.circuit_schema import MeasurementRunRequest
from quantum_engine.circuit_builder import CircuitBuilder
from quantum_engine.simulator import simulator
from quantum_engine.measurement import MeasurementAnalyzer
from visualization.measurement_data import MeasurementDataFormatter
from utils.response_formatter import success_response

router = APIRouter(prefix="/api/measurement", tags=["Measurement Engine"])


@router.post("/run")
async def run_measurement(request: MeasurementRunRequest):
    """
    Simulates single-qubit state measurement on Qiskit AerSimulator.
    Returns empirical counts, theoretical probabilities, and Bloch sphere state telemetry.
    """
    try:
        # Build state prep circuit
        qc = CircuitBuilder.build_bloch_circuit(
            theta=request.theta,
            phi=request.phi,
            apply_h=request.apply_h,
            apply_x=request.apply_x,
        )

        sim_res = simulator.run_circuit(qc, shots=request.shots, return_memory=True)
        counts = sim_res["counts"]

        # Analysis
        single_qubit_stats = MeasurementAnalyzer.analyze_single_qubit(counts, request.shots)
        bloch_coords = MeasurementDataFormatter.bloch_angles_to_cartesian(request.theta, request.phi)
        theoretical_probs = MeasurementDataFormatter.state_probabilities_from_angles(request.theta)

        histogram = [
            {
                "state": "|0⟩",
                "count": single_qubit_stats["count_0"],
                "measured_probability": single_qubit_stats["prob_0"],
                "theoretical_probability": theoretical_probs["prob_0"],
            },
            {
                "state": "|1⟩",
                "count": single_qubit_stats["count_1"],
                "measured_probability": single_qubit_stats["prob_1"],
                "theoretical_probability": theoretical_probs["prob_1"],
            },
        ]

        data = {
            "counts": counts,
            "single_qubit_stats": single_qubit_stats,
            "theoretical_probabilities": theoretical_probs,
            "histogram": histogram,
            "bloch_coordinates": bloch_coords,
            "angles": {
                "theta_rad": request.theta,
                "phi_rad": request.phi,
            },
            "applied_gates": {
                "hadamard": request.apply_h,
                "pauli_x": request.apply_x,
            },
            "sample_bitstream": "".join((sim_res.get("memory") or [])[:64]),
            "shots": request.shots,
            "execution_time_ms": sim_res["execution_time_ms"],
            "backend": "Qiskit AerSimulator",
        }

        return success_response(data=data, message="Quantum measurement executed successfully.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Measurement execution failed: {str(e)}")
