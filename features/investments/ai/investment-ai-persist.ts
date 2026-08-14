import type { InvestmentAiStoredAnalysis } from '@/features/investments/ai/investment-ai.types';

/** Only user-accepted AI analysis may be written to customFields / publish payload. */
export function acceptedInvestmentAiAnalysisOrNull(
  value: unknown,
): InvestmentAiStoredAnalysis | null {
  if (!value || typeof value !== 'object') return null;
  const rec = value as Partial<InvestmentAiStoredAnalysis>;
  if (rec.accepted !== true) return null;
  const summary = String(rec.professionalInvestmentSummary ?? '').trim();
  const fingerprint = String(rec.fingerprint ?? '').trim();
  if (!summary || !fingerprint) return null;
  return {
    fingerprint,
    accepted: true,
    professionalInvestmentSummary: summary,
    shortInvestmentSummary: String(rec.shortInvestmentSummary ?? '').trim(),
    investmentHighlights: Array.isArray(rec.investmentHighlights)
      ? rec.investmentHighlights.map(String)
      : [],
    businessModelSummary: String(rec.businessModelSummary ?? '').trim(),
    fundingUseSummary: String(rec.fundingUseSummary ?? '').trim(),
    strengths: Array.isArray(rec.strengths) ? rec.strengths.map(String) : [],
    profileGaps: Array.isArray(rec.profileGaps) ? rec.profileGaps.map(String) : [],
    improvementSuggestions: Array.isArray(rec.improvementSuggestions)
      ? rec.improvementSuggestions.map(String)
      : [],
  };
}

export function shouldReuseInvestmentAiFingerprint(
  currentFingerprint: string,
  storedFingerprint?: string | null,
): boolean {
  return Boolean(currentFingerprint) && currentFingerprint === storedFingerprint;
}
