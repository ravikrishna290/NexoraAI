import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FileText, Download, FileSpreadsheet, ShieldCheck } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 uppercase tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-cyan" /> Automated Executive Safety Reports
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            One-Click PDF/Excel Audit Exports • OISD Scorecards • Shift Risk Summaries
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card variant="elevated" className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-950 text-brand-blue rounded border border-blue-800">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Executive Shift Risk & Compound Audit (PDF)</h3>
              <p className="text-xs text-slate-400">Includes 4-question XAI explanations and regulatory compliance lineage</p>
            </div>
          </div>
          <Button variant="primary" size="md" className="w-full" icon={<Download className="w-4 h-4" />}>
            GENERATE PDF AUDIT REPORT
          </Button>
        </Card>

        <Card variant="default" className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-950 text-emerald-400 rounded border border-emerald-800">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Raw SCADA Telemetry & Permit Log (XLSX)</h3>
              <p className="text-xs text-slate-400">Full raw dataset export for industrial safety auditors</p>
            </div>
          </div>
          <Button variant="secondary" size="md" className="w-full" icon={<Download className="w-4 h-4" />}>
            EXPORT EXCEL TELEMETRY DATA
          </Button>
        </Card>
      </div>
    </div>
  );
};
