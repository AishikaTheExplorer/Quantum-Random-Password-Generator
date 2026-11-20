# QRNG // QISKIT
## Quantum Random Password Generator & Cryptographic Entropy Engine

A production-grade, full-stack quantum computing web application that generates cryptographic passwords from simulated quantum superposition state measurements using **Python**, **Qiskit**, and **Qiskit Aer**, integrated with a reactive **React + Three.js** scientific laboratory interface featuring custom GLSL shader particle dynamics, KaTeX formula rendering, and dual-level scientific explanations.

---

## 1. Project Overview

The **Quantum Random Password Generator (QRNG // QISKIT)** bridges quantum information science and cryptographic engineering. Rather than relying on classical pseudo-random algorithms (PRNGs), this system samples measurement collapse outcomes from multi-qubit Hadamard superposition registers executed on the **Qiskit AerSimulator**. 

The application implements unbiased rejection sampling to eliminate modulo bias, calculates theoretical Shannon entropy, benchmarks against classical OS CSPRNGs, and provides 3D interactive visualizations of quantum states on the Bloch sphere and entanglement particle dynamics.

---

## 2. Advanced 3D Introductory Experience & Architecture

### Phase 1: Cinematic Probability Cloud
On initial load, the user experiences an electron-orbital-inspired 3D probability cloud powered by **Three.js** and **custom GLSL vertex/fragment shaders**:
- **13,500 GPU-rendered particles** on desktop devices (dynamically scaled for mobile).
- Double-lobed orbital distribution representing quantum states $|0\rangle$ (Electric Cyan `#00F0FF`) and $|1\rangle$ (Ultraviolet `#8A2BE2`).
- Additive blending, soft Gaussian-like point sprite falloff, and orbital swirling.

### Phase 2: Scroll-Driven Wavefunction Collapse
As the user scrolls down (or clicks *Scroll to collapse wavefunction* or *Skip Intro*):
- The shader uniform `uCollapse` smoothly interpolates particles from an expanded probability cloud into a high-density, glowing quantum core.
- The camera eases into the focal point with smooth damping.
- Upon collapse, a Framer Motion transition smoothly reveals the application navigation and scientific Bento cards without layout distortion.

### Phase 3: Persistent Ambient Quantum Background
Following the collapse transition:
- The particle system transforms into a persistent, lightweight ambient background behind all six application routes.
- Particles exhibit gentle harmonic drift and subtle attraction to cursor coordinates with perpendicular swirling.
- Selected particle pairs generate transient electric filament sparks that pulse and fade.
- If WebGL is unavailable, a responsive CSS bioluminescent gradient fallback is rendered automatically.

---

## 3. Mathematical Formula Rendering (KaTeX Integration)

All equations throughout the application are rendered using **KaTeX** with LaTeX typesetting:

- **Shannon Password Entropy:**
  $$H = L \cdot \log_2(N) \quad [\text{bits}]$$
- **Total Combinatorial Keyspace:**
  $$S = N^L = 2^H$$
- **Unbiased Rejection Sampling:**
  $$k = \lceil \log_2(N) \rceil, \quad P(v = i \mid v < N) = \frac{1}{N} \quad \forall i \in [0, N-1]$$
- **Hadamard Superposition Transformation:**
  $$H = \frac{1}{\sqrt{2}}\begin{pmatrix} 1 & 1 \\ 1 & -1 \end{pmatrix}, \quad H|0\rangle = \frac{|0\rangle + |1\rangle}{\sqrt{2}}$$
- **Bloch Sphere Statevector Orientation:**
  $$|\psi\rangle = \cos\left(\frac{\theta}{2}\right)|0\rangle + e^{i\phi}\sin\left(\frac{\theta}{2}\right)|1\rangle$$
- **Born Rule Projective Measurement:**
  $$P(0) = \cos^2\left(\frac{\theta}{2}\right), \quad P(1) = \sin^2\left(\frac{\theta}{2}\right)$$
- **Grover Quantum Search Bound:**
  $$T_{\text{quantum}} \approx \frac{\pi}{4}\sqrt{N^L} = \frac{\pi}{4} 2^{H/2}$$

---

## 4. Beginner-Friendly Scientific Explanations

Each major concept is presented using a **Dual-Level Explainer**:
- **Level 1 (Intuitive Summary):** Plain-language explanation using clear analogies.
- **Level 2 (Rigorous Mathematical & Quantum Physics Model):** Detailed scientific formulation with KaTeX equations, Hilbert space definitions, and cryptanalytic proofs.

---

## 5. Technology Stack

### Frontend
- **Framework:** React 19 + Vite + TypeScript
- **Styling:** Tailwind CSS v4 (Custom "Cryogenic Obsidian & Bioluminescence" Design System)
- **3D Graphics & Shaders:** Three.js, `@react-three/fiber`, `@react-three/drei`, GLSL
- **Mathematical Rendering:** KaTeX
- **Animation:** Framer Motion
- **Data Visualization:** Recharts
- **Icons:** Lucide React
- **Routing:** React Router v7
- **HTTP Client:** Axios
- **Testing:** Vitest, React Testing Library, JSDOM

### Backend
- **Runtime:** Python 3.11 / 3.12
- **Web Framework:** FastAPI (Asynchronous REST API)
- **ASGI Server:** Uvicorn
- **Quantum Framework:** Qiskit 2.6.2
- **Quantum Simulator:** Qiskit Aer 0.18.4 (`AerSimulator`)
- **Scientific Computing:** NumPy
- **Validation:** Pydantic v2
- **Classical Baseline:** Python standard library `secrets` (OS `/dev/urandom` CSPRNG)
- **Testing:** Pytest, HTTPX

---

## 6. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      React Frontend                         │
│  (GLSL Shader Background • Three.js • KaTeX • Recharts)     │
└──────────────┬──────────────────────────────▲───────────────┘
               │ REST API Requests (Axios)    │ JSON Telemetry
               ▼                              │
┌─────────────────────────────────────────────┴───────────────┐
│                      FastAPI Backend                        │
│            (Input Validation • CORS • Health Check)         │
└───────┬─────────────────────────────────────────────▲───────┘
        │                                             │
        ▼                                             │
┌───────────────────────────────┐   ┌─────────────────┴───────┐
│        Quantum Engine         │   │     Password Engine     │
│  • CircuitBuilder             │   │  • Unbiased Rejection   │
│  • AerSimulator               │   │    Sampling Algorithm   │
│  • Superposition Circuits     │   │  • Character Mapping    │
│  • Born-Rule Measurement      │   │  • Shannon Entropy      │
│  • Qiskit Bit Extraction      │   │  • Attacker Models      │
└───────────────┬───────────────┘   └─────────────────▲───────┘
                │                                     │
                ▼                                     │
┌───────────────────────────────┐                     │
│       Qiskit Aer Core         │                     │
│  • AerSimulator Execution     ├─────────────────────┘
│  • Shot Memory Bitstreams     │ (Random Binary Outcomes)
└───────────────────────────────┘
```

---

## 7. Frontend Pages & Modules

1. **Password Generator (`/`):** Primary Bento card with sliders, category toggles, batch generation, entropy readouts, copy button, and trace inspection.
2. **Quantum Circuit Generator (`/circuits`):** 4-wire circuit editor ($q[0]–q[3]$) with gate toolbox (H, X, CNOT, Phase, Measure), Qiskit ASCII trace, and collapse probability histograms.
3. **Quantum Measurement Engine (`/measurement`):** Split-screen lab with 3D Three.js Bloch sphere, polar ($\theta$) and azimuthal ($\phi$) angles, and empirical shot histograms.
4. **Binary-to-Character Converter (`/converter`):** 3-stage dataflow pipeline tracing raw bits, candidate chunking, and final character mapping.
5. **Password Strength Analyzer (`/analyzer`):** Multi-factor cybersecurity analytics, crack-time estimations across 4 threat models, and classical vs quantum benchmarks.
6. **Quantum Visualization Engine (`/visualizer`):** Dedicated 3D lab featuring dual viewports: Viewport A (Bloch Sphere) and Viewport B (Entangled Dual-Cluster Particle Field).

---

## 8. Installation & Local Execution

### Prerequisites
- Python 3.11 or 3.12
- Node.js v18+ (tested on Node v22)
- npm

### Quick-Launch Scripts (Windows)
- Run `run_backend.bat` to launch the FastAPI server.
- Run `run_frontend.bat` to launch the React frontend.

### Manual Launch

**Terminal 1 — Backend:**
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
*API Swagger Documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)*

**Terminal 2 — Frontend:**
```powershell
cd frontend
npm install
npm run dev
```
*Application Client: [http://localhost:5173](http://localhost:5173)*

---

## 9. Testing & Automated Verification

### Backend Pytest Suite
```powershell
cd backend
pytest -v
```
*Executes all 21 unit and integration tests covering circuit generation, Hadamard gates, Aer simulation, random bit extraction, rejection sampling, entropy math, and all REST endpoints.*

### Frontend Vitest Suite
```powershell
cd frontend
npx vitest run
```
*Executes 8 tests covering navbar branding, routing, controls, clipboard copying, KaTeX formula rendering, and dual-level scientific explanations.*

### Production Build Verification
```powershell
cd frontend
npm run build
```

---

## 10. Cloud Deployment Guide

### A. Frontend Deployment (Vercel)
1. Import repository on [Vercel](https://vercel.com).
2. Configure **Root Directory**: `frontend`.
3. **Build Command:** `npm run build`.
4. **Output Directory:** `dist`.
5. **Install Command:** `npm install`.
6. Add Environment Variable:
   - `VITE_API_BASE_URL`: URL of your deployed backend (e.g. `https://your-backend.onrender.com`).
7. Client-side SPA routing rewrites are handled by `frontend/vercel.json`.

### B. Backend Deployment (Render / Railway)
1. Create a **Web Service** on [Render](https://render.com) or [Railway](https://railway.app).
2. Configure **Root Directory**: `backend`.
3. **Runtime:** Python 3.
4. **Build Command:** `pip install -r requirements.txt`.
5. **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`.
6. Environment Variables:
   - `ENVIRONMENT`: `production`
   - `PORT`: `8000` (or host assigned)
   - `CORS_ORIGINS`: Your Vercel frontend URL (e.g. `https://qrng-qiskit.vercel.app`).
7. **Health Check Path:** `/api/health`.

---

## 11. Scientific Limitations & Reality Notice

> [!NOTE]
> **Simulation vs. Physical Quantum Hardware:**
> Qiskit Aer is an advanced classical simulator of quantum circuits running on CPU/GPU via linear algebra statevector transforms and pseudo-random projective collapse. While it accurately reproduces quantum probability distributions, it does not provide physical hardware quantum advantage or true physical non-determinism over OS CSPRNGs (`/dev/urandom`). For physical non-deterministic entropy, direct execution on physical QPUs (e.g. via Qiskit Runtime) or dedicated optical QRNG hardware is required.

---

## License

Academic and Educational Use License. Developed for research and educational demonstrations.
