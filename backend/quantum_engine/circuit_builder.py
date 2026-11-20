"""Quantum circuit builder for QRNG and interactive quantum simulations."""

from typing import List, Dict, Any, Optional
import math
from qiskit import QuantumCircuit


class CircuitBuilder:
    """Constructs QuantumCircuit instances for random bit generation and user experiments."""

    @staticmethod
    def build_superposition_circuit(num_qubits: int = 8) -> QuantumCircuit:
        """
        Creates an n-qubit circuit where every qubit is placed into an equal
        superposition using a Hadamard (H) gate:
        |0> --[H]--> (|0> + |1>) / sqrt(2)
        and then measured into classical registers.
        """
        if num_qubits < 1 or num_qubits > 32:
            raise ValueError("Number of qubits must be between 1 and 32.")

        qc = QuantumCircuit(num_qubits, num_qubits, name="QRNG_Superposition")
        for i in range(num_qubits):
            qc.h(i)
        qc.measure(range(num_qubits), range(num_qubits))
        return qc

    @staticmethod
    def build_bloch_circuit(theta: float = 0.0, phi: float = 0.0, apply_h: bool = False, apply_x: bool = False) -> QuantumCircuit:
        """
        Prepares a single-qubit state vector on the Bloch sphere:
        |psi> = cos(theta/2)|0> + e^(i*phi)*sin(theta/2)|1>
        Optionally applies Hadamard or Pauli-X gates, then measures into classical bit 0.
        """
        qc = QuantumCircuit(1, 1, name="Bloch_State_Prep")
        if apply_x:
            qc.x(0)
        if apply_h:
            qc.h(0)
        if abs(theta) > 1e-6:
            qc.ry(theta, 0)
        if abs(phi) > 1e-6:
            qc.rz(phi, 0)

        qc.measure(0, 0)
        return qc

    @staticmethod
    def build_custom_circuit(num_qubits: int, gates: List[Dict[str, Any]]) -> QuantumCircuit:
        """
        Builds a custom user-defined circuit from an array of gate specifications.
        Gate dict schema:
        {
            "name": "h" | "x" | "cx" | "cnot" | "p" | "phase" | "measure",
            "target": int,
            "control": Optional[int],
            "params": Optional[List[float]]
        }
        """
        if num_qubits < 1 or num_qubits > 16:
            raise ValueError(f"Invalid qubit count: {num_qubits}. Must be between 1 and 16.")

        qc = QuantumCircuit(num_qubits, num_qubits, name="User_Circuit")

        for gate in gates:
            gate_name = gate.get("name", "").lower()
            target = gate.get("target")

            if target is not None and (target < 0 or target >= num_qubits):
                raise ValueError(f"Target qubit {target} is out of bounds for {num_qubits}-qubit circuit.")

            if gate_name == "h":
                qc.h(target)
            elif gate_name in ("x", "not"):
                qc.x(target)
            elif gate_name in ("cx", "cnot"):
                control = gate.get("control")
                if control is None or control < 0 or control >= num_qubits:
                    raise ValueError(f"Invalid control qubit {control} for CNOT gate.")
                if control == target:
                    raise ValueError("Control and target qubits cannot be the same for CNOT.")
                qc.cx(control, target)
            elif gate_name in ("p", "phase"):
                params = gate.get("params", [math.pi / 2])
                param_val = float(params[0]) if params else math.pi / 2
                qc.p(param_val, target)
            elif gate_name in ("measure", "m"):
                classical_target = gate.get("classical_target", target)
                qc.measure(target, classical_target)
            else:
                raise ValueError(f"Unsupported gate type: '{gate_name}'.")

        # Ensure all qubits with operations are measured if no explicit measurements were added
        has_measures = any(gate.get("name", "").lower() in ("measure", "m") for gate in gates)
        if not has_measures:
            qc.measure(range(num_qubits), range(num_qubits))

        return qc
