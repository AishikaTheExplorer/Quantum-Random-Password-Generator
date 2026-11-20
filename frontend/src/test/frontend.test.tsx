import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Navbar } from '../components/navigation/Navbar';
import { PasswordGenerator } from '../pages/PasswordGenerator';
import { fallbackPasswordGenerator } from '../services/demoFallback';
import { MathFormula } from '../components/ui/MathFormula';
import { DualLevelExplainer } from '../components/ui/DualLevelExplainer';

describe('Frontend Component Tests', () => {
  it('Navbar renders brand identity and navigation links', () => {
    render(
      <MemoryRouter>
        <Navbar
          health={null}
          isConnected={false}
          isChecking={false}
          onRefreshHealth={vi.fn()}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('QRNG')).toBeInTheDocument();
    expect(screen.getByText('QISKIT')).toBeInTheDocument();
    expect(screen.getByText('Generator')).toBeInTheDocument();
    expect(screen.getByText('Circuit Lab')).toBeInTheDocument();
    expect(screen.getByText('Measurement')).toBeInTheDocument();
    expect(screen.getByText('Converter')).toBeInTheDocument();
    expect(screen.getByText('Analyzer')).toBeInTheDocument();
    expect(screen.getByText('3D Lab')).toBeInTheDocument();
  });

  it('Navbar shows disconnected demo badge when offline', () => {
    render(
      <MemoryRouter>
        <Navbar
          health={null}
          isConnected={false}
          isChecking={false}
          onRefreshHealth={vi.fn()}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('DEMO MODE (BACKEND OFFLINE)')).toBeInTheDocument();
  });

  it('Navbar shows connected badge when backend is online', () => {
    render(
      <MemoryRouter>
        <Navbar
          health={{
            backend_status: 'online',
            simulator: 'Qiskit AerSimulator',
            qiskit_version: '2.6.2',
            qiskit_aer_version: '0.18.4',
            aer_operational: true,
            max_qubits: 28,
            version: '1.0.0',
            environment: 'academic_production',
          }}
          isConnected={true}
          isChecking={false}
          onRefreshHealth={vi.fn()}
        />
      </MemoryRouter>
    );

    expect(screen.getByText(/QISKIT AER \/\/ CONNECTED/i)).toBeInTheDocument();
  });

  it('PasswordGenerator initializes and renders controls and scientific explainer', async () => {
    render(
      <MemoryRouter>
        <PasswordGenerator isConnected={false} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Password Generation/i)).toBeInTheDocument();
    expect(screen.getByText(/PASSWORD LENGTH/i)).toBeInTheDocument();
    expect(screen.getByText('Uppercase')).toBeInTheDocument();
    expect(screen.getByText('Lowercase')).toBeInTheDocument();
    expect(screen.getByText('Numbers')).toBeInTheDocument();
    expect(screen.getByText('Symbols')).toBeInTheDocument();
    expect(screen.getByText('GENERATE QUANTUM PASSWORD')).toBeInTheDocument();
    expect(screen.getByText('Shannon Password Entropy')).toBeInTheDocument();
  });

  it('Fallback generator produces valid password structure', () => {
    const result = fallbackPasswordGenerator({
      length: 20,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
      count: 1,
    });

    expect(result.passwords.length).toBe(1);
    expect(result.primary_password.length).toBe(20);
    expect(result.theoretical_entropy_bits).toBeGreaterThan(100);
    expect(result.character_set_size).toBeGreaterThan(60);
  });

  it('Clipboard copy triggers copy feedback', async () => {
    const writeTextSpy = vi.spyOn(navigator.clipboard, 'writeText');
    render(
      <MemoryRouter>
        <PasswordGenerator isConnected={false} />
      </MemoryRouter>
    );

    await waitFor(() => {
      const copyButtons = screen.getAllByTitle('Copy to clipboard');
      expect(copyButtons.length).toBeGreaterThan(0);
      fireEvent.click(copyButtons[0]);
    });

    expect(writeTextSpy).toHaveBeenCalled();
  });

  it('MathFormula renders KaTeX equations correctly', () => {
    const { container } = render(<MathFormula math="H = L \log_2(N)" display={true} />);
    expect(container.querySelector('.katex')).toBeInTheDocument();
  });

  it('DualLevelExplainer renders simple summary and toggles technical explanation', () => {
    render(
      <DualLevelExplainer
        title="Test Concept"
        simpleExplanation="This is the simple summary."
        technicalExplanation="This is the advanced mathematical physics explanation."
        mathFormula="|\psi\rangle = \frac{|0\rangle + |1\rangle}{\sqrt{2}}"
      />
    );

    expect(screen.getByText('Test Concept')).toBeInTheDocument();
    expect(screen.getByText('This is the simple summary.')).toBeInTheDocument();

    // Toggle button to expand level 2
    const toggleButton = screen.getByText('Explain');
    fireEvent.click(toggleButton);

    expect(screen.getByText('This is the advanced mathematical physics explanation.')).toBeInTheDocument();
  });
});
