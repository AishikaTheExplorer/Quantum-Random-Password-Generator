"""Password strength and cybersecurity analysis endpoint."""

from fastapi import APIRouter, HTTPException
from api.schemas.password_schema import PasswordAnalyzeRequest
from password_engine.strength_analyzer import PasswordStrengthAnalyzer
from utils.response_formatter import success_response

router = APIRouter(prefix="/api/password", tags=["Password Analysis"])


@router.post("/analyze")
async def analyze_password_strength(request: PasswordAnalyzeRequest):
    """
    Performs multi-factor cryptographic evaluation of the supplied password.
    Note: Passwords are evaluated strictly in transient memory and never persisted or logged.
    """
    try:
        # Zero-logging: password is not printed to stdout/stderr or log files
        analysis = PasswordStrengthAnalyzer.analyze_password(request.password)
        return success_response(
            data=analysis,
            message="Password cryptographic analysis completed."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
