import React, { useState } from 'react';
import {
  Atom,
  Sparkles,
  RotateCcw,
  Zap,
  Info,
  Shield,
  Layers,
} from 'lucide-react';
import { BlochSphere3D } from '../components/quantum/BlochSphere3D';
import { MathFormula } from '../components/ui/MathFormula';
import { DualLevelExplainer } from '../components/ui/DualLevelExplainer';

export const VisualizationEngine: React.FC = () => {
  // Bloch Sphere Spherical Angle Controls
  const [theta, setTheta] = useState<number>(Math.PI / 4);
  const [phi, setPhi] = useState<number>(Math.PI / 3);

  const handleApplyHadamard = () => {
    // Hadamard gate places |0> into |+> (theta = pi/2, phi = 0)
    setTheta(Math.PI / 2);
    setPhi(0);
  };

  const handleApplyPauliX = () => {
    // Pauli-X flips |0> (theta = 0) to |1> (theta = pi) or inverts theta
    setTheta((prev) => (Math.abs(prev - Math.PI) < 0.05 ? 0 : Math.PI - prev));
  };

  const handleApplyCollapse = () => {
    // Projective collapse to |0> or |1> following Born rule
    const p0 = Math.pow(Math.cos(theta / 2), 2);
    const outcome = Math.random() < p0 ? 0 : 1;
    setTheta(outcome === 0 ? 0 : Math.PI);
    setPhi(0);
  };

  const handleResetBloch = () => {
    setTheta(0);
    setPhi(0);
  };

  // Cartesian coordinates calculation
  const cartX = Math.sin(theta) * Math.cos(phi);
  const cartY = Math.sin(theta) * Math.sin(phi);
  const cartZ = Math.cos(theta);

  // Theoretical Born rule probabilities
  const prob0 = Math.pow(Math.cos(theta / 2), 2);
  const prob1 = Math.pow(Math.sin(theta / 2), 2);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00F0FF]/15 border border-[#00F0FF]/30 text-[#00F0FF] text-xs font-mono">
          <Atom className="w-3.5 h-3.5 text-[#00F0FF]" />
          <span>SINGLE-QUBIT HILBERT SPACE VISUALIZATION</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#F8FAFC]">
          Quantum State Visualization Laboratory
        </h2>
        <p className="text-sm sm:text-base text-[#B6C3D4] max-w-2xl mx-auto">
          Explore single-qubit statevector projections on the 3D Bloch sphere, test unitary gate operations, and observe measurement collapse dynamics.
        </p>
      </div>

      {/* Main Scientific Laboratory Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 3D Bloch Sphere Viewport (7 Cols) */}
        <div className="lg:col-span-7 glass-panel p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-mono text-[#00F0FF] flex items-center gap-2 font-bold">
              <Atom className="w-4 h-4 text-[#00F0FF]" />
              INTERACTIVE 3D BLOCH SPHERE
            </span>
            <button
              onClick={handleResetBloch}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center gap-1.5 cursor-pointer border border-slate-700"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset to |0⟩</span>
            </button>
          </div>

          {/* 3D Canvas Viewport */}
          <div className="h-[420px] w-full">
            <BlochSphere3D theta={theta} phi={phi} interactive={true} />
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#94A3B8] font-mono">
            <span>Click &amp; drag sphere to inspect from different viewing angles</span>
            <span className="text-cyan-300">Unit Radius: r = 1</span>
          </div>
        </div>

        {/* Quantum Controls & Mathematical Telemetry (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Controls Glass Card */}
          <div className="glass-panel p-6 space-y-5">
            <div className="text-xs font-mono text-[#CBD5E1] font-bold border-b border-slate-800 pb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00F0FF]" />
              STATE PREPARATION &amp; GATE CONTROLS
            </div>

            {/* Quick State Presets */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono text-slate-400">STATE PRESETS:</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: '|0⟩ Ground State', t: 0, p: 0 },
                  { label: '|1⟩ Excited State', t: Math.PI, p: 0 },
                  { label: '|+⟩ Equal Superposition', t: Math.PI / 2, p: 0 },
                  { label: '|−⟩ Phase Inverted', t: Math.PI / 2, p: Math.PI },
                ].map((st) => (
                  <button
                    key={st.label}
                    onClick={() => {
                      setTheta(st.t);
                      setPhi(st.p);
                    }}
                    className="p-2 rounded-lg bg-[#080C17] hover:bg-[#00F0FF]/15 border border-slate-800 hover:border-[#00F0FF]/40 text-xs font-mono text-slate-300 hover:text-white transition-all cursor-pointer text-left"
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Angular Sliders */}
            <div className="space-y-4 pt-2 border-t border-slate-800 text-xs font-mono">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">POLAR ANGLE (θ):</span>
                  <span className="text-[#00F0FF] font-bold">
                    {(theta / Math.PI).toFixed(2)}π rad ({((theta * 180) / Math.PI).toFixed(0)}°)
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={Math.PI}
                  step="0.02"
                  value={theta}
                  onChange={(e) => setTheta(Number(e.target.value))}
                  className="w-full accent-[#00F0FF]"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">AZIMUTHAL ANGLE (φ):</span>
                  <span className="text-[#8B5CF6] font-bold">
                    {(phi / Math.PI).toFixed(2)}π rad ({((phi * 180) / Math.PI).toFixed(0)}°)
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={Math.PI * 2}
                  step="0.04"
                  value={phi}
                  onChange={(e) => setPhi(Number(e.target.value))}
                  className="w-full accent-[#8B5CF6]"
                />
              </div>
            </div>

            {/* Action Gate Triggers */}
            <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-800">
              <button
                onClick={handleApplyHadamard}
                className="py-2.5 px-3 rounded-xl bg-[#00F0FF]/15 hover:bg-[#00F0FF]/25 text-[#00F0FF] border border-[#00F0FF]/40 text-xs font-mono font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>HADAMARD (H)</span>
              </button>
              <button
                onClick={handleApplyPauliX}
                className="py-2.5 px-3 rounded-xl bg-[#8A2BE2]/15 hover:bg-[#8A2BE2]/25 text-[#A855F7] border border-[#8A2BE2]/40 text-xs font-mono font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>PAULI-X (BIT FLIP)</span>
              </button>
            </div>

            <button
              onClick={handleApplyCollapse}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#8A2BE2] text-black font-semibold font-mono text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all hover:opacity-90"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>PROJECTIVE MEASUREMENT COLLAPSE</span>
            </button>
          </div>

          {/* Mathematical Coordinates & Born Rule Card */}
          <div className="glass-panel p-5 space-y-3 font-mono text-xs">
            <div className="text-[11px] text-[#CBD5E1] font-bold flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Shield className="w-3.5 h-3.5 text-[#00FFA3]" />
              <span>BORN RULE &amp; PROBABILITY TELEMETRY</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[#080C17] border border-cyan-800/30">
                <div className="text-[10px] text-slate-400">P(|0⟩) = cos²(θ/2)</div>
                <div className="text-lg font-bold text-[#00F0FF] mt-1">
                  {(prob0 * 100).toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-500">Amplitude: {Math.cos(theta / 2).toFixed(3)}</div>
              </div>

              <div className="p-3 rounded-xl bg-[#080C17] border border-purple-800/30">
                <div className="text-[10px] text-slate-400">P(|1⟩) = sin²(θ/2)</div>
                <div className="text-lg font-bold text-[#8B5CF6] mt-1">
                  {(prob1 * 100).toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-500">Amplitude: {Math.sin(theta / 2).toFixed(3)}</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#05070E] border border-slate-800 text-[11px] text-slate-300 space-y-1">
              <div className="text-slate-400">Bloch Vector Coordinates (x, y, z):</div>
              <div className="text-cyan-300 font-bold">
                ({cartX.toFixed(3)}, {cartY.toFixed(3)}, {cartZ.toFixed(3)})
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Beginner-Friendly 3D Quantum Visualization Guides */}
      <div className="space-y-4 pt-2">
        <div className="text-xs font-mono text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-2">
          <Atom className="w-4 h-4 text-[#00F0FF]" />
          <span>Quantum State Space Geometry &amp; Measurement Foundations</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DualLevelExplainer
            title="Bloch Sphere State Geometry"
            simpleExplanation="Every point on the sphere's surface is a valid recipe combining the ground state (0) and excited state (1) with relative timing (phase)."
            technicalExplanation="Any pure single-qubit state can be parameterized by polar angle theta in [0, pi] and azimuthal angle phi in [0, 2*pi). The complex projective Hilbert space CP^1 is isomorphic to the unit 2-sphere S^2, with Cartesian coordinates x = sin theta * cos phi, y = sin theta * sin phi, and z = cos theta."
            mathFormula="|\psi\rangle = \cos\left(\frac{\theta}{2}\right)|0\rangle + e^{i\phi}\sin\left(\frac{\theta}{2}\right)|1\rangle"
            defaultExpanded={true}
          />

          <DualLevelExplainer
            title="Projective Wavefunction Collapse"
            simpleExplanation="Before you look, the state arrow points somewhere on the sphere. Once measured, it snaps instantly to either the North Pole (0) or South Pole (1)."
            technicalExplanation="Under von Neumann projective measurement, observing in the computational basis {|0>, |1>} forces the state vector to collapse into |0> with probability cos^2(theta/2) or |1> with probability sin^2(theta/2)."
            mathFormula="\rho \xrightarrow{\text{Measure}} P(0)|0\rangle\langle 0| + P(1)|1\rangle\langle 1|, \quad P(0) = \cos^2\left(\frac{\theta}{2}\right)"
            defaultExpanded={false}
          />

          <DualLevelExplainer
            title="Superposition Building Block for QRNG"
            simpleExplanation="By setting the state to the equator (theta = 90 deg), the qubit has an exact 50/50 chance of collapsing to 0 or 1, creating an ideal random coin flip."
            technicalExplanation="Applying a Hadamard gate H = (1/sqrt(2)) [[1, 1], [1, -1]] to |0> creates the equal superposition state |+> = (|0> + |1>)/sqrt(2). In the computational basis, this produces an unbiased Bernoulli sequence P(0) = P(1) = 0.5 with zero expected bias."
            mathFormula="H|0\rangle = \frac{|0\rangle + |1\rangle}{\sqrt{2}}, \quad P(0) = P(1) = 0.5"
            defaultExpanded={false}
          />
        </div>
      </div>
    </div>
  );
};

export default VisualizationEngine;
