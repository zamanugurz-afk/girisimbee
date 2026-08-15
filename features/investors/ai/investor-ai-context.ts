import type { InvestorCriteriaContext } from '@/features/investors/lib/investor-criteria';
import type { InvestorAiSafeContext } from '@/features/investors/ai/investor-ai.types';
import { redactCareerAiValue } from '@/features/candidates/ai/career-ai-pii';
import { fingerprintCanonical } from '@/features/investments/ai/investment-ai-context';

const TEXT_LIMIT = 280;

function clip(value: string, limit = TEXT_LIMIT): string {
  const text = value.trim();
  return text.length > limit ? text.slice(0, limit) : text;
}

export function toInvestorAiSafeContext(ctx: InvestorCriteriaContext): InvestorAiSafeContext {
  return {
    displayName: clip(ctx.displayName, 80),
    investorType: ctx.investorType,
    preferredSectors: ctx.preferredSectors.slice(0, 8),
    preferredStages: ctx.preferredStages.slice(0, 8),
    allStages: ctx.allStages,
    ticket: clip(ctx.investmentTicket.amountDisplay, 80),
    ticketMin: ctx.investmentTicket.min != null ? String(ctx.investmentTicket.min) : '',
    ticketMax: ctx.investmentTicket.max != null ? String(ctx.investmentTicket.max) : '',
    preferredProductStatuses: ctx.preferredProductStatuses.slice(0, 6),
    preferredBusinessModels: ctx.preferredBusinessModels.slice(0, 6),
    preferredTargetCustomers: ctx.preferredTargetCustomers.slice(0, 6),
    revenueExpectation: ctx.revenueExpectation,
    tractionExpectation: ctx.tractionExpectation,
    preferredGeographies: ctx.preferredGeographies.slice(0, 8),
    equityPreference: ctx.equityPreference,
    valuationApproach: ctx.valuationApproach,
    preferredUseOfFunds: ctx.preferredUseOfFunds.slice(0, 8),
    investmentThesis: clip(ctx.investmentThesis),
    mustHaveSignals: ctx.mustHaveSignals.slice(0, 6),
    dealBreakers: ctx.dealBreakers.slice(0, 6),
  };
}

export function compactInvestorAiContext(context: InvestorAiSafeContext): InvestorAiSafeContext {
  return redactCareerAiValue({
    displayName: context.displayName.trim(),
    investorType: context.investorType.trim(),
    preferredSectors: context.preferredSectors.map((item) => item.trim()).filter(Boolean).slice(0, 8),
    preferredStages: context.preferredStages.map((item) => item.trim()).filter(Boolean).slice(0, 8),
    allStages: Boolean(context.allStages),
    ticket: context.ticket.trim(),
    ticketMin: context.ticketMin.trim(),
    ticketMax: context.ticketMax.trim(),
    preferredProductStatuses: context.preferredProductStatuses
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 6),
    preferredBusinessModels: context.preferredBusinessModels
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 6),
    preferredTargetCustomers: context.preferredTargetCustomers
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 6),
    revenueExpectation: context.revenueExpectation.trim(),
    tractionExpectation: context.tractionExpectation.trim(),
    preferredGeographies: context.preferredGeographies
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 8),
    equityPreference: context.equityPreference.trim(),
    valuationApproach: context.valuationApproach.trim(),
    preferredUseOfFunds: context.preferredUseOfFunds
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 8),
    investmentThesis: clip(context.investmentThesis),
    mustHaveSignals: context.mustHaveSignals.map((item) => item.trim()).filter(Boolean).slice(0, 6),
    dealBreakers: context.dealBreakers.map((item) => item.trim()).filter(Boolean).slice(0, 6),
  });
}

export function investorAiFingerprint(context: InvestorAiSafeContext): string {
  return fingerprintCanonical(compactInvestorAiContext(context));
}

export function investorAiPolishFingerprint(kind: string, text: string): string {
  return fingerprintCanonical({ action: 'investor-polish', kind, text: text.trim() });
}
