import React from 'react';
import { DigitalTwinCanvas } from '../components/domain/DigitalTwinCanvas';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useTwinStore } from '../store/useTwinStore';
import { useDatasetStore } from '../store/useDatasetStore';
import { MOCK_ASSETS, MOCK_WORKERS, MOCK_SENSORS } from '../services/mockData';
import { Cpu, Activity, User, Wrench, ShieldAlert, Gauge } from 'lucide-react';

export const DigitalTwinPage: React.FC = () => {
  const { selectedNode, selectedEntityId, selectEntity } = useTwinStore();
  const { currentMachineSnapshot } = useDatasetStore();

  const activeAsset = MOCK_ASSETS.find((a) => a.assetId === selectedEntityId) || MOCK_ASSETS[0];

  // Use dataset snapshot for P-102 if available
  const isP102 = activeAsset.assetId === 'PUMP-P102';
  const rpm = isP102 && currentMachineSnapshot ? currentMachineSnapshot.rpm : (activeAsset.rpm || 1425);
  const torque = isP102 && currentMachineSnapshot ? currentMachineSnapshot.torqueNm : (activeAsset.torqueNm || 41.9);
  const toolWear = isP102 && currentMachineSnapshot ? currentMachineSnapshot.toolWearMin : (activeAsset.toolWearMin || 184);
  const healthScore = isP102 && currentMachineSnapshot ? currentMachineSnapshot.healthScore : activeAsset.healthScore;
  const failureProb = isP102 && currentMachineSnapshot ? currentMachineSnapshot.failureProbability : (activeAsset.failureProbability || 88);
  const rul = isP102 && currentMachineSnapshot ? currentMachineSnapshot.remainingUsefulLife : (activeAsset.remainingUsefulLife || 14);
  const failureMode = isP102 && currentMachineSnapshot ? currentMachineSnapshot.failureMode : activeAsset.failureMode;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 uppercase tracking-tight flex items-center gap-2">
            <Cpu className="w-5 h-5 text-brand-cyan" /> 3D/2D Spatial Digital Twin Explorer
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Living Topological Graph • Hydrocracker Unit 2 • Real-Time Spatial Sensor & Personnel Tracking
          </p>
        </div>
        <Badge variant="CRITICAL" pulse>
          LIVE GRAPH CONNECTED (1,420 EV/SEC)
        </Badge>
      </div>

      {/* Main Grid Layout: Top Canvas, Bottom Node Details */}
      <div className="space-y-6">
        {/* Full-width Spatial Canvas */}
        <DigitalTwinCanvas />

        {/* Bottom Details Drawer / Inspection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Asset Diagnostics Inspector with AI4I Data */}
          <Card variant="elevated" title="SELECTED ASSET DIAGNOSTICS (AI4I PREDICTIVE)">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-100">{activeAsset.name}</h4>
                  <span className="text-xs font-mono text-slate-400">ID: {activeAsset.assetId} • Zone B4 • AI4I Dataset</span>
                </div>
                <Badge variant={healthScore < 50 ? 'CRITICAL' : healthScore < 75 ? 'WARNING' : 'SAFE'}>
                  {healthScore < 50 ? 'CRITICAL' : healthScore < 75 ? 'WARNING' : 'SAFE'}
                </Badge>
              </div>

              <div className="bg-slate-900 p-3 rounded border border-slate-800 space-y-1.5 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Health Score:</span>
                  <strong className={healthScore < 50 ? 'text-red-400' : 'text-amber-400'}>{healthScore}% ({healthScore < 50 ? 'Degraded' : 'Nominal'})</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Failure Probability:</span>
                  <strong className="text-red-400">{failureProb}%</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Remaining Useful Life (RUL):</span>
                  <strong className="text-amber-400">{rul} hours</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Rotational Speed:</span>
                  <strong className="text-slate-200">{rpm} RPM</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Torque:</span>
                  <strong className="text-slate-200">{torque} Nm</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tool Wear:</span>
                  <strong className="text-slate-200">{toolWear} min</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Spectral Vibration:</span>
                  <strong className="text-red-400">{activeAsset.vibrationMmSec} mm/s</strong>
                </div>
                {failureMode && (
                  <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-red-400 font-bold flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> Failure Mode: {failureMode}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Card 2: Field Personnel Geofence Tracking */}
          <Card variant="default" title="ZONE B4 FIELD WORKERS (2 ACTIVE)">
            <div className="space-y-3">
              {MOCK_WORKERS.slice(0, 2).map((worker) => (
                <div key={worker.id} className="p-3 bg-slate-900 rounded border border-slate-800 space-y-1.5 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-emerald-400" /> {worker.name} ({worker.id})
                    </span>
                    <Badge variant={worker.vitalStatus === 'NORMAL' ? 'SAFE' : 'WARNING'} size="sm">
                      {worker.vitalStatus}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-slate-400">{worker.role} • Assigned PTW-8409</div>
                  <div className="text-[10px] text-amber-400">Shift Active: {worker.shiftHoursActive} hours (Fatigue Flag)</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Card 3: Active Zone Sensors */}
          <Card variant="default" title="ZONE SENSOR TELEMETRY NODES">
            <div className="space-y-2">
              {MOCK_SENSORS.slice(0, 3).map((sensor) => (
                <div key={sensor.sensorId} className="p-2.5 bg-slate-900 rounded border border-slate-800 flex items-center justify-between font-mono text-xs">
                  <div>
                    <div className="font-bold text-slate-200">{sensor.sensorId} - {sensor.sensorName}</div>
                    <div className="text-[10px] text-slate-400">Baseline: {sensor.baselineMin}-{sensor.baselineMax} {sensor.unit}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-red-400">{sensor.value} {sensor.unit}</div>
                    <Badge variant={sensor.status} size="sm">{sensor.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
