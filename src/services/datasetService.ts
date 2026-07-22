/**
 * Nexora Dataset Service
 * Provides real-time access to AI4I 2020 Predictive Maintenance and
 * Smoke/Fire IoT datasets, plus synthesized PPE detection events.
 *
 * Supports two modes:
 *   DATASET_REPLAY  — cycles through real dataset rows at configurable speed
 *   SIMULATION      — scenario-driven event generation
 */

import { AI4I_DATASET, AI4IRecord } from '../data/ai4iData';
import { SMOKE_DATASET, SmokeRecord } from '../data/smokeData';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type DataMode = 'SIMULATION' | 'DATASET_REPLAY';

export type PPEViolationType = 'HELMET_MISSING' | 'VEST_MISSING' | 'GLOVES_MISSING' | 'GOGGLES_MISSING' | 'ALL_COMPLIANT';

export type VisionDetectionType =
  | 'PPE_VIOLATION'
  | 'FIRE_DETECTED'
  | 'SMOKE_DETECTED'
  | 'RESTRICTED_ZONE_ENTRY'
  | 'WORKER_DOWN'
  | 'ALL_CLEAR';

export interface VisionDetection {
  id: string;
  cameraId: string;
  cameraZone: string;
  detectionType: VisionDetectionType;
  subType?: PPEViolationType;
  confidence: number;         // 0–100
  timestamp: string;
  riskBoost: number;          // Points added to compound risk
  workerName?: string;
  imageTag: string;           // Descriptive label for Evidence Viewer
  notified: boolean;
  severity: 'CRITICAL' | 'HIGH' | 'WARNING' | 'SAFE';
}

export interface MachineHealthSnapshot {
  assetId: string;
  assetName: string;
  productId: string;
  airTempC: number;
  processTempC: number;
  rpm: number;
  torqueNm: number;
  toolWearMin: number;
  healthScore: number;            // 0–100
  failureProbability: number;     // 0–100
  remainingUsefulLife: number;    // hours
  failureMode: string | null;
  machineFailure: boolean;
  dataSource: 'AI4I_DATASET' | 'SIMULATION';
}

export interface SmokeFireSnapshot {
  tempC: number;
  humidity: number;
  tvocPpb: number;
  eco2Ppm: number;
  pm25: number;
  fireAlarm: boolean;
  smokeLevel: 'NONE' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  dataSource: 'SMOKE_DATASET' | 'SIMULATION';
}

// ─────────────────────────────────────────────────────────────────────────────
// Camera Configuration
// ─────────────────────────────────────────────────────────────────────────────

export const CAMERA_CONFIG = [
  { id: 'CAM-C01', zone: 'Zone A1', name: 'Distillation Area — West Entry', position: { x: 110, y: 80 } },
  { id: 'CAM-C02', zone: 'Zone A1', name: 'Pump P-201 Area',               position: { x: 150, y: 330 } },
  { id: 'CAM-C03', zone: 'Zone B4', name: 'Reactor Feed — Hot Work Zone',  position: { x: 445, y: 80 } },
  { id: 'CAM-C04', zone: 'Zone B4', name: 'Pump P-102 Critical Zone',      position: { x: 445, y: 340 } },
  { id: 'CAM-C05', zone: 'Zone B4', name: 'Gas Sensor AT-G104 Proximity',  position: { x: 560, y: 130 } },
  { id: 'CAM-C06', zone: 'Zone C2', name: 'Separator V-401 Area',          position: { x: 790, y: 100 } },
] as const;

export type CameraId = typeof CAMERA_CONFIG[number]['id'];

// ─────────────────────────────────────────────────────────────────────────────
// Risk contribution map
// ─────────────────────────────────────────────────────────────────────────────

