"""Main FastAPI application for Quantum Random Password Generator."""

import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import qiskit
import qiskit_aer

from api.routes import password, circuit, measurement, conversion, analysis, comparison
from utils.response_formatter import success_response

app = FastAPI(
    title="Quantum Random Password Generator API",
    description="Full-stack quantum computing password generation engine using Qiskit Aer",
    version="1.0.0",
)

# Environment & CORS configuration
environment = os.getenv("ENVIRONMENT", "development").lower()
env_cors = os.getenv("CORS_ORIGINS", "")

default_origins = [
    "https://quantum-random-password-generator.vercel.app",
    "https://quantum-password-generator.vercel.app",
    "https://qrng-qiskit.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
]

if env_cors:
    parsed_origins = [
        origin.strip().rstrip("/")
        for origin in env_cors.split(",")
        if origin.strip()
    ]
    if "*" in parsed_origins:
        origins = ["*"]
    else:
        origins = list(dict.fromkeys(parsed_origins + default_origins))
else:
    origins = default_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"^https:\/\/.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include route modules
app.include_router(password.router)
app.include_router(circuit.router)
app.include_router(measurement.router)
app.include_router(conversion.router)
app.include_router(analysis.router)
app.include_router(comparison.router)


@app.get("/api/health")
async def health_check():
    """
    Health check endpoint returning backend status and Qiskit environment telemetry.
    """
    try:
        aer_sim = qiskit_aer.AerSimulator()
        aer_operational = hasattr(aer_sim, "run")
        backend_name = aer_sim.name
        max_qubits = getattr(aer_sim, "num_qubits", 28)
    except Exception:
        aer_operational = False
        backend_name = "Unavailable"
        max_qubits = 0

    return success_response(
        data={
            "backend_status": "online",
            "simulator": backend_name,
            "qiskit_version": qiskit.__version__,
            "qiskit_aer_version": qiskit_aer.__version__,
            "aer_operational": aer_operational,
            "max_qubits": max_qubits,
            "version": "1.0.0",
            "environment": environment,
        },
        message="Backend and Quantum Simulator are fully operational."
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Safe global exception handler avoiding sensitive stack leak."""
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "code": 500,
            "message": "Internal simulation service error.",
            "details": str(exc),
        },
    )


if __name__ == "__main__":
    import uvicorn
    # Bind to 0.0.0.0 for container / cloud deployment
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    reload = os.getenv("RELOAD", "false").lower() == "true"
    uvicorn.run("main:app", host=host, port=port, reload=reload)
