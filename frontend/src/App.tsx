import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from './components/navigation/Navbar';
import { QuantumUniverseBackground } from './components/quantum/QuantumUniverseBackground';
import { PasswordGenerator } from './pages/PasswordGenerator';
import { CircuitGenerator } from './pages/CircuitGenerator';
import { MeasurementEngine } from './pages/MeasurementEngine';
import { BinaryConverter } from './pages/BinaryConverter';
import { StrengthAnalyzer } from './pages/StrengthAnalyzer';
import { VisualizationEngine } from './pages/VisualizationEngine';
import { checkBackendHealth } from './services/api';
import type { BackendHealth } from './types';
import { Atom, Cpu, Lock, RotateCcw, ArrowRight, ChevronDown } from 'lucide-react';

export const App: React.FC = () => {
  const [health, setHealth] = useState<BackendHealth | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  // 3D Quantum Galaxy Formation Progress: 0.0 = Scattered Cosmic Dust, 1.0 = Rotating Spiral Galaxy
  const [formationProgress, setFormationProgress] = useState<number>(0.0);

  const fetchHealth = useCallback(async () => {
    setIsChecking(true);
    try {
      const res = await checkBackendHealth();
      setHealth(res);
      setIsConnected(true);
    } catch {
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 8000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  // Bi-directional wheel scroll listener to smoothly drive galaxy formation & floating text
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      // If intro is not yet locked or user is at the very top of the document
      if (formationProgress < 0.98 || window.scrollY <= 10) {
        if (formationProgress < 0.98 && e.deltaY > 0) {
          e.preventDefault();
        } else if (formationProgress > 0 && e.deltaY < 0 && window.scrollY <= 5) {
          e.preventDefault();
        }

        const delta = e.deltaY * 0.0022;
        setFormationProgress((prev) => Math.min(1.0, Math.max(0.0, prev + delta)));
      }
    },
    [formationProgress]
  );

  // Touch swipe gesture for mobile devices
  useEffect(() => {
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (formationProgress < 0.98) {
        const touchCurrentY = e.touches[0].clientY;
        const delta = (touchStartY - touchCurrentY) * 0.0035;
        setFormationProgress((prev) => Math.min(1.0, Math.max(0.0, prev + delta)));
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [formationProgress]);

  useEffect(() => {
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  const handleCompleteIntro = () => {
    setFormationProgress(1.0);
  };

  const handleReplayIntro = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setFormationProgress(0.0);
  };

  const isIntroActive = formationProgress < 0.92;
  const introControlsOpacity = Math.max(0, 1 - formationProgress * 2.4);

  return (
    <BrowserRouter>
      <div className="relative min-h-screen bg-[#03050A] text-[#F8FAFC] flex flex-col font-sans selection:bg-[#00F0FF]/30 selection:text-white overflow-x-hidden">
        {/* Single Persistent 3D Rotating Quantum Orbital Structure Background across all routes */}
        <QuantumUniverseBackground
          formationProgress={formationProgress}
          isIntroActive={isIntroActive}
        />

        {/* 
          FLOATING HEADING TRANSFORMATION:
          Initially centered in the viewport with NO rectangular box (pure floating typography).
          As the user scrolls, it smoothly floats upward, adjusts scale, and docks naturally as the application main heading!
        */}
        <motion.div
          className="relative z-30 w-full flex flex-col items-center text-center px-4 transition-all duration-300 pointer-events-none select-none"
          style={{
            paddingTop: `${Math.max(1.5, 33 - formationProgress * 31)}vh`,
            paddingBottom: `${Math.max(0.75, 3 - formationProgress * 2.25)}rem`,
          }}
        >
          {/* Small Elegant Monospaced Label */}
          <div className="flex items-center justify-center gap-2 mb-2.5">
            <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse" />
            <span className="font-mono text-xs sm:text-sm tracking-[0.22em] text-[#00F0FF] font-semibold uppercase drop-shadow-[0_0_12px_rgba(0,240,255,0.7)]">
              QRNG // QISKIT
            </span>
          </div>

          {/* Project Title: Seamlessly scales from Hero to Master Application Heading */}
          <motion.h1
            style={{
              transform: `scale(${1 - formationProgress * 0.22})`,
              transformOrigin: 'center top',
            }}
            className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#F8FAFC] font-heading drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)] max-w-4xl leading-tight"
          >
            QUANTUM RANDOM PASSWORD GENERATOR
          </motion.h1>

          {/* Project Description: High-contrast readable slate text */}
          <p className="mt-3 text-xs sm:text-sm md:text-base text-[#B6C3D4] font-sans leading-relaxed max-w-xl mx-auto drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
            Generate provably unbiased cryptographic passwords using binary measurement outcomes from simulated quantum circuits.
          </p>

          {/* Intro Controls & Scroll Indicator (Only visible before galaxy is formed) */}
          <AnimatePresence>
            {formationProgress < 0.88 && (
              <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: introControlsOpacity }}
                exit={{ opacity: 0 }}
                className="mt-8 flex flex-col items-center gap-4 pointer-events-auto"
              >
                <button
                  onClick={handleCompleteIntro}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#00F0FF]/15 hover:bg-[#00F0FF]/25 border border-[#00F0FF]/40 text-[#00F0FF] hover:text-white text-xs font-mono font-semibold transition-all cursor-pointer shadow-[0_0_20px_rgba(0,240,255,0.25)] backdrop-blur-sm"
                >
                  <span>Enter Application</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <div
                  onClick={handleCompleteIntro}
                  className="flex flex-col items-center gap-2 cursor-pointer mt-3"
                >
                  <span className="text-xs font-mono tracking-widest text-[#00F0FF] uppercase drop-shadow-[0_0_8px_rgba(0,240,255,0.6)] animate-pulse">
                    Scroll to form quantum structure
                  </span>

                  <div className="w-44 h-1 bg-[#0B0F1A]/90 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-[#00F0FF] via-[#06B6D4] to-[#8A2BE2] transition-all duration-100"
                      style={{ width: `${Math.round(formationProgress * 100)}%` }}
                    />
                  </div>

                  <ChevronDown className="w-4 h-4 text-[#00F0FF] animate-bounce" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* 
          APPLICATION INTERFACE:
          Fades in naturally below the docked heading as the orbital structure forms.
          Orbital structure continues rotating persistently in the background.
        */}
        <motion.div
          style={{
            opacity: Math.max(0, (formationProgress - 0.25) / 0.75),
            transform: `translateY(${(1 - formationProgress) * 20}px)`,
            pointerEvents: formationProgress > 0.65 ? 'auto' : 'none',
          }}
          className="flex-1 flex flex-col z-20"
        >
          {/* Sticky Navigation Bar */}
          <Navbar
            health={health}
            isConnected={isConnected}
            isChecking={isChecking}
            onRefreshHealth={fetchHealth}
          />

          {/* Main Content Router */}
          <main className="flex-1 relative pb-16 pointer-events-auto">
            <Routes>
              <Route path="/" element={<PasswordGenerator isConnected={isConnected} />} />
              <Route path="/circuits" element={<CircuitGenerator isConnected={isConnected} />} />
              <Route path="/measurement" element={<MeasurementEngine isConnected={isConnected} />} />
              <Route path="/converter" element={<BinaryConverter isConnected={isConnected} />} />
              <Route path="/analyzer" element={<StrengthAnalyzer isConnected={isConnected} />} />
              <Route path="/visualizer" element={<VisualizationEngine />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Scientific Laboratory Footer */}
          <footer className="border-t border-slate-800/80 bg-[#080C17]/90 backdrop-blur-md py-6 px-4 sm:px-6 lg:px-8 text-xs font-mono text-[#94A3B8] pointer-events-auto">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#F8FAFC]">QRNG // QISKIT</span>
                <span>—</span>
                <span>Quantum Random Bit Generator &amp; Key Entropy System</span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-[11px]">
                <button
                  onClick={handleReplayIntro}
                  className="flex items-center gap-1.5 text-[#00F0FF] hover:text-white transition-colors cursor-pointer"
                  title="Replay Quantum Orbital Structure Formation Animation"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Replay Quantum Structure</span>
                </button>
                <span className="flex items-center gap-1 text-[#94A3B8]">
                  <Lock className="w-3.5 h-3.5 text-[#00FFA3]" />
                  Zero-Persistence Memory Architecture
                </span>
                <span className="flex items-center gap-1 text-[#94A3B8]">
                  <Cpu className="w-3.5 h-3.5 text-[#00F0FF]" />
                  Qiskit Aer 0.18 + Python 3.12
                </span>
                <span className="flex items-center gap-1 text-[#94A3B8]">
                  <Atom className="w-3.5 h-3.5 text-[#8B5CF6]" />
                  Interactive 3D Orbital Model
                </span>
              </div>
            </div>
          </footer>
        </motion.div>
      </div>
    </BrowserRouter>
  );
};

export default App;
