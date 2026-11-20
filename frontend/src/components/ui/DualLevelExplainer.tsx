import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Sparkles, BookOpen } from 'lucide-react';
import { MathFormula } from './MathFormula';

interface DualLevelExplainerProps {
  title: string;
  simpleExplanation: string;
  technicalExplanation: string;
  mathFormula?: string;
  defaultExpanded?: boolean;
  className?: string;
}

export const DualLevelExplainer: React.FC<DualLevelExplainerProps> = ({
  title,
  simpleExplanation,
  technicalExplanation,
  mathFormula,
  defaultExpanded = false,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);

  return (
    <div
      className={`rounded-xl border border-slate-800 bg-[#080C17]/80 backdrop-blur-md overflow-hidden transition-all duration-300 hover:border-[#00F0FF]/30 ${className}`}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3.5 text-left text-xs font-mono text-slate-300 hover:text-white transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#00F0FF]" />
          <span className="font-semibold text-slate-200">{title}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-300">
            Concept Guide
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <span>{isExpanded ? 'Collapse' : 'Explain'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {/* Level 1 Simple Summary (Always Visible or Collapsible Preview) */}
      <div className="px-3.5 pb-3 pt-0 text-xs text-slate-300 leading-relaxed border-t border-slate-800/40">
        <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#00FFA3] uppercase tracking-wider mb-1 pt-2">
          <Sparkles className="w-3 h-3 text-[#00FFA3]" />
          <span>Level 1: Intuitive Summary</span>
        </div>
        <p className="text-slate-300 font-sans">{simpleExplanation}</p>
      </div>

      {/* Level 2 Technical Rigor (Expandable) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="px-3.5 pb-3.5 pt-2 border-t border-slate-800/80 bg-[#05070E]/60 text-xs text-slate-300 space-y-2.5 font-sans"
          >
            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#A855F7] uppercase tracking-wider">
              <span>Level 2: Rigorous Mathematical &amp; Quantum Physics Model</span>
            </div>
            <p className="leading-relaxed text-slate-400">{technicalExplanation}</p>

            {mathFormula && (
              <div className="py-1 px-2 rounded-lg bg-[#080C17] border border-cyan-900/40 text-center">
                <MathFormula math={mathFormula} display={true} color="cyan" />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DualLevelExplainer;
