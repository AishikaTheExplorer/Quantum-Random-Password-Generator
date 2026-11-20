@echo off
echo ========================================================
echo Starting QRNG // QISKIT FastAPI Backend Server
echo ========================================================
cd /d "%~dp0backend"
if exist "..\venv\Scripts\python.exe" (
    ..\venv\Scripts\python.exe -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
) else if exist "venv\Scripts\python.exe" (
    venv\Scripts\python.exe -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
) else (
    python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
)
pause
