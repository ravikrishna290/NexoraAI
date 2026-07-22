import React from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { MOCK_REGULATORY_STANDARDS, MOCK_AUDIT_LOGS } from '../services/mockData';
import { Award, Lock, ShieldCheck, FileCheck2 } from 'lucide-react';

export const CompliancePage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 uppercase tracking-tight flex items-center gap-2">
            <Award className="w-5 h-5 text-brand-blue" /> Regulatory Compliance & Cryptographic Audit Hub
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            OISD-105 • OSHA 1910.119 • Factory Act 1948 • ISO 45001 • Immutable SHA-256 Chain of Custody
          </p>
        </div>
        <Badge variant="SAFE" pulse>
          AUDIT ENGINE ACTIVE
        </Badge>
      </div>

      {/* Regulatory Standard Cards (3 Cols) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {MOCK_REGULATORY_STANDARDS.map((std) => (
          <Card key={std.code} variant="elevated" className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-brand-blue">{std.code}</span>
              <Badge variant={std.complianceScore > 95 ? 'SAFE' : 'WARNING'}>
                {std.complianceScore}% COMPLIANT
              </Badge>
            </div>

            <h3 className="text-sm font-bold text-slate-100">{std.name}</h3>
            <p className="text-[11px] text-slate-400 font-mono">Governing Body: {std.governingBody}</p>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs font-mono text-slate-300">
              <span>Total Rules: <strong>{std.totalRules}</strong></span>
              <span>Violations: <strong className={std.activeViolations > 0 ? 'text-red-400' : 'text-emerald-400'}>{std.activeViolations}</strong></span>
            </div>
          </Card>
        ))}
      </div>

      {/* Cryptographic Audit Ledger Table */}
      <Card variant="default" title="CRYPTOGRAPHIC IMMUTABLE EVENT LEDGER (SHA-256 CHAIN)">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Seq #</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Actor / Agent</th>
                <th className="py-2.5 px-3">Event Type</th>
                <th className="py-2.5 px-3">Action Summary</th>
                <th className="py-2.5 px-3 text-right">Cryptographic Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {MOCK_AUDIT_LOGS.map((log) => (
                <tr key={log.entryId} className="hover:bg-slate-850">
                  <td className="py-3 px-3 text-brand-cyan font-bold">#{log.sequenceNumber}</td>
                  <td className="py-3 px-3 text-slate-400">{log.timestamp}</td>
                  <td className="py-3 px-3 text-slate-200 font-bold">{log.actorName}</td>
                  <td className="py-3 px-3">
                    <Badge variant={log.eventType.includes('REJECT') ? 'CRITICAL' : 'info'} size="sm">
                      {log.eventType}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-slate-300 max-w-xs truncate">{log.actionSummary}</td>
                  <td className="py-3 px-3 text-right font-mono text-[10px] text-emerald-400 truncate max-w-[140px]" title={log.currentHash}>
                    {log.currentHash.substring(0, 16)}...
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
