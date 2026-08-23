/**
 * GİRİŞİMBEE — CV EXTRACTION ENGINE 11.0
 * COMPLETE FIELD PROVENANCE & DATA CONTRACT SYSTEM
 * 
 * Provides an immutable, fully traceable audit record for every extracted
 * candidate attribute. Every field explicitly documents its:
 * - value
 * - source (e.g. PDF_PAGE_1, DOCX_TABLE_ROW_2)
 * - section (e.g. HEADER, CONTACT, EXPERIENCE, EDUCATION)
 * - resolver (e.g. NameResolver, ExperienceResolver)
 * - confidence (0.0 to 1.0)
 * - evidence (raw matched document snippet)
 * - positiveEvidence (reasons accepted)
 * - negativeEvidence (penalties considered)
 * - rejectedCandidates (candidates evaluated and dismissed)
 * - ambiguity (boolean flag)
 */

import type { CvZoneType } from './cv-document-zoning';
import type { CanonicalTaxonomyMappingResult } from './cv.types';

export interface CvFieldProvenanceRecord<T = any> {
  fieldName: string;
  value: T;
  source: string;
  section: CvZoneType | string;
  resolver: string;
  confidence: number;
  evidence: string;
  positiveEvidence: string[];
  negativeEvidence: string[];
  rejectedCandidates?: Array<{
    value: string;
    reason: string;
    score?: number;
  }>;
  ambiguity: boolean;
}

export interface CvExtractionProvenanceReport {
  documentId?: string;
  fileName?: string;
  fields: Record<string, CvFieldProvenanceRecord>;
  qualityScore: number;
  totalEntitiesExtracted: number;
  firewallViolationsCount: number;
  processingTimestamp: string;
}

export class CvProvenanceTracker {
  private records: Map<string, CvFieldProvenanceRecord> = new Map();
  private fileName?: string;
  private documentId?: string;

  constructor(fileName?: string, documentId?: string) {
    this.fileName = fileName;
    this.documentId = documentId;
  }

  recordField<T>(field: CvFieldProvenanceRecord<T>): void {
    this.records.set(field.fieldName, field);
  }

  getField<T>(fieldName: string): CvFieldProvenanceRecord<T> | undefined {
    return this.records.get(fieldName);
  }

  getAllRecords(): CvFieldProvenanceRecord[] {
    return Array.from(this.records.values());
  }

  generateReport(canonical: CanonicalTaxonomyMappingResult): CvExtractionProvenanceReport {
    const fieldsObj: Record<string, CvFieldProvenanceRecord> = {};
    this.records.forEach((rec, key) => {
      fieldsObj[key] = rec;
    });

    return {
      documentId: this.documentId,
      fileName: this.fileName,
      fields: fieldsObj,
      qualityScore: canonical.canonicalConfidence ?? 0.95,
      totalEntitiesExtracted:
        canonical.experiences.length +
        canonical.educationList.length +
        canonical.professionalSkills.length +
        canonical.technicalSkills.length +
        canonical.tools.length +
        (canonical.fullName ? 1 : 0) +
        (canonical.primaryRole ? 1 : 0) +
        (canonical.primarySector ? 1 : 0) +
        (canonical.residenceCity ? 1 : 0),
      firewallViolationsCount: 0,
      processingTimestamp: new Date().toISOString(),
    };
  }
}
