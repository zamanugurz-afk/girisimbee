import type { InvestorAiAnalysis } from '@/features/investors/ai/investor-ai.types';
import {
  groundedInvestorList,
  groundedInvestorTextOrEmpty,
} from '@/features/investors/ai/investor-ai-grounding';

function asTrimmedList(value: unknown, limit: number): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item ?? '').trim())
    .filter(Boolean)
    .slice(0, limit);
}

export function parseInvestorAiAnalysis(
  json: unknown,
  evidence: string,
): InvestorAiAnalysis | null {
  const record = json && typeof json === 'object' ? (json as Record<string, unknown>) : {};
  const professionalInvestorSummary = groundedInvestorTextOrEmpty(
    String(record.professionalInvestorSummary ?? '').trim(),
    evidence,
  );
  if (!professionalInvestorSummary) return null;
  return {
    professionalInvestorSummary,
    shortInvestorSummary: groundedInvestorTextOrEmpty(
      String(record.shortInvestorSummary ?? '').trim(),
      evidence,
    ),
    investmentThesis: groundedInvestorTextOrEmpty(
      String(record.investmentThesis ?? '').trim(),
      evidence,
    ),
    investmentHighlights: groundedInvestorList(asTrimmedList(record.investmentHighlights, 4), evidence),
    profileGaps: asTrimmedList(record.profileGaps, 4),
    improvementSuggestions: asTrimmedList(record.improvementSuggestions, 4),
  };
}