export const VISION_RISK_BOOSTS: Record<VisionDetectionType, number> = {
  FIRE_DETECTED:        40,
  SMOKE_DETECTED:       25,
  RESTRICTED_ZONE_ENTRY: 18,
  PPE_VIOLATION:        10,
  WORKER_DOWN:          30,
  ALL_CLEAR:            0,
};

// ─────────────────────────────────────────────────────────────────────────────
// Predictive Maintenance — AI4I Dataset Service
// ─────────────────────────────────────────────────────────────────────────────

/** Derive machine health snapshot from a real AI4I record */
export function getMachineSnapshot(record: AI4IRecord, assetId = 'PUMP-P102'): MachineHealthSnapshot {
  const processTempC = record.processTempK - 273.15;
  const airTempC = record.airTempK - 273.15;

  // Health degrades with tool wear and torque deviation from nominal (40 Nm)
  const torqueDeviation = Math.abs(record.torqueNm - 40) / 40;
  const wearFactor = Math.min(1, record.toolWearMin / 200);
  const healthScore = Math.max(5, Math.round(100 - (wearFactor * 50) - (torqueDeviation * 30) - (record.machineFailure * 35)));

  // Failure probability: logistic-style curve from health
  const failureProbability = record.machineFailure === 1
    ? Math.round(75 + Math.random() * 20)
    : Math.round(Math.max(2, (1 - healthScore / 100) * 60));

  // RUL: remaining useful life (hours) — inverse of wear progression
  const remainingUsefulLife = record.machineFailure === 1
    ? Math.round(Math.random() * 12)
    : Math.round((200 - record.toolWearMin) * 0.8);

  // Determine active failure mode
  let failureMode: string | null = null;
  if (record.twf) failureMode = 'Tool Wear Failure (TWF)';
  else if (record.hdf) failureMode = 'Heat Dissipation Failure (HDF)';
  else if (record.pwf) failureMode = 'Power Failure (PWF)';
  else if (record.osf) failureMode = 'Overstrain Failure (OSF)';
  else if (record.rnf) failureMode = 'Random Failure (RNF)';

  return {
    assetId,
    assetName: assetId === 'PUMP-P102' ? 'Hydrocracker Charge Pump P-102' : `Machine ${record.productId}`,
    productId: record.productId,
    airTempC: +airTempC.toFixed(1),
    processTempC: +processTempC.toFixed(1),
    rpm: record.rpm,
    torqueNm: record.torqueNm,
    toolWearMin: record.toolWearMin,
    healthScore,
    failureProbability,
    remainingUsefulLife,
    failureMode,
    machineFailure: record.machineFailure === 1,
    dataSource: 'AI4I_DATASET',
  };
}

/** Get AI4I record at playback index (wraps around) */
export function getAI4IRecord(index: number): AI4IRecord {
  return AI4I_DATASET[index % AI4I_DATASET.length];
}

/** Get total AI4I dataset length */
export const AI4I_LENGTH = AI4I_DATASET.length;

// ─────────────────────────────────────────────────────────────────────────────
// Smoke / Fire — IoT Dataset Service
// ─────────────────────────────────────────────────────────────────────────────

export function getSmokeSnapshot(record: SmokeRecord): SmokeFireSnapshot {
  let smokeLevel: SmokeFireSnapshot['smokeLevel'] = 'NONE';
  if (record.fireAlarm) {
    if (record.tvoc > 5000 || record.pm25 > 10) smokeLevel = 'CRITICAL';
    else if (record.tvoc > 1000 || record.pm25 > 5) smokeLevel = 'HIGH';
    else smokeLevel = 'MODERATE';
  } else if (record.tvoc > 100 || record.pm25 > 2) {
    smokeLevel = 'LOW';
  }

  return {
    tempC: +record.tempC.toFixed(1),
    humidity: +record.humidity.toFixed(1),
    tvocPpb: +record.tvoc.toFixed(0),
    eco2Ppm: +record.eco2.toFixed(0),
    pm25: +record.pm25.toFixed(2),
    fireAlarm: record.fireAlarm === 1,
    smokeLevel,
    dataSource: 'SMOKE_DATASET',
  };
}

