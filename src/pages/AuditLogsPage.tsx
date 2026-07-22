import React from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { MOCK_AUDIT_LOGS } from '../services/mockData';
import { History, Lock, ShieldCheck } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 uppercase tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-brand-cyan" /> Cryptographic Tamper-Proof Audit Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            SHA-256 Chained Event Blocks • Immutable Safety Decision Records • Legal Chain of Custody
          </p>
        </div>
        <Badge variant="SAFE" pulse>
          LEDGER INTEGRITY VERIFIED
        </Badge>
      </div>

      <Card variant="default" title="SYSTEM EVENT BLOCKCHAIN LEDGER">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Sequence</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Actor / Principal</th>
                <th className="py-2.5 px-3">Event Type</th>
                <th className="py-2.5 px-3">Action Details</th>
                <th className="py-2.5 px-3 text-right">Cryptographic SHA-256 Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {MOCK_AUDIT_LOGS.map((log) => (
                <tr key={log.entryId} className="hover:bg-slate-850">
                  <td className="py-3 px-3 text-brand-blue font-bold">#{log.sequenceNumber}</td>
                  <td className="py-3 px-3 text-slate-400">{log.timestamp}</td>
                  <td className="py-3 px-3 text-slate-200 font-bold">{log.actorName}</td>
                  <td className="py-3 px-3">
                    <Badge variant={log.eventType.includes('REJECT') ? 'CRITICAL' : 'info'} size="sm">
                      {log.eventType}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-slate-300 max-w-sm">{log.actionSummary}</td>
                  <td className="py-3 px-3 text-right font-mono text-[10px] text-emerald-400 truncate max-w-[160px]" title={log.currentHash}>
                    {log.currentHash}
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
