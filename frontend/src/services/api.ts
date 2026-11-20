import axios from 'axios';
import type {
  ApiResponse,
  BackendHealth,
  PasswordGenerateOptions,
  PasswordGenerateResult,
  CircuitSimulateRequest,
  CircuitSimulateResult,
  MeasurementRunRequest,
  MeasurementRunResult,
  ConversionResult,
  PasswordAnalysisResult,
  ComparisonResult,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Check backend health
export const checkBackendHealth = async (): Promise<BackendHealth> => {
  const response = await apiClient.get<ApiResponse<BackendHealth>>('/api/health');
  return response.data.data;
};

// Generate quantum passwords
export const generateQuantumPassword = async (
  options: PasswordGenerateOptions
): Promise<PasswordGenerateResult> => {
  const response = await apiClient.post<ApiResponse<PasswordGenerateResult>>('/api/generate', options);
  return response.data.data;
};

// Simulate quantum circuit
export const simulateQuantumCircuit = async (
  request: CircuitSimulateRequest
): Promise<CircuitSimulateResult> => {
  const response = await apiClient.post<ApiResponse<CircuitSimulateResult>>('/api/circuit/simulate', request);
  return response.data.data;
};

// Run quantum measurement (Bloch state)
export const runQuantumMeasurement = async (
  request: MeasurementRunRequest
): Promise<MeasurementRunResult> => {
  const response = await apiClient.post<ApiResponse<MeasurementRunResult>>('/api/measurement/run', request);
  return response.data.data;
};

// Convert binary stream
export const convertBinaryStream = async (payload: {
  binary_string?: string;
  bit_count?: number;
  encoding_mode?: string;
  chunk_size?: number;
}): Promise<ConversionResult> => {
  const response = await apiClient.post<ApiResponse<ConversionResult>>('/api/conversion/convert', payload);
  return response.data.data;
};

// Analyze password strength
export const analyzePasswordStrength = async (
  password: string
): Promise<PasswordAnalysisResult> => {
  const response = await apiClient.post<ApiResponse<PasswordAnalysisResult>>('/api/password/analyze', {
    password,
  });
  return response.data.data;
};

// Run classical vs quantum comparison
export const runClassicalVsQuantumComparison = async (payload: {
  password_length: number;
  iterations: number;
  uppercase?: boolean;
  lowercase?: boolean;
  numbers?: boolean;
  symbols?: boolean;
}): Promise<ComparisonResult> => {
  const response = await apiClient.post<ApiResponse<ComparisonResult>>('/api/comparison/run', payload);
  return response.data.data;
};
