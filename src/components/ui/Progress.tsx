import React from 'react';
import { clsx } from 'clsx';
import { SeverityLevel } from '../../types/digitalTwin';

interface ProgressProps {
  value: number; // 0 to 100
  max?: number;
  variant?: SeverityLevel | 'brand' | 'cyan';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  variant = 'brand',
  showLabel = false,
  label,
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const barColors = {
    SAFE: 'bg-emerald-500',
    LOW: 'bg-emerald-400',
    WARNING: 'bg-amber-500',
    HIGH: 'bg-orange-500',
    CRITICAL: 'bg-red-500',
    brand: 'bg-brand-blue',
    cyan: 'bg-brand-cyan',
  };

  return (
    <div className={clsx('w-full', className)}>
      {(showLabel || label) && (
        <div className="flex justify-between text-xs font-mono mb-1 text-slate-300">
          <span>{label}</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/60">
        <div
          className={clsx('h-full transition-all duration-500 ease-out rounded-full', barColors[variant])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
