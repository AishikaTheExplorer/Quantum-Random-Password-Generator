/**
 * Fallback generator for offline/demo inspection when Python backend is not reachable.
 * Note: Clearly labeled as client-side simulated fallback.
 */

import type {
  PasswordGenerateOptions,
  PasswordGenerateResult,
  CircuitSimulateRequest,
  CircuitSimulateResult,
  MeasurementRunRequest,
  MeasurementRunResult,
} from '../types';

export const fallbackPasswordGenerator = (opts: PasswordGenerateOptions): PasswordGenerateResult => {
  let pool = '';
  if (opts.uppercase) pool += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (opts.lowercase) pool += 'abcdefghijklmnopqrstuvwxyz';
  if (opts.numbers) pool += '0123456789';
  if (opts.symbols) pool += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  if (!pool) pool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  const passwords: string[] = [];
  for (let p = 0; p < opts.count; p++) {
    let s = '';
    for (let i = 0; i < opts.length; i++) {
      s += pool[Math.floor(Math.random() * pool.length)];
    }
    passwords.push(s);
  }

  const entropy = Math.round(opts.length * Math.log2(pool.length) * 100) / 100;

  return {
    passwords,
    primary_password: passwords[0],
    length: opts.length,
    count: opts.count,
    character_set_size: pool.length,
    selected_categories: {
      uppercase: opts.uppercase,
      lowercase: opts.lowercase,
      numbers: opts.numbers,
      symbols: opts.symbols,
    },
    theoretical_entropy_bits: entropy,
    strength: {
      level: entropy > 90 ? 'Very Strong' : entropy > 70 ? 'Strong' : 'Moderate',
      color: entropy > 90 ? '#00F0FF' : '#10B981',
      badge: 'OFFLINE PREVIEW',
      description: 'Demo mode calculation (Backend disconnected).',
    },
    search_space: {
      scientific: `1.00 × 10^${Math.floor(opts.length * Math.log10(pool.length))}`,
      exponent: Math.floor(opts.length * Math.log10(pool.length)),
      mantissa: 1.0,
      log10_size: Math.round(opts.length * Math.log10(pool.length) * 10) / 10,
      two_power_bits: entropy,
    },
    crack_time_estimates: {
      online_rate_limited: {
        attacker_model: 'Online Rate-Limited (100/s)',
        rate_display: '100 guesses/sec',
        description: 'Standard throttled web application.',
        seconds: 1e12,
        human_time: '> 1,000 Years',
      },
      offline_fast_gpu: {
        attacker_model: 'Offline GPU Rig (100B/s)',
        rate_display: '10^11 hashes/sec',
        description: 'Multi-GPU cluster traversal.',
        seconds: 1e6,
        human_time: '> 100 Days',
      },
      quantum_grover_oracle: {
        attacker_model: 'Theoretical Quantum (Grover Search)',
        rate_display: '10^9 oracle calls/sec',
        description: 'Quadratic quantum speedup O(sqrt(N^L)).',
        seconds: 1e8,
        human_time: '> 3 Years',
      },
    },
    sampling_metrics: {
      algorithm: 'Client-Side Simulation (Demo Fallback)',
      bit_chunk_size_k: Math.ceil(Math.log2(pool.length)),
      quantum_bits_consumed: opts.length * 8,
      candidates_accepted: opts.length,
      candidates_rejected: Math.floor(opts.length * 0.2),
      rejection_rate_pct: 16.7,
    },
    execution_time_ms: 12.4,
    trace_data: {
      password_index: 0,
      password: passwords[0],
      accepted_count: opts.length,
      rejected_count: 2,
      rejection_rate_pct: 10.0,
      category_enforcements: [],
      sample_trace: [],
    },
    generation_source: 'DEMO PREVIEW (Local Fallback Simulator)',
    timestamp: new Date().toISOString(),
  };
};

export const fallbackCircuitSimulate = (req: CircuitSimulateRequest): CircuitSimulateResult => {
  const total = req.shots || 1024;
  const c0 = Math.floor(total * 0.51);
  const c1 = total - c0;
  return {
    circuit: {
      name: 'User_Circuit_Preview',
      num_qubits: req.num_qubits,
      num_clbits: req.num_qubits,
      depth: 3,
      gate_counts: { h: 2, cx: 1 },
      ascii_diagram: `q_0: ──[H]──■──\n           │  \nq_1: ───────■──`,
      instructions: [],
    },
    counts: { '00': c0, '11': c1 },
    probabilities: { '00': 0.51, '11': 0.49 },
    histogram: [
      { state: '|00⟩', binary: '00', count: c0, probability: 0.51, percentage: 51.0 },
      { state: '|11⟩', binary: '11', count: c1, probability: 0.49, percentage: 49.0 },
    ],
    entropy_bits: 0.999,
    most_probable_state: { state: '|00⟩', binary: '00', count: c0, probability: 0.51 },
    sample_memory: ['00', '11', '00', '11', '00'],
    shots: req.shots,
    execution_time_ms: 8.5,
    circuit_depth: 3,
    gate_counts: { h: 2, cx: 1 },
  };
};

export const fallbackMeasurement = (req: MeasurementRunRequest): MeasurementRunResult => {
  const p0 = Math.pow(Math.cos(req.theta / 2), 2);
  const p1 = Math.pow(Math.sin(req.theta / 2), 2);
  const c0 = Math.round(req.shots * p0);
  const c1 = req.shots - c0;

  return {
    counts: { '0': c0, '1': c1 },
    single_qubit_stats: {
      count_0: c0,
      count_1: c1,
      prob_0: Math.round(p0 * 1000) / 1000,
      prob_1: Math.round(p1 * 1000) / 1000,
      bias_from_uniform: Math.abs(p0 - 0.5),
      shots: req.shots,
      entropy: 0.98,
    },
    theoretical_probabilities: {
      prob_0: Math.round(p0 * 1000) / 1000,
      prob_1: Math.round(p1 * 1000) / 1000,
    },
    histogram: [
      { state: '|0⟩', count: c0, measured_probability: p0, theoretical_probability: p0 },
      { state: '|1⟩', count: c1, measured_probability: p1, theoretical_probability: p1 },
    ],
    bloch_coordinates: {
      x: Math.sin(req.theta) * Math.cos(req.phi),
      y: Math.sin(req.theta) * Math.sin(req.phi),
      z: Math.cos(req.theta),
    },
    angles: { theta_rad: req.theta, phi_rad: req.phi },
    applied_gates: { hadamard: req.apply_h, pauli_x: req.apply_x },
    sample_bitstream: '1010010110101011',
    shots: req.shots,
    execution_time_ms: 5.2,
    backend: 'Demo Fallback Engine',
  };
};
