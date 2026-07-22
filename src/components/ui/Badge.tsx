import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SeverityLevel } from '../../types/digitalTwin';

interface BadgeProps {
  children: React.ReactNode;
  variant?: SeverityLevel | 'info' | 'purple' | 'neutral';
  size?: 'sm' | 'md';
  pulse?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  pulse = false,
  className,
}) => {
  const baseClasses = 'inline-flex items-center font-mono font-semibold rounded-full border tracking-wide uppercase';

  const variants = {
    SAFE: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/80',
    LOW: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60',
    WARNING: 'bg-amber-950/60 text-amber-400 border-amber-800/80',
    HIGH: 'bg-orange-950/60 text-orange-400 border-orange-800/80',
    CRITICAL: 'bg-red-950/80 text-red-400 border-red-700/90 alert-pulse-critical',
    info: 'bg-cyan-950/60 text-cyan-400 border-cyan-800/80',
    purple: 'bg-purple-950/60 text-purple-400 border-purple-800/80',
    neutral: 'bg-slate-800/80 text-slate-300 border-slate-700',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span className={twMerge(clsx(baseClasses, variants[variant], sizes[size], className))}>
      {pulse && (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping mr-1.5 flex-shrink-0" />
      )}
      {children}
    </span>
  );
};
