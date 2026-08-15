import type { InvestorCriteriaContext } from '@/features/investors/lib/investor-criteria';
import { buildInvestorSummaryDraft } from '@/features/investors/lib/investor-summary';
import { asTrimmedString, joinList } from '@/features/investments/lib/investment-text';
import { acceptedInvestorAiAnalysisOrNull } from '@/features/investors/ai/investor-ai-persist';

export type InvestorCardData = {
  displayName: string;
  investorType: string | null;
  sectors: string[];
  stages: string[];
  allStages: boolean;
  ticket: string | null;
  geographies: string[];
  businessModels: string[];
  targetCustomers: string[];
  revenueExpectation: string | null;
  tractionExpectation: string | null;
  thesis: string | null;
  summary: string;
  shortSummary: string | null;
  highlights: string[];
};

const CHIP_LIMIT = 3;

export function limitChips(values: string[], limit = CHIP_LIMIT): { shown: string[]; extra: number } {
  const unique = values.filter(Boolean);
  return {
    shown: unique.slice(0, limit),
    extra: Math.max(0, unique.length - limit),
  };
}

export function buildInvestorCardData(input: {
  context: InvestorCriteriaContext;
  longDescription?: unknown;
  shortDescription?: unknown;
  storedAnalysis?: unknown;
}): InvestorCardData {
  const { context } = input;
  const accepted = acceptedInvestorAiAnalysisOrNull(input.storedAnalysis);
  const draft = buildInvestorSummaryDraft(context);
  const manualLong = asTrimmedString(input.longDescription);
  const manualShort = asTrimmedString(input.shortDescription);
  const thesis =
    accepted?.investmentThesis
    || context.investmentThesis
    || null;

  return {
    displayName: context.displayName,
    investorType: context.investorType || null,
    sectors: context.preferredSectors,
    stages: context.allStages ? ['Tüm aşamalar'] : context.preferredStages,
    allStages: context.allStages,
    ticket: context.investmentTicket.amountDisplay || null,
    geographies: context.preferredGeographies,
    businessModels: context.preferredBusinessModels,
    targetCustomers: context.preferredTargetCustomers,
    revenueExpectation: context.revenueExpectation || null,
    tractionExpectation: context.tractionExpectation || null,
    thesis,
    summary: (accepted?.professionalInvestorSummary || manualLong || draft.longDescription).trim(),
    shortSummary:
      (accepted?.shortInvestorSummary || manualShort || draft.shortDescription).trim() || null,
    highlights: (accepted?.investmentHighlights?.length
      ? accepted.investmentHighlights
      : draft.highlights
    ).slice(0, 4),
  };
}

export function formatChipLine(values: string[], limit = CHIP_LIMIT): string | null {
  const { shown, extra } = limitChips(values, limit);
  if (!shown.length) return null;
  return extra > 0 ? `${joinList(shown)} +${extra}` : joinList(shown);
}
