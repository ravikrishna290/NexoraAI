import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('karan.mehta@nexora.ai');
  const [password, setPassword] = useState('••••••••••••');
  const [role, setRole] = useState('SAFETY_OFFICER');
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, role);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-6 relative overflow-hidden select-none">
      {/* Background Animated Industrial Topology Grid */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#3B82F6 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />

      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center z-10">
        {/* Left Branding Panel (6 Cols) */}
        <div className="md:col-span-6 space-y-6 text-left">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-brand-blue flex items-center justify-center text-white shadow-xl shadow-blue-500/30 border border-blue-400/30">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-wider">NEXORA</h1>
              <span className="text-xs font-mono text-brand-cyan tracking-widest uppercase font-semibold">
                Industrial Safety Intelligence Platform
              </span>
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed font-sans">
            Enterprise Industrial Safety Platform synthesizing real-time telemetry across SCADA, IoT, Work Permits, CCTV, and SOP Regulations into Compound Risk Intelligence for zero-harm operations.
          </p>

          <div className="space-y-2.5 font-mono text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Multi-Agent Neural-Symbolic Reasoning Engine</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Explainable AI (XAI) 4-Question Decision Lineage</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Cryptographic SHA-256 Tamper-Proof Audit Ledger</span>
            </div>
          </div>
        </div>

        {/* Right Authentication Card (6 Cols) */}
        <div className="md:col-span-6 glass-panel-elevated p-8 rounded-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-xl font-bold text-slate-100">Enterprise Authentication</h2>
            <p className="text-xs text-slate-400 mt-1">Sign in with your organization credentials or SSO</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5 font-mono">
                WORK EMAIL / IDENTITY
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-100 pl-9 pr-4 py-2.5 rounded-md focus:outline-none focus:border-brand-blue"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5 font-mono">
                PASSWORD
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-100 pl-9 pr-4 py-2.5 rounded-md focus:outline-none focus:border-brand-blue"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5 font-mono">
                ENTERPRISE ROLE AUTHORIZATION
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-100 px-3 py-2.5 rounded-md focus:outline-none focus:border-brand-blue cursor-pointer"
              >
                <option value="SAFETY_OFFICER">Chief EHS / Safety Officer</option>
                <option value="PLANT_MANAGER">Plant General Manager</option>
                <option value="MAINTENANCE_ENGINEER">Lead Maintenance Engineer</option>
                <option value="SYSTEM_ADMIN">System Administrator</option>
              </select>
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full mt-2" icon={<ArrowRight className="w-4 h-4" />}>
              AUTHORIZE & ENTER PLATFORM
            </Button>
          </form>

          <div className="pt-2 text-center border-t border-slate-800">
            <span className="text-[11px] font-mono text-slate-500">
              SAML 2.0 / Azure AD Single Sign-On Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
