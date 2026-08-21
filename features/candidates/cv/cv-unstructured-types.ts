/**
 * Universal Unstructured CV Intelligence Types (CV Extraction 4.0)
 * Layout-independent, evidence-based token and block types.
 */

import type { RawExtractedExperience, RawExtractedEducation, AiCvExtractionPayload } from './cv.types';
import type { CvSectionType } from './cv-document-model';

export type CandidateTokenType =
  | 'PERSON_NAME'
  | 'EMAIL'
  | 'PHONE'
  | 'CITY'
  | 'DISTRICT'
  | 'ADDRESS'
  | 'DATE'
  | 'DATE_RANGE'
  | 'ROLE'
  | 'COMPANY'
  | 'UNIVERSITY'
  | 'DEGREE'
  | 'FIELD_OF_STUDY'
  | 'SKILL'
  | 'TOOL'
  | 'LANGUAGE'
  | 'LANGUAGE_LEVEL'
  | 'RESPONSIBILITY'
  | 'CERTIFICATE'
  | 'SECTION_HEADER'
  | 'SUMMARY'
  | 'URL'
  | 'LINKEDIN'
  | 'LOCATION'
  | 'NOISE'
  | 'UNKNOWN';

export interface CandidateToken {
  id: string;
  type: CandidateTokenType;
  text: string;
  normalized: string;
  lineIndex: number;
  startChar?: number;
  endChar?: number;
  confidence: number;
  metadata?: Record<string, any>;
}

export type ExperienceLayoutFormat =
  | 'FORMAT_A' // Role -> Company -> Date -> Responsibilities
  | 'FORMAT_B' // Company -> Role -> Date -> Responsibilities
  | 'FORMAT_C' // Date -> Company -> Role -> Responsibilities
  | 'FORMAT_D' // Company | Role | Date (single line or delimited)
  | 'FORMAT_E' // Role - Company - Location \n Date
  | 'FORMAT_F' // Company -> Role -> Location -> Date
  | 'FORMAT_G' // Date -> Role -> Company
  | 'FORMAT_H' // Key-Value (Company: ... Position: ... Dates: ...)
  | 'FORMAT_I' // Slash delimited (Company / Role / Date)
  | 'FORMAT_J' // Role @ Company \n Date
  | 'UNSTRUCTURED_BLOCK';

export interface UnstructuredExperienceBlock {
  format: ExperienceLayoutFormat;
  company?: string;
  role?: string;
  startYear?: number;
  endYear?: number;
  isCurrent?: boolean;
  city?: string;
  responsibilities: string[];
  confidence: number;
  tokens: CandidateToken[];
  evidence: string;
}

export interface UnstructuredEducationBlock {
  school?: string;
  level?: string;
  field?: string;
  graduationYear?: number;
  startYear?: number;
  confidence: number;
  tokens: CandidateToken[];
  evidence: string;
}

export interface UnstructuredPersonalInfo {
  fullName?: string;
  city?: string;
  district?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  website?: string;
  address?: string;
  gender?: 'Kadın' | 'Erkek';
  birthDate?: string;
  birthYear?: number;
  nationality?: string;
  evidence: Record<string, string>;
  confidence: Record<string, number>;
}

export interface UnstructuredExtractionResult extends AiCvExtractionPayload {
  unstructuredExperiences: UnstructuredExperienceBlock[];
  unstructuredEducation: UnstructuredEducationBlock[];
  personalInfo: UnstructuredPersonalInfo;
  fieldConfidenceScores: Record<string, number>;
  provenanceMap: Record<string, {
    value: any;
    evidence: string;
    confidence: number;
    method: string;
  }>;
}
