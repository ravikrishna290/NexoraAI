export interface HistoricalIncident {
  incidentId: string;
  title: string;
  date: string;
  plantLocation: string;
  unit: string;
  severity: 'CATASTROPHIC' | 'MAJOR' | 'MODERATE' | 'NEAR_MISS';
  summary: string;
  rootCauses: string[];
  contributingFactors: string[];
  fatalities: number;
  injuries: number;
  financialLossUsd: number;
  regulatoryViolations: string[];
  vectorEmbeddingTags: string[];
  preventiveActionImplemented: string[];
}

export interface IncidentRcaNode {
  id: string;
  label: string;
  type: 'INCIDENT_EVENT' | 'DIRECT_CAUSE' | 'ROOT_CAUSE' | 'SOP_VIOLATION' | 'PREVENTIVE_ACTION';
  children?: IncidentRcaNode[];
  details?: string;
}
