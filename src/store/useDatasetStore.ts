/**
 * useDatasetStore — Global state for dataset playback and simulation
 */

import { create } from 'zustand';
import {
  DataMode,
  SimulationScenario,
  VisionDetection,
  MachineHealthSnapshot,
  SmokeFireSnapshot,
  getAI4IRecord,
  getMachineSnapshot,
  getSmokeRecord,
  getSmokeSnapshot,
  getNextPPEEvent,
  getSmokeVisionEvent,
  AI4I_LENGTH,
  SMOKE_LENGTH,
} from '../services/datasetService';

interface DatasetStoreState {
  dataMode: DataMode;
  playbackIndex: number;
  playbackSpeed: number;       // 1 = 1 record/3s, 2 = 1/1.5s, etc.
  simulationScenario: SimulationScenario;
  isPlaying: boolean;

  // Live snapshots
  currentMachineSnapshot: MachineHealthSnapshot | null;
  currentSmokeSnapshot: SmokeFireSnapshot | null;

  // Vision detections (rolling buffer — max 20)
  visionDetections: VisionDetection[];
  latestDetection: VisionDetection | null;

  // Camera active alert map
  cameraAlerts: Record<string, VisionDetection | null>;

  // Actions
  setDataMode: (mode: DataMode) => void;
  setPlaybackSpeed: (speed: number) => void;
  advancePlayback: () => void;
  setSimulationScenario: (scenario: SimulationScenario) => void;
  addVisionDetection: (detection: VisionDetection) => void;
  triggerPPEEvent: () => VisionDetection;
  triggerSmokeEvent: () => VisionDetection | null;
  clearCameraAlert: (cameraId: string) => void;
  resetSimulation: () => void;
  setPlaying: (playing: boolean) => void;
}

// Initialize with first dataset record
const initialRecord = getAI4IRecord(0);
const initialSmokeRecord = getSmokeRecord(150); // Start with a fire event for impact

export const useDatasetStore = create<DatasetStoreState>((set, get) => ({
  dataMode: 'SIMULATION',
  playbackIndex: 0,
  playbackSpeed: 1,
  simulationScenario: 'GAS_LEAK',
  isPlaying: true,

  currentMachineSnapshot: getMachineSnapshot(initialRecord),
  currentSmokeSnapshot: getSmokeSnapshot(initialSmokeRecord),

  visionDetections: [],
  latestDetection: null,
  cameraAlerts: {},

  setDataMode: (mode) => set({ dataMode: mode }),

  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),

  setPlaying: (playing) => set({ isPlaying: playing }),

  advancePlayback: () => {
    const { playbackIndex } = get();
    const nextIndex = (playbackIndex + 1);
    const ai4iRecord = getAI4IRecord(nextIndex);
    const smokeRecord = getSmokeRecord(nextIndex % SMOKE_LENGTH);

    set({
      playbackIndex: nextIndex,
      currentMachineSnapshot: getMachineSnapshot(ai4iRecord),
      currentSmokeSnapshot: getSmokeSnapshot(smokeRecord),
    });
  },

  setSimulationScenario: (scenario) => {
    set({ simulationScenario: scenario });
  },

  addVisionDetection: (detection) => {
    set((state) => {
      const updated = [detection, ...state.visionDetections].slice(0, 20);
      return {
        visionDetections: updated,
        latestDetection: detection,
        cameraAlerts: {
          ...state.cameraAlerts,
          [detection.cameraId]: detection,
        },
      };
    });
  },

  triggerPPEEvent: () => {
    const detection = getNextPPEEvent();
    get().addVisionDetection(detection);
    return detection;
  },

  triggerSmokeEvent: () => {
    const smokeRecord = getSmokeRecord(
      Math.floor(Math.random() * SMOKE_LENGTH)
    );
    const detection = getSmokeVisionEvent(smokeRecord, 'CAM-C03');
    if (detection) {
      get().addVisionDetection(detection);
    }
    return detection;
  },

  clearCameraAlert: (cameraId) => {
    set((state) => ({
      cameraAlerts: { ...state.cameraAlerts, [cameraId]: null },
    }));
  },

  resetSimulation: () => {
    set({
      playbackIndex: 0,
      simulationScenario: 'NONE',
      visionDetections: [],
      latestDetection: null,
      cameraAlerts: {},
      currentMachineSnapshot: getMachineSnapshot(getAI4IRecord(0)),
      currentSmokeSnapshot: getSmokeSnapshot(getSmokeRecord(0)),
    });
  },
}));
