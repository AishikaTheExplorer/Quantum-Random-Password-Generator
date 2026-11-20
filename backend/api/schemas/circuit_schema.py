"""Pydantic schemas for quantum circuit definition and measurement."""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class GateInstruction(BaseModel):
    name: str = Field(..., description="Gate type: 'h', 'x', 'cx', 'p', 'measure'")
    target: int = Field(..., ge=0, description="Target qubit index")
    control: Optional[int] = Field(default=None, description="Control qubit index for two-qubit gates")
    params: Optional[List[float]] = Field(default=None, description="Continuous gate rotation parameters")
    classical_target: Optional[int] = Field(default=None, description="Target classical register bit for measurement")


class CircuitSimulateRequest(BaseModel):
    num_qubits: int = Field(default=4, ge=1, le=16, description="Number of quantum wire registers")
    gates: List[GateInstruction] = Field(default=[], description="Gate sequence to apply")
    shots: int = Field(default=1024, ge=1, le=100000, description="Number of measurement shots")


class MeasurementRunRequest(BaseModel):
    theta: float = Field(default=0.0, description="Bloch polar angle theta in radians")
    phi: float = Field(default=0.0, description="Bloch azimuthal angle phi in radians")
    apply_h: bool = Field(default=False, description="Apply Hadamard gate to state")
    apply_x: bool = Field(default=False, description="Apply Pauli-X gate to state")
    shots: int = Field(default=1024, ge=1, le=50000, description="Measurement shot count")
