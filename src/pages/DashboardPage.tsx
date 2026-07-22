import React from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { FourQuestionCard } from '../components/domain/FourQuestionCard';
import { DigitalTwinCanvas } from '../components/domain/DigitalTwinCanvas';
import { SwarmReasoningCard } from '../components/domain/SwarmReasoningCard';
import { useRiskStore } from '../store/useRiskStore';
import { usePermitStore } from '../store/usePermitStore';
import { MOCK_SENSORS, MOCK_ASSETS } from '../services/mockData';
import { ShieldAlert, Users, FileCheck2, Activity, ArrowUpRight, Zap, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { activeAssessment, resolveAssessment } = useRiskStore();
  const { permits } = usePermitStore();
  const navigate = useNavigate();

  const pendingPermits = permits.filter((p) => p.status.includes('PENDING') || p.status.includes('RECOMMENDED'));

  return (
    <div className="space-y-6">
      {/* Page Header Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 uppercase tracking-tight flex items-center gap-2">
            Executive Industrial Safety Command Center
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Refinery Alpha — Hydrocracker Unit 2 • Real-Time AI Compound Risk Monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={<RefreshCw className="w-3.5 h-3.5" />}>
            Refresh Telemetry
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/compound-risk')}>
            Inspect Compound Graph →
          </Button>
        </div>
      </div>

      {/* Top Metric KPI Ribbon (4 Cards — Equal Height) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        {/* Card 1: Global Compound Risk Index */}
        <Card variant="critical" className="relative overflow-hidden flex flex-col justify-between h-full">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-mono font-semibold text-red-300 uppercase tracking-wider block">
                GLOBAL COMPOUND RISK INDEX
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold font-mono text-white">{activeAssessment.compoundRiskScore}%</span>
                <span className="text-xs font-mono text-red-400 font-bold flex items-center">
                  <ArrowUpRight className="w-3.5 h-3.5" /> +18.4%/hr
                </span>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-red-900/60 text-red-400 border border-red-700/80">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-red-900/50 flex justify-between items-center text-[11px] font-mono text-slate-300">
            <span>Level: <strong className="text-red-400">CRITICAL</strong></span>
            <span>Zone B4 Affected</span>
          </div>
        </Card>

        {/* Card 2: Active Workforce */}
        <Card variant="default" className="flex flex-col justify-between h-full">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider block">
                ACTIVE WORKFORCE ON-SITE
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold font-mono text-white">142</span>
                <span className="text-xs font-mono text-emerald-400">100% PPE Compliant</span>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-slate-800 text-brand-cyan border border-slate-700">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/80 flex justify-between items-center text-[11px] font-mono text-slate-400">
            <span>High-Hazard Zone: <strong className="text-amber-400">8 Workers</strong></span>
            <span>Avg Shift: 6.2 hrs</span>
          </div>
        </Card>

        {/* Card 3: Active Work Permits */}
        <Card variant="default" className="flex flex-col justify-between h-full">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider block">
                ACTIVE WORK PERMITS (PTW)
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold font-mono text-white">18</span>
                <span className="text-xs font-mono text-amber-400">2 Pending AI Review</span>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-slate-800 text-brand-orange border border-slate-700">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/80 flex justify-between items-center text-[11px] font-mono text-slate-400">
            <span>Hot Work Active: <strong className="text-red-400">4 Permits</strong></span>
            <button onClick={() => navigate('/permits')} className="text-brand-blue hover:underline">
              View Queue →
            </button>
          </div>
        </Card>

        {/* Card 4: Machine Health Index */}
        <Card variant="default" className="flex flex-col justify-between h-full">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider block">
                MACHINE HEALTH INDEX
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold font-mono text-white">94.2%</span>
                <span className="text-xs font-mono text-emerald-400">Nominal</span>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-slate-800 text-brand-blue border border-slate-700">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/80 flex justify-between items-center text-[11px] font-mono text-slate-400">
            <span>Anomalous Assets: <strong className="text-red-400">1 (Pump P-102)</strong></span>
            <span>Vibration: 8.4mm/s</span>
          </div>
        </Card>
      </div>

      {/* Main Section Split: Left Spatial Canvas + Right AI Diagnosis & Swarm Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Spatial Digital Twin & Telemetry (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <DigitalTwinCanvas />

          {/* SCADA Telemetry Live Grid */}
          <Card variant="default" title="LIVE SCADA & IoT TELEMETRY SENSORS (HYDROCRACKER UNIT 2)">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {MOCK_SENSORS.slice(0, 6).map((sensor) => (
                <div
                  key={sensor.sensorId}
                  className={`p-3 rounded border text-left font-mono space-y-1 transition-all ${
                    sensor.status === 'CRITICAL'
                      ? 'bg-red-950/40 border-red-800 text-red-200 alert-pulse-critical'
                      : sensor.status === 'WARNING'
                      ? 'bg-amber-950/30 border-amber-800 text-amber-200'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span>{sensor.sensorId}</span>
                    <Badge variant={sensor.status} size="sm">
                      {sensor.status}
                    </Badge>
                  </div>
                  <div className="text-lg font-bold text-white">
                    {sensor.value} <span className="text-xs font-normal text-slate-400">{sensor.unit}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">{sensor.sensorName}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: AI Compound Recommendation & Swarm Monitor (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Top Priority XAI Card */}
          <FourQuestionCard
            fourQuestions={activeAssessment.fourQuestions}
            riskScore={activeAssessment.compoundRiskScore}
          />

          {/* Action Trigger Box */}
          <Card variant="elevated" className="space-y-3 bg-slate-900 border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 uppercase font-mono flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-brand-orange" /> URGENT HUMAN AUTHORIZATION
              </span>
              <span className="text-[10px] font-mono text-slate-400">Target: Permit PTW-8409</span>
            </div>
            <p className="text-xs text-slate-300">
              The AI Engine recommends immediate permit rejection to prevent flammable vapor ignition in Zone B4.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                variant="danger"
                size="md"
                className="w-full"
                onClick={() => resolveAssessment(activeAssessment.assessmentId, 'REJECT')}
              >
                REJECT PERMIT (1-CLICK)
              </Button>
              <Button
                variant="secondary"
                size="md"
                className="w-full"
                onClick={() => navigate('/compound-risk')}
              >
                OPEN DEEP INSPECTOR
              </Button>
            </div>
          </Card>

          {/* Multi-Agent Swarm Reasoning Monitor (Fills Column Height Gap) */}
          <SwarmReasoningCard />
        </div>
      </div>
    </div>
  );
};