export function getSmokeRecord(index: number): SmokeRecord {
  return SMOKE_DATASET[index % SMOKE_DATASET.length];
}

export const SMOKE_LENGTH = SMOKE_DATASET.length;

// ─────────────────────────────────────────────────────────────────────────────
// PPE Detection — Synthesized Event Stream
// ─────────────────────────────────────────────────────────────────────────────

const PPE_WORKER_POOL = ['W-804 (Vikram Sharma)', 'W-809 (Arjun Mehta)', 'W-302 (Priya Nair)', 'W-115 (Rajesh Kumar)', 'W-712 (Deepak Rao)'];

const PPE_EVENT_POOL: Array<Omit<VisionDetection, 'id' | 'timestamp'>> = [
  { cameraId: 'CAM-C03', cameraZone: 'Zone B4', detectionType: 'PPE_VIOLATION', subType: 'HELMET_MISSING',
    confidence: 98, riskBoost: 10, workerName: PPE_WORKER_POOL[0], imageTag: 'Worker without helmet near hot work zone', notified: true, severity: 'HIGH' },
  { cameraId: 'CAM-C04', cameraZone: 'Zone B4', detectionType: 'PPE_VIOLATION', subType: 'VEST_MISSING',
    confidence: 94, riskBoost: 10, workerName: PPE_WORKER_POOL[1], imageTag: 'Safety vest non-compliance detected', notified: false, severity: 'WARNING' },
  { cameraId: 'CAM-C05', cameraZone: 'Zone B4', detectionType: 'RESTRICTED_ZONE_ENTRY',
    confidence: 97, riskBoost: 18, workerName: PPE_WORKER_POOL[2], imageTag: 'Unauthorized entry into gas hazard zone', notified: true, severity: 'CRITICAL' },
  { cameraId: 'CAM-C01', cameraZone: 'Zone A1', detectionType: 'PPE_VIOLATION', subType: 'GLOVES_MISSING',
    confidence: 89, riskBoost: 10, workerName: PPE_WORKER_POOL[3], imageTag: 'Chemical gloves missing during equipment handling', notified: false, severity: 'WARNING' },
  { cameraId: 'CAM-C06', cameraZone: 'Zone C2', detectionType: 'PPE_VIOLATION', subType: 'GOGGLES_MISSING',
    confidence: 92, riskBoost: 10, workerName: PPE_WORKER_POOL[4], imageTag: 'Safety goggles not worn near separator vessel', notified: true, severity: 'WARNING' },
  { cameraId: 'CAM-C04', cameraZone: 'Zone B4', detectionType: 'RESTRICTED_ZONE_ENTRY',
    confidence: 99, riskBoost: 18, workerName: PPE_WORKER_POOL[0], imageTag: 'Worker within 3m of CRITICAL gas plume boundary', notified: true, severity: 'CRITICAL' },
];

let _ppeEventIndex = 0;

export function getNextPPEEvent(): VisionDetection {
  const base = PPE_EVENT_POOL[_ppeEventIndex % PPE_EVENT_POOL.length];
  _ppeEventIndex++;
  return {
    ...base,
    id: `VIS-${Date.now()}-${_ppeEventIndex}`,
    timestamp: new Date().toISOString(),
  };
}

