/**
 * GİRİŞİMBEE — CV EXTRACTION ENGINE: EVIDENCE CONTRACT
 * 
 * Formal evidence contract for every extracted field in the pipeline.
 * Invariant: ZERO EVIDENCE -> NO CANONICAL VALUE (null + explicit reason).
 */

import type { CvSectionType } from './cv-document-model';

export type EvidenceConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNRESOLVED';

export interface FieldProvenance {
  page?: number;
  blockId?: string;
  lineId?: string;
  sourceType: 'document' | 'spatial_header' | 'inferred' | 'none';
  tokenIndices?: [number, number];
}

export interface EvidenceContract<T = any> {
  field: string;
  value: T | null;
  source: CvSectionType | string;
  section: string;
  evidence: string;
  confidence: number; // 0.0 to 1.0
  confidenceLevel: EvidenceConfidenceLevel;
  resolver: string;
  provenance: FieldProvenance;
  unresolvedReason?: string;
}

export function createEvidenceContract<T = any>(params: {
  field: string;
  value: T | null;
  source: CvSectionType | string;
  section: string;
  evidence: string;
  confidence?: number;
  confidenceLevel?: EvidenceConfidenceLevel;
  resolver: string;
  provenance?: Partial<FieldProvenance>;
  unresolvedReason?: string;
}): EvidenceContract<T> {
  const conf = params.confidence ?? (params.value ? 0.9 : 0.0);
  const confLevel =
    params.confidenceLevel ??
    (conf >= 0.85 ? 'HIGH' : conf >= 0.6 ? 'MEDIUM' : conf > 0 ? 'LOW' : 'UNRESOLVED');

  return {
    field: params.field,
    value: params.value,
    source: params.source,
    section: params.section,
    evidence: params.evidence,
    confidence: conf,
    confidenceLevel: confLevel,
    resolver: params.resolver,
    provenance: {
      sourceType: params.value ? 'document' : 'none',
      ...params.provenance,
    },
    unresolvedReason: params.value === null ? (params.unresolvedReason || 'insufficient_evidence') : undefined,
  };
}
