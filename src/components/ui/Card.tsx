import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'glass' | 'critical';
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  title,
  subtitle,
  action,
  className,
  ...props
}) => {
  const baseClasses = 'rounded-lg border p-4 transition-all duration-200';

  const variants = {
    default: 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-md',
    elevated: 'bg-slate-850 border-slate-700 text-slate-100 shadow-xl',
    glass: 'glass-panel text-slate-100',
    critical: 'bg-red-950/30 border-red-800/80 text-slate-100 shadow-lg shadow-red-950/50',
  };

  return (
    <div className={twMerge(clsx(baseClasses, variants[variant], className))} {...props}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800/80">
          <div>
            {title && <h3 className="text-sm font-semibold text-slate-200 tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
