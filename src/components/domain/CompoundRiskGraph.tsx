import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ContributingFactor } from '../../types/compoundRisk';
import { Cpu, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface CompoundRiskGraphProps {
  factors: ContributingFactor[];
  score: number;
  onFactorClick?: (factor: ContributingFactor) => void;
}

export const CompoundRiskGraph: React.FC<CompoundRiskGraphProps> = ({
  factors,
  score,
  onFactorClick,
}) => {
  const isCritical = score > 75;

  return (
    <Card variant="elevated" className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-brand-blue" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            COMPOUND FUSING GRAPH & MULTI-AGENT INPUT MATRIX
          </h3>
        </div>
        <Badge variant={isCritical ? 'CRITICAL' : 'WARNING'} pulse>
          FUSION SCORE: {score}%
        </Badge>
      </div>

      {/* Node Visualization Diagram */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center bg-navy-950 p-4 rounded-lg border border-slate-800">
        {/* Column 1: Domain Agent Inputs (Left 5 cols) */}
        <div className="lg:col-span-5 space-y-2.5">
          <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            1. MULTI-AGENT DOMAIN INPUTS (6/12 ACTIVE)
          </span>
          {factors.map((factor, idx) => (
            <div
              key={idx}
              onClick={() => onFactorClick && onFactorClick(factor)}
              className="bg-slate-900 border border-slate-800 hover:border-brand-blue p-2.5 rounded-md cursor-pointer transition-all flex items-center justify-between group"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-200">{factor.agentName}</span>
                  <span className="text-[10px] font-mono text-slate-500">({factor.agentTitle})</span>
                </div>
                <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5">{factor.factorText}</p>
              </div>
              <Badge variant={factor.severity} size="sm">
                {(factor.weight * 100).toFixed(0)}% WT
              </Badge>
            </div>
          ))}
        </div>

        {/* Column 2: Fusing Engine Matrix (Center 3 cols) */}
        <div className="lg:col-span-3 flex flex-col items-center justify-center p-4 bg-slate-900/90 border border-slate-800 rounded-md text-center space-y-3 relative">
          <div className="w-10 h-10 rounded-full bg-brand-blue/20 border border-brand-blue/50 flex items-center justify-center text-brand-blue font-bold">
            CRE
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200">COMPOUND RISK ENGINE</h4>
            <span className="text-[10px] font-mono text-brand-cyan">Gamma Interaction Multiplier γ = 3.5x</span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono">Non-linear Risk Fusion Matrix Execution</p>
          <ArrowRight className="w-5 h-5 text-brand-blue animate-pulse hidden lg:block absolute -right-3" />
        </div>

        {/* Column 3: Synthesized Output Score (Right 4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 p-5 rounded-md border border-red-800/60 text-center space-y-3 flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center">
            <svg className="w-32 h-32" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" stroke="#1E293B" strokeWidth="10" fill="none" />
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke={isCritical ? '#EF4444' : '#F59E0B'}
                strokeWidth="10"
                fill="none"
                strokeDasharray="264"
                strokeDashoffset={264 - (264 * score) / 100}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold font-mono text-white">{score}%</span>
              <span className="text-[10px] font-mono text-red-400 uppercase font-bold tracking-wider">
                {score > 75 ? 'CRITICAL' : 'HIGH RISK'}
              </span>
            </div>
          </div>

          <div className="text-left w-full text-xs space-y-1 font-mono text-slate-300 bg-slate-950 p-2.5 rounded border border-slate-800">
            <div>Confidence Score: <strong>94.2%</strong></div>
            <div>Risk Velocity: <strong className="text-red-400">+18.4%/hr Escalating</strong></div>
            <div>Action Required: <strong className="text-emerald-400">IMMEDIATE REJECT</strong></div>
          </div>
        </div>
      </div>
    </Card>
  );
};