/** Generate fire/smoke detection event from a real smoke dataset record */
export function getSmokeVisionEvent(record: SmokeRecord, cameraId: CameraId = 'CAM-C03'): VisionDetection | null {
  const snapshot = getSmokeSnapshot(record);
  const cam = CAMERA_CONFIG.find(c => c.id === cameraId)!;

  if (snapshot.smokeLevel === 'NONE') return null;

  const isFire = snapshot.fireAlarm && snapshot.smokeLevel === 'CRITICAL';
  const detectionType: VisionDetectionType = isFire ? 'FIRE_DETECTED' : 'SMOKE_DETECTED';

  return {
    id: `VIS-${Date.now()}-SMOKE`,
    cameraId,
    cameraZone: cam.zone,
    detectionType,
    confidence: isFire ? 97 : 88,
    timestamp: new Date().toISOString(),
    riskBoost: VISION_RISK_BOOSTS[detectionType],
    imageTag: isFire
      ? `Fire detected — Temp ${snapshot.tempC}°C, TVOC ${snapshot.tvocPpb} ppb, PM2.5 ${snapshot.pm25}`
      : `Smoke detected — TVOC ${snapshot.tvocPpb} ppb, PM2.5 ${snapshot.pm25}, eCO2 ${snapshot.eco2Ppm} ppm`,
    notified: true,
    severity: isFire ? 'CRITICAL' : 'HIGH',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Simulation Scenarios
// ─────────────────────────────────────────────────────────────────────────────

export type SimulationScenario =
  | 'GAS_LEAK'
  | 'FIRE'
  | 'SMOKE'
  | 'PPE_VIOLATION'
  | 'MACHINE_FAILURE'
  | 'MULTI_INCIDENT'
  | 'NONE';

export interface ScenarioConfig {
  id: SimulationScenario;
  label: string;
  description: string;
  riskBoost: number;
  affectedZones: string[];
  affectedCameras: CameraId[];
  icon: string;
  severity: 'CRITICAL' | 'HIGH' | 'WARNING';
}

export const SIMULATION_SCENARIOS: ScenarioConfig[] = [
  {
    id: 'GAS_LEAK',
    label: 'Gas Leak Event',
    description: 'Hydrocarbon vapor accumulation in Zone B4 exceeds 20% LEL',
    riskBoost: 35,
    affectedZones: ['Zone B4'],
    affectedCameras: ['CAM-C03', 'CAM-C04', 'CAM-C05'],
    icon: '💨',
    severity: 'CRITICAL',
  },
  {
    id: 'FIRE',
    label: 'Fire Detection',
    description: 'Open flame detected at Zone B4 by thermal camera network',
    riskBoost: 40,
    affectedZones: ['Zone B4'],
    affectedCameras: ['CAM-C03', 'CAM-C04'],
    icon: '🔥',
    severity: 'CRITICAL',
  },
  {
    id: 'SMOKE',
    label: 'Smoke Detection',
    description: 'IoT smoke sensors detect TVOC spike — possible smoldering event',
    riskBoost: 25,
    affectedZones: ['Zone B4', 'Zone A1'],
    affectedCameras: ['CAM-C03', 'CAM-C01'],
    icon: '🌫️',
    severity: 'HIGH',
  },
  {
    id: 'PPE_VIOLATION',
    label: 'PPE Violation',
    description: 'AI Vision detects worker without compliant personal protective equipment',
    riskBoost: 10,
    affectedZones: ['Zone B4'],
    affectedCameras: ['CAM-C04'],
    icon: '🦺',
    severity: 'WARNING',
  },
  {
    id: 'MACHINE_FAILURE',
    label: 'Machine Failure',
    description: 'AI4I dataset predicts imminent bearing failure on Pump P-102',
    riskBoost: 20,
    affectedZones: ['Zone B4'],
    affectedCameras: ['CAM-C04'],
    icon: '⚙️',
    severity: 'CRITICAL',
  },
  {
    id: 'MULTI_INCIDENT',
    label: 'Multi-Incident',
    description: 'Concurrent: Gas Leak + PPE Violation + Machine Failure in Zone B4',
    riskBoost: 55,
    affectedZones: ['Zone B4', 'Zone A1', 'Zone C2'],
    affectedCameras: ['CAM-C03', 'CAM-C04', 'CAM-C05', 'CAM-C06'],
    icon: '🚨',
    severity: 'CRITICAL',
  },
];
