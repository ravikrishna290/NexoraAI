import React, { useState, useEffect, useRef } from 'react';
import { useTwinStore } from '../../store/useTwinStore';
import { useDatasetStore } from '../../store/useDatasetStore';
import { CAMERA_CONFIG } from '../../services/datasetService';
import { Badge } from '../ui/Badge';
import {
  Cpu,
  User,
  Flame,
  Activity,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Layers,
  Thermometer,
  Wind,
  Camera,
} from 'lucide-react';

// ─────────────────────────────────────────────
// Live telemetry data (ticks every 2 seconds)
// ─────────────────────────────────────────────
function useLiveTelemetry() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 2000);
    return () => clearInterval(id);
  }, []);

  const noise = (base: number, amp: number) =>
    +(base + (Math.random() - 0.5) * amp).toFixed(1);

  return {
    gasLel: noise(22.4, 1.2),          // % LEL — CRITICAL
    pressure: noise(142.8, 3.0),       // Bar
    temperature: noise(387, 4),        // °C
    vibrationP102: noise(8.4, 0.6),    // mm/s
    vibrationP201: noise(2.1, 0.3),    // mm/s — normal
    flowF301: noise(14.2, 0.8),        // m³/hr
    tempHX101: noise(312, 6),          // °C heat exchanger outlet
    pressV401: noise(8.4, 0.5),        // Bar separator vessel
    tick,
  };
}

/** Camera symbol with animated alert beacon */
const CameraSymbol: React.FC<{
  cx: number; cy: number; label: string; alert: any; onClick?: () => void;
}> = ({ cx, cy, label, alert, onClick }) => {
  const isAlert = Boolean(alert);
  const color = isAlert ? '#EF4444' : '#3B82F6';
  return (
    <g className="cursor-pointer" onClick={onClick}>
      {isAlert && (
        <circle cx={cx} cy={cy} r="16" fill="none" stroke="#EF4444" strokeWidth="1.5">
          <animate attributeName="r" values="10;22;10" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.8;0;0.8" dur="1.5s" repeatCount="indefinite" />
        </circle>
      )}
      <rect x={cx - 10} y={cy - 7} width="20" height="14" rx="3" fill="#0F172A" stroke={color} strokeWidth="1.5" />
      <polygon points={`${cx + 10},${cy - 4} ${cx + 16},${cy - 7} ${cx + 16},${cy + 7} ${cx + 10},${cy + 4}`} fill={color} />
      <circle cx={cx - 2} cy={cy} r="3" fill={color} />
      <text x={cx} y={cy + 18} textAnchor="middle" fill={color} fontSize="8" fontFamily="monospace" fontWeight="bold">{label}</text>
    </g>
  );
};

// ─────────────────────────────────────────────
// Shared P&ID drawing primitives
// ─────────────────────────────────────────────

/** Centrifugal pump symbol (circle + small triangle) */
const PumpSymbol: React.FC<{
  cx: number; cy: number; r?: number;
  label: string; value: string; status: 'OK' | 'WARN' | 'CRIT';
  onClick?: () => void;
}> = ({ cx, cy, r = 18, label, value, status, onClick }) => {
  const colors = { OK: '#10B981', WARN: '#F59E0B', CRIT: '#EF4444' };
  const color = colors[status];
  return (
    <g className="cursor-pointer" onClick={onClick}>
      {/* Vibration pulse ring for critical */}
      {status === 'CRIT' && (
        <circle cx={cx} cy={cy} r={r + 8} fill="none" stroke={color} strokeWidth="1" opacity="0.5">
          <animate attributeName="r" values={`${r + 4};${r + 16};${r + 4}`} dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
        </circle>
      )}
      <circle cx={cx} cy={cy} r={r} fill="#1E293B" stroke={color} strokeWidth="2" />
      {/* Impeller blades */}
      <line x1={cx} y1={cy - r + 4} x2={cx} y2={cy + r - 4} stroke={color} strokeWidth="1.5" />
      <line x1={cx - r + 4} y1={cy} x2={cx + r - 4} y2={cy} stroke={color} strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r="4" fill={color} />
      {/* Labels */}
      <text x={cx} y={cy + r + 13} textAnchor="middle" fill={color} fontSize="9" fontFamily="monospace" fontWeight="bold">{label}</text>
      <text x={cx} y={cy + r + 24} textAnchor="middle" fill="#94A3B8" fontSize="8" fontFamily="monospace">{value}</text>
    </g>
  );
};

