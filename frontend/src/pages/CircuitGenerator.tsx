import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Cpu,
  Play,
  RotateCcw,
  Trash2,
  Plus,
  Layers,
  BarChart2,
  Code2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { simulateQuantumCircuit } from '../services/api';
import { fallbackCircuitSimulate } from '../services/demoFallback';
import type { CircuitSimulateResult, GateInstruction } from '../types';
import { MathFormula } from '../components/ui/MathFormula';
import { DualLevelExplainer } from '../components/ui/DualLevelExplainer';

interface CircuitGeneratorProps {
  isConnected: boolean;
}

export const CircuitGenerator: React.FC<CircuitGeneratorProps> = ({ isConnected }) => {
  const [numQubits, setNumQubits] = useState<number>(4);
  const [shots, setShots] = useState<number>(1024);
  const [selectedGate, setSelectedGate] = useState<string>('h');
  const [cnotControl, setCnotControl] = useState<number>(0);
  const [phaseAngle, setPhaseAngle] = useState<number>(1.5708); // pi / 2

  // Gate list placed on circuit
  const [placedGates, setPlacedGates] = useState<GateInstruction[]>([
    { name: 'h', target: 0 },
    { name: 'cx', control: 0, target: 1 },
    { name: 'h', target: 2 },
    { name: 'cx', control: 2, target: 3 },
  ]);

  const [simulationResult, setSimulationResult] = useState<CircuitSimulateResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const availableGates = [
    { id: 'h', name: 'Hadamard (H)', symbol: 'H', desc: 'Creates equal superposition', math: 'H|0\\rangle = \\frac{|0\\rangle + |1\\rangle}{\\sqrt{2}}', color: '#00F0FF' },
    { id: 'x', name: 'Pauli-X (X)', symbol: 'X', desc: 'Bit flip gate', math: 'X|0\\rangle = |1\\rangle, \\; X|1\\rangle = |0\\rangle', color: '#8A2BE2' },
    { id: 'cx', name: 'CNOT (CX)', symbol: 'CX', desc: 'Entangles target with control', math: '\\text{CX}|c, t\\rangle = |c, c \\oplus t\\rangle', color: '#38BDF8', needsControl: true },
    { id: 'p', name: 'Phase Gate (P)', symbol: 'P(θ)', desc: 'Relative phase rotation', math: 'P(\\theta)|1\\rangle = e^{i\\theta}|1\\rangle', color: '#A855F7', needsParam: true },
    { id: 'measure', name: 'Measure (M)', symbol: 'M', desc: 'Born projective measurement', math: 'P(m) = |\\langle m | \\psi \\rangle|^2', color: '#00FFA3' },
  ];

  const handleAddGate = (wireIdx: number) => {
    setErrorMsg(null);
    if (selectedGate === 'cx') {
      if (cnotControl === wireIdx) {
        setErrorMsg('Control and target qubits cannot be identical for CNOT.');
        return;
      }
      setPlacedGates([...placedGates, { name: 'cx', control: cnotControl, target: wireIdx }]);
    } else if (selectedGate === 'p') {
      setPlacedGates([...placedGates, { name: 'p', target: wireIdx, params: [phaseAngle] }]);
    } else {
      setPlacedGates([...placedGates, { name: selectedGate, target: wireIdx }]);
    }
  };

  const handleRemoveGate = (index: number) => {
    const updated = [...placedGates];
    updated.splice(index, 1);
    setPlacedGates(updated);
  };

  const handleResetCircuit = () => {
    setPlacedGates([]);
    setSimulationResult(null);
  };

  const handleCompileAndSimulate = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      if (isConnected) {
        const res = await simulateQuantumCircuit({
          num_qubits: numQubits,
          gates: placedGates,
          shots,
        });
        setSimulationResult(res);
      } else {
        const fallback = fallbackCircuitSimulate({
          num_qubits: numQubits,
          gates: placedGates,
          shots,
        });
        setSimulationResult(fallback);
      }
    } catch (err: unknown) {
      console.warn('Simulation error, using demo preview:', err);
      const fallback = fallbackCircuitSimulate({
        num_qubits: numQubits,
        gates: placedGates,
        shots,
      });
      setSimulationResult(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleCompileAndSimulate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00F0FF]/15 border border-[#00F0FF]/30 text-[#00F0FF] text-xs font-mono">
          <Cpu className="w-3.5 h-3.5" />
          <span>INTERACTIVE QUANTUM CIRCUIT COMPILER</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#F8FAFC]">
          Quantum Circuit Workspace
        </h2>
        <p className="text-sm sm:text-base text-[#B6C3D4] max-w-2xl mx-auto">
          Compose quantum circuits on multi-qubit registers, apply unitary gates, and compile to
          Qiskit AerSimulator for real-time statevector and shot measurements.
        </p>
      </div>

      {/* Main 3-Column Studio Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT PANEL: Gate Toolbox (3 Cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="glass-panel p-5 space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-cyan-300">
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#00F0FF]" />
                GATE TOOLBOX
              </span>
            </div>

            <div className="space-y-2">
              {availableGates.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGate(g.id)}
                  className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedGate === g.id
                      ? 'bg-[#00F0FF]/15 border-[#00F0FF]/50 shadow-[0_0_15px_rgba(0,240,255,0.18)]'
                      : 'bg-[#080C17] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm" style={{ color: g.color }}>
                      [{g.symbol}]
                    </span>
                    <span className="text-xs text-white">{g.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">{g.desc}</div>
                  <div className="mt-1 text-[10px] text-cyan-300">
                    <MathFormula math={g.math} />
                  </div>
                </button>
              ))}
            </div>

            {/* Special Parameters for CNOT or Phase */}
            {selectedGate === 'cx' && (
              <div className="p-3 rounded-xl bg-[#080C17] border border-cyan-800/40 space-y-2 text-xs font-mono">
                <span className="text-slate-400">CNOT CONTROL WIRE:</span>
                <select
                  value={cnotControl}
                  onChange={(e) => setCnotControl(Number(e.target.value))}
                  className="w-full bg-[#05070E] border border-slate-700 rounded-lg p-2 text-cyan-300"
                >
                  {Array.from({ length: numQubits }, (_, i) => (
                    <option key={i} value={i}>
                      q[{i}]
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedGate === 'p' && (
              <div className="p-3 rounded-xl bg-[#080C17] border border-purple-800/40 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>PHASE θ:</span>
                  <span className="text-purple-300">{(phaseAngle / Math.PI).toFixed(2)}π rad</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={Math.PI * 2}
                  step="0.05"
                  value={phaseAngle}
                  onChange={(e) => setPhaseAngle(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>
            )}

            <div className="text-[11px] font-mono text-slate-400 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
              Tip: Select a gate above, then click the [+] button on any wire to place it.
            </div>
          </div>
        </div>

        {/* CENTER PANEL: Circuit Workspace (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="glass-panel p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono text-slate-400 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[#00F0FF]" />
                QUANTUM REGISTER WIRES (q[0] – q[{numQubits - 1}])
              </span>
              <div className="flex items-center gap-2">
                <select
                  value={numQubits}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    setNumQubits(n);
                    setPlacedGates(placedGates.filter((g) => g.target < n && (g.control === undefined || g.control < n)));
                  }}
                  className="bg-[#05070E] border border-slate-700 text-cyan-300 text-xs rounded px-2 py-1 font-mono"
                >
                  <option value={2}>2 Wires</option>
                  <option value={3}>3 Wires</option>
                  <option value={4}>4 Wires</option>
                </select>
                <button
                  onClick={handleResetCircuit}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="text-xs text-rose-400 bg-rose-950/40 p-2.5 rounded-lg border border-rose-800/50">
                {errorMsg}
              </div>
            )}

            {/* 4 Quantum Wire Rows */}
            <div className="space-y-5 py-2">
              {Array.from({ length: numQubits }, (_, wireIdx) => {
                const wireGates = placedGates.filter((g) => g.target === wireIdx || g.control === wireIdx);
                return (
                  <div key={wireIdx} className="space-y-1">
                    <div className="flex items-center gap-3">
                      {/* Wire Label */}
                      <span className="w-12 text-xs font-mono font-bold text-cyan-300 bg-cyan-950/40 border border-cyan-800/40 px-2 py-1 rounded text-center shrink-0">
                        q[{wireIdx}]
                      </span>

                      {/* Quantum Wire Line */}
                      <div className="flex-1 relative h-10 bg-[#080C17] border border-slate-800 rounded-xl flex items-center px-3 overflow-x-auto gap-2">
                        {/* Horizontal Wire Line */}
                        <div className="absolute left-0 right-0 h-[2px] bg-slate-700/60 z-0 pointer-events-none" />

                        {/* Placed Gates along wire */}
                        {wireGates.map((gate, gIdx) => {
                          const isControl = gate.control === wireIdx;
                          const gateDef = availableGates.find((ag) => ag.id === gate.name);
                          return (
                            <motion.div
                              key={gIdx}
                              initial={{ scale: 0.8 }}
                              animate={{ scale: 1 }}
                              className={`relative z-10 px-2.5 py-1 rounded-lg border font-mono text-xs flex items-center gap-1 shrink-0 ${
                                isControl
                                  ? 'bg-sky-950 border-sky-500 text-sky-200'
                                  : 'bg-[#0B0F1A] border-[#00F0FF]/40 text-cyan-200 shadow-sm'
                              }`}
                            >
                              <span>
                                {isControl ? `● Ctrl (->q[${gate.target}])` : gateDef?.symbol || gate.name.toUpperCase()}
                              </span>
                            </motion.div>
                          );
                        })}

                        {/* Add Gate on this wire */}
                        <button
                          onClick={() => handleAddGate(wireIdx)}
                          title={`Place [${selectedGate.toUpperCase()}] on q[${wireIdx}]`}
                          className="relative z-10 ml-auto p-1.5 rounded-lg bg-[#00F0FF]/15 hover:bg-[#00F0FF]/30 text-[#00F0FF] border border-[#00F0FF]/30 cursor-pointer transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Placed Gates Sequence Manager */}
            {placedGates.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="text-[11px] font-mono text-slate-400">
                  APPLIED GATE SEQUENCE ({placedGates.length} GATES):
                </div>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">
                  {placedGates.map((g, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#080C17] border border-slate-700 text-xs font-mono"
                    >
                      <span className="text-cyan-300">
                        {g.name.toUpperCase()} on q[{g.target}]
                        {g.control !== undefined && ` (ctrl: q[${g.control}])`}
                      </span>
                      <button
                        onClick={() => handleRemoveGate(idx)}
                        className="text-slate-500 hover:text-rose-400 ml-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Shots Slider & Compile Action */}
            <div className="pt-3 border-t border-slate-800 space-y-4">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">MEASUREMENT SHOTS:</span>
                <span className="text-[#00F0FF] font-bold">{shots} SHOTS</span>
              </div>
              <input
                type="range"
                min="100"
                max="10000"
                step="100"
                value={shots}
                onChange={(e) => setShots(Number(e.target.value))}
                className="w-full accent-[#00F0FF]"
              />

              <button
                onClick={handleCompileAndSimulate}
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#8A2BE2] text-black font-semibold tracking-wider uppercase text-sm shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(0,240,255,0.5)] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{isLoading ? 'EXECUTING ON AERSIMULATOR...' : 'COMPILE & EXECUTE CIRCUIT'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Live Circuit Telemetry & Histogram (3 Cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="glass-panel p-5 space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-cyan-300">
              <span className="flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-[#00FFA3]" />
                MEASUREMENT OUTCOMES
              </span>
            </div>

            {simulationResult ? (
              <div className="space-y-4 font-mono text-xs">
                {/* Circuit Stats Pills */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg bg-[#080C17] border border-slate-800">
                    <div className="text-[10px] text-slate-400">CIRCUIT DEPTH</div>
                    <div className="text-base font-bold text-white mt-0.5">
                      {simulationResult.circuit_depth}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#080C17] border border-slate-800">
                    <div className="text-[10px] text-slate-400">EXEC TIME</div>
                    <div className="text-base font-bold text-[#00FFA3] mt-0.5">
                      {simulationResult.execution_time_ms} ms
                    </div>
                  </div>
                </div>

                {/* Most Probable State */}
                <div className="p-3 rounded-xl bg-[#080C17] border border-cyan-800/40">
                  <div className="text-[10px] text-slate-400">TOP COLLAPSE STATE</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-lg font-bold text-[#00F0FF]">
                      {simulationResult.most_probable_state?.state || '|0000⟩'}
                    </span>
                    <span className="text-xs text-slate-300">
                      {((simulationResult.most_probable_state?.probability || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Recharts Probability Bar Chart */}
                <div className="space-y-1">
                  <div className="text-[11px] text-slate-400">COLLAPSE PROBABILITIES:</div>
                  <div className="h-44 w-full bg-[#080C17] p-2 rounded-xl border border-slate-800">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={simulationResult.histogram.slice(0, 8)}>
                        <XAxis dataKey="state" stroke="#64748B" fontSize={10} />
                        <YAxis stroke="#64748B" fontSize={10} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0B0F1A', borderColor: '#00F0FF', fontSize: '11px' }}
                        />
                        <Bar dataKey="percentage" fill="#00F0FF" radius={[4, 4, 0, 0]}>
                          {simulationResult.histogram.slice(0, 8).map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={index % 2 === 0 ? '#00F0FF' : '#A855F7'}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* ASCII Diagram Snippet */}
                {simulationResult.circuit?.ascii_diagram && (
                  <div className="space-y-1">
                    <div className="text-[10px] text-slate-400">QISKIT ASCII TRACE:</div>
                    <pre className="text-[10px] leading-tight text-slate-300 bg-[#05070E] p-2 rounded-lg border border-slate-800 overflow-x-auto whitespace-pre font-mono">
                      {simulationResult.circuit.ascii_diagram}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10 text-xs text-slate-500 font-mono">
                Click Compile to execute circuit and inspect telemetry.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Beginner-Friendly Quantum Circuit Guides */}
      <div className="space-y-4 pt-2">
        <div className="text-xs font-mono text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#00F0FF]" />
          <span>Circuit Architecture &amp; Simulation Theory</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DualLevelExplainer
            title="Hadamard Superposition Gate"
            simpleExplanation="A Hadamard gate transforms a definite 0 or 1 into an equal superposition, giving an exact 50/50 probability of collapsing to either outcome when measured."
            technicalExplanation="The single-qubit Hadamard unitary matrix rotates the computational basis states |0> and |1> into symmetric superposition states. In Qiskit, measuring an ideal H|0> state in the computational basis yields P(0) = P(1) = 0.5."
            mathFormula="H = \frac{1}{\sqrt{2}}\begin{pmatrix} 1 & 1 \\ 1 & -1 \end{pmatrix}, \quad H|0\rangle = \frac{|0\rangle + |1\rangle}{\sqrt{2}}"
            defaultExpanded={true}
          />

          <DualLevelExplainer
            title="Two-Qubit Entanglement with CNOT"
            simpleExplanation="CNOT does not automatically create entanglement by itself. It creates entanglement only when applied to a superposition state, linking two qubits together."
            technicalExplanation="When CNOT is applied to computational basis states (e.g., |00> or |10>), the output remains a separable product state (|00> or |11>). However, applying a Hadamard on control qubit q_0 followed by CNOT from q_0 to q_1 transforms separable state |00> into the maximally entangled Bell state |\Phi^+>."
            mathFormula="|00\rangle \xrightarrow{H \otimes I} \frac{|00\rangle + |10\rangle}{\sqrt{2}} \xrightarrow{\text{CX}_{0 \to 1}} |\Phi^+\rangle = \frac{|00\rangle + |11\rangle}{\sqrt{2}}"
            defaultExpanded={false}
          />

          <DualLevelExplainer
            title="Measurement Shots & Statistical Standard Error"
            simpleExplanation="Observed measurement frequencies will fluctuate slightly around 50% due to finite sample size, exactly like flipping a fair coin a finite number of times."
            technicalExplanation="For S independent shots, the standard error of the observed frequency scales as sigma_p = sqrt(p(1-p)/S). For p = 0.5, sigma_p = 1 / (2*sqrt(S)). Under the Law of Large Numbers, empirical frequencies converge to Born rule probabilities as S approaches infinity."
            mathFormula="\sigma_p = \sqrt{\frac{p(1-p)}{S}}, \quad \sigma_{p=0.5} = \frac{1}{2\sqrt{S}}"
            defaultExpanded={false}
          />
        </div>
      </div>
    </div>
  );
};
