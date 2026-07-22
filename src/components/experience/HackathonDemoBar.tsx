import React, { useState, useEffect } from 'react';
import {
  Play, Sparkles, ShieldAlert, CheckCircle2, Loader2, Radio,
  Database, Flame, Wind, HardHat, Cpu, Zap, RotateCcw, ChevronDown
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useDatasetStore } from '../../store/useDatasetStore';
import { useRiskStore } from '../../store/useRiskStore';
import {
  SIMULATION_SCENARIOS,
  SimulationScenario,
  AI4I_LENGTH,
  SMOKE_LENGTH
} from '../../services/datasetService';

interface HackathonDemoBarProps {
  onStartThinkingModal: () => void;
  onNavigateToCompoundRisk: () => void;
}

export const HackathonDemoBar: React.FC<HackathonDemoBarProps> = ({
  onStartThinkingModal,
  onNavigateToCompoundRisk,
}) => {
  const {
    dataMode,
    setDataMode,
    playbackIndex,
    playbackSpeed,
    setPlaybackSpeed,
    advancePlayback,
    isPlaying,
    setPlaying,
    currentMachineSnapshot,
    currentSmokeSnapshot,
    setSimulationScenario,
    triggerPPEEvent,
    triggerSmokeEvent,
    resetSimulation,
  } = useDatasetStore();

  const { setScenarioRisk, resetScenarioRisk } = useRiskStore();

  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [demoStepText, setDemoStepText] = useState('');
  const [showScenarioMenu, setShowScenarioMenu] = useState(false);

  // Playback timer for DATASET_REPLAY mode
  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = Math.max(500, 3000 / playbackSpeed);
    const id = setInterval(() => {
      advancePlayback();
    }, intervalMs);
    return () => clearInterval(id);
  }, [isPlaying, playbackSpeed, advancePlayback]);

  // Scenario trigger handler
  const handleSelectScenario = (scenario: SimulationScenario) => {
    setShowScenarioMenu(false);
    setSimulationScenario(scenario);

    const config = SIMULATION_SCENARIOS.find(s => s.id === scenario);
    if (!config) return;

    // Apply scenario risk boost to Compound Risk engine
    setScenarioRisk(config.riskBoost, config.label);

    // Trigger relevant vision/sensor events
    if (scenario === 'PPE_VIOLATION' || scenario === 'MULTI_INCIDENT') {
      triggerPPEEvent();
    }
    if (scenario === 'SMOKE' || scenario === 'FIRE' || scenario === 'MULTI_INCIDENT') {
      triggerSmokeEvent();
    }

    // Launch automated AI reasoning flow
    runFullAutomatedSimulation(config.label);
  };

  const runFullAutomatedSimulation = (scenarioLabel = 'Incident Scenario') => {
    setIsDemoRunning(true);
    setDemoStepText(`1. Ingesting Real Datasets & Field Telemetry (${scenarioLabel})...`);

    // Step 1: Trigger Thinking Mode
    setTimeout(() => {
      onStartThinkingModal();
      setDemoStepText('2. Multi-Agent Swarm Reasoning Active (6 Domain Agents + AI4I + Vision AI)...');
    }, 1500);

    // Step 2: Navigate to Compound Risk Center
    setTimeout(() => {
      onNavigateToCompoundRisk();
      setDemoStepText('3. Synthesizing Compound Risk Matrix & XAI 4-Question Diagnosis...');
    }, 8500);

    // Step 3: Complete Simulation
    setTimeout(() => {
      setIsDemoRunning(false);
      setDemoStepText('');
    }, 14000);
  };

  const handleReset = () => {
    resetSimulation();
    resetScenarioRisk();
  };

  return (
    <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-navy-950 border-b border-blue-500/20 px-4 py-2 flex items-center justify-between z-20 text-xs font-mono select-none">

      {/* Left: Mode Toggle & Status */}
      <div className="flex items-center gap-3">
        {/* Dataset Mode Switcher */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded p-0.5">
          <button
            onClick={() => setDataMode('DATASET_REPLAY')}
            className={`px-2.5 py-1 rounded text-[11px] font-mono flex items-center gap-1.5 transition-all ${
              dataMode === 'DATASET_REPLAY'
                ? 'bg-brand-blue text-white font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3 h-3" /> Dataset Replay
          </button>
          <button
            onClick={() => setDataMode('SIMULATION')}
            className={`px-2.5 py-1 rounded text-[11px] font-mono flex items-center gap-1.5 transition-all ${
              dataMode === 'SIMULATION'
                ? 'bg-purple-600 text-white font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3 h-3" /> Live Simulation
          </button>
        </div>

        {/* Dataset Replay Ticker */}
        {dataMode === 'DATASET_REPLAY' && (
          <div className="hidden lg:flex items-center gap-3 bg-slate-950/80 px-3 py-1 rounded border border-slate-800 text-[11px]">
            <span className="text-brand-cyan font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse inline-block" />
              AI4I Row #{playbackIndex % AI4I_LENGTH}
            </span>
            {currentMachineSnapshot && (
              <span className="text-slate-300">
                RPM: <strong className="text-slate-100">{currentMachineSnapshot.rpm}</strong> •
                Torque: <strong className="text-slate-100">{currentMachineSnapshot.torqueNm}Nm</strong> •
                Wear: <strong className="text-slate-100">{currentMachineSnapshot.toolWearMin}m</strong>
              </span>
            )}
            {/* Speed toggle */}
            <button
              onClick={() => setPlaybackSpeed(playbackSpeed === 1 ? 2 : playbackSpeed === 2 ? 5 : 1)}
              className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold"
              title="Toggle Playback Speed"
            >
              {playbackSpeed}x
            </button>
          </div>
        )}

        {/* Running Step Indicator */}
        {isDemoRunning && (
          <span className="text-amber-400 font-bold flex items-center gap-1.5 animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> {demoStepText}
          </span>
        )}
      </div>

      {/* Right: Scenario Selector & Actions */}
      <div className="flex items-center gap-2 relative">

        {/* Scenario Menu Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowScenarioMenu(!showScenarioMenu)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 font-mono text-[11px] flex items-center gap-1.5 transition-colors"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>SCENARIO PRESETS</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showScenarioMenu && (
            <div className="absolute right-0 top-full mt-1.5 w-64 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl p-1.5 z-50 font-mono">
              <div className="text-[10px] text-slate-400 px-2 py-1 uppercase font-bold border-b border-slate-800 mb-1">
                Select Enterprise Hazard Scenario
              </div>
              {SIMULATION_SCENARIOS.map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => handleSelectScenario(sc.id)}
                  className="w-full text-left px-2.5 py-2 rounded hover:bg-slate-800 flex items-center justify-between transition-colors group"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-brand-cyan flex items-center gap-1.5">
                      <span>{sc.icon}</span> {sc.label}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[170px]">{sc.description}</div>
                  </div>
                  <Badge variant={sc.severity} size="sm">+{sc.riskBoost}</Badge>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Primary Run Simulation Button */}
        <Button
          variant="primary"
          size="sm"
          onClick={() => handleSelectScenario('MULTI_INCIDENT')}
          disabled={isDemoRunning}
          icon={<Radio className="w-3.5 h-3.5 text-brand-cyan animate-pulse" />}
          className="bg-brand-blue hover:bg-blue-600 shadow-md shadow-blue-500/20 border border-blue-400/30 font-semibold"
        >
          {isDemoRunning ? 'SIMULATION IN PROGRESS...' : 'RUN INCIDENT SIMULATION'}
        </Button>

        {/* Reset Button */}
        <button
          onClick={handleReset}
          className="p-1.5 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded"
          title="Reset Simulation & Datasets"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