/** Pressure vessel / separator drum (vertical cylinder) */
const VesselSymbol: React.FC<{
  x: number; y: number; w?: number; h?: number;
  label: string; value: string; status: 'OK' | 'WARN' | 'CRIT';
}> = ({ x, y, w = 36, h = 60, label, value, status }) => {
  const colors = { OK: '#10B981', WARN: '#F59E0B', CRIT: '#EF4444' };
  const color = colors[status];
  return (
    <g>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx="5" fill="#1E293B" stroke={color} strokeWidth="1.5" />
      {/* Dome cap top */}
      <ellipse cx={x} cy={y - h / 2} rx={w / 2} ry="6" fill="#0F172A" stroke={color} strokeWidth="1.5" />
      {/* Fill level indicator */}
      <rect x={x - w / 2 + 2} y={y} width={w - 4} height={h / 2 - 2} rx="3" fill={`${color}20`} />
      <text x={x} y={y + h / 2 + 14} textAnchor="middle" fill={color} fontSize="9" fontFamily="monospace" fontWeight="bold">{label}</text>
      <text x={x} y={y + h / 2 + 25} textAnchor="middle" fill="#94A3B8" fontSize="8" fontFamily="monospace">{value}</text>
    </g>
  );
};

/** Heat exchanger (two overlapping rectangles) */
const HeatExchangerSymbol: React.FC<{
  cx: number; cy: number;
  label: string; value: string; status: 'OK' | 'WARN' | 'CRIT';
}> = ({ cx, cy, label, value, status }) => {
  const colors = { OK: '#10B981', WARN: '#F59E0B', CRIT: '#EF4444' };
  const color = colors[status];
  return (
    <g>
      <rect x={cx - 30} y={cy - 14} width="60" height="28" rx="4" fill="#1E293B" stroke={color} strokeWidth="1.5" />
      <rect x={cx - 20} y={cy - 14} width="40" height="28" rx="2" fill="#0F172A" stroke={color} strokeWidth="1" strokeDasharray="3" />
      {/* Zigzag heat transfer lines */}
      <polyline points={`${cx - 15},${cy - 6} ${cx - 5},${cy + 6} ${cx + 5},${cy - 6} ${cx + 15},${cy + 6}`}
        fill="none" stroke={color} strokeWidth="1.5" />
      <text x={cx} y={cy + 24} textAnchor="middle" fill={color} fontSize="9" fontFamily="monospace" fontWeight="bold">{label}</text>
      <text x={cx} y={cy + 34} textAnchor="middle" fill="#94A3B8" fontSize="8" fontFamily="monospace">{value}</text>
    </g>
  );
};

/** Control valve (bowtie shape) */
const ValveSymbol: React.FC<{
  cx: number; cy: number; open: boolean; label: string;
}> = ({ cx, cy, open, label }) => {
  const color = open ? '#10B981' : '#EF4444';
  return (
    <g className="cursor-pointer">
      <polygon points={`${cx - 10},${cy - 8} ${cx + 10},${cy - 8} ${cx},${cy}`} fill={color} opacity="0.8" />
      <polygon points={`${cx - 10},${cy + 8} ${cx + 10},${cy + 8} ${cx},${cy}`} fill={color} opacity="0.8" />
      <line x1={cx} y1={cy - 14} x2={cx} y2={cy - 8} stroke={color} strokeWidth="2" />
      <circle cx={cx} cy={cy - 17} r="4" fill="none" stroke={color} strokeWidth="1.5" />
      <text x={cx} y={cy + 20} textAnchor="middle" fill={color} fontSize="8" fontFamily="monospace">{label}</text>
      <text x={cx} y={cy + 29} textAnchor="middle" fill="#64748B" fontSize="7" fontFamily="monospace">
        {open ? 'OPEN' : 'CLOSED'}
      </text>
    </g>
  );
};

