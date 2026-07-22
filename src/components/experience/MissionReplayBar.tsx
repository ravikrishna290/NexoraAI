import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, FastForward, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { useRiskStore } from '../../store/useRiskStore';

export interface TimelineFrame {
  time: string;
  title: string;
  description: string;
  riskScore: number;
  statusLevel: 'SAFE' | 'WARNING' | 'CRITICAL';
  gasLel: number;
  vibration: number;
}

export const INCIDENT_TIMELINE: TimelineFrame[] = [
  { time: '08:00', title: 'Normal Operation', description: 'Plant telemetry normal. LEL 1.2%, Vibration 1.8 mm/s.', riskScore: 12, statusLevel: 'SAFE', gasLel: 1.2, vibration: 1.8 },
  { time: '08:01', title: 'Maintenance Starts', description: 'Technician W-804 arrives at Pump P-102.', riskScore: 18, statusLevel: 'SAFE', gasLel: 1.5, vibration: 2.1 },
  { time: '08:02', title: 'Gas Leak Begins', description: 'Sensor G-104 reads LEL gas rising to 8.4%.', riskScore: 35, statusLevel: 'WARNING', gasLel: 8.4, vibration: 3.2 },
  { time: '08:03', title: 'Worker Enters Zone B4', description: 'Field Worker W-809 enters high-hazard perimeter.', riskScore: 48, statusLevel: 'WARNING', gasLel: 12.0, vibration: 4.5 },
  { time: '08:04', title: 'Hot Work Permit Submitted', description: 'Permit PTW-8409 requested for pipe welding.', riskScore: 65, statusLevel: 'WARNING', gasLel: 16.2, vibration: 6.1 },
  { time: '08:05', title: 'AI Swarm Pattern Match', description: 'IncidentAgent finds 89% match to 2021 Jamnagar explosion.', riskScore: 78, statusLevel: 'CRITICAL', gasLel: 18.5, vibration: 7.2 },
  { time: '08:08', title: 'Compound Risk Peak (96%)', description: 'Sensor G-104 reads 22.4% LEL + Hot Work + Pump Spike.', riskScore: 96, statusLevel: 'CRITICAL', gasLel: 22.4, vibration: 8.4 },
  { time: '08:09', title: '1-Click Permit Rejected', description: 'AI Directive executes automatic permit rejection & SCADA purge.', riskScore: 18, statusLevel: 'SAFE', gasLel: 4.1, vibration: 2.2 },
  { time: '08:10', title: 'Explosion Prevented!', description: 'Zone B4 stabilized. Zero-harm mission accomplished.', riskScore: 8, statusLevel: 'SAFE', gasLel: 1.2, vibration: 1.8 },
];

export const MissionReplayBar: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrameIdx, setCurrentFrameIdx] = useState(0);
  const { updateSimulationGas } = useRiskStore();

  const currentFrame = INCIDENT_TIMELINE[currentFrameIdx];

  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentFrameIdx((prev) => {
          if (prev >= INCIDENT_TIMELINE.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          const nextIdx = prev + 1;
          updateSimulationGas(INCIDENT_TIMELINE[nextIdx].gasLel);
          return nextIdx;
        });
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleSeek = (idx: number) => {
    setCurrentFrameIdx(idx);
    updateSimulationGas(INCIDENT_TIMELINE[idx].gasLel);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-lg space-y-3 font-mono text-xs shadow-xl">
      {/* Top Replay Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-brand-blue animate-pulse" />
          <span className="font-bold text-slate-100 uppercase tracking-wider">
            MISSION REPLAY TIMELINE (HYDROCRACKER INCIDENT SIMULATION)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={currentFrame.statusLevel} pulse>
            {currentFrame.time} — RISK {currentFrame.riskScore}%
          </Badge>
        </div>
      </div>

      {/* Playback Controls & Frame Details */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Play / Pause Buttons */}
        <div className="md:col-span-3 flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded bg-brand-blue text-white hover:bg-blue-600 font-bold flex items-center gap-1 text-xs"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? 'PAUSE REPLAY' : 'PLAY REPLAY'}</span>
          </button>
          <button
            onClick={() => handleSeek(0)}
            className="p-2 rounded bg-slate-800 text-slate-300 hover:text-white"
            title="Reset Timeline"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Current Frame Event Narrative */}
        <div className="md:col-span-9 bg-slate-950 p-2.5 rounded border border-slate-800 flex items-center justify-between">
          <div>
            <span className="font-bold text-brand-cyan">{currentFrame.time} • {currentFrame.title}</span>
            <p className="text-[11px] text-slate-300 font-sans mt-0.5">{currentFrame.description}</p>
          </div>
          <div className="text-right text-[11px] text-slate-400">
            <div>LEL: <strong className="text-amber-400">{currentFrame.gasLel}%</strong></div>
            <div>Vib: <strong className="text-red-400">{currentFrame.vibration}mm/s</strong></div>
          </div>
        </div>
      </div>

      {/* Interactive Timeline Scrubber Bar */}
      <div className="grid grid-cols-9 gap-1 pt-1">
        {INCIDENT_TIMELINE.map((frame, idx) => (
          <button
            key={idx}
            onClick={() => handleSeek(idx)}
            className={`p-1.5 rounded text-center transition-all border ${
              currentFrameIdx === idx
                ? 'bg-brand-blue text-white border-blue-400 font-bold shadow'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-600'
            }`}
          >
            <div className="text-[10px]">{frame.time}</div>
            <div className="text-[9px] font-bold truncate">{frame.riskScore}%</div>
          </button>
        ))}
      </div>
    </div>
  );
};
