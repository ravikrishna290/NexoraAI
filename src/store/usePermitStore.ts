import { create } from 'zustand';
import { WorkPermit, PermitStatus } from '../types/permit';
import { MOCK_PERMITS } from '../services/mockData';

interface PermitStoreState {
  permits: WorkPermit[];
  selectedPermit: WorkPermit | null;
  filterStatus: string;
  filterType: string;
  selectPermit: (permit: WorkPermit | null) => void;
  updatePermitStatus: (permitId: string, status: PermitStatus) => void;
  setFilterStatus: (status: string) => void;
  setFilterType: (type: string) => void;
}

export const usePermitStore = create<PermitStoreState>((set) => ({
  permits: MOCK_PERMITS,
  selectedPermit: MOCK_PERMITS[0],
  filterStatus: 'ALL',
  filterType: 'ALL',
  selectPermit: (permit) => set({ selectedPermit: permit }),
  updatePermitStatus: (permitId, status) => {
    set((state) => ({
      permits: state.permits.map((p) => (p.permitId === permitId ? { ...p, status } : p)),
      selectedPermit: state.selectedPermit?.permitId === permitId ? { ...state.selectedPermit, status } : state.selectedPermit,
    }));
  },
  setFilterStatus: (status) => set({ filterStatus: status }),
  setFilterType: (type) => set({ filterType: type }),
}));
