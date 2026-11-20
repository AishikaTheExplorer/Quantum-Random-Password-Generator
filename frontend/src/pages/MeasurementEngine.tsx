import React, { useState, useEffect } from 'react';
import {
  Atom,
  RotateCcw,
  Sparkles,
  BarChart2,
  Play,
  Info,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { BlochSphere3D } from '../components/quantum/BlochSphere3D';
import { runQuantumMeasurement } from '../services/api';
import { fallbackMeasurement } from '../services/demoFallback';
import type { MeasurementRunResult } from '../types';
import { MathFormula } from '../components/ui/MathFormula';
import { DualLevelExplainer } from '../components/ui/DualLevelExplainer';

interface MeasurementEngineProps {
  isConnected: boolean;
}

export const MeasurementEngine: React.FC<MeasurementEngineProps> = ({ isConnected }) => {
  const [theta, setTheta] = useState<number>(Math.PI / 2); // 50/50 superposition default
  const [phi, setPhi] = useState<number>(0);
  const [applyH, setApplyH] = useState<boolean>(false);
  const [applyX, setApplyX] = useState<boolean>(false);
  const [shots, setShots] = useState<number>(1024);

  const [measurementResult, setMeasurementResult] = useState<MeasurementRunResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleMeasure = async () => {
    setIsLoading(true);
    try {
      const res = await runQuantumMeasurement({
        theta,
        phi,
        apply_h: applyH,
        apply_x: applyX,
        shots,
      });
      setMeasurementResult(res);
    } catch (err: unknown) {
      console.warn('Measurement API error, using demo fallback:', err);
      const fallback = fallbackMeasurement({
        theta,
        phi,
        apply_h: applyH,
        apply_x: applyX,
        shots,
      });
      setMeasurementResult(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleMeasure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theta, phi, applyH, applyX, isConnected]);

  const handlePresetState = (t: number, p: number, h = false, x = false) => {
    setTheta(t);
    setPhi(p);
    setApplyH(h);
    setApplyX(x);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8A2BE2]/15 border border-[#8A2BE2]/30 text-[#8B5CF6] text-xs font-mono">
          <Atom className="w-3.5 h-3.5 text-[#00F0FF]" />
          <span>SINGLE-QUBIT STATE MEASUREMENT & PROJECTION</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#F8FAFC]">
          Quantum Measurement Laboratory
        </h2>
        <p className="text-sm sm:text-base text-[#B6C3D4] max-w-2xl mx-auto">
          Explore single-qubit statevector projections on the Bloch sphere and observe projective
          measurement collapse distributions via Qiskit Aer simulations.
        </p>
      </div>

      {/* Split-Screen Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT PANEL: Interactive 3D Bloch Sphere (6 Cols) */}
        <div className="lg:col-span-6 space-y-5">
          <div className="glass-panel p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono text-cyan-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00F0FF]" />
                3D BLOCH SPHERE VIEWPORT
              </span>
              <button
                onClick={() => handlePresetState(0, 0, false, false)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to |0⟩</span>
              </button>
            </div>

            {/* Three.js Canvas Container */}
            <div className="h-[360px] w-full">
              <BlochSphere3D theta={theta} phi={phi} />
            </div>

            {/* Quick State Presets */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono text-slate-400">BASIS STATE PRESETS:</span>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: '|0⟩ Ground', t: 0, p: 0 },
                  { label: '|1⟩ Excited', t: Math.PI, p: 0 },
                  { label: '|+⟩ Superpos', t: Math.PI / 2, p: 0 },
                  { label: '|−⟩ Minus', t: Math.PI / 2, p: Math.PI },
                ].map((st) => (
                  <button
                    key={st.label}
                    onClick={() => handlePresetState(st.t, st.p)}
                    className="p-2 rounded-lg bg-[#080C17] hover:bg-[#00F0FF]/15 border border-slate-800 hover:border-[#00F0FF]/40 text-[11px] font-mono text-slate-300 hover:text-white transition-all cursor-pointer"
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
                  <span className="text-[#A855F7] font-bold">
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
                  className="w-full accent-[#A855F7]"
                />
              </div>

              {/* Gate modifiers */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setApplyH(!applyH)}
                  className={`p-2.5 rounded-xl border text-xs font-mono transition-all ${
                    applyH
                      ? 'bg-[#00F0FF]/20 border-[#00F0FF] text-cyan-200'
                      : 'bg-[#080C17] border-slate-800 text-slate-400'
                  }`}
                >
                  Hadamard (H) {applyH ? '[ACTIVE]' : ''}
                </button>
                <button
                  onClick={() => setApplyX(!applyX)}
                  className={`p-2.5 rounded-xl border text-xs font-mono transition-all ${
                    applyX
                      ? 'bg-purple-600/20 border-purple-500 text-purple-200'
                      : 'bg-[#080C17] border-slate-800 text-slate-400'
                  }`}
                >
                  Pauli-X (Bit Flip) {applyX ? '[ACTIVE]' : ''}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Measurement Results & Distribution (6 Cols) */}
        <div className="lg:col-span-6 space-y-5">
          <div className="glass-panel p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono text-[#00FFA3] flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-[#00FFA3]" />
                EMPIRICAL MEASUREMENT TELEMETRY
              </span>
              <button
                onClick={handleMeasure}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#00FFA3] text-black font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isLoading ? 'MEASURING...' : 'FIRE SHOTS'}</span>
              </button>
            </div>

            {/* Shots Slider */}
            <div className="space-y-1 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">SHOT REPETITIONS:</span>
                <span className="text-[#00FFA3] font-bold">{shots} SHOTS</span>
              </div>
              <input
                type="range"
                min="100"
                max="50000"
                step="500"
                value={shots}
                onChange={(e) => setShots(Number(e.target.value))}
                className="w-full accent-[#00FFA3]"
              />
            </div>

            {/* Comparison Metrics Grid */}
            {measurementResult && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                  {/* State |0> */}
                  <div className="p-4 rounded-xl bg-[#080C17] border border-[#00F0FF]/30 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-[#00F0FF]">STATE |0⟩</span>
                      <span className="text-[10px] text-slate-400">Ground State</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {measurementResult.single_qubit_stats.count_0}
                      <span className="text-xs text-slate-400 ml-1">shots</span>
                    </div>
                    <div className="flex justify-between text-[11px] pt-1 border-t border-slate-800">
                      <span className="text-slate-400">Measured:</span>
                      <span className="text-[#00F0FF] font-bold">
                        {(measurementResult.single_qubit_stats.prob_0 * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Theoretical:</span>
                      <span className="text-slate-300">
                        {(measurementResult.theoretical_probabilities.prob_0 * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* State |1> */}
                  <div className="p-4 rounded-xl bg-[#080C17] border border-[#8A2BE2]/30 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-[#8A2BE2]">STATE |1⟩</span>
                      <span className="text-[10px] text-slate-400">Excited State</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {measurementResult.single_qubit_stats.count_1}
                      <span className="text-xs text-slate-400 ml-1">shots</span>
                    </div>
                    <div className="flex justify-between text-[11px] pt-1 border-t border-slate-800">
                      <span className="text-slate-400">Measured:</span>
                      <span className="text-[#8A2BE2] font-bold">
                        {(measurementResult.single_qubit_stats.prob_1 * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Theoretical:</span>
                      <span className="text-slate-300">
                        {(measurementResult.theoretical_probabilities.prob_1 * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Histogram comparing measured vs theoretical */}
                <div className="space-y-1">
                  <div className="text-xs font-mono text-slate-400 flex justify-between">
                    <span>PROBABILITY HISTOGRAM</span>
                    <span className="text-[#00FFA3]">
                      Exec: {measurementResult.execution_time_ms} ms
                    </span>
                  </div>
                  <div className="h-44 w-full bg-[#080C17] p-2 rounded-xl border border-slate-800">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={measurementResult.histogram}>
                        <XAxis dataKey="state" stroke="#64748B" fontSize={11} />
                        <YAxis stroke="#64748B" fontSize={11} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0B0F1A', borderColor: '#00F0FF', fontSize: '11px' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                        <Bar
                          dataKey="measured_probability"
                          name="Measured Freq"
                          fill="#00F0FF"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="theoretical_probability"
                          name="Born Rule Theory"
                          fill="#8A2BE2"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Sample Bitstream Generated */}
                <div className="space-y-1.5 font-mono text-xs">
                  <div className="text-[11px] text-slate-400">MEASUREMENT BITSTREAM SAMPLE:</div>
                  <div className="p-2.5 rounded-lg bg-[#05070E] border border-slate-800 break-all text-xs text-slate-300 tracking-widest font-mono">
                    {measurementResult.sample_bitstream?.slice(0, 48) || '100101101100101010110101'}...
                  </div>
                </div>

                {/* Scientific Disclaimer Notice */}
                <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-[11px] text-slate-400 font-sans flex items-start gap-2 leading-relaxed">
                  <Info className="w-4 h-4 text-[#00F0FF] shrink-0 mt-0.5" />
                  <span>
                    Academic Note: Results are computed via Qiskit Aer simulation using linear algebra
                    statevector transforms and pseudo-random projective collapse. No physical quantum
                    coherence hardware telemetry is claimed.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Beginner-Friendly Quantum Measurement Guides */}
      <div className="space-y-4 pt-2">
        <div className="text-xs font-mono text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#00F0FF]" />
          <span>Measurement Theory &amp; Bloch Sphere Foundations</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DualLevelExplainer
            title="The 3D Bloch Sphere"
            simpleExplanation="A visual sphere where the top pole is pure 0, the bottom pole is pure 1, and points on the equator are balanced mixtures with different relative phases."
            technicalExplanation="The Bloch sphere is a geometric representation of the pure state space of a two-level quantum system (qubit). Coordinates are mapped via polar angle theta in [0, pi] and azimuthal angle phi in [0, 2*pi]: (x, y, z) = (sin theta * cos phi, sin theta * sin phi, cos theta)."
            mathFormula="|\psi\rangle = \cos\left(\frac{\theta}{2}\right)|0\rangle + e^{i\phi}\sin\left(\frac{\theta}{2}\right)|1\rangle"
            defaultExpanded={true}
          />

          <DualLevelExplainer
            title="The Born Rule of Measurement"
            simpleExplanation="Measurement forces a superposition qubit to collapse to either 0 or 1, with odds determined by the state vector's polar angle on the sphere."
            technicalExplanation="According to the Born rule, projective measurement in the computational basis {|0>, |1>} yields outcome 0 with probability P(0) = |<0|\psi>|^2 = cos^2(theta/2) and outcome 1 with probability P(1) = |<1|\psi>|^2 = sin^2(theta/2)."
            mathFormula="P(0) = |\langle 0|\psi\rangle|^2 = \cos^2\left(\frac{\theta}{2}\right), \quad P(1) = |\langle 1|\psi\rangle|^2 = \sin^2\left(\frac{\theta}{2}\right)"
            defaultExpanded={false}
          />

          <DualLevelExplainer
            title="Finite Shot Standard Error & LLN"
            simpleExplanation="Observed frequencies in simulation deviate slightly from theoretical Born probabilities due to finite sample size. The deviation shrinks predictably as shot count increases."
            technicalExplanation="For S independent shots, the standard error of the empirical probability estimate is sigma_p = sqrt(p(1-p)/S). For equal superposition (p = 0.5), sigma_p = 1 / (2*sqrt(S)). By the Law of Large Numbers, the observed frequency f = count / S converges to p as S approaches infinity."
            mathFormula="\sigma_p = \sqrt{\frac{p(1-p)}{S}}, \quad \lim_{S \to \infty} \left|\frac{\text{count}}{S} - p\right| = 0"
            defaultExpanded={false}
          />
        </div>
      </div>
    </div>
  );
};
