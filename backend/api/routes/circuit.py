"""Quantum circuit compile and simulate API endpoint."""

from fastapi import APIRouter, HTTPException
from api.schemas.circuit_schema import CircuitSimulateRequest
from quantum_engine.circuit_builder import CircuitBuilder
from quantum_engine.simulator import simulator
from quantum_engine.measurement import MeasurementAnalyzer
from visualization.circuit_data import CircuitDataFormatter
from utils.response_formatter import success_response

router = APIRouter(prefix="/api/circuit", tags=["Quantum Circuit"])


@router.post("/simulate")
async def simulate_circuit(request: CircuitSimulateRequest):
    """
    Builds the corresponding Qiskit QuantumCircuit, compiles it,
    runs it on Qiskit AerSimulator, and returns measurement counts, depth, and telemetry.
    """
    try:
        # Convert Pydantic gate instructions to dicts
        gates_dict = [gate.model_dump() for gate in request.gates]
        qc = CircuitBuilder.build_custom_circuit(num_qubits=request.num_qubits, gates=gates_dict)

        # Run on AerSimulator
        sim_result = simulator.run_circuit(qc, shots=request.shots, return_memory=True)

        counts = sim_result["counts"]
        probabilities = MeasurementAnalyzer.calculate_probabilities(counts, request.shots)
        histogram = MeasurementAnalyzer.format_histogram_data(counts, request.shots)
        entropy = MeasurementAnalyzer.calculate_distribution_entropy(counts, request.shots)
        circuit_meta = CircuitDataFormatter.format_circuit_summary(qc)

        # Get top binary outcome
        sorted_counts = sorted(counts.items(), key=lambda x: x[1], reverse=True)
        most_probable = sorted_counts[0] if sorted_counts else ("0" * request.num_qubits, 0)

        data = {
            "circuit": circuit_meta,
            "counts": counts,
            "probabilities": probabilities,
            "histogram": histogram,
            "entropy_bits": entropy,
            "most_probable_state": {
                "state": f"|{most_probable[0]}⟩",
                "binary": most_probable[0],
                "count": most_probable[1],
                "probability": round(most_probable[1] / request.shots, 4) if request.shots > 0 else 0,
            },
            "sample_memory": (sim_result.get("memory") or [])[:20],
            "shots": request.shots,
            "execution_time_ms": sim_result["execution_time_ms"],
            "circuit_depth": qc.depth(),
            "gate_counts": dict(qc.count_ops()),
        }

        return success_response(data=data, message="Circuit compiled and simulated successfully.")
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation error: {str(e)}")
