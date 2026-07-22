import { SeverityLevel } from './digitalTwin';

export type PermitType = 'HOT_WORK' | 'CONFINED_SPACE' | 'HEIGHT_WORK' | 'ELECTRICAL_ISOLATION' | 'RADIOGRAPHY' | 'EXCAVATION';

export type PermitStatus = 'DRAFT' | 'PENDING_AI_REVIEW' | 'RECOMMENDED_REJECT' | 'RECOMMENDED_APPROVE' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'REVOKED';

export interface IsolationLock {
  lockId: string;
  tagType: 'LOTO_MECHANICAL' | 'LOTO_ELECTRICAL' | 'VALVE_BLIND';
  location: string;
  verifiedBy: string;
  status: 'LOCKED_VERIFIED' | 'PENDING_VERIFICATION';
}

export interface WorkPermit {
  permitId: string;
  applicantName: string;
  applicantRole: string;
  department: string;
  permitType: PermitType;
  plantUnit: string;
  zoneId: string;
  zoneName: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  description: string;
  supervisorName: string;
  status: PermitStatus;
  aiRiskScore: number;
  aiRecommendation: 'REJECT' | 'APPROVE_WITH_CONDITIONS' | 'APPROVE';
  atmosphericTests: {
    lelGas: number;
    o2Percentage: number;
    h2sPpm: number;
    testedBy: string;
    testTimestamp: string;
  };
  isolationLocks: IsolationLock[];
  associatedAssessmentId?: string;
  safetyPrecautions: string[];
}
