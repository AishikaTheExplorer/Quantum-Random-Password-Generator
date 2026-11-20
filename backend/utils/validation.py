"""Request parameter validations and bounds checking."""

from typing import List, Dict, Any


def validate_password_options(length: int, count: int, uppercase: bool, lowercase: bool, numbers: bool, symbols: bool):
    """Ensures password generation inputs fall within safe cryptographic bounds."""
    if not (8 <= length <= 64):
        raise ValueError(f"Password length ({length}) must be between 8 and 64 characters.")
    if not (1 <= count <= 10):
        raise ValueError(f"Password count ({count}) must be between 1 and 10.")
    if not any([uppercase, lowercase, numbers, symbols]):
        raise ValueError("At least one character group (uppercase, lowercase, numbers, symbols) must be selected.")


def validate_circuit_config(num_qubits: int, gates: List[Dict[str, Any]]):
    """Ensures quantum circuit definition is well-formed."""
    if not (1 <= num_qubits <= 16):
        raise ValueError(f"Number of qubits ({num_qubits}) must be between 1 and 16.")
    for gate in gates:
        name = gate.get("name", "").lower()
        if name not in ("h", "x", "not", "cx", "cnot", "p", "phase", "measure", "m"):
            raise ValueError(f"Unsupported gate type: '{name}'.")
