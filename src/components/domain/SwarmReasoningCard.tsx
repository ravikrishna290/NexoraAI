import React, { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Activity, ShieldAlert, Cpu, Eye, Award, FileText, CheckCircle2, Loader2, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface AgentStatus {
  id: string;
  name: string;
  domain: string;
  icon: React.ElementType;
  status: 'PROCESSING' | 'COMPLETED' | 'CRITICAL_FLAG';
  confidence: number;
  summary: string;
  latencyMs: number;
}

const INITIAL_AGENTS: AgentStatus[] = [
  { id: 'sensor-agent', name: 'SensorAgent', domain: 'SCADA Telemetry', icon: Activity, status: 'CRITICAL_FLAG', confidence: 99.2, summary: 'Sensor G-104 reading 22.4% LEL gas concentration in Zone B4', latencyMs: 14 },
  { id: 'maint-agent', name: 'MaintenanceAgent', domain: 'AI4I Predictive Maintenance', icon: Cpu, status: 'CRITICAL_FLAG', confidence: 96.8, summary: 'Pump P-102 vibration spike (8.4 mm/s). Bearing seal degradation.', latencyMs: 22 },
  { id: 'permit-agent', name: 'PermitAgent', domain: 'PTW Safety System', icon: FileText, status: 'CRITICAL_FLAG', confidence: 98.5, summary: 'Hot Work PTW-8409 requested within 8m of active gas release', latencyMs: 18 },
  { id: 'vision-agent', name: 'VisionAgent', domain: 'Vision AI Network', icon: Eye, status: 'CRITICAL_FLAG', confidence: 98.4, summary: 'CAM-C03 / CAM-C04: Helmet & Vest missing near hot work area', latencyMs: 31 },
  { id: 'compliance-agent', name: 'ComplianceAgent', domain: 'Regulatory RAG Vector Engine', icon: Award, status: 'COMPLETED', confidence: 99.0, summary: 'OISD-STD-105 Sec 6.2 & OSHA 1910.119 statutory violation flagged', latencyMs: 45 },
  { id: 'incident-agent', name: 'IncidentAgent', domain: 'Past Incident Matcher', icon: ShieldAlert, status: 'COMPLETED', confidence: 89.0, summary: '89% match to INC-2021-04-12 (Jamnagar Hydrocracker VCE)', latencyMs: 28 },
];

export const SwarmReasoningCard: React.FC = () => {
  const [agents, setAgents] = useState(INITIAL_AGENTS);
  const [activePulse, setActivePulse] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActivePulse(p => (p + 1) % INITIAL_AGENTS.length);
    }, 2500);
    return () => clearInterval(id);
  }, []);

  return (
    <Card variant="elevated" className="space-y-3 font-mono">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-purple-950 text-purple-400 border border-purple-800">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Multi-Agent Swarm Monitor</h3>
            <p className="text-[10px] text-slate-400">6 Specialized AI Domain Agents • Real-Time Parallel Reasoning</p>
          </div>
        </div>
        <Badge variant="info" size="sm" pulse>SWARM ACTIVE (6/6)</Badge>
      </div>

      {/* Agents List */}
      <div className="space-y-2">
        {agents.map((agent, idx) => {
          const Icon = agent.icon;
          const isPulsing = activePulse === idx;
          const isCrit = agent.status === 'CRITICAL_FLAG';

          return (
            <motion.div
              key={agent.id}
              className={`p-2 rounded border transition-all text-xs ${
                isPulsing
                  ? 'border-brand-cyan bg-slate-800/90 shadow-md shadow-cyan-500/10'
                  : isCrit
                  ? 'border-red-900/60 bg-red-950/20'
                  : 'border-slate-800 bg-slate-900/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 flex items-center gap-1.5 text-[11px]">
                  <Icon className={`w-3.5 h-3.5 ${isCrit ? 'text-red-400' : 'text-brand-cyan'}`} />
                  {agent.name}
                  <span className="text-[9px] font-normal text-slate-400">({agent.domain})</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">{agent.latencyMs}ms</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                    isCrit ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  }`}>
                    {agent.confidence}%
                  </span>
                </div>
              </div>
              <div className="text-[10px] text-slate-300 mt-1 truncate">{agent.summary}</div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
};
