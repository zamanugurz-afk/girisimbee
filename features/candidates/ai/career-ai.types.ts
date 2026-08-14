export const CAREER_AI_ACTIONS = ['suggest', 'polish', 'analyze'] as const;
export type CareerAiAction = (typeof CAREER_AI_ACTIONS)[number];

export const CAREER_AI_MANUAL_KINDS = [
  'role',
  'responsibility',
  'achievement',
  'skill',
  'education',
  'certificate',
] as const;
export type CareerAiManualKind = (typeof CAREER_AI_MANUAL_KINDS)[number];

export const CAREER_AI_POLISH_KINDS = ['responsibility', 'achievement', 'summary'] as const;
export type CareerAiPolishKind = (typeof CAREER_AI_POLISH_KINDS)[number];

export type CareerAiSafeExperience = {
  role: string;
  sector: string;
  period: string;
  responsibilities: string[];
  achievements: string[];
  metric: string;
};

/** Compact, PII-stripped payload sent to OpenAI for analyze. */
export type CareerAiSafeContext = {
  primarySector: string;
  desiredRole: string;
  experienceLevel: string;
  totalExperienceYears: number | null;
  professionalSkills: string[];
  educationLevel: string;
  educationField: string;
  certificates: string[];
  languages: Array<{ language: string; level: string }>;
  experiences: CareerAiSafeExperience[];
  careerProgressions: Array<{ from: string; to: string }>;
};

export type CareerAiSuggestRequest = {
  action: 'suggest';
  kind: CareerAiManualKind;
  text: string;
  catalog: string[];
  sector?: string;
  role?: string;
  experienceLevel?: string;
};

export type CareerAiPolishRequest = {
  action: 'polish';
  kind: CareerAiPolishKind;
  text: string;
  metric?: string;
  role?: string;
  sector?: string;
  experienceLevel?: string;
  totalExperienceYears?: number | null;
};

export type CareerAiAnalyzeRequest = {
  action: 'analyze';
  context: CareerAiSafeContext;
  fingerprint: string;
};

export type CareerAiRequest =
  | CareerAiSuggestRequest
  | CareerAiPolishRequest
  | CareerAiAnalyzeRequest;

export type CareerAiSuggestResult = {
  action: 'suggest';
  source: 'taxonomy';
  suggestions: string[];
  fingerprint: string;
};

export type CareerAiPolishResult = {
  action: 'polish';
  source: 'ai' | 'cache' | 'deterministic';
  polished: string;
  fingerprint: string;
};

export type CareerAiAnalysis = {
  professionalSummary: string;
  shortSummary: string;
  strengths: string[];
  highlightedAchievements: string[];
  profileGaps: string[];
  improvementSuggestions: string[];
};

export type CareerAiAnalyzeResult = CareerAiAnalysis & {
  action: 'analyze';
  source: 'ai' | 'cache';
  fingerprint: string;
};

export type CareerAiResult =
  | CareerAiSuggestResult
  | CareerAiPolishResult
  | CareerAiAnalyzeResult;

/** Persisted subset in listings.customFields — only after the user accepts. */
export type CareerAiStoredAnalysis = CareerAiAnalysis & {
  fingerprint: string;
  accepted?: boolean;
};
