import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  KeyRound,
  Cpu,
  Atom,
  Binary,
  ShieldCheck,
  Eye,
  Menu,
  X,
} from 'lucide-react';
import type { BackendHealth } from '../../types';

interface NavbarProps {
  health: BackendHealth | null;
  isConnected: boolean;
  isChecking: boolean;
  onRefreshHealth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  health,
  isConnected,
  isChecking,
  onRefreshHealth,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { to: '/', label: 'Generator', icon: KeyRound },
    { to: '/circuits', label: 'Circuit Lab', icon: Cpu },
    { to: '/measurement', label: 'Measurement', icon: Atom },
    { to: '/converter', label: 'Converter', icon: Binary },
    { to: '/analyzer', label: 'Analyzer', icon: ShieldCheck },
    { to: '/visualizer', label: '3D Lab', icon: Eye },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#05070E]/85 border-b border-[#00F0FF]/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Identity */}
          <NavLink to="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#00F0FF]/20 to-[#8A2BE2]/30 border border-[#00F0FF]/40 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.25)] group-hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all">
              <Atom className="w-5 h-5 text-[#00F0FF] animate-spin-slow" />
              <div className="absolute inset-0 rounded-xl bg-[#00F0FF]/10 filter blur-sm group-hover:bg-[#00F0FF]/20 transition-all" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold tracking-wider text-base text-[#F8FAFC]">QRNG</span>
                <span className="text-xs font-mono text-[#00F0FF] font-semibold">//</span>
                <span className="font-mono text-xs tracking-widest text-[#CBD5E1]">QISKIT</span>
              </div>
              <div className="text-[10px] tracking-wide text-[#B6C3D4] font-sans hidden sm:block">
                Quantum Random Bit Engine
              </div>
            </div>
          </NavLink>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 shadow-[0_0_12px_rgba(0,240,255,0.15)]'
                        : 'text-[#CBD5E1] hover:text-[#F8FAFC] hover:bg-slate-800/40 border border-transparent'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Backend Status Telemetry Pill */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={onRefreshHealth}
              title="Click to re-ping Qiskit Aer backend"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono transition-all cursor-pointer ${
                isConnected
                  ? 'bg-[#00FFA3]/10 border-[#00FFA3]/30 text-[#00FFA3] hover:bg-[#00FFA3]/20 shadow-[0_0_12px_rgba(0,255,163,0.15)]'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isConnected ? 'bg-[#00FFA3]' : 'bg-amber-400'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isConnected ? 'bg-[#00FFA3]' : 'bg-amber-500'
                  }`}
                />
              </span>
              <span>
                {isChecking
                  ? 'CHECKING...'
                  : isConnected
                  ? `QISKIT AER // CONNECTED (v${health?.qiskit_version || '2.x'})`
                  : 'DEMO MODE (BACKEND OFFLINE)'}
              </span>
            </button>
          </div>

          {/* Mobile menu trigger */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-[#00F0FF]/15 bg-[#080C17]/95 px-4 pt-2 pb-4 space-y-1"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                      isActive
                        ? 'bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30'
                        : 'text-slate-300 hover:bg-slate-800/50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Status:</span>
              <span className={isConnected ? 'text-[#00FFA3]' : 'text-amber-400'}>
                {isConnected ? 'Qiskit Aer Connected' : 'Demo Mode (Offline)'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
