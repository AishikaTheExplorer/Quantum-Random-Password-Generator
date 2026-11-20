import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Copy,
  Check,
  RefreshCw,
  Eye,
  EyeOff,
  Sparkles,
  Shield,
  Layers,
  Binary,
  Cpu,
  Clock,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { generateQuantumPassword } from '../services/api';
import { fallbackPasswordGenerator } from '../services/demoFallback';
import type { PasswordGenerateResult } from '../types';
import { MathFormula } from '../components/ui/MathFormula';
import { DualLevelExplainer } from '../components/ui/DualLevelExplainer';

interface PasswordGeneratorProps {
  isConnected: boolean;
}

export const PasswordGenerator: React.FC<PasswordGeneratorProps> = ({ isConnected }) => {
  const [length, setLength] = useState<number>(16);
  const [uppercase, setUppercase] = useState<boolean>(true);
  const [lowercase, setLowercase] = useState<boolean>(true);
  const [numbers, setNumbers] = useState<boolean>(true);
  const [symbols, setSymbols] = useState<boolean>(true);
  const [count, setCount] = useState<number>(1);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(true);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [result, setResult] = useState<PasswordGenerateResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showTrace, setShowTrace] = useState<boolean>(false);

  const handleGenerate = async () => {
    if (!uppercase && !lowercase && !numbers && !symbols) {
      setErrorMsg('Please select at least one character category.');
      return;
    }
    setErrorMsg(null);
    setIsLoading(true);

    try {
      // Always attempt the live Qiskit Aer backend API first
      const data = await generateQuantumPassword({
        length,
        uppercase,
        lowercase,
        numbers,
        symbols,
        count,
      });
      setResult(data);
    } catch (err: unknown) {
      console.warn('Backend call failed, using demo fallback:', err);
      const demoData = fallbackPasswordGenerator({
        length,
        uppercase,
        lowercase,
        numbers,
        symbols,
        count,
      });
      setResult(demoData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Generate initial password on mount, and re-fetch from Qiskit backend once connection establishes
    handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
      {/* Page Title & Context */}
      <div className="text-center space-y-2">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00F0FF]/10 border border-[#00F0FF]/25 text-[#00F0FF] text-xs font-mono"
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>QISKIT AER // BORN SUPERPOSITION SAMPLING</span>
        </motion.div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#F8FAFC]">
          Password Generation Laboratory
        </h2>
        <p className="text-sm sm:text-base text-[#B6C3D4] max-w-2xl mx-auto">
          Generates provably unbiased cryptographic keys using binary measurement collapse from
          Hadamard superposition circuits on Qiskit Aer.
        </p>
      </div>

      {/* Main Large Frosted Glass Bento Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="glass-panel p-6 sm:p-8 space-y-6 relative overflow-hidden"
      >
        {/* Top Glow Ambient Accent */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent opacity-80" />

        {/* SECTION A: Password Output Hero Box */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-[#94A3B8]">
            <span className="flex items-center gap-1.5 text-cyan-300">
              <Sparkles className="w-3.5 h-3.5 text-[#00F0FF]" />
              PRIMARY OUTPUT
            </span>
            <span>
              SOURCE:{' '}
              <span className="text-[#F8FAFC]">
                {result?.generation_source || 'Qiskit AerSimulator'}
              </span>
            </span>
          </div>

          <div className="relative rounded-2xl bg-[#05070E]/90 border border-[#00F0FF]/30 p-5 sm:p-6 shadow-[0_0_25px_rgba(0,240,255,0.08)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full overflow-x-auto text-center sm:text-left">
              <span className="text-xl sm:text-2xl md:text-3xl font-mono font-semibold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#F8FAFC] via-cyan-100 to-[#00F0FF] select-all break-all">
                {result?.primary_password
                  ? showPassword
                    ? result.primary_password
                    : '•'.repeat(result.primary_password.length)
                  : 'Initializing Quantum Circuit...'}
              </span>
            </div>

            {/* Action Bar */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
                className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>

              <button
                onClick={() => result?.primary_password && handleCopy(result.primary_password, 0)}
                title="Copy to clipboard"
                className="p-2.5 rounded-xl bg-[#00F0FF]/15 hover:bg-[#00F0FF]/25 text-[#00F0FF] border border-[#00F0FF]/40 shadow-[0_0_12px_rgba(0,240,255,0.2)] transition-all cursor-pointer"
              >
                {copiedIndex === 0 ? <Check className="w-4 h-4 text-[#00FFA3]" /> : <Copy className="w-4 h-4" />}
              </button>

              <button
                onClick={handleGenerate}
                disabled={isLoading}
                title="Regenerate"
                className="p-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#00F0FF]' : ''}`} />
              </button>
            </div>
          </div>

          {/* Additional Passwords if Count > 1 */}
          {result && result.passwords.length > 1 && (
            <div className="space-y-2 pt-2">
              <div className="text-xs font-mono text-slate-400">
                BATCH OUTCOMES ({result.passwords.length} KEYS):
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {result.passwords.slice(1).map((pwd, idx) => (
                  <div
                    key={idx + 1}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#080C17] border border-slate-800 hover:border-[#00F0FF]/30 transition-all text-xs font-mono"
                  >
                    <span className="text-slate-300 truncate mr-2">
                      {showPassword ? pwd : '•'.repeat(pwd.length)}
                    </span>
                    <button
                      onClick={() => handleCopy(pwd, idx + 1)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                    >
                      {copiedIndex === idx + 1 ? <Check className="w-3.5 h-3.5 text-[#00FFA3]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SECTION B: Configuration Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4 border-t border-slate-800/80">
          {/* Sliders (Length & Count) */}
          <div className="space-y-5 lg:col-span-1">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">PASSWORD LENGTH</span>
                <span className="text-[#00F0FF] font-bold">{length} CHARS</span>
              </div>
              <input
                type="range"
                min="8"
                max="64"
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#00F0FF]"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>8 Min</span>
                <span>16 Default</span>
                <span>32 High</span>
                <span>64 Max</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">BATCH QUANTITY</span>
                <span className="text-[#A855F7] font-bold">{count} KEYS</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#A855F7]"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>1 Key</span>
                <span>5 Keys</span>
                <span>10 Max</span>
              </div>
            </div>
          </div>

          {/* Character Category Toggle Cards */}
          <div className="space-y-3 lg:col-span-2">
            <span className="text-xs font-mono text-slate-400">CHARACTER GROUPS</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Uppercase', sub: 'A–Z', active: uppercase, set: setUppercase, color: '#00F0FF' },
                { label: 'Lowercase', sub: 'a–z', active: lowercase, set: setLowercase, color: '#38BDF8' },
                { label: 'Numbers', sub: '0–9', active: numbers, set: setNumbers, color: '#8A2BE2' },
                { label: 'Symbols', sub: '!@#$...', active: symbols, set: setSymbols, color: '#00FFA3' },
              ].map((cat) => (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() => cat.set(!cat.active)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    cat.active
                      ? 'bg-[#0B0F1A] border-[#00F0FF]/40 shadow-[0_0_12px_rgba(0,240,255,0.12)]'
                      : 'bg-[#05070E]/60 border-slate-800 opacity-60 hover:opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-white">{cat.label}</span>
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: cat.active ? cat.color : '#475569' }}
                    />
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">{cat.sub}</div>
                </button>
              ))}
            </div>

            {errorMsg && (
              <div className="text-xs text-rose-400 bg-rose-950/40 p-2.5 rounded-lg border border-rose-800/50">
                {errorMsg}
              </div>
            )}
          </div>
        </div>

        {/* SECTION C: Real-Time Entropy & Keyspace Telemetry Bento Sub-Grid */}
        {result && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80">
            <div className="p-3.5 rounded-xl bg-[#080C17]/90 border border-slate-800">
              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#00F0FF]" />
                SHANNON ENTROPY
              </div>
              <div className="text-xl font-mono font-bold text-[#00F0FF] mt-1">
                {result.theoretical_entropy_bits} <span className="text-xs text-slate-400">bits</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                <MathFormula math="H = L \log_2(N)" color="cyan" />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#080C17]/90 border border-slate-800">
              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#A855F7]" />
                CHARACTER POOL
              </div>
              <div className="text-xl font-mono font-bold text-[#A855F7] mt-1">
                {result.character_set_size} <span className="text-xs text-slate-400">glyphs</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Combinatorial Base N
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#080C17]/90 border border-slate-800">
              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                <Binary className="w-3.5 h-3.5 text-[#00FFA3]" />
                TOTAL KEYSPACE
              </div>
              <div className="text-xl font-mono font-bold text-[#00FFA3] mt-1 truncate">
                {result.search_space.scientific}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                <MathFormula math="S = N^L = 2^H" color="green" />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#080C17]/90 border border-slate-800">
              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-300" />
                EXECUTION TIME
              </div>
              <div className="text-xl font-mono font-bold text-cyan-300 mt-1">
                {result.execution_time_ms} <span className="text-xs text-slate-400">ms</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Aer Circuit Simulation
              </div>
            </div>
          </div>
        )}

        {/* SECTION D: Prominent Glowing Generate Button */}
        <div className="pt-2">
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#00F0FF] via-[#38BDF8] to-[#8A2BE2] hover:from-[#00F0FF] hover:to-[#A855F7] text-black font-semibold text-base sm:text-lg tracking-wide uppercase transition-all duration-300 shadow-[0_0_30px_rgba(0,240,255,0.35)] hover:shadow-[0_0_45px_rgba(0,240,255,0.55)] cursor-pointer flex items-center justify-center gap-3 disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>MEASURING QUANTUM SUPERPOSITION...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-black" />
                <span>GENERATE QUANTUM PASSWORD</span>
              </>
            )}
          </button>
        </div>

        {/* SECTION E: Educational Quantum Sampling Trace Accordion */}
        {result?.sampling_metrics && (
          <div className="pt-4 border-t border-slate-800/80">
            <button
              onClick={() => setShowTrace(!showTrace)}
              className="w-full flex items-center justify-between text-xs font-mono text-slate-400 hover:text-cyan-300 transition-colors py-1 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Info className="w-4 h-4 text-[#00F0FF]" />
                INSPECT UNBIASED REJECTION SAMPLING TELEMETRY
              </span>
              {showTrace ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            <AnimatePresence>
              {showTrace && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 pt-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                    <div className="p-3 rounded-lg bg-[#080C17] border border-slate-800">
                      <div className="text-slate-400">Bit Chunk Size (k)</div>
                      <div className="text-white font-bold mt-1">
                        {result.sampling_metrics.bit_chunk_size_k} bits / candidate
                      </div>
                      <div className="text-[10px] text-slate-500">
                        2^{result.sampling_metrics.bit_chunk_size_k} = {Math.pow(2, result.sampling_metrics.bit_chunk_size_k)} ≥ {result.character_set_size}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-[#080C17] border border-slate-800">
                      <div className="text-slate-400">Rejection Rate</div>
                      <div className="text-emerald-400 font-bold mt-1">
                        {result.sampling_metrics.rejection_rate_pct}%
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {result.sampling_metrics.candidates_rejected} candidates rejected
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-[#080C17] border border-slate-800">
                      <div className="text-slate-400">Quantum Bits Measured</div>
                      <div className="text-[#00F0FF] font-bold mt-1">
                        {result.sampling_metrics.quantum_bits_consumed} raw bits
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Zero Modulo Bias Guarantee
                      </div>
                    </div>
                  </div>

                  {result.trace_data?.sample_trace?.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[11px] font-mono text-slate-400">
                        SAMPLE CONVERSION STEPS:
                      </div>
                      <div className="max-h-48 overflow-y-auto space-y-1 pr-2 font-mono text-xs">
                        {result.trace_data.sample_trace.map((step, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center justify-between p-2 rounded-lg border text-[11px] ${
                              step.accepted
                                ? 'bg-cyan-950/20 border-cyan-800/40 text-cyan-200'
                                : 'bg-rose-950/20 border-rose-800/30 text-rose-300'
                            }`}
                          >
                            <span className="text-slate-400">#{step.step}</span>
                            <span>Bits: <strong className="text-white">{step.bits}</strong></span>
                            <span>Val: {step.integer}</span>
                            <span>Status: {step.accepted ? 'ACCEPTED' : 'REJECTED'}</span>
                            <span>Char: {step.character ? <strong className="text-cyan-300 px-1 bg-slate-800 rounded">{step.character}</strong> : '—'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Beginner-Friendly & Rigorous Scientific Explanations */}
      <div className="space-y-4 pt-4">
        <div className="text-xs font-mono text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#00F0FF]" />
          <span>Scientific Concepts &amp; Cryptographic Architecture Guide</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DualLevelExplainer
            title="Shannon Password Entropy"
            simpleExplanation="Entropy measures the effective number of random combinations in the password. For our category-constrained generator, we calculate the exact number of valid passwords rather than assuming every combination is possible."
            technicalExplanation="For unconstrained character selection, entropy is H = L * log2(N). However, when requiring at least one character from each selected category, invalid strings are eliminated. The exact number of valid passwords M is calculated using the Principle of Inclusion-Exclusion (PIE): M = sum (-1)^|J| * (N - sum n_j)^L. Since passwords are drawn uniformly from this space, the exact entropy is H = log2(M)."
            mathFormula="H = \log_2(M) \le L \cdot \log_2(N), \quad M = \sum_{J \subseteq \{1..m\}} (-1)^{|J|}\left(N - \sum_{j \in J} n_j\right)^L"
            defaultExpanded={true}
          />

          <DualLevelExplainer
            title="Unbiased Rejection Sampling"
            simpleExplanation="Computers generate bits in powers of two (like 128 possibilities for 7 bits). Instead of squishing out-of-range numbers into character slots which causes bias, the generator discards values outside the alphabet range."
            technicalExplanation="When mapping k random bits to alphabet size N where 2^k > N, using candidate % N creates modulo bias because lower indices receive an extra slice of the remainder. Rejection sampling reads k = ceil(log2 N) bits and strictly rejects any value v >= N, guaranteeing that each allowed character has identical conditional probability P(v = i | v < N) = 1/N."
            mathFormula="k = \lceil \log_2(N) \rceil, \quad P(v = i \mid v < N) = \frac{1/2^k}{N / 2^k} = \frac{1}{N} \quad \forall i \in [0, N-1]"
            defaultExpanded={false}
          />

          <DualLevelExplainer
            title="Category Enforcement & Uniformity"
            simpleExplanation="Rather than swapping characters into a password after it is generated (which ruins randomness at those spots), the system rejects any password that misses a category and tries again."
            technicalExplanation="In-place replacement introduces positional bias and distorts the uniform distribution. By evaluating complete candidate strings and rejecting those that lack any required category, the resulting passwords remain strictly uniformly distributed over the valid constrained password space of size M."
            mathFormula="P(s \mid s \in \mathcal{M}) = \frac{(1/N)^L}{M / N^L} = \frac{1}{M} \quad \forall s \in \mathcal{M}"
            defaultExpanded={false}
          />
        </div>
      </div>
    </div>
  );
};
