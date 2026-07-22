import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Settings, Sliders, ShieldCheck, Database, Cpu } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 uppercase tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-400" /> Platform Configuration & AI Calibration
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Multi-Agent Swarm Weights • Telemetry Adapter Settings • Role-Based Access Control (RBAC)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card variant="elevated" title="MULTI-AGENT SWARM WEIGHT CALIBRATION">
          <div className="space-y-3 font-mono text-xs">
            <div className="space-y-1">
              <label className="text-slate-300 flex justify-between">
                <span>SensorAgent Weight (SCADA/IoT):</span>
                <strong className="text-brand-cyan">0.35 (35%)</strong>
              </label>
              <input type="range" min="0" max="1" step="0.05" defaultValue="0.35" className="w-full accent-brand-blue" />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 flex justify-between">
                <span>PermitAgent Weight (Work Authorization):</span>
                <strong className="text-brand-cyan">0.28 (28%)</strong>
              </label>
              <input type="range" min="0" max="1" step="0.05" defaultValue="0.28" className="w-full accent-brand-blue" />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 flex justify-between">
                <span>MaintenanceAgent Weight (Asset Health):</span>
                <strong className="text-brand-cyan">0.16 (16%)</strong>
              </label>
              <input type="range" min="0" max="1" step="0.05" defaultValue="0.16" className="w-full accent-brand-blue" />
            </div>

            <Button variant="primary" size="sm" className="mt-2">
              SAVE AGENT WEIGHTS
            </Button>
          </div>
        </Card>

        <Card variant="default" title="SCADA & TELEMETRY STREAM ADAPTERS">
          <div className="space-y-2 font-mono text-xs">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded flex justify-between items-center">
              <div>
                <strong className="text-slate-200 block">OPC-UA Refinery Gateway</strong>
                <span className="text-[10px] text-slate-400">Endpoint: opc.tcp://10.142.8.10:4840</span>
              </div>
              <span className="text-emerald-400 font-bold">CONNECTED</span>
            </div>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded flex justify-between items-center">
              <div>
                <strong className="text-slate-200 block">MQTT Gas Telemetry Stream</strong>
                <span className="text-[10px] text-slate-400">Broker: tls://mqtt.nexora.internal:8883</span>
              </div>
              <span className="text-emerald-400 font-bold">CONNECTED</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
