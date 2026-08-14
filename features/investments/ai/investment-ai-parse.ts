import type { InvestmentAiAnalysis } from '@/features/investments/ai/investment-ai.types';
import { groundedList, groundedTextOrEmpty } from '@/features/candidates/ai/career-ai-grounding';

function asTrimmedList(value: unknown, limit: number): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item ?? '').trim())
    .filter(Boolean)
    .slice(0, limit);
}

export function parseInvestmentAiAnalysis(
  json: unknown,
  evidence: string,
): InvestmentAiAnalysis | null {
  const record = json && typeof json === 'object' ? (json as Record<string, unknown>) : {};
  const professionalInvestmentSummary = groundedTextOrEmpty(
    String(record.professionalInvestmentSummary ?? '').trim(),
    evidence,
  );
  if (!professionalInvestmentSummary) return null;
  return {
    professionalInvestmentSummary,
    shortInvestmentSummary: groundedTextOrEmpty(
      String(record.shortInvestmentSummary ?? '').trim(),
      evidence,
    ),
    investmentHighlights: groundedList(asTrimmedList(record.investmentHighlights, 4), evidence),
    businessModelSummary: groundedTextOrEmpty(
      String(record.businessModelSummary ?? '').trim(),
      evidence,
    ),
    fundingUseSummary: groundedTextOrEmpty(String(record.fundingUseSummary ?? '').trim(), evidence),
    strengths: groundedList(asTrimmedList(record.strengths, 4), evidence),
    profileGaps: asTrimmedList(record.profileGaps, 4),
    improvementSuggestions: asTrimmedList(record.improvementSuggestions, 4),
  };
}
