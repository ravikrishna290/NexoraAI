export type SeverityLevel = 'SAFE' | 'LOW' | 'WARNING' | 'HIGH' | 'CRITICAL';

export interface SpatialNode {
  id: string;
  name: string;
  type: 'PLANT' | 'UNIT' | 'ZONE' | 'ASSET' | 'SENSOR' | 'WORKER';
  parentId?: string;
  coordinates: { x: number; y: number; z?: number };
  status: SeverityLevel;
  zoneId?: string;
}

export interface SensorTelemetry {
  sensorId: string;
  sensorName: string;
  type: 'GAS_LEL' | 'PRESSURE' | 'TEMPERATURE' | 'VIBRATION' | 'HUMIDITY' | 'CO2' | 'O2';
  value: number;
  unit: string;
  baselineMin: number;
  baselineMax: number;
  thresholdWarning: number;
  thresholdCritical: number;
  status: SeverityLevel;
  lastUpdated: string;
  zoneId: string;
  trend: 'RISING' | 'STABLE' | 'FALLING';
}

export interface AssetHealth {
  assetId: string;
  name: string;
  category: 'PUMP' | 'REACTOR' | 'COMPRESSOR' | 'HEAT_EXCHANGER' | 'VALVE' | 'HEADER';
  zoneId: string;
  status: SeverityLevel;
  healthScore: number; // 0 - 100%
  vibrationMmSec: number;
  temperatureC: number;
  operatingHours: number;
  lastMaintenance: string;
  activeWorkOrders: number;
  // AI4I Predictive Maintenance Dataset fields
  rpm?: number;
  torqueNm?: number;
  toolWearMin?: number;
  failureProbability?: number;
  remainingUsefulLife?: number;
  failureMode?: string | null;
}

export interface FieldWorker {
  id: string;
  name: string;
  role: string;
  zoneId: string;
  coordinates: { x: number; y: number };
  shiftHoursActive: number;
  ppeCompliant: boolean;
  certifications: string[];
  assignedPermitId?: string;
  vitalStatus: 'NORMAL' | 'ELEVATED_HEART_RATE' | 'FALL_DETECTED';
}

export interface DigitalTwinState {
  plantId: string;
  plantName: string;
  activeUnit: string;
  nodes: SpatialNode[];
  sensors: SensorTelemetry[];
  assets: AssetHealth[];
  workers: FieldWorker[];
  activeLayers: {
    sensors: boolean;
    workers: boolean;
    permits: boolean;
    dangerZones: boolean;
    cctv: boolean;
  };
}