/** Gas sensor node (diamond shape with blinking critical state) */
const GasSensorSymbol: React.FC<{
  cx: number; cy: number; label: string; value: string; status: 'OK' | 'WARN' | 'CRIT';
}> = ({ cx, cy, label, value, status }) => {
  const colors = { OK: '#10B981', WARN: '#F59E0B', CRIT: '#EF4444' };
  const color = colors[status];
  const size = 12;
  const points = `${cx},${cy - size} ${cx + size},${cy} ${cx},${cy + size} ${cx - size},${cy}`;
  return (
    <g>
      {status === 'CRIT' && (
        <polygon points={points} fill={color} opacity="0.2">
          <animate attributeName="opacity" values="0.1;0.4;0.1" dur="1s" repeatCount="indefinite" />
        </polygon>
      )}
      <polygon points={points} fill="#1E293B" stroke={color} strokeWidth="2" />
      <text x={cx} y={cy + 3} textAnchor="middle" fill={color} fontSize="7" fontFamily="monospace" fontWeight="bold">AT</text>
      <text x={cx} y={cy + size + 12} textAnchor="middle" fill={color} fontSize="8" fontFamily="monospace" fontWeight="bold">{label}</text>
      <text x={cx} y={cy + size + 22} textAnchor="middle" fill="#F8FAFC" fontSize="8" fontFamily="monospace">{value}</text>
    </g>
  );
};

/** Worker indicator (person icon) */
const WorkerNode: React.FC<{
  cx: number; cy: number; label: string; inHazard?: boolean;
}> = ({ cx, cy, label, inHazard }) => {
  const color = inHazard ? '#EF4444' : '#10B981';
  return (
    <g>
      {inHazard && (
        <circle cx={cx} cy={cy} r="16" fill="none" stroke="#EF4444" strokeWidth="1" strokeDasharray="3">
          <animate attributeName="r" values="14;20;14" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite" />
        </circle>
      )}
      {/* Head */}
      <circle cx={cx} cy={cy - 8} r="6" fill="#1E293B" stroke={color} strokeWidth="2" />
      {/* Body */}
      <line x1={cx} y1={cy - 2} x2={cx} y2={cy + 8} stroke={color} strokeWidth="2" />
      {/* Arms */}
      <line x1={cx - 7} y1={cy + 2} x2={cx + 7} y2={cy + 2} stroke={color} strokeWidth="2" />
      {/* Legs */}
      <line x1={cx} y1={cy + 8} x2={cx - 5} y2={cy + 16} stroke={color} strokeWidth="2" />
      <line x1={cx} y1={cy + 8} x2={cx + 5} y2={cy + 16} stroke={color} strokeWidth="2" />
      <text x={cx} y={cy + 28} textAnchor="middle" fill={color} fontSize="8" fontFamily="monospace" fontWeight="bold">{label}</text>
    </g>
  );
};

/** Animated pipe flow segment */
const FlowPipe: React.FC<{
  d: string; color?: string; flow?: boolean; dashed?: boolean;
}> = ({ d, color = '#3B82F6', flow = true, dashed = false }) => (
  <g>
    <path d={d} stroke="#1E293B" strokeWidth="6" fill="none" />
    <path d={d} stroke={color} strokeWidth="3" fill="none" strokeDasharray={dashed ? '4 4' : undefined} />
    {flow && (
      <path d={d} stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" fill="none" strokeDasharray="6 12">
        <animate attributeName="stroke-dashoffset" from="18" to="0" dur="1.2s" repeatCount="indefinite" />
      </path>
    )}
  </g>
);

