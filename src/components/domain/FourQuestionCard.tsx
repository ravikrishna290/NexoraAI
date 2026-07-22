import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { FourQuestionSummary } from '../../types/compoundRisk';
import { AlertCircle, HelpCircle, ShieldCheck, Zap } from 'lucide-react';

interface FourQuestionCardProps {
  fourQuestions: FourQuestionSummary;
  riskScore: number;
  onExecuteMitigation?: (stepIndex: number) => void;
}

export const FourQuestionCard: React.FC<FourQuestionCardProps> = ({
  fourQuestions,
  riskScore,
  onExecuteMitigation,
}) => {
  const isCritical = riskScore > 75;

  return (
    <Card variant={isCritical ? 'critical' : 'elevated'} className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-brand-red/20 text-brand-red border border-red-500/30">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">AI Explainable Diagnosis (XAI)</h3>
            <p className="text-[11px] text-slate-400">Synthesized by 12 Domain Agents & Compound Risk Engine</p>
          </div>
        </div>
        <Badge variant={isCritical ? 'CRITICAL' : 'WARNING'} pulse>
          {riskScore}% COMPOUND RISK
        </Badge>
      </div>

      {/* 4-Question Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Q1: What is happening */}
        <div className="bg-slate-900/80 p-3.5 rounded-md border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-cyan uppercase font-mono">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>1. What is Happening?</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-sans">{fourQuestions.whatIsHappening}</p>
        </div>

        {/* Q2: Why is it happening */}
        <div className="bg-slate-900/80 p-3.5 rounded-md border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 uppercase font-mono">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>2. Why is it Happening?</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-sans">{fourQuestions.whyIsItHappening}</p>
        </div>

        {/* Q3: How dangerous is it */}
        <div className="bg-slate-900/80 p-3.5 rounded-md border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-red uppercase font-mono">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>3. How Dangerous is it?</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-sans font-medium">{fourQuestions.howDangerousIsIt}</p>
        </div>

        {/* Q4: What should be done */}
        <div className="bg-slate-900/80 p-3.5 rounded-md border border-slate-800 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 uppercase font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>4. What Should Be Done?</span>
          </div>
          <ul className="space-y-1.5">
            {fourQuestions.whatShouldBeDone.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                <span className="w-4 h-4 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-700/80 text-[10px] font-mono flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                  {idx + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
};
