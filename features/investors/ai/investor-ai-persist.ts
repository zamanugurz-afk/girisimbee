import type { InvestorAiStoredAnalysis } from '@/features/investors/ai/investor-ai.types';

/** Only user-accepted AI analysis may be written to customFields / publish payload. */
export function acceptedInvestorAiAnalysisOrNull(
  value: unknown,
): InvestorAiStoredAnalysis | null {
  if (!value || typeof value !== 'object') return null;
  const rec = value as Partial<InvestorAiStoredAnalysis>;
  if (rec.accepted !== true) return null;
  const summary = String(rec.professionalInvestorSummary ?? '').trim();
  const fingerprint = String(rec.fingerprint ?? '').trim();
  if (!summary || !fingerprint) return null;
  return {
    fingerprint,
    accepted: true,
    professionalInvestorSummary: summary,
    shortInvestorSummary: String(rec.shortInvestorSummary ?? '').trim(),
    investmentThesis: String(rec.investmentThesis ?? '').trim(),
    investmentHighlights: Array.isArray(rec.investmentHighlights)
      ? rec.investmentHighlights.map(String)
      : [],
    profileGaps: Array.isArray(rec.profileGaps) ? rec.profileGaps.map(String) : [],
    improvementSuggestions: Array.isArray(rec.improvementSuggestions)
      ? rec.improvementSuggestions.map(String)
      : [],
  };
}

export function shouldReuseInvestorAiFingerprint(
  currentFingerprint: string,
  storedFingerprint?: string | null,
): boolean {
  return Boolean(currentFingerprint) && currentFingerprint === storedFingerprint;
}