/** Live telemetry readout badge on canvas */
const TelemetryTag: React.FC<{
  x: number; y: number; label: string; value: string;
  unit: string; status: 'OK' | 'WARN' | 'CRIT';
}> = ({ x, y, label, value, unit, status }) => {
  const bg = { OK: '#064E3B', WARN: '#78350F', CRIT: '#7F1D1D' };
  const border = { OK: '#10B981', WARN: '#F59E0B', CRIT: '#EF4444' };
  const text = { OK: '#10B981', WARN: '#F59E0B', CRIT: '#EF4444' };
  return (
    <g>
      <rect x={x} y={y} width="72" height="32" rx="4" fill={bg[status]} stroke={border[status]} strokeWidth="1" />
      <text x={x + 4} y={y + 12} fill="#94A3B8" fontSize="8" fontFamily="monospace">{label}</text>
      <text x={x + 4} y={y + 25} fill={text[status]} fontSize="11" fontFamily="monospace" fontWeight="bold">
        {value} <tspan fontSize="8" fill="#94A3B8">{unit}</tspan>
      </text>
    </g>
  );
};

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export const DigitalTwinCanvas: React.FC = () => {
  const { twinState, toggleLayer } = useTwinStore();
  const { cameraAlerts } = useDatasetStore();
  const tel = useLiveTelemetry();

  const [selectedAsset, setSelectedAsset] = useState<{ id: string; desc: string } | null>(null);
  const [zoom, setZoom] = useState(1);

  const gasStatus: 'OK' | 'WARN' | 'CRIT' = tel.gasLel > 20 ? 'CRIT' : tel.gasLel > 10 ? 'WARN' : 'OK';
  const p102Status: 'OK' | 'WARN' | 'CRIT' = tel.vibrationP102 > 7 ? 'CRIT' : tel.vibrationP102 > 4.5 ? 'WARN' : 'OK';
  const tempStatus: 'OK' | 'WARN' | 'CRIT' = tel.temperature > 400 ? 'CRIT' : tel.temperature > 380 ? 'WARN' : 'OK';

  return (
    <div className="relative w-full bg-navy-950 rounded-lg border border-slate-800 overflow-hidden flex flex-col shadow-2xl">
      {/* ── Toolbar ── */}
      <div className="h-12 bg-slate-900/95 border-b border-slate-800 px-4 flex items-center justify-between z-10 flex-shrink-0 gap-3">
        {/* Left: Unit Title + Non-wrapping Compact Hazard Badge */}
        <div className="flex items-center gap-2.5 flex-shrink-0 min-w-0">
          <Cpu className="w-4 h-4 text-brand-cyan animate-pulse flex-shrink-0" />
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono whitespace-nowrap truncate">
            LIVING DIGITAL TWIN — {twinState.activeUnit}
          </span>
          <Badge variant="CRITICAL" size="sm" pulse className="whitespace-nowrap flex-shrink-0">
            ZONE B4: {tel.gasLel}% LEL
          </Badge>
        </div>

        {/* Right side: Layer toggles & zoom controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Layer toggles */}
          <div className="flex items-center gap-1 text-xs">
            {[
              { key: 'sensors', label: 'Sensors', icon: Activity, activeClass: 'bg-blue-950 text-blue-300 border-blue-700' },
              { key: 'cctv', label: 'Vision AI', icon: Camera, activeClass: 'bg-purple-950 text-purple-300 border-purple-700' },
              { key: 'workers', label: 'Workers', icon: User, activeClass: 'bg-emerald-950 text-emerald-300 border-emerald-700' },
              { key: 'permits', label: 'Hot Work', icon: Flame, activeClass: 'bg-amber-950 text-amber-300 border-amber-700' },
            ].map(({ key, label, icon: Icon, activeClass }) => (
              <button
                key={key}
                onClick={() => toggleLayer(key as any)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono border transition-all flex items-center gap-1 ${
                  (twinState.activeLayers as any)[key]
                    ? activeClass
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3 h-3" /> {label}
              </button>
            ))}
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 pl-2 border-l border-slate-800">
            <button onClick={() => setZoom((z) => Math.min(z + 0.15, 1.8))} className="p-1 text-slate-400 hover:text-white bg-slate-800 rounded" title="Zoom In"><ZoomIn className="w-3 h-3" /></button>
            <button onClick={() => setZoom((z) => Math.max(z - 0.15, 0.6))} className="p-1 text-slate-400 hover:text-white bg-slate-800 rounded" title="Zoom Out"><ZoomOut className="w-3 h-3" /></button>
            <button onClick={() => setZoom(1)} className="p-1 text-slate-400 hover:text-white bg-slate-800 rounded" title="Reset Zoom"><RefreshCw className="w-3 h-3" /></button>
            <span className="text-[9px] font-mono text-slate-500 hidden sm:inline">{Math.round(zoom * 100)}%</span>
          </div>
        </div>
      </div>

      {/* ── Main SVG P&ID Canvas ── */}
      <div className="relative overflow-hidden" style={{ height: 540 }}>
        {/* Engineering dot grid background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.12]"
          style={{
            backgroundImage: 'radial-gradient(circle, #3B82F6 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Expanding gas hazard overlay */}
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            left: 430, top: 160,
            width: 280, height: 280,
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(239,68,68,0.18) 0%, rgba(245,158,11,0.08) 50%, transparent 75%)',
            animation: 'ping 4s cubic-bezier(0,0,0.2,1) infinite',
          }}
        />

        <svg
          viewBox="0 0 960 520"
          className="w-full h-full"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', transition: 'transform 0.2s ease' }}
        >
          <defs>
            {/* Flow gradient for process lines */}
            <linearGradient id="pipeBlue" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1E3A5F" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
            <linearGradient id="pipeRed" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4B0000" />
              <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>
            {/* Gas cloud gradient */}
            <radialGradient id="gasCloud" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.55" />
              <stop offset="45%" stopColor="#F59E0B" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* ════ ZONE BACKGROUNDS ════ */}

          {/* Zone A1 — Distillation (SAFE) */}
          <rect x="20" y="20" width="240" height="480" rx="8" fill="rgba(16,185,129,0.04)" stroke="#10B981" strokeWidth="1.5" strokeDasharray="6 3" />
          <text x="35" y="44" fill="#10B981" fontSize="11" fontFamily="monospace" fontWeight="bold">ZONE A1: DISTILLATION</text>
          <text x="35" y="58" fill="#475569" fontSize="9" fontFamily="monospace">Status: SAFE  ■ LEL 0.8%</text>

          {/* Zone B4 — Reactor Feed (CRITICAL) */}
          <rect x="285" y="20" width="400" height="480" rx="8" fill="rgba(239,68,68,0.07)" stroke="#EF4444" strokeWidth="2">
            <animate attributeName="stroke-opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
          </rect>
          <text x="300" y="44" fill="#EF4444" fontSize="11" fontFamily="monospace" fontWeight="bold">ZONE B4: REACTOR FEED (CRITICAL HAZARD)</text>
          <text x="300" y="58" fill="#F8FAFC" fontSize="9" fontFamily="monospace" fontWeight="bold">
            ▲ LEL {tel.gasLel}%  ▲ Vibration {tel.vibrationP102}mm/s  ▲ Hot Work Requested
          </text>

          {/* Expanding Gas Cloud over Zone B4 */}
          <circle cx="490" cy="240" r="130" fill="url(#gasCloud)">
            <animate attributeName="r" values="100;145;100" dur="5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0.85;0.5" dur="5s" repeatCount="indefinite" />
          </circle>
          {/* Rotating hazard dashed ring */}
          <circle cx="490" cy="240" r="140" fill="none" stroke="#EF4444" strokeWidth="1" strokeDasharray="8 6" opacity="0.5">
            <animateTransform attributeName="transform" type="rotate" from="0 490 240" to="360 490 240" dur="25s" repeatCount="indefinite" />
          </circle>

          {/* Zone C2 — Separator (WARNING) */}
          <rect x="710" y="20" width="230" height="480" rx="8" fill="rgba(245,158,11,0.04)" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="6 3" />
          <text x="725" y="44" fill="#F59E0B" fontSize="11" fontFamily="monospace" fontWeight="bold">ZONE C2: SEPARATOR</text>
          <text x="725" y="58" fill="#475569" fontSize="9" fontFamily="monospace">Status: WARNING  ■ P {tel.pressV401} Bar</text>

          {/* ════ PROCESS PIPEWORK (P&ID lines) ════ */}

          {/* Feed line A1 → B4 (process feed header) */}
          <FlowPipe d="M 170 200 L 285 200" color="#3B82F6" />
          {/* B4 main header */}
          <FlowPipe d="M 285 200 L 690 200" color="#3B82F6" />
          {/* B4 → C2 separator feed */}
          <FlowPipe d="M 690 200 L 710 200" color="#3B82F6" />
          {/* Pump P-102 suction/discharge */}
          <FlowPipe d="M 430 200 L 430 280" color={p102Status === 'CRIT' ? '#EF4444' : '#3B82F6'} />
          <FlowPipe d="M 430 280 L 490 280" color={p102Status === 'CRIT' ? '#EF4444' : '#3B82F6'} />
          {/* HX-101 shell side */}
          <FlowPipe d="M 120 120 L 120 200" color="#10B981" />
          {/* A1 internal recirculation */}
          <FlowPipe d="M 100 300 L 200 300 L 200 340" color="#10B981" dashed />
          {/* Separator to product line */}
          <FlowPipe d="M 790 160 L 790 100 L 900 100" color="#F59E0B" />
          {/* Vent lines (dashed) */}
          <FlowPipe d="M 490 120 L 490 80 L 580 80" color="#64748B" dashed flow={false} />

          {/* ════ EQUIPMENT ════ */}

          {/* HX-101: Feed/Effluent Heat Exchanger (Zone A1) */}
          <HeatExchangerSymbol
            cx={120} cy={120}
            label="HX-101" value={`${tel.tempHX101}°C`}
            status={tel.tempHX101 > 330 ? 'WARN' : 'OK'}
          />

          {/* Pump P-201: Normal recirculation pump (Zone A1) */}
          {twinState.activeLayers.sensors || true ? (
            <PumpSymbol
              cx={150} cy={310} label="P-201" value={`${tel.vibrationP201}mm/s`}
              status="OK"
              onClick={() => setSelectedAsset({ id: 'P-201', desc: 'Recirculation Pump — Normal Operation' })}
            />
          ) : null}

          {/* CRITICAL: Pump P-102 — bearing seal failure (Zone B4) */}
          <PumpSymbol
            cx={430} cy={310} label="P-102" value={`${tel.vibrationP102}mm/s`}
            status={p102Status}
            onClick={() => setSelectedAsset({ id: 'P-102', desc: `Bearing Seal Degradation — ${tel.vibrationP102}mm/s (baseline 2.1mm/s)` })}
          />

          {/* R-301: Reactor / Fractionator (Zone B4) */}
          <VesselSymbol
            x={570} y={230} w={48} h={80}
            label="R-301" value={`${tel.temperature}°C`}
            status={tempStatus}
          />

          {/* V-401: Separator Vessel (Zone C2) */}
          <VesselSymbol
            x={790} y={240} w={44} h={70}
            label="V-401" value={`${tel.pressV401}Bar`}
            status={tel.pressV401 > 9 ? 'WARN' : 'OK'}
          />

          {/* ════ VALVES ════ */}
          {/* Isolation valve on P-102 suction */}
          <ValveSymbol cx={375} cy={200} open={true} label="XV-301" />
          {/* Emergency isolation on B4 feed header */}
          <ValveSymbol cx={550} cy={200} open={false} label="XV-302" />
          {/* Separator product valve */}
          <ValveSymbol cx={850} cy={100} open={true} label="XV-401" />

          {/* ════ GAS SENSORS ════ */}
          {twinState.activeLayers.sensors && (
            <>
              <GasSensorSymbol
                cx={480} cy={130} label="AT-G104" value={`${tel.gasLel}% LEL`}
                status={gasStatus}
              />
              <GasSensorSymbol
                cx={340} cy={130} label="AT-G105" value="0.8% LEL"
                status="OK"
              />
              <GasSensorSymbol
                cx={650} cy={130} label="AT-G201" value="2.1% LEL"
                status="OK"
              />
            </>
          )}

          {/* ════ INLINE TELEMETRY TAGS ════ */}
          {twinState.activeLayers.sensors && (
            <>
              {/* Pressure indicator on reactor */}
              <TelemetryTag x={600} y={155} label="PT-301" value={String(tel.pressure)} unit="Bar" status={tel.pressure > 148 ? 'WARN' : 'OK'} />
              {/* Temperature on reactor feed */}
              <TelemetryTag x={600} y={195} label="TT-302" value={String(tel.temperature)} unit="°C" status={tempStatus} />
              {/* Flow meter on B4 feed header */}
              <TelemetryTag x={370} y={155} label="FT-201" value={String(tel.flowF301)} unit="m³/hr" status="OK" />
            </>
          )}

          {/* ════ WORKERS ════ */}
          {twinState.activeLayers.workers && (
            <>
              <WorkerNode cx={410} cy={380} label="W-804" inHazard={true} />
              <WorkerNode cx={460} cy={390} label="W-809" inHazard={true} />
              <WorkerNode cx={130} cy={380} label="W-302" inHazard={false} />
            </>
          )}

          {/* ════ VISION AI CAMERAS ════ */}
          {twinState.activeLayers.cctv && (
            <>
              {CAMERA_CONFIG.map((cam) => (
                <CameraSymbol
                  key={cam.id}
                  cx={cam.position.x}
                  cy={cam.position.y}
                  label={cam.id}
                  alert={cameraAlerts[cam.id] || null}
                  onClick={() => setSelectedAsset({ id: cam.id, desc: `${cam.name} (${cam.zone}) — AI Vision Feed` })}
                />
              ))}
            </>
          )}

          {/* ════ HOT WORK ZONE BOUNDARY ════ */}
          {twinState.activeLayers.permits && (
            <g>
              <rect x="355" y="240" width="180" height="160" rx="6"
                fill="rgba(245,158,11,0.08)" stroke="#F59E0B" strokeWidth="2" strokeDasharray="6 3">
                <animate attributeName="stroke-opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
              </rect>
              <text x="445" y="264" textAnchor="middle" fill="#F59E0B" fontSize="9" fontFamily="monospace" fontWeight="bold">HOT WORK ZONE</text>
              <text x="445" y="276" textAnchor="middle" fill="#F59E0B" fontSize="8" fontFamily="monospace">PTW-2026-8409 PENDING</text>
            </g>
          )}

          {/* ════ EVACUATION ROUTE ════ */}
          <path d="M 440 400 L 440 470 L 285 470 L 285 500 L 20 500" stroke="#10B981" strokeWidth="2.5" fill="none" strokeDasharray="8 4">
            <animate attributeName="stroke-dashoffset" from="24" to="0" dur="1.2s" repeatCount="indefinite" />
          </path>
          <text x="200" y="495" fill="#10B981" fontSize="9" fontFamily="monospace" fontWeight="bold">◄ EMERGENCY EVACUATION ROUTE</text>

          {/* ════ INSTRUMENT LEGEND TOP RIGHT ════ */}
          <g transform="translate(720, 68)">
            <rect x="0" y="0" width="200" height="80" rx="4" fill="#0F172A" stroke="#334155" strokeWidth="1" />
            <text x="8" y="16" fill="#64748B" fontSize="8" fontFamily="monospace" fontWeight="bold">INSTRUMENT KEY</text>
            <text x="8" y="30" fill="#3B82F6" fontSize="8" fontFamily="monospace">— Process Flow Line</text>
            <text x="8" y="43" fill="#10B981" fontSize="8" fontFamily="monospace">○ Centrifugal Pump</text>
            <text x="8" y="56" fill="#F59E0B" fontSize="8" fontFamily="monospace">◇ Gas Analyser (AT)</text>
            <text x="8" y="69" fill="#EF4444" fontSize="8" fontFamily="monospace">⊠ Bowtie Isolation Valve</text>
          </g>
        </svg>
      </div>

      {/* ── Asset Detail Panel ── */}
      {selectedAsset && (
        <div className="absolute bottom-12 right-4 bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-mono w-64 shadow-2xl z-20">
          <div className="flex justify-between items-start mb-1">
            <span className="font-bold text-slate-100">{selectedAsset.id}</span>
            <button onClick={() => setSelectedAsset(null)} className="text-slate-500 hover:text-white text-[10px]">✕</button>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">{selectedAsset.desc}</p>
        </div>
      )}

      {/* ── Bottom Legend ── */}
      <div className="h-9 bg-slate-900/90 border-t border-slate-800 px-4 flex items-center justify-between text-[11px] font-mono text-slate-400 flex-shrink-0">
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> SAFE</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> WARNING</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500 animate-ping" /> CRITICAL / GAS CLOUD</span>
          <span className="flex items-center gap-1.5"><span className="inline-block w-4 border-t-2 border-dashed border-slate-400" /> Evacuation Route</span>
        </div>
        <span className="text-slate-500 text-[10px]">
          Hydrocracker Unit 2 · P&ID Rev C · SCADA Live Feed · Tick #{tel.tick}
        </span>
      </div>
    </div>
  );
};
