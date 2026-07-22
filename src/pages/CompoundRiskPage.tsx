import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { FourQuestionCard } from '../components/domain/FourQuestionCard';
import { CompoundRiskGraph } from '../components/domain/CompoundRiskGraph';
import { useRiskStore } from '../store/useRiskStore';
import { Flame, Sliders, ShieldAlert, CheckCircle2, History, Zap } from 'lucide-react';

export const CompoundRiskPage: React.FC = () => {
  const { activeAssessment, resolveAssessment, updateSimulationGas, toggleExhaustPurge, simulationParameters } = useRiskStore();
  const [showSandbox, setShowSandbox] = useState(false);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 uppercase tracking-tight flex items-center gap-2">
            <Flame className="w-5 h-5 text-brand-red animate-pulse" /> Compound Risk Intelligence Center
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Multi-Agent Neural-Symbolic Fusing • Assessment ID: {activeAssessment.assessmentId}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={showSandbox ? 'primary' : 'outline'}
            size="sm"
            icon={<Sliders className="w-3.5 h-3.5" />}
            onClick={() => setShowSandbox(!showSandbox)}
          >
            {showSandbox ? 'Hide What-If Sandbox' : 'Open "What-If" Simulator'}
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => resolveAssessment(activeAssessment.assessmentId, 'REJECT')}
          >
            1-CLICK REJECT PERMIT
          </Button>
        </div>
      </div>

      {/* Interactive "What-If" Scenario Simulator Sandbox Drawer */}
      {showSandbox && (
        <Card variant="elevated" className="bg-slate-900 border-brand-blue/40 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-brand-cyan" />
              <h3 className="text-sm font-bold text-slate-100">"WHAT-IF" SCENARIO SIMULATION SANDBOX</h3>
            </div>
            <span className="text-xs font-mono text-brand-cyan">Simulate Parameter Overrides</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            {/* Control 1: Gas LEL Slider */}
            <div className="space-y-1.5 bg-slate-950 p-3 rounded border border-slate-800">
              <label className="text-slate-300 flex justify-between">
                <span>Simulate Gas LEL Level:</span>
                <strong className="text-amber-400">{simulationParameters.gasLelOverride ?? 22.4}% LEL</strong>
              </label>
              <input
                type="range"
                min="0"
                max="50"
                step="1"
                value={simulationParameters.gasLelOverride ?? 22.4}
                onChange={(e) => updateSimulationGas(parseFloat(e.target.value))}
                className="w-full cursor-pointer accent-brand-blue"
              />
            </div>

            {/* Control 2: Exhaust Ventilation Purge Toggle */}
            <div className="space-y-1.5 bg-slate-950 p-3 rounded border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-300 block font-bold">SCADA Nitrogen/Exhaust Ventilation:</span>
                <span className="text-[10px] text-slate-400">Simulate 500 CFM Fan Activation</span>
              </div>
              <Button
                variant={simulationParameters.exhaustPurgeActive ? 'primary' : 'outline'}
                size="sm"
                onClick={() => toggleExhaustPurge(!simulationParameters.exhaustPurgeActive)}
              >
                {simulationParameters.exhaustPurgeActive ? 'PURGE ACTIVE' : 'ACTIVATE PURGE'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Main Multi-Agent Compound Fusing Visualizer */}
      <CompoundRiskGraph
        factors={activeAssessment.contributingFactors}
        score={activeAssessment.compoundRiskScore}
      />

      {/* Core XAI 4-Question Diagnosis & Regulatory Lineage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 4-Question Summary (8 Cols) */}
        <div className="lg:col-span-8">
          <FourQuestionCard
            fourQuestions={activeAssessment.fourQuestions}
            riskScore={activeAssessment.compoundRiskScore}
          />
        </div>

        {/* Right Column: Regulatory Lineage & Historical Precedent Match (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Card 1: Regulatory Lineage */}
          <Card variant="default" title="STATUTORY REGULATORY LINEAGE">
            <div className="space-y-2">
              <p className="text-xs text-slate-300">
                The Compliance Agent identified direct violations of the following statutory guidelines:
              </p>
              <div className="space-y-2 pt-1">
                {activeAssessment.regulatoryLineage.map((rule, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-900 rounded border border-slate-800">
                    <span className="text-xs font-bold text-amber-400 font-mono block">{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Card 2: Historical Incident Vector Match */}
          {activeAssessment.historicalIncidentMatch && (
            <Card variant="elevated" title="HISTORICAL INCIDENT PRECEDENT MATCH">
              <div className="space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-red-400">{activeAssessment.historicalIncidentMatch.incidentId}</span>
                  <Badge variant="CRITICAL">
                    {(activeAssessment.historicalIncidentMatch.similarityScore * 100).toFixed(0)}% MATCH
                  </Badge>
                </div>
                <div className="text-slate-200 font-sans font-semibold">
                  {activeAssessment.historicalIncidentMatch.title}
                </div>
                <div className="text-[11px] text-slate-400">
                  Location: {activeAssessment.historicalIncidentMatch.location} ({activeAssessment.historicalIncidentMatch.date})
                </div>
                <p className="text-[11px] text-slate-300 font-sans pt-1">
                  Vapor cloud explosion occurred under identical atmospheric LEL and welding permit conditions.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
