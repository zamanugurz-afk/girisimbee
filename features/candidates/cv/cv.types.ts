import type { CareerExperience } from '@/features/candidates/config/career-profile-fields';
import type { CareerProfileFormValues } from '@/features/career-profile/types';

export interface ExtractedContactInfo {
  emails: string[];
  phones: string[];
  linkedInUrls: string[];
  websites: string[];
}

export interface MaskedCvResult {
  rawText: string;
  maskedText: string;
  contacts: ExtractedContactInfo;
  piiMaskedCount: number;
}

export interface DeterministicCvSignals {
  detectedCities: string[];
  dateRanges: Array<{ startYear?: number; endYear?: number; raw: string; isCurrent?: boolean }>;
  languages: string[];
  certificates: string[];
  educationDegrees: string[];
}

export interface RawExtractedExperience {
  sector?: string;
  role?: string;
  company?: string;
  durationYears?: number;
  startYear?: number | null;
  endYear?: number | null;
  isCurrent?: boolean;
  duration?: string;
  employmentType?: string;
  department?: string;
  responsibilities?: string;
  achievements?: string;
}

export interface RawExtractedEducation {
  level?: string;
  field?: string;
  school?: string;
  graduationYear?: number | null;
}

export interface RawAmbiguousCvItem {
  raw: string;
  kind: 'role' | 'sector' | 'skill' | 'tool';
  candidates: string[];
  suggestedCanonical?: string;
}

export interface AiCvExtractionPayload {
  experiences: RawExtractedExperience[];
  roles: string[];
  sectors: string[];
  skills: string[];
  tools: string[];
  education: RawExtractedEducation[];
  languages: string[];
  certificates: string[];
  locations: string[];
  summary: string;
  fullName?: string;
  gender?: string;
  birthDate?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  website?: string;
  nationality?: string;
  address?: string;
  ambiguousItems: RawAmbiguousCvItem[];
}

export interface CanonicalTaxonomyMappingResult {
  primaryRole: string;
  matchedRoles: string[];
  primarySector: string;
  matchedSectors: string[];
  professionalSkills: string[];
  technicalSkills: string[];
  tools: string[];
  educationLevel: string;
  educationField: string;
  educationList: Array<{ level: string; field?: string; school?: string; graduationYear?: number | null }>;
  languages: string;
  certificates: string;
  residenceCity: string;
  residenceDistrict?: string;
  fullName?: string;
  gender?: string;
  birthDate?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  website?: string;
  nationality?: string;
  address?: string;
  experiences: CareerExperience[];
  summary: string;
  ambiguousItems: RawAmbiguousCvItem[];
  canonicalConfidence: number;
}

export const CV_EXTRACTION_VERSION = '3.0.0';
export const CAREER_TAXONOMY_VERSION = '3.0.0';
export const CV_PARSER_VERSION = '3.0.0';

export interface CvExtractionMetrics {
  aiCallCount: number;
  aiCalled: boolean;
  aiSkipped: boolean;
  inputTokens: number;
  outputTokens: number;
  estimatedCostUsd: number;
  deterministicFieldsCount: number;
  aiExtractedFieldsCount: number;
  taxonomyMappedCount: number;
  ambiguousCount: number;
  piiMaskedCount: number;
  cacheHit: boolean;
  extractionVersion: string;
  taxonomyVersion: string;
  parserVersion: string;
  coverageScore: number;
  confidenceScores: Record<string, number>;
  processingTimeMs?: number;
}

export interface CvProfileDraftResult {
  formValues: Partial<CareerProfileFormValues>;
  cvFilledFieldKeys: string[];
  unconfirmedPreferenceKeys: string[];
  ambiguousItems: RawAmbiguousCvItem[];
  summary: string;
  extractedCount: number;
  categoriesFound: {
    experiences: number;
    roles: number;
    sectors: number;
    skills: number;
    tools: number;
    education: number;
    languages: number;
    certificates: number;
    locations: number;
    summary: boolean;
  };
  metrics: CvExtractionMetrics;
}
