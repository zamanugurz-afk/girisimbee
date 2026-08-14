import type { InvestmentContext } from '@/features/investments/lib/investment-context';
import {
  formatTeamLabel,
  listEnteredMetrics,
} from '@/features/investments/lib/investment-context';
import { buildInvestmentSummaryDraft } from '@/features/investments/lib/investment-summary';
import { asTrimmedString, joinList } from '@/features/investments/lib/investment-text';
import { acceptedInvestmentAiAnalysisOrNull } from '@/features/investments/ai/investment-ai-persist';

export type InvestmentCardData = {
  startupName: string;
  productName: string | null;
  sector: string | null;
  stage: string | null;
  productStatus: string | null;
  city: string | null;
  summary: string;
  shortSummary: string | null;
  fundingAmount: string | null;
  equityOffered: string | null;
  valuation: string | null;
  revenueStatus: string | null;
  tractionStatus: string | null;
  businessModel: string | null;
  targetCustomer: string | null;
  useOfFunds: string | null;
  useOfFundsDetail: string | null;
  differentiation: string | null;
  team: string | null;
  highlights: string[];
  tractionMetrics: Array<{ label: string; value: string }>;
};

export function buildInvestmentCardData(input: {
  context: InvestmentContext;
  longDescription?: unknown;
  shortDescription?: unknown;
  storedAnalysis?: unknown;
}): InvestmentCardData {
  const { context } = input;
  const accepted = acceptedInvestmentAiAnalysisOrNull(input.storedAnalysis);
  const draft = buildInvestmentSummaryDraft(context);
  const manualLong = asTrimmedString(input.longDescription);
  const manualShort = asTrimmedString(input.shortDescription);

  const summary =
    (accepted?.professionalInvestmentSummary || manualLong || draft.longDescription).trim();
  const shortSummary =
    (accepted?.shortInvestmentSummary || manualShort || draft.shortDescription).trim() || null;

  const highlights = (accepted?.investmentHighlights?.length
    ? accepted.investmentHighlights
    : draft.highlights
  ).slice(0, 4);

  return {
    startupName: context.startupName,
    productName: context.productName || null,
    sector: context.sector || null,
    stage: context.stage || null,
    productStatus: context.productStatus || null,
    city: context.geography || null,
    summary,
    shortSummary,
    fundingAmount: context.fundingNeed.amountDisplay || null,
    equityOffered: context.investmentOffer.equityOffered || null,
    valuation: context.investmentOffer.valuation || null,
    revenueStatus: context.revenueStatus || null,
    tractionStatus: context.tractionStatus || null,
    businessModel: joinList(context.businessModel) || null,
    targetCustomer: joinList(context.targetCustomer) || null,
    useOfFunds: joinList(context.useOfFunds) || null,
    useOfFundsDetail: context.useOfFundsDetail || null,
    differentiation: context.differentiation || null,
    team: formatTeamLabel(context) || null,
    highlights,
    tractionMetrics: listEnteredMetrics(context).map(({ label, value }) => ({ label, value })),
  };
}
