"""Extracts circuit metadata and layout for frontend visualization."""

from typing import Dict, Any, List
from qiskit import QuantumCircuit


class CircuitDataFormatter:
    """Formats Qiskit QuantumCircuit data into structured objects for React visualization."""

    @staticmethod
    def format_circuit_summary(circuit: QuantumCircuit) -> Dict[str, Any]:
        """Extracts text diagrams, gate counts, depth, and wire structures."""
        # ASCII art representation
        ascii_diagram = circuit.draw(output="text").single_string()

        # Gate frequency count
        gate_counts = dict(circuit.count_ops())

        # List of instructions for wire diagram
        instructions_data = []
        for index, instruction in enumerate(circuit.data):
            op_name = instruction.operation.name
            q_indices = [circuit.find_bit(q).index for q in instruction.qubits]
            c_indices = [circuit.find_bit(c).index for c in instruction.clbits]
            params = [float(p) for p in instruction.operation.params] if hasattr(instruction.operation, "params") else []

            instructions_data.append({
                "step": index,
                "gate": op_name,
                "qubits": q_indices,
                "clbits": c_indices,
                "params": params,
            })

        return {
            "name": circuit.name or "QuantumCircuit",
            "num_qubits": circuit.num_qubits,
            "num_clbits": circuit.num_clbits,
            "depth": circuit.depth(),
            "gate_counts": gate_counts,
            "ascii_diagram": ascii_diagram,
            "instructions": instructions_data,
        }
