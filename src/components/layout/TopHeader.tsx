import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useRiskStore } from '../../store/useRiskStore';
import { Factory, Search, Bell, ShieldAlert, Cpu, Bot, Sparkles, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';

interface TopHeaderProps {
  onOpenCopilot: () => void;
  onOpenThinkingModal: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onOpenCopilot, onOpenThinkingModal }) => {
  const { user, selectedPlant, setSelectedPlant } = useAuthStore();
  const { activeAssessment } = useRiskStore();
  const navigate = useNavigate();

  const isCritical = activeAssessment.compoundRiskScore > 75;

  return (
    <header className="h-16 bg-slate-900/95 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
      {/* Left: Plant Switcher & Global Search */}
      <div className="flex items-center gap-4">
        {/* Plant Selector */}
        <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-md">
          <Factory className="w-4 h-4 text-brand-cyan" />
          <select
            value={selectedPlant}
            onChange={(e) => setSelectedPlant(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="Refinery Alpha (Gujarat Complex)" className="bg-slate-900 text-slate-200">
              Refinery Alpha — Hydrocracker Unit 2
            </option>
            <option value="Chemical Unit Beta" className="bg-slate-900 text-slate-200">
              Chemical Unit Beta — Olefins Plant
            </option>
          </select>
        </div>

        {/* AI Experience Trigger Buttons */}
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenThinkingModal}
          icon={<Cpu className="w-3.5 h-3.5 text-brand-cyan animate-pulse" />}
          className="border-brand-blue/50 text-brand-blue hover:bg-brand-blue/20 hidden md:inline-flex"
        >
          AI Thinking Mode
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onOpenCopilot}
          icon={<Bot className="w-3.5 h-3.5 text-brand-cyan" />}
          className="hidden lg:inline-flex"
        >
          AI Copilot
        </Button>
      </div>

      {/* Center: Global Active Risk Alert Banner */}
      {isCritical && (
        <button
          onClick={() => navigate('/compound-risk')}
          className="hidden 2xl:flex items-center gap-2 bg-red-950/80 border border-red-700/90 text-red-300 px-3 py-1 rounded-md text-xs font-semibold alert-pulse-critical hover:bg-red-900/90 transition-all cursor-pointer truncate max-w-md"
        >
          <ShieldAlert className="w-4 h-4 text-red-400 animate-bounce flex-shrink-0" />
          <span className="truncate">COMPOUND RISK ALERT: <strong>{activeAssessment.compoundRiskScore}% CRITICAL</strong> in {activeAssessment.zoneName}</span>
          <span className="bg-red-900/90 text-white px-2 py-0.5 rounded font-mono text-[10px] uppercase flex-shrink-0">View XAI Diagnosis →</span>
        </button>
      )}

      {/* Right: Notifications & User Profile */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-all"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-red animate-ping" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-red" />
        </button>

        <div className="h-5 w-px bg-slate-800" />

        {/* User Info & Badge */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-brand-blue font-bold text-xs">
            {user?.name ? user.name.split(' ').map((n) => n[0]).join('') : 'KM'}
          </div>
          <div className="hidden sm:block">
            <span className="text-xs font-semibold text-slate-200 block -mb-0.5">{user?.name}</span>
            <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-emerald-400" /> {user?.role}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
