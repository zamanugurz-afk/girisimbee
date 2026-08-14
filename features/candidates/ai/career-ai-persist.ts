import type { CareerAiStoredAnalysis } from '@/features/candidates/ai/career-ai.types';

/** Only user-accepted AI analysis may be written to customFields / publish payload. */
export function acceptedCareerAiAnalysisOrNull(value: unknown): CareerAiStoredAnalysis | null {
  if (!value || typeof value !== 'object') return null;
  const rec = value as Partial<CareerAiStoredAnalysis>;
  if (rec.accepted !== true) return null;
  const summary = String(rec.professionalSummary ?? '').trim();
  const fingerprint = String(rec.fingerprint ?? '').trim();
  if (!summary || !fingerprint) return null;
  return {
    fingerprint,
    accepted: true,
    professionalSummary: summary,
    shortSummary: String(rec.shortSummary ?? '').trim(),
    strengths: Array.isArray(rec.strengths) ? rec.strengths.map(String) : [],
    highlightedAchievements: Array.isArray(rec.highlightedAchievements)
      ? rec.highlightedAchievements.map(String)
      : [],
    profileGaps: Array.isArray(rec.profileGaps) ? rec.profileGaps.map(String) : [],
    improvementSuggestions: Array.isArray(rec.improvementSuggestions)
      ? rec.improvementSuggestions.map(String)
      : [],
  };
}

export function shouldReuseCareerAiFingerprint(
  currentFingerprint: string,
  storedFingerprint?: string | null,
): boolean {
  return Boolean(currentFingerprint) && currentFingerprint === storedFingerprint;
}
