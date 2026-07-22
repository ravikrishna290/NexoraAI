import { create } from 'zustand';
import { DigitalTwinState, SpatialNode } from '../types/digitalTwin';
import { MOCK_PLANT_NODES, MOCK_SENSORS, MOCK_ASSETS, MOCK_WORKERS } from '../services/mockData';

interface TwinStoreState {
  twinState: DigitalTwinState;
  selectedNode: SpatialNode | null;
  selectedEntityId: string | null;
  selectNode: (node: SpatialNode | null) => void;
  selectEntity: (id: string | null) => void;
  toggleLayer: (layer: keyof DigitalTwinState['activeLayers']) => void;
}

export const useTwinStore = create<TwinStoreState>((set) => ({
  twinState: {
    plantId: 'PLANT-01',
    plantName: 'Refinery Alpha (Gujarat Complex)',
    activeUnit: 'Hydrocracker Unit 2',
    nodes: MOCK_PLANT_NODES,
    sensors: MOCK_SENSORS,
    assets: MOCK_ASSETS,
    workers: MOCK_WORKERS,
    activeLayers: {
      sensors: true,
      workers: true,
      permits: true,
      dangerZones: true,
      cctv: true,
    },
  },
  selectedNode: MOCK_PLANT_NODES[3], // Default selected: Zone B-4
  selectedEntityId: 'PUMP-P102',
  selectNode: (node) => set({ selectedNode: node }),
  selectEntity: (id) => set({ selectedEntityId: id }),
  toggleLayer: (layer) =>
    set((state) => ({
      twinState: {
        ...state.twinState,
        activeLayers: {
          ...state.twinState.activeLayers,
          [layer]: !state.twinState.activeLayers[layer],
        },
      },
    })),
}));
