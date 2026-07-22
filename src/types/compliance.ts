export interface RegulatoryStandard {
  code: string; // e.g., OISD-STD-105
  name: string; // e.g., Work Permit System in Hydrocarbon Industry
  governingBody: string; // e.g., Oil Industry Safety Directorate
  complianceScore: number; // 0 - 100%
  totalRules: number;
  activeViolations: number;
  lastAuditDate: string;
}

export interface RegulatoryClause {
  clauseId: string;
  standardCode: string;
  section: string;
  title: string;
  requirementText: string;
  mandatoryPrecautions: string[];
  penaltyCategory: 'CRITICAL_STOPPAGE' | 'HEAVY_FINE' | 'WARNING';
}

export interface CryptographicAuditEntry {
  entryId: string;
  sequenceNumber: number;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  eventType: 'PERMIT_AUTHORIZATION' | 'PERMIT_REJECTION' | 'SAFETY_OVERRIDE' | 'ISOLATION_TRIGGER' | 'AGENT_CALIBRATION';
  targetEntityId: string;
  actionSummary: string;
  previousHash: string;
  currentHash: string; // SHA-256
  digitalSignature: string;
}
