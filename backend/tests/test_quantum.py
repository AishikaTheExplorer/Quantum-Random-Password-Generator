"""Tests for quantum circuit generation, simulation, and random bit extraction."""

import pytest
from quantum_engine.circuit_builder import CircuitBuilder
from quantum_engine.simulator import QuantumSimulator
from quantum_engine.random_bits import QuantumRandomBitGenerator
from quantum_engine.measurement import MeasurementAnalyzer


def test_circuit_creation_and_hadamard():
    """Verify circuit initialization and correct Hadamard gate application."""
    qc = CircuitBuilder.build_superposition_circuit(num_qubits=4)
    assert qc.num_qubits == 4
    assert qc.num_clbits == 4

    # Count ops to ensure Hadamard and measurement gates exist
    ops = dict(qc.count_ops())
    assert ops.get("h") == 4
    assert ops.get("measure") == 4


def test_simulation_execution():
    """Verify Qiskit Aer simulator runs and returns counts summing to shot count."""
    sim = QuantumSimulator()
    qc = CircuitBuilder.build_superposition_circuit(num_qubits=2)
    shots = 200
    res = sim.run_circuit(qc, shots=shots)

    assert "counts" in res
    assert sum(res["counts"].values()) == shots
    assert res["backend_name"] == "AerSimulator"
    assert res["execution_time_ms"] >= 0


def test_quantum_random_bits_output():
    """Verify generated bits contain only '0' and '1' and match requested length."""
    generator = QuantumRandomBitGenerator(register_size=8)
    num_bits = 64
    result = generator.generate_quantum_bits(num_bits)

    bits = result["bits"]
    assert len(bits) == num_bits
    assert set(bits).issubset({"0", "1"})
    assert result["qubits_used"] == 8
    assert result["total_bits_generated"] >= num_bits


def test_custom_circuit_validation():
    """Verify invalid gate parameters or out-of-bounds qubits raise ValueError."""
    with pytest.raises(ValueError):
        CircuitBuilder.build_custom_circuit(num_qubits=2, gates=[{"name": "h", "target": 5}])

    with pytest.raises(ValueError):
        CircuitBuilder.build_custom_circuit(num_qubits=2, gates=[{"name": "cx", "control": 0, "target": 0}])


def test_measurement_entropy_calculation():
    """Verify measurement entropy is non-negative and calculates correctly."""
    counts = {"0": 50, "1": 50}
    entropy = MeasurementAnalyzer.calculate_distribution_entropy(counts, 100)
    # 50/50 distribution has exact theoretical Shannon entropy of 1.0 bit
    assert pytest.approx(entropy, 0.01) == 1.0
