import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Cpu, CheckCircle2, Loader2, ShieldAlert, Zap, ArrowRight, X } from 'lucide-react';

interface AgentThinkingStep {
  id: string;
  name: string;
  title: string;
  status: 'PENDING' | 'THINKING' | 'COMPLETED';
  confidence: number;
  executionTimeMs: number;
  reasoningSummary: string;
  contributedRiskScore: number;
}

interface AiThinkingModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

const INITIAL_AGENT_STEPS: AgentThinkingStep[] = [
  {
    id: 'sensor',
    name: 'SensorAgent',
    title: 'SCADA Telemetry Specialist',
    status: 'PENDING',
    confidence: 98,
    executionTimeMs: 42,
    reasoningSummary: 'LEL Gas Sensor G-104 detected atmospheric spike to 22.4% LEL in Zone B4. Spectral vibration on Pump P-102 elevated at 8.4 mm/s.',
    contributedRiskScore: 35,
  },
  {
    id: 'permit',
    name: 'PermitAgent',
    title: 'Work Authorization Specialist',
    status: 'PENDING',
    confidence: 96,
    executionTimeMs: 38,
    reasoningSummary: 'Hot Work Permit PTW-2026-8409 requested within 8 meters of active gas leak zone.',
    contributedRiskScore: 28,
  },
  {
    id: 'maintenance',
    name: 'MaintenanceAgent',
    title: 'Asset Integrity Specialist',
    status: 'PENDING',
    confidence: 92,
    executionTimeMs: 65,
    reasoningSummary: 'Pump P-102 bearing seal breakdown confirmed. Hydrocarbon leakage risk elevated.',
    contributedRiskScore: 16,
  },
  {
    id: 'shift',
    name: 'ShiftAgent',
    title: 'Fatigue & Crew Analyst',
    status: 'PENDING',
    confidence: 89,
    executionTimeMs: 29,
    reasoningSummary: 'Welding crew assigned (Vikram Sharma & team) in 11.2th hour of continuous shift. Human error probability +30%.',
    contributedRiskScore: 9,
  },
  {
    id: 'incident',
    name: 'IncidentAgent',
    title: 'Historical Precedent Engine',
    status: 'PENDING',
    confidence: 89,
    executionTimeMs: 110,
    reasoningSummary: 'Vector match: 89% similarity to 2021 Hydrocracker Vapor Cloud Explosion (INC-2021-04-12).',
    contributedRiskScore: 8,
  },
  {
    id: 'compliance',
    name: 'ComplianceAgent',
    title: 'Statutory Rule Guardrail',
    status: 'PENDING',
    confidence: 99,
    executionTimeMs: 18,
    reasoningSummary: 'VIOLATION DETECTED: OISD-STD-105 Section 6.2 strictly forbids hot work when LEL > 5%.',
    contributedRiskScore: 4,
  },
  {
    id: 'supervisor',
    name: 'SupervisorAgent',
    title: 'Executive XAI Synthesizer',
    status: 'PENDING',
    confidence: 94,
    executionTimeMs: 145,
    reasoningSummary: 'Synthesized Compound Risk Score = 96% (CRITICAL). Issuing 1-Click Permit Rejection & SCADA Nitrogen Purge Directive.',
    contributedRiskScore: 0,
  },
];

