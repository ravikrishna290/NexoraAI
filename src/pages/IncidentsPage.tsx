import React from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { MOCK_HISTORICAL_INCIDENTS } from '../services/mockData';
import { ShieldAlert, Search, GitBranch, History } from 'lucide-react';

export const IncidentsPage: React.FC = () => {
  const incident = MOCK_HISTORICAL_INCIDENTS[0];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 uppercase tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-brand-red" /> Historical Incident & RCA Intelligence
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Vector Similarity Search • Historical Failure Memory • Root Cause Analysis (RCA)
          </p>
        </div>

        {/* Vector Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search past near-misses & incident vectors..."
            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 pl-9 pr-4 py-2 rounded-md w-72 focus:outline-none focus:border-brand-blue"
          />
        </div>
      </div>

      {/* Incident Detail Card */}
      <Card variant="elevated" className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <span className="text-xs font-mono font-bold text-red-400">{incident.incidentId}</span>
            <h2 className="text-lg font-bold text-slate-100">{incident.title}</h2>
            <span className="text-xs text-slate-400 font-mono">{incident.plantLocation} • {incident.date}</span>
          </div>
          <Badge variant="CRITICAL">{incident.severity}</Badge>
        </div>

        <p className="text-xs text-slate-200 leading-relaxed">{incident.summary}</p>

        {/* RCA Tree Visualizer */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase font-mono">
            <GitBranch className="w-4 h-4 text-brand-cyan" /> ROOT CAUSE ANALYSIS (RCA) TREE
          </div>

          <div className="bg-navy-950 p-4 rounded-lg border border-slate-800 space-y-3 font-mono text-xs">
            <div className="p-3 bg-red-950/40 border border-red-800/80 rounded">
              <span className="text-[10px] text-red-400 block font-bold">PRIMARY INCIDENT EVENT:</span>
              <strong className="text-red-200">{incident.title}</strong>
            </div>

            <div className="pl-6 space-y-2 border-l-2 border-slate-800">
              <span className="text-[11px] text-amber-400 font-bold block">IDENTIFIED ROOT CAUSES:</span>
              {incident.rootCauses.map((cause, idx) => (
                <div key={idx} className="p-2.5 bg-slate-900 rounded border border-slate-800 text-slate-300">
                  • {cause}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
