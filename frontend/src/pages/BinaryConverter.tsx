import React, { useState, useEffect } from 'react';
import {
  Binary,
  RefreshCw,
  Info,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { convertBinaryStream } from '../services/api';
import type { ConversionResult } from '../types';
import { MathFormula } from '../components/ui/MathFormula';
import { DualLevelExplainer } from '../components/ui/DualLevelExplainer';

interface BinaryConverterProps {
  isConnected?: boolean;
}

export const BinaryConverter: React.FC<BinaryConverterProps> = () => {
  const [bitCount, setBitCount] = useState<number>(64);
  const [chunkSize, setChunkSize] = useState<number>(7); // 2^7 = 128 >= 88 characters
  const [encodingMode, setEncodingMode] = useState<string>('binary');
  const [customBinary, setCustomBinary] = useState<string>('');

  const [conversionData, setConversionData] = useState<ConversionResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleRunConversion = async () => {
    setIsLoading(true);
    try {
      const res = await convertBinaryStream({
        binary_string: customBinary.trim() || undefined,
        bit_count: bitCount,
        chunk_size: chunkSize,
        encoding_mode: encodingMode,
      });
      setConversionData(res);
    } catch (err: unknown) {
      console.warn('Conversion failed, using local generator:', err);
      // Generate client-side fallback stream
      let localBits = customBinary.trim();
      if (!localBits) {
        localBits = Array.from({ length: bitCount }, () => (Math.random() > 0.5 ? '1' : '0')).join('');
      }
      const pool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
      const chunks = [];
      const accepted = [];
      const rejected = [];
      const chars = [];

      for (let i = 0; i < localBits.length - chunkSize + 1; i += chunkSize) {
        const chunk = localBits.slice(i, i + chunkSize);
        const dec = parseInt(chunk, 2);
        const isAcc = dec < pool.length;
        if (isAcc) {
          accepted.push(dec);
          chars.push(pool[dec]);
        } else {
          rejected.push(dec);
        }
        chunks.push({
          chunk_index: chunks.length,
          start_bit: i,
          end_bit: i + chunkSize,
          binary: chunk,
          decimal: dec,
          hex: `0x${dec.toString(16).toUpperCase().padStart(2, '0')}`,
          accepted: isAcc,
          mapped_char: isAcc ? pool[dec] : null,
          category: isAcc ? 'Mixed' : null,
          status: isAcc ? 'ACCEPTED' : 'REJECTED (MODULO BIAS PREVENTION)',
        });
      }

      setConversionData({
        stage1_tokens: localBits.slice(0, 96).split('').map((b, i) => ({
          index: i,
          bit: b,
          color: b === '0' ? '#00F0FF' : '#8A2BE2',
          label: b === '0' ? '|0⟩' : '|1⟩',
        })),
        stage2_chunks: chunks.slice(0, 30),
        stage3_password: chars.join(''),
        encodings: {
          binary_stream: localBits,
          decimal_values: accepted.slice(0, 16),
          hex_stream: accepted.map((c) => c.toString(16).toUpperCase().padStart(2, '0')).join(''),
          ascii_password: chars.join(''),
          raw_ascii_chunks: chars.slice(0, 16),
        },
        stats: {
          total_bits: localBits.length,
          chunk_size: chunkSize,
          total_chunks_processed: chunks.length,
          accepted_count: accepted.length,
          rejected_count: rejected.length,
          rejection_rate_percent: Math.round((rejected.length / Math.max(1, chunks.length)) * 100),
          character_pool_size: pool.length,
          resulting_password_length: chars.length,
          bits_per_character: Math.round((localBits.length / Math.max(1, chars.length)) * 10) / 10,
        },
        methodology_explanation:
          'Unbiased rejection sampling guarantees uniform mapping. Values ≥ pool size are discarded rather than wrapping via modulo, eliminating bias.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleRunConversion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bitCount, chunkSize]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00F0FF]/15 border border-[#00F0FF]/30 text-[#00F0FF] text-xs font-mono">
          <Binary className="w-3.5 h-3.5" />
          <span>DATA FLOW PIPELINE // UNBIASED CHARACTER MAPPING</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#F8FAFC]">
          Binary-to-Character Converter
        </h2>
        <p className="text-sm sm:text-base text-[#B6C3D4] max-w-2xl mx-auto">
          Trace how raw quantum measurement bitstreams are grouped into integer candidates, filtered
          through rejection sampling to prevent modulo bias, and mapped into final password characters.
        </p>
      </div>

      {/* Control Bar */}
      <div className="glass-panel p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          <div>
            <label className="text-slate-400 block mb-1">BITSTREAM LENGTH:</label>
            <select
              value={bitCount}
              onChange={(e) => {
                setCustomBinary('');
                setBitCount(Number(e.target.value));
              }}
              className="bg-[#080C17] border border-slate-700 rounded-lg px-3 py-1.5 text-cyan-300"
            >
              <option value={32}>32 Bits</option>
              <option value={64}>64 Bits</option>
              <option value={128}>128 Bits</option>
              <option value={256}>256 Bits</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">CHUNK SIZE (k):</label>
            <select
              value={chunkSize}
              onChange={(e) => setChunkSize(Number(e.target.value))}
              className="bg-[#080C17] border border-slate-700 rounded-lg px-3 py-1.5 text-purple-300"
            >
              <option value={4}>4 Bits (2⁴ = 16)</option>
              <option value={6}>6 Bits (2⁶ = 64)</option>
              <option value={7}>7 Bits (2⁷ = 128)</option>
              <option value={8}>8 Bits (2⁸ = 256)</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">ENCODING VIEW:</label>
            <div className="flex rounded-lg bg-[#080C17] p-0.5 border border-slate-800">
              {['binary', 'decimal', 'hex', 'ascii'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setEncodingMode(mode)}
                  className={`px-3 py-1 rounded-md capitalize transition-all cursor-pointer ${
                    encodingMode === mode ? 'bg-[#00F0FF]/20 text-[#00F0FF] font-bold' : 'text-slate-400'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleRunConversion}
          disabled={isLoading}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#8A2BE2] text-black font-semibold text-xs tracking-wider uppercase flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'GENERATING...' : 'GENERATE FRESH STREAM'}</span>
        </button>
      </div>

      {/* 3-Stage Pipeline Visual Grid */}
      <div className="space-y-6">
        {/* STAGE 1: Quantum Binary Output */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 font-bold">
              <span className="w-5 h-5 rounded-full bg-[#00F0FF]/20 text-[#00F0FF] flex items-center justify-center text-[10px]">
                1
              </span>
              STAGE 1: QUANTUM BINARY MEASUREMENT OUTCOMES
            </div>
            <div className="text-xs font-mono text-slate-400">
              TOTAL BITS: <span className="text-[#00F0FF] font-bold">{conversionData?.stats.total_bits || bitCount}</span>
            </div>
          </div>

          {/* Color-Coded Bitstream Grid */}
          <div className="p-4 rounded-xl bg-[#05070E] border border-slate-800 flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
            {conversionData?.stage1_tokens.map((tok) => (
              <span
                key={tok.index}
                className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-xs font-mono font-bold transition-transform hover:scale-110"
                style={{
                  backgroundColor: tok.bit === '0' ? 'rgba(0, 240, 255, 0.15)' : 'rgba(138, 43, 226, 0.2)',
                  color: tok.bit === '0' ? '#00F0FF' : '#C084FC',
                  border: `1px solid ${tok.bit === '0' ? 'rgba(0, 240, 255, 0.3)' : 'rgba(138, 43, 226, 0.4)'}`,
                }}
                title={`Bit ${tok.index}: |${tok.bit}⟩`}
              >
                {tok.bit}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#00F0FF]" />
              <span>|0⟩ Ground Projection</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#8A2BE2]" />
              <span>|1⟩ Excited Projection</span>
            </div>
          </div>
        </div>

        {/* STAGE 2: Numerical Conversion & Rejection Sampling */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-xs font-mono text-purple-300 font-bold">
              <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center text-[10px]">
                2
              </span>
              STAGE 2: NUMERICAL CHUNKING & REJECTION SAMPLING
            </div>
            <div className="text-xs font-mono text-slate-400">
              CHUNK SIZE: <span className="text-purple-300 font-bold">{chunkSize} BITS</span>
            </div>
          </div>

          {/* Interactive Chunk Table */}
          <div className="overflow-x-auto max-h-64 border border-slate-800 rounded-xl">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#080C17] text-slate-400 border-b border-slate-800 sticky top-0">
                <tr>
                  <th className="p-2.5">Chunk #</th>
                  <th className="p-2.5">Binary Chunks</th>
                  <th className="p-2.5">Decimal</th>
                  <th className="p-2.5">Hex</th>
                  <th className="p-2.5">Rejection Sampling Status</th>
                  <th className="p-2.5">Mapped Glyph</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-[#05070E]">
                {conversionData?.stage2_chunks.map((ch) => (
                  <tr
                    key={ch.chunk_index}
                    className={`hover:bg-slate-800/30 transition-colors ${
                      ch.accepted ? '' : 'bg-rose-950/15'
                    }`}
                  >
                    <td className="p-2.5 text-slate-500">#{ch.chunk_index + 1}</td>
                    <td className="p-2.5 text-cyan-300 font-bold">{ch.binary}</td>
                    <td className="p-2.5 text-white">{ch.decimal}</td>
                    <td className="p-2.5 text-slate-400">{ch.hex}</td>
                    <td className="p-2.5">
                      {ch.accepted ? (
                        <span className="inline-flex items-center gap-1 text-[#00FFA3]">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Accepted (Value &lt; Pool)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-400">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Rejected (Modulo Bias Avoidance)</span>
                        </span>
                      )}
                    </td>
                    <td className="p-2.5">
                      {ch.mapped_char ? (
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-bold border border-cyan-800/40">
                          {ch.mapped_char}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Statistical Metrics Banner */}
          {conversionData && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono pt-2">
              <div className="p-3 rounded-lg bg-[#080C17] border border-slate-800">
                <div className="text-slate-400">Processed Chunks</div>
                <div className="text-base font-bold text-white mt-1">
                  {conversionData.stats.total_chunks_processed}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[#080C17] border border-slate-800">
                <div className="text-slate-400">Accepted Candidates</div>
                <div className="text-base font-bold text-[#00FFA3] mt-1">
                  {conversionData.stats.accepted_count}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[#080C17] border border-slate-800">
                <div className="text-slate-400">Rejected Candidates</div>
                <div className="text-base font-bold text-rose-400 mt-1">
                  {conversionData.stats.rejected_count}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[#080C17] border border-slate-800">
                <div className="text-slate-400">Rejection Rate</div>
                <div className="text-base font-bold text-cyan-300 mt-1">
                  {conversionData.stats.rejection_rate_percent}%
                </div>
              </div>
            </div>
          )}
        </div>

        {/* STAGE 3: Final Character Output & Multiformat Representations */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-xs font-mono text-[#00FFA3] font-bold">
              <span className="w-5 h-5 rounded-full bg-[#00FFA3]/20 text-[#00FFA3] flex items-center justify-center text-[10px]">
                3
              </span>
              STAGE 3: ASSEMBLED KEY & MULTI-FORMAT ENCODING
            </div>
            <div className="text-xs font-mono text-slate-400">
              RESULT LENGTH: <span className="text-[#00FFA3] font-bold">{conversionData?.stats.resulting_password_length || 0} CHARS</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#05070E] border border-[#00FFA3]/30">
            <div className="text-xs font-mono text-slate-400 mb-2">RESULTING CONVERTED KEY:</div>
            <div className="text-xl sm:text-2xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-[#00FFA3] to-[#00F0FF] break-all select-all">
              {conversionData?.stage3_password || 'Waiting for conversion...'}
            </div>
          </div>

          {/* Multiformat Encodings Preview */}
          {conversionData?.encodings && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[#080C17] border border-slate-800 space-y-1">
                <span className="text-slate-400">HEXADECIMAL STREAM:</span>
                <div className="text-purple-300 break-all">{conversionData.encodings.hex_stream || '—'}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#080C17] border border-slate-800 space-y-1">
                <span className="text-slate-400">DECIMAL INTEGER STREAM:</span>
                <div className="text-cyan-300 truncate">
                  [{conversionData.encodings.decimal_values.join(', ')}]
                </div>
              </div>
            </div>
          )}

          {/* Explanation Banner */}
          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 flex items-start gap-3 text-xs text-slate-300 font-sans leading-relaxed">
            <Info className="w-5 h-5 text-[#00F0FF] shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block mb-0.5">Why Unbiased Rejection Sampling Matters:</strong>
              {conversionData?.methodology_explanation}
            </div>
          </div>
        </div>
      </div>

      {/* Beginner-Friendly Binary Mapping Guides */}
      <div className="space-y-4 pt-2">
        <div className="text-xs font-mono text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-2">
          <Binary className="w-4 h-4 text-[#00F0FF]" />
          <span>Information Theory &amp; Binary Mapping Foundations</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DualLevelExplainer
            title="Binary Bit Chunking (k Bits)"
            simpleExplanation="A single character needs multiple binary bits to represent it. For our 88-character alphabet (uppercase, lowercase, digits, symbols), 7 bits are required because 6 bits only yield 64 combinations."
            technicalExplanation="To represent an alphabet of size N, the minimum chunk size is k = ceil(log2 N). For N = 88, k = ceil(log2 88) = 7 bits (providing 2^7 = 128 states). Six bits would only reach indices 0-63, rendering 24 characters completely unreachable."
            mathFormula="k = \lceil \log_2(88) \rceil = 7 \quad (2^6 = 64 < 88 \le 128 = 2^7)"
            defaultExpanded={true}
          />

          <DualLevelExplainer
            title="The Modulo Bias Trap"
            simpleExplanation="If you divide random numbers and use the remainder to pick characters, earlier characters get picked more frequently because 128 does not divide evenly by 88."
            technicalExplanation="When mapping an integer v in [0, 2^k - 1] via v mod N, the remainder wraps around. The first (2^k mod N) indices have an extra probability slice: (floor(2^k / N) + 1) / 2^k vs floor(2^k / N) / 2^k for higher indices. For N = 88 and k = 7, indices 0-39 have probability 2/128 while 40-87 have probability 1/128, creating severe cryptographic bias."
            mathFormula="P(i) = \frac{\lfloor 2^k / N \rfloor + [i < (2^k \bmod N)]}{2^k} \neq \frac{1}{N}"
            defaultExpanded={false}
          />

          <DualLevelExplainer
            title="Rejection Sampling Solution"
            simpleExplanation="Instead of wrapping numbers around, any random number from 88 to 127 is simply discarded. Every character from 0 to 87 has the exact same 1 in 88 chance."
            technicalExplanation="By accepting candidate values v < N and strictly discarding candidates v >= N, the conditional probability for each valid index i in [0, N-1] is identical: P(v = i | v < N) = 1/N. For N = 88 and k = 7, the rejection rate is exactly (128 - 88) / 128 = 31.25%."
            mathFormula="P(v = i \mid v < 88) = \frac{1/128}{88 / 128} = \frac{1}{88} \quad \forall i \in [0, 87]"
            defaultExpanded={false}
          />
        </div>
      </div>
    </div>
  );
};
