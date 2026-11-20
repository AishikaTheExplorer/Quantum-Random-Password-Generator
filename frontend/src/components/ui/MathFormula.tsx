import React, { useMemo } from 'react';
import katex from 'katex';

interface MathFormulaProps {
  math: string;
  display?: boolean;
  className?: string;
  color?: 'cyan' | 'purple' | 'green' | 'default';
}

export const MathFormula: React.FC<MathFormulaProps> = ({
  math,
  display = false,
  className = '',
  color = 'default',
}) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: display,
        throwOnError: false,
        strict: false,
      });
    } catch {
      return math;
    }
  }, [math, display]);

  const colorClass =
    color === 'cyan'
      ? 'text-cyan-300'
      : color === 'purple'
      ? 'text-purple-300'
      : color === 'green'
      ? 'text-emerald-300'
      : 'text-slate-100';

  if (display) {
    return (
      <div
        className={`my-3 overflow-x-auto py-1 px-2 text-center select-all font-mono ${colorClass} ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span
      className={`inline-block align-baseline mx-0.5 select-all ${colorClass} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default MathFormula;
