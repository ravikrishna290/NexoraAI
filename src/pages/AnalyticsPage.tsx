import React from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { BarChart3, TrendingUp, Activity, ShieldAlert } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const MOCK_RISK_TREND_DATA = [
  { time: '08:00', riskScore: 18, gasLel: 2.1 },
  { time: '10:00', riskScore: 24, gasLel: 3.4 },
  { time: '12:00', riskScore: 32, gasLel: 4.8 },
  { time: '14:00', riskScore: 48, gasLel: 11.2 },
  { time: '16:00', riskScore: 96, gasLel: 22.4 },
  { time: '17:00', riskScore: 96, gasLel: 22.4 },
];

const MOCK_PERMIT_DISTRIBUTION = [
  { category: 'Hot Work', count: 8 },
  { category: 'Confined Space', count: 4 },
  { category: 'Height Work', count: 3 },
  { category: 'Electrical', count: 3 },
];

export const AnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 uppercase tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-brand-blue" /> Predictive Operational Analytics & Trends
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Historical Telemetry Velocity • Risk Trend Curves • Machine Degradation Profiling
          </p>
        </div>
        <Badge variant="info">24-HOUR TIME HARVEST</Badge>
      </div>

      {/* Analytics Charts Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Line Chart: Risk Velocity & Gas LEL Trend (8 Cols) */}
        <div className="lg:col-span-8">
          <Card variant="elevated" title="24-HOUR COMPOUND RISK & GAS LEL TREND CURVE">
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MOCK_RISK_TREND_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="time" stroke="#64748B" fontSize={11} fontFamily="monospace" />
                  <YAxis stroke="#64748B" fontSize={11} fontFamily="monospace" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '6px', fontSize: '12px' }}
                  />
                  <Line type="monotone" dataKey="riskScore" stroke="#EF4444" strokeWidth={3} name="Compound Risk %" />
                  <Line type="monotone" dataKey="gasLel" stroke="#F59E0B" strokeWidth={2} name="Gas LEL %" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Bar Chart: Active Permit Category Distribution (4 Cols) */}
        <div className="lg:col-span-4">
          <Card variant="default" title="PERMIT TYPE DISTRIBUTION">
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MOCK_PERMIT_DISTRIBUTION}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="category" stroke="#64748B" fontSize={10} fontFamily="monospace" />
                  <YAxis stroke="#64748B" fontSize={11} fontFamily="monospace" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '6px', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
