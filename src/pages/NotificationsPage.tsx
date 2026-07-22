import React from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Bell, ShieldAlert, Zap, CheckCircle2 } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 uppercase tracking-tight flex items-center gap-2">
            <Bell className="w-5 h-5 text-brand-red" /> Safety Alert & Escalation Notification Center
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Real-Time Push Escalations • Field Officer Dispatches • System Warnings
          </p>
        </div>
      </div>

      <Card variant="default" className="space-y-3">
        <div className="space-y-2">
          <div className="p-3.5 bg-red-950/40 border border-red-800 rounded-md flex items-start justify-between">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-slate-100 font-mono">CRITICAL COMPOUND RISK DETECTED (96%)</div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Zone B4 LEL Gas sensor G-104 reading 22.4% overlapping with requested Hot Work Permit PTW-8409.
                </p>
                <span className="text-[10px] text-slate-400 font-mono block mt-1">10 minutes ago • Auto-Dispatched to Karan Mehta</span>
              </div>
            </div>
            <Badge variant="CRITICAL">ACTION REQUIRED</Badge>
          </div>

          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-md flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-slate-100 font-mono">ASSET VIBRATION SPECTRAL ANOMALY</div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Hydrocracker Charge Pump P-102 vibration increased from 2.1mm/s to 8.4mm/s.
                </p>
                <span className="text-[10px] text-slate-400 font-mono block mt-1">25 minutes ago</span>
              </div>
            </div>
            <Badge variant="WARNING">WARNING</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
};