export const AiThinkingModeModal: React.FC<AiThinkingModeModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [steps, setSteps] = useState<AgentThinkingStep[]>(INITIAL_AGENT_STEPS);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [accumulatedRisk, setAccumulatedRisk] = useState(5);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSteps(INITIAL_AGENT_STEPS);
      setCurrentStepIdx(0);
      setAccumulatedRisk(5);
      setIsFinished(false);
      return;
    }

    // Sequentially animate agent thinking steps
    const interval = setInterval(() => {
      setCurrentStepIdx((prevIdx) => {
        if (prevIdx >= steps.length) {
          clearInterval(interval);
          setIsFinished(true);
          if (onComplete) onComplete();
          return prevIdx;
        }

        // Mark current agent as completed and next as thinking
        setSteps((prevSteps) =>
          prevSteps.map((step, idx) => {
            if (idx === prevIdx) {
              setAccumulatedRisk((r) => Math.min(96, r + step.contributedRiskScore));
              return { ...step, status: 'COMPLETED' };
            }
            if (idx === prevIdx + 1) {
              return { ...step, status: 'THINKING' };
            }
            return step;
          })
        );

        return prevIdx + 1;
      });
    }, 900);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-navy-950/85 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="max-w-3xl w-full glass-panel-elevated rounded-xl p-6 border border-brand-blue/40 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand-blue/20 border border-brand-blue flex items-center justify-center text-brand-blue">
                <Cpu className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                  AI MULTI-AGENT SWARM THINKING MODE
                </h2>
                <span className="text-xs font-mono text-brand-cyan">
                  Parallel Agent Execution & Compound Risk Accumulation
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Dynamic Live Risk Score Counter Bar */}
          <div className="bg-slate-900/90 p-4 rounded-lg border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-slate-400 block uppercase">
                Dynamic Evidence Accumulation
              </span>
              <span className="text-xs text-slate-300 font-sans">
                Processing 12 domain agents over live plant telemetry...
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-3xl font-extrabold font-mono text-red-400 animate-pulse">
                  {accumulatedRisk}%
                </div>
                <span className="text-[10px] font-mono text-red-400 uppercase font-bold">
                  {accumulatedRisk > 75 ? 'CRITICAL RISK' : 'ACCUMULATING EVIDENCE'}
                </span>
              </div>
            </div>
          </div>

          {/* Agent Execution Steps Stream */}
          <div className="space-y-3 font-mono text-xs">
            {steps.map((step, idx) => {
              const isCompleted = step.status === 'COMPLETED';
              const isThinking = step.status === 'THINKING' || (idx === currentStepIdx && !isFinished);

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`p-3.5 rounded-lg border transition-all flex items-start justify-between ${
                    isCompleted
                      ? 'bg-slate-900 border-slate-800 text-slate-200'
                      : isThinking
                      ? 'bg-brand-blue/10 border-brand-blue/60 text-white alert-pulse-critical'
                      : 'bg-slate-950/40 border-slate-900 text-slate-600'
                  }`}
                >
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      ) : isThinking ? (
                        <Loader2 className="w-4 h-4 text-brand-cyan animate-spin flex-shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-800 flex-shrink-0" />
                      )}
                      <span className="font-bold text-slate-100">{step.name}</span>
                      <span className="text-[10px] text-slate-500">({step.title})</span>
                    </div>

                    {(isCompleted || isThinking) && (
                      <p className="text-xs text-slate-300 font-sans pl-6 pt-0.5">
                        {step.reasoningSummary}
                      </p>
                    )}
                  </div>

                  <div className="text-right flex-shrink-0 pl-3">
                    {isCompleted ? (
                      <Badge variant="SAFE" size="sm">
                        {step.executionTimeMs}ms • {step.confidence}% CONF
                      </Badge>
                    ) : isThinking ? (
                      <Badge variant="info" size="sm" pulse>
                        THINKING...
                      </Badge>
                    ) : (
                      <span className="text-[10px] text-slate-600">QUEUED</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
            <span className="text-xs font-mono text-slate-400">
              {isFinished ? 'Swarm Reasoning Complete • Decision Ready' : 'Processing LangGraph Pipeline...'}
            </span>

            <Button
              variant={isFinished ? 'danger' : 'secondary'}
              size="md"
              onClick={onClose}
              icon={isFinished ? <ShieldAlert className="w-4 h-4" /> : undefined}
            >
              {isFinished ? 'VIEW REASONING DIAGNOSIS' : 'CLOSE OVERLAY'}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
