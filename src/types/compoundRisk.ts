import { SeverityLevel } from './digitalTwin';

export interface ContributingFactor {
  agentName: string;
  agentTitle: string;
  factorText: string;
  metricValue?: string;
  baselineValue?: string;
  weight: number; // 0.0 to 1.0
  severity: SeverityLevel;
}

export interface FourQuestionSummary {
  whatIsHappening: string;
  whyIsItHappening: string;
  howDangerousIsIt: string;
  whatShouldBeDone: string[];
}

export interface RecommendedMitigation {
  step: number;
  actionTitle: string;
  description: string;
  urgency: 'IMMEDIATE' | 'HIGH' | 'MEDIUM';
  automatedActionType: 'ONE_CLICK_REJECT' | 'DISPATCH_SAFETY_OFFICER' | 'SCADA_ISOLATION_SUGGESTION' | 'MANUAL';
  targetEntityId?: string;
}

export interface CompoundRiskAssessment {
  assessmentId: string;
  timestamp: string;
  plantId: string;
  unitName: string;
  zoneId: string;
  zoneName: string;
  compoundRiskScore: number; // 0 - 100%
  riskVelocity: number; // rate of change dR/dt (% per hour)
  riskLevel: SeverityLevel;
  confidenceScore: number; // 0.00 to 1.00
  targetEntity: {
    type: 'PERMIT_REQUEST' | 'EQUIPMENT_ANOMALY' | 'ATMOSPHERIC_EXCURSION' | 'CREW_FATIGUE';
    entityId: string;
    description: string;
  };
  fourQuestions: FourQuestionSummary;
  contributingFactors: ContributingFactor[];
  regulatoryLineage: string[];
  historicalIncidentMatch?: {
    incidentId: string;
    title: string;
    similarityScore: number; // 0.0 to 1.0
    date: string;
    location: string;
  };
  mitigations: RecommendedMitigation[];
  status: 'UNRESOLVED' | 'UNDER_REVIEW' | 'MITIGATED' | 'REJECTED';
}
