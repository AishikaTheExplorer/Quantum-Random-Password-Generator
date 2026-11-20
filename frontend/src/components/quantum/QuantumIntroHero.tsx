import React, { useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ArrowRight } from 'lucide-react';

interface QuantumIntroHeroProps {
  formationProgress: number; // 0.0 (scattered) to 1.0 (formed galaxy & docked header)
  onUpdateFormation: (progress: number) => void;
  onCompleteIntro: () => void;
}

export const QuantumIntroHero: React.FC<QuantumIntroHeroProps> = ({
  formationProgress,
  onUpdateFormation,
  onCompleteIntro,
}) => {
  // Bi-directional wheel listener to smoothly drive galaxy formation and floating text
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      // If intro is not yet locked or user is at top of page
      if (formationProgress < 0.99 || window.scrollY <= 10) {
        if (formationProgress < 0.99 && e.deltaY > 0) {
          e.preventDefault();
        } else if (formationProgress > 0 && e.deltaY < 0 && window.scrollY <= 5) {
          e.preventDefault();
        }

        const delta = e.deltaY * 0.0024;
        const next = Math.min(1.0, Math.max(0.0, formationProgress + delta));
        onUpdateFormation(next);

        if (next >= 0.98) {
          onCompleteIntro();
        }
      }
    },
    [formationProgress, onUpdateFormation, onCompleteIntro]
  );

  // Touch swipe support for mobile devices
  useEffect(() => {
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (formationProgress < 0.99) {
        const touchCurrentY = e.touches[0].clientY;
        const delta = (touchStartY - touchCurrentY) * 0.004;
        const next = Math.min(1.0, Math.max(0.0, formationProgress + delta));
        onUpdateFormation(next);
        if (next >= 0.98) {
          onCompleteIntro();
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [formationProgress, onUpdateFormation, onCompleteIntro]);

  useEffect(() => {
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // Floating text transformation calculations:
  // At 0: vertically centered in screen (translateY: 0), large font, subtle glow
  // At 1: smoothly translated upwards to dock as the application header, compact and refined
  const translateY = -formationProgress * 36; // in vh
  const titleScale = 1 - formationProgress * 0.22;
  const introControlsOpacity = Math.max(0, 1 - formationProgress * 2.5);

  return (
    <div
      className={`fixed inset-0 z-30 flex flex-col justify-between p-6 sm:p-10 select-none ${
        formationProgress >= 0.98 ? 'pointer-events-none' : 'pointer-events-auto'
      }`}
    >
      <div />

      {/* Floating Introductory Text (NO RECTANGULAR BOX OR GLASS CARD - PURE FLOATING TYPOGRAPHY) */}
      <motion.div
        style={{
          transform: `translateY(${translateY}vh)`,
        }}
        className="text-center space-y-4 max-w-4xl mx-auto pointer-events-none px-4"
      >
        {/* Small Elegant Monospaced Identity Label */}
        <div className="flex items-center justify-center gap-2">
          <span className="font-mono text-xs sm:text-sm tracking-[0.25em] text-[#00F0FF] font-semibold uppercase drop-shadow-[0_0_12px_rgba(0,240,255,0.7)]">
            QRNG // QISKIT
          </span>
        </div>

        {/* Project Title: Transforms smoothly into Application Main Heading */}
        <motion.h1
          style={{ transform: `scale(${titleScale})` }}
          className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#F8FAFC] font-heading drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)] leading-tight"
        >
          QUANTUM RANDOM PASSWORD GENERATOR
        </motion.h1>

        {/* Project Description: High-contrast readable slate text */}
        <motion.p
          animate={{
            opacity: Math.max(0.65, 1 - formationProgress * 0.35),
            y: formationProgress * 2,
          }}
          className="text-xs sm:text-sm md:text-base text-[#B6C3D4] font-sans leading-relaxed max-w-xl mx-auto drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]"
        >
          Generate provably unbiased cryptographic passwords using binary measurement outcomes from simulated quantum circuits.
        </motion.p>

        {/* Direct Action Trigger: Disappears as user scrolls */}
        <motion.div
          animate={{ opacity: introControlsOpacity }}
          className="pt-2 pointer-events-auto"
        >
          {formationProgress < 0.4 && (
            <button
              onClick={() => {
                onUpdateFormation(1.0);
                onCompleteIntro();
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#00F0FF]/15 hover:bg-[#00F0FF]/25 border border-[#00F0FF]/40 text-[#00F0FF] hover:text-white text-xs font-mono font-semibold transition-all cursor-pointer shadow-[0_0_20px_rgba(0,240,255,0.25)] backdrop-blur-sm"
            >
              <span>Enter Application</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </motion.div>
      </motion.div>

      {/* Bottom Scroll Indicator with Visual Feedback */}
      <motion.div
        animate={{ opacity: introControlsOpacity }}
        className="flex flex-col items-center gap-2.5 cursor-pointer pointer-events-auto mx-auto pb-4"
        onClick={() => {
          onUpdateFormation(1.0);
          onCompleteIntro();
        }}
      >
        <span className="text-xs font-mono tracking-widest text-[#00F0FF] uppercase drop-shadow-[0_0_8px_rgba(0,240,255,0.6)] animate-pulse">
          Scroll to form quantum structure
        </span>

        {/* Minimal Progress Line Indicator */}
        <div className="w-44 h-1 bg-[#0B0F1A]/80 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-[#00F0FF] via-[#06B6D4] to-[#8A2BE2] transition-all duration-100"
            style={{ width: `${Math.round(formationProgress * 100)}%` }}
          />
        </div>

        <ChevronDown className="w-4 h-4 text-[#00F0FF] animate-bounce" />
      </motion.div>
    </div>
  );
};

export default QuantumIntroHero;
