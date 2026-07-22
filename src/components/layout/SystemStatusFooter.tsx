import React, { useState, useEffect } from 'react';
import { Radio, Database, Activity, Lock } from 'lucide-react';

export const SystemStatusFooter: React.FC = () => {
  const [latency, setLatency] = useState(42);
  const [eventCount, setEventCount] = useState(1420);

  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(38 + Math.floor(Math.random() * 12));
      setEventCount((prev) => prev + Math.floor(Math.random() * 5));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="h-8 bg-slate-950 border-t border-slate-800/80 px-4 text-[11px] font-mono text-slate-400 flex items-center justify-between z-10">
      {/* Left: Connection Indicators */}
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5 text-emerald-400">
          <Radio className="w-3 h-3 animate-pulse" />
          <span>WebSocket: CONNECTED ({latency}ms)</span>
        </span>
        <span className="hidden sm:flex items-center gap-1.5">
          <Database className="w-3 h-3 text-brand-cyan" />
          <span>OPC-UA Engine: ACTIVE</span>
        </span>
        <span className="hidden md:flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-brand-blue" />
          <span>Stream Velocity: {eventCount.toLocaleString()} events/sec</span>
        </span>
      </div>

      {/* Right: Security & Cryptographic Ledger Status */}
      <div className="flex items-center gap-4">
        <span className="hidden lg:flex items-center gap-1 text-slate-400">
          <Lock className="w-3 h-3 text-emerald-400" />
          <span>Immutable Ledger: Hash Verified (#14209)</span>
        </span>
        <span className="text-slate-400 font-semibold">NEXORA INDUSTRIAL AI</span>
      </div>
    </footer>
  );
};
