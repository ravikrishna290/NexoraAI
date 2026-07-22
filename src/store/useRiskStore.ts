import { create } from 'zustand';
import { CompoundRiskAssessment } from '../types/compoundRisk';
import { MOCK_PRIMARY_ASSESSMENT } from '../services/mockData';

interface RiskStoreState {
  activeAssessment: CompoundRiskAssessment;
  allAssessments: CompoundRiskAssessment[];
  simulationParameters: {
    gasLelOverride: number | null;
    hotWorkActive: boolean;
    exhaustPurgeActive: boolean;
    visionRiskBoost: number;
    activeScenario: string | null;
  };
  resolveAssessment: (id: string, action: 'REJECT' | 'MITIGATED') => void;
  updateSimulationGas: (lel: number) => void;
  toggleExhaustPurge: (active: boolean) => void;
  applyVisionRiskBoost: (boostPoints: number, source: string) => void;
  setScenarioRisk: (scenarioBoost: number, scenarioName: string) => void;
  resetScenarioRisk: () => void;
}

export const useRiskStore = create<RiskStoreState>((set) => ({
  activeAssessment: MOCK_PRIMARY_ASSESSMENT,
  allAssessments: [MOCK_PRIMARY_ASSESSMENT],
  simulationParameters: {
    gasLelOverride: null,
    hotWorkActive: true,
    exhaustPurgeActive: false,
    visionRiskBoost: 0,
    activeScenario: null,
  },
  resolveAssessment: (id, action) => {
    set((state) => {
      const updated = {
        ...state.activeAssessment,
        status: action === 'REJECT' ? ('REJECTED' as const) : ('MITIGATED' as const),
        compoundRiskScore: action === 'REJECT' ? 12 : 8,
        riskLevel: 'SAFE' as const,
      };
      return { activeAssessment: updated };
    });
  },
  updateSimulationGas: (lel) => {
    set((state) => {
      const isHigh = lel > 10;
      const newScore = isHigh ? Math.min(99, Math.round(lel * 4.2)) : Math.round(lel * 1.5);
      return {
        simulationParameters: { ...state.simulationParameters, gasLelOverride: lel },
        activeAssessment: {
          ...state.activeAssessment,
          compoundRiskScore: newScore,
          riskLevel: newScore > 75 ? 'CRITICAL' : newScore > 40 ? 'WARNING' : 'SAFE',
        },
      };
    });
  },
  toggleExhaustPurge: (active) => {
    set((state) => {
      const currentScore = state.activeAssessment.compoundRiskScore;
      const newScore = active ? Math.max(14, currentScore - 55) : Math.min(96, currentScore + 55);
      return {
        simulationParameters: { ...state.simulationParameters, exhaustPurgeActive: active },
        activeAssessment: {
          ...state.activeAssessment,
          compoundRiskScore: newScore,
          riskLevel: newScore > 75 ? 'CRITICAL' : newScore > 40 ? 'WARNING' : 'SAFE',
        },
      };
    });
  },

  applyVisionRiskBoost: (boostPoints, source) => {
    set((state) => {
      const newScore = Math.min(99.9, state.activeAssessment.compoundRiskScore + boostPoints);
      return {
        simulationParameters: {
          ...state.simulationParameters,
          visionRiskBoost: (state.simulationParameters.visionRiskBoost || 0) + boostPoints,
        },
        activeAssessment: {
          ...state.activeAssessment,
          compoundRiskScore: newScore,
          riskLevel: newScore >= 75 ? 'CRITICAL' : newScore >= 45 ? 'HIGH' : newScore >= 25 ? 'WARNING' : 'SAFE',
        },
      };
    });
  },

  setScenarioRisk: (scenarioBoost, scenarioName) => {
    set((state) => {
      const base = MOCK_PRIMARY_ASSESSMENT.compoundRiskScore;
      const newScore = Math.min(99.9, base + scenarioBoost);
      return {
        simulationParameters: {
          ...state.simulationParameters,
          activeScenario: scenarioName,
          visionRiskBoost: scenarioBoost,
        },
        activeAssessment: {
          ...state.activeAssessment,
          compoundRiskScore: newScore,
          riskLevel: newScore >= 75 ? 'CRITICAL' : newScore >= 45 ? 'HIGH' : newScore >= 25 ? 'WARNING' : 'SAFE',
        },
      };
    });
  },

  resetScenarioRisk: () => {
    set({
      simulationParameters: {
        gasLelOverride: null,
        hotWorkActive: true,
        exhaustPurgeActive: false,
        visionRiskBoost: 0,
        activeScenario: null,
      },
      activeAssessment: MOCK_PRIMARY_ASSESSMENT,
    });
  },
}));
