// Standard API Response Envelope
export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data: T;
  metadata?: Record<string, unknown>;
  code?: number;
  details?: unknown;
}

// Backend Health
export interface BackendHealth {
  backend_status: string;
  simulator: string;
  qiskit_version: string;
  qiskit_aer_version: string;
  aer_operational: boolean;
  max_qubits: number;
  version: string;
  environment: string;
}

// Password Generator Types
export interface PasswordGenerateOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  count: number;
}

export interface StrengthClassification {
  level: string;
  color: string;
  badge: string;
  description: string;
}

export interface SearchSpaceInfo {
  scientific: string;
  exponent: number;
  mantissa: number;
  log10_size: number;
  two_power_bits: number;
}

export interface CrackTimeModel {
  attacker_model: string;
  rate_display: string;
  description: string;
  seconds: number;
  human_time: string;
}

export interface TraceStep {
  step: number;
  bits: string;
  integer: number;
  accepted: boolean;
  character: string | null;
  category: string | null;
  reason: string;
}

export interface CategoryEnforcement {
  category: string;
  index: number;
  replaced_character: string;
  injected_character: string;
}

export interface PasswordTraceData {
  password_index: number;
  password: string;
  accepted_count: number;
  rejected_count: number;
  rejection_rate_pct: number;
  category_enforcements: CategoryEnforcement[];
  sample_trace: TraceStep[];
}

export interface SamplingMetrics {
  algorithm: string;
  bit_chunk_size_k: number;
  quantum_bits_consumed: number;
  candidates_accepted: number;
  candidates_rejected: number;
  rejection_rate_pct: number;
}

export interface PasswordGenerateResult {
  passwords: string[];
  primary_password: string;
  length: number;
  count: number;
  character_set_size: number;
  selected_categories: {
    uppercase: boolean;
    lowercase: boolean;
    numbers: boolean;
    symbols: boolean;
  };
  theoretical_entropy_bits: number;
  strength: StrengthClassification;
  search_space: SearchSpaceInfo;
  crack_time_estimates: Record<string, CrackTimeModel>;
  sampling_metrics: SamplingMetrics;
  execution_time_ms: number;
  trace_data: PasswordTraceData;
  generation_source: string;
  timestamp: string;
}

// Circuit Types
export interface GateInstruction {
  name: string;
  target: number;
  control?: number;
  params?: number[];
  classical_target?: number;
}

export interface CircuitSimulateRequest {
  num_qubits: number;
  gates: GateInstruction[];
  shots: number;
}

export interface CircuitHistogramItem {
  state: string;
  binary: string;
  count: number;
  probability: number;
  percentage: number;
}

export interface CircuitSimulateResult {
  circuit: {
    name: string;
    num_qubits: number;
    num_clbits: number;
    depth: number;
    gate_counts: Record<string, number>;
    ascii_diagram: string;
    instructions: Array<{
      step: number;
      gate: string;
      qubits: number[];
      clbits: number[];
      params: number[];
    }>;
  };
  counts: Record<string, number>;
  probabilities: Record<string, number>;
  histogram: CircuitHistogramItem[];
  entropy_bits: number;
  most_probable_state: {
    state: string;
    binary: string;
    count: number;
    probability: number;
  };
  sample_memory: string[];
  shots: number;
  execution_time_ms: number;
  circuit_depth: number;
  gate_counts: Record<string, number>;
}

// Measurement Types
export interface MeasurementRunRequest {
  theta: number;
  phi: number;
  apply_h: boolean;
  apply_x: boolean;
  shots: number;
}

export interface MeasurementHistogramItem {
  state: string;
  count: number;
  measured_probability: number;
  theoretical_probability: number;
}

export interface MeasurementRunResult {
  counts: Record<string, number>;
  single_qubit_stats: {
    count_0: number;
    count_1: number;
    prob_0: number;
    prob_1: number;
    bias_from_uniform: number;
    shots: number;
    entropy: number;
  };
  theoretical_probabilities: {
    prob_0: number;
    prob_1: number;
  };
  histogram: MeasurementHistogramItem[];
  bloch_coordinates: {
    x: number;
    y: number;
    z: number;
  };
  angles: {
    theta_rad: number;
    phi_rad: number;
  };
  applied_gates: {
    hadamard: boolean;
    pauli_x: boolean;
  };
  sample_bitstream: string;
  shots: number;
  execution_time_ms: number;
  backend: string;
}

// Binary Conversion Types
export interface Stage1Token {
  index: number;
  bit: string;
  color: string;
  label: string;
}

export interface Stage2Chunk {
  chunk_index: number;
  start_bit: number;
  end_bit: number;
  binary: string;
  decimal: number;
  hex: string;
  accepted: boolean;
  mapped_char: string | null;
  category: string | null;
  status: string;
}

export interface ConversionStats {
  total_bits: number;
  chunk_size: number;
  total_chunks_processed: number;
  accepted_count: number;
  rejected_count: number;
  rejection_rate_percent: number;
  character_pool_size: number;
  resulting_password_length: number;
  bits_per_character: number;
}

export interface ConversionResult {
  stage1_tokens: Stage1Token[];
  stage2_chunks: Stage2Chunk[];
  stage3_password: string;
  encodings: {
    binary_stream: string;
    decimal_values: number[];
    hex_stream: string;
    ascii_password: string;
    raw_ascii_chunks: string[];
  };
  stats: ConversionStats;
  methodology_explanation: string;
}

// Password Strength Analyzer Types
export interface CharacterBreakdownItem {
  category: string;
  count: number;
  percentage: number;
  color: string;
}

export interface PasswordAnalysisResult {
  length: number;
  character_categories: {
    uppercase: boolean;
    lowercase: boolean;
    numbers: boolean;
    symbols: boolean;
    other: boolean;
  };
  character_set_size: number;
  theoretical_entropy_bits: number;
  strength: StrengthClassification;
  crack_time_estimates: Record<string, CrackTimeModel>;
  search_space: SearchSpaceInfo;
  character_breakdown: CharacterBreakdownItem[];
  recommendations: string[];
}

// Classical vs Quantum Comparison Types
export interface ComparisonTableRow {
  metric: string;
  classical: string;
  quantum: string;
}

export interface ComparisonChartItem {
  engine: string;
  execution_ms: number;
  bits_consumed: number;
  passwords_per_sec: number;
  ratio_zero: number;
  ratio_one: number;
}

export interface ComparisonResult {
  classical_duration_ms: number;
  quantum_duration_ms: number;
  classical_passwords: string[];
  quantum_passwords: string[];
  comparison_table: ComparisonTableRow[];
  chart_data: ComparisonChartItem[];
  scientific_disclaimer: string;
}
