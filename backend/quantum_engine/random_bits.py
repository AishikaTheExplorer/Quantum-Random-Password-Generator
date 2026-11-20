"""Quantum random bit generation engine using Qiskit Aer simulations."""

import math
import time
from typing import Dict, Any, List
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator
from quantum_engine.circuit_builder import CircuitBuilder


class QuantumRandomBitGenerator:
    """
    Generates unbiased random binary sequences using true quantum simulation principles.
    Uses n-qubit registers in Hadamard superposition measured on Qiskit AerSimulator.
    """

    def __init__(self, register_size: int = 8):
        self.register_size = register_size
        self._simulator = AerSimulator()

    def generate_quantum_bits(self, num_bits: int) -> Dict[str, Any]:
        """
        Generates at least num_bits random bits from quantum superposition measurements.

        Qiskit bitstring ordering:
        In Qiskit, classical registers are ordered c[n-1]...c[1]c[0] (little-endian representation).
        Each qubit q[i] is measured independently into c[i] following Hadamard gate application:
        H|0> = (|0> + |1>)/sqrt(2), producing an independent Bernoulli trial P(0)=0.5, P(1)=0.5.
        We extract bits from each shot systematically without truncation bias.
        """
        if num_bits < 1:
            raise ValueError("Requested bit count must be at least 1.")
        if num_bits > 100000:
            raise ValueError("Requested bit count cannot exceed 100,000 in a single batch.")

        # Determine number of shots needed
        qubits = min(self.register_size, max(4, min(16, num_bits)))
        shots_needed = math.ceil(num_bits / qubits)

        circuit = CircuitBuilder.build_superposition_circuit(num_qubits=qubits)

        start_time = time.perf_counter()
        # Run circuit on AerSimulator requesting per-shot memory
        job = self._simulator.run(circuit, shots=shots_needed, memory=True)
        result = job.result()
        memory_shots: List[str] = result.get_memory(circuit)
        duration_ms = round((time.perf_counter() - start_time) * 1000, 3)

        # Concatenate bits from all shots
        # memory_shots is a list of strings like ['10010110', '01110010', ...]
        bit_chunks = []
        for shot_str in memory_shots:
            bit_chunks.append(shot_str)

        all_bits = "".join(bit_chunks)

        # Return exact number of requested bits + metrics
        output_bits = all_bits[:num_bits]
        remaining_pool = all_bits[num_bits:]

        count_0 = output_bits.count("0")
        count_1 = output_bits.count("1")

        return {
            "bits": output_bits,
            "total_bits_generated": len(all_bits),
            "requested_bits": num_bits,
            "remaining_bits_in_pool": len(remaining_pool),
            "qubits_used": qubits,
            "shots_executed": shots_needed,
            "circuit_depth": circuit.depth(),
            "execution_time_ms": duration_ms,
            "bit_counts": {"0": count_0, "1": count_1},
            "ratio_0": round(count_0 / num_bits, 4) if num_bits > 0 else 0.5,
            "ratio_1": round(count_1 / num_bits, 4) if num_bits > 0 else 0.5,
        }


# Global instance
quantum_bit_generator = QuantumRandomBitGenerator(register_size=8)
