"""Simulator wrapper for executing quantum circuits with Qiskit Aer."""

import time
from typing import Dict, Any, List, Optional
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator


class QuantumSimulator:
    """Provides high-performance execution of quantum circuits on local Qiskit Aer backend."""

    def __init__(self):
        self._simulator = AerSimulator()

    def run_circuit(
        self,
        circuit: QuantumCircuit,
        shots: int = 1024,
        return_memory: bool = False
    ) -> Dict[str, Any]:
        """
        Executes circuit on Qiskit Aer simulator and measures outcomes.
        Returns execution timing, counts, and optional individual shot memory.
        """
        if shots < 1 or shots > 100000:
            raise ValueError(f"Shot count {shots} must be between 1 and 100,000.")

        start_time = time.perf_counter()

        try:
            # Run simulation on AerSimulator
            job = self._simulator.run(circuit, shots=shots, memory=return_memory)
            result = job.result()
            counts = result.get_counts(circuit)
            memory: Optional[List[str]] = result.get_memory(circuit) if return_memory else None
        except Exception as e:
            raise RuntimeError(f"Qiskit Aer simulation failed: {str(e)}") from e

        execution_time_ms = round((time.perf_counter() - start_time) * 1000, 3)

        return {
            "counts": counts,
            "memory": memory,
            "shots": shots,
            "execution_time_ms": execution_time_ms,
            "backend_name": "AerSimulator",
            "circuit_depth": circuit.depth(),
            "qubits": circuit.num_qubits,
            "clbits": circuit.num_clbits,
        }


# Global simulator instance
simulator = QuantumSimulator()
