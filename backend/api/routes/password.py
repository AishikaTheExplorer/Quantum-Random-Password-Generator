"""Password generation API endpoint using Qiskit Aer simulations."""

from fastapi import APIRouter, HTTPException
from api.schemas.password_schema import PasswordGenerateRequest
from password_engine.generator import QuantumPasswordGenerator
from utils.response_formatter import success_response, error_response

router = APIRouter(prefix="/api", tags=["Password Generation"])


@router.post("/generate")
async def generate_quantum_password(request: PasswordGenerateRequest):
    """
    Executes actual Qiskit quantum circuit superposition measurements,
    extracts quantum bits, applies unbiased rejection sampling,
    and returns production-grade passwords with cryptographic telemetry.
    """
    try:
        result = QuantumPasswordGenerator.generate_passwords(
            length=request.length,
            uppercase=request.uppercase,
            lowercase=request.lowercase,
            numbers=request.numbers,
            symbols=request.symbols,
            count=request.count,
        )
        return success_response(
            data=result,
            message=f"Successfully generated {request.count} quantum password(s)."
        )
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Quantum password generation failed: {str(e)}")
