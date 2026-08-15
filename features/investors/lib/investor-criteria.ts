/**
 * Canonical investor criteria — comparable to seeking Investment Context.
 * Built at read time from structured listing fields. No matching score here.
 */
import {
  ALL_STARTUP_STAGES_OPTION,
  STARTUP_STAGES,
} from '@/features/listings/config/listing-field-options';
import { asStringList, asTrimmedString } from '@/features/investments/lib/investment-text';
import {
  resolveInvestorTicket,
  type InvestorTicket,
} from '@/features/investors/lib/investor-ticket';

export type InvestorCriteriaContext = {
  displayName: string;
  investorType: string;
  preferredSectors: string[];
  preferredStages: string[];
  allStages: boolean;
  investmentTicket: InvestorTicket;
  preferredProductStatuses: string[];
  preferredBusinessModels: string[];
  preferredTargetCustomers: string[];
  revenueExpectation: string;
  tractionExpectation: string;
  preferredGeographies: string[];
  equityPreference: string;
  valuationApproach: string;
  preferredUseOfFunds: string[];
  investmentThesis: string;
  mustHaveSignals: string[];
  dealBreakers: string[];
  investmentThesisSignals: string[];
};

export type InvestorCriteriaInput = {
  title?: unknown;
  customFields?: Record<string, unknown> | null;
};

function normalizeStages(value: unknown): string[] {
  const list = asStringList(value);
  if (list.includes(ALL_STARTUP_STAGES_OPTION)) {
    return [...STARTUP_STAGES];
  }
  return list.filter((item) => item !== ALL_STARTUP_STAGES_OPTION);
}

function deriveThesisSignals(ctx: Omit<InvestorCriteriaContext, 'investmentThesisSignals'>): string[] {
  const signals: string[] = [];
  if (ctx.investorType) signals.push(`investor:${ctx.investorType}`);
  ctx.preferredSectors.forEach((sector) => signals.push(`sector:${sector}`));
  if (ctx.allStages) signals.push('all-stages');
  ctx.preferredStages.forEach((stage) => signals.push(`stage:${stage}`));
  ctx.preferredProductStatuses.forEach((status) => signals.push(`product:${status}`));
  ctx.preferredBusinessModels.forEach((model) => signals.push(`model:${model}`));
  ctx.preferredTargetCustomers.forEach((customer) => signals.push(`customer:${customer}`));
  if (ctx.revenueExpectation) signals.push(`revenue:${ctx.revenueExpectation}`);
  if (ctx.tractionExpectation) signals.push(`traction:${ctx.tractionExpectation}`);
  ctx.preferredGeographies.forEach((geo) => signals.push(`geo:${geo}`));
  if (ctx.investmentTicket.amountDisplay) {
    signals.push(`ticket:${ctx.investmentTicket.amountDisplay}`);
  }
  if (ctx.investmentTicket.min != null) signals.push(`ticketMin:${ctx.investmentTicket.min}`);
  if (ctx.investmentTicket.max != null) signals.push(`ticketMax:${ctx.investmentTicket.max}`);
  if (ctx.equityPreference) signals.push(`equity:${ctx.equityPreference}`);
  if (ctx.valuationApproach) signals.push(`valuation:${ctx.valuationApproach}`);
  ctx.preferredUseOfFunds.forEach((item) => signals.push(`use:${item}`));
  ctx.mustHaveSignals.forEach((item) => signals.push(`must:${item}`));
  ctx.dealBreakers.forEach((item) => signals.push(`break:${item}`));
  return signals;
}

export function buildInvestorCriteriaContext(input: InvestorCriteriaInput): InvestorCriteriaContext {
  const cf = input.customFields ?? {};
  const rawStages = asStringList(cf.preferredStages);
  const allStages =
    rawStages.includes(ALL_STARTUP_STAGES_OPTION)
    || STARTUP_STAGES.every((stage) => rawStages.includes(stage));
  const preferredStages = normalizeStages(cf.preferredStages);

  const base: Omit<InvestorCriteriaContext, 'investmentThesisSignals'> = {
    displayName: asTrimmedString(input.title),
    investorType: asTrimmedString(cf.investorType),
    preferredSectors: asStringList(cf.sectors),
    preferredStages,
    allStages,
    investmentTicket: resolveInvestorTicket(cf),
    preferredProductStatuses: asStringList(cf.preferredProductStatuses),
    preferredBusinessModels: asStringList(cf.preferredBusinessModels),
    preferredTargetCustomers: asStringList(cf.preferredTargetCustomers),
    revenueExpectation: asTrimmedString(cf.revenueExpectation),
    tractionExpectation: asTrimmedString(cf.tractionExpectation),
    preferredGeographies: asStringList(cf.preferredGeographies),
    equityPreference: asTrimmedString(cf.equityPreference),
    valuationApproach: asTrimmedString(cf.valuationApproach),
    preferredUseOfFunds: asStringList(cf.preferredUseOfFunds),
    investmentThesis: asTrimmedString(cf.investmentThesis),
    mustHaveSignals: asStringList(cf.mustHaveSignals),
    dealBreakers: asStringList(cf.dealBreakers),
  };

  return {
    ...base,
    investmentThesisSignals: deriveThesisSignals(base),
  };
}

export function hasInvestorProfileReady(ctx: InvestorCriteriaContext): boolean {
  return Boolean(
    ctx.displayName
    && ctx.investorType
    && ctx.preferredSectors.length > 0
    && (ctx.allStages || ctx.preferredStages.length > 0)
    && ctx.investmentTicket.amountDisplay,
  );
}

export const INVESTOR_PUBLISH_CUSTOM_KEYS = [
  'investorType',
  'sectors',
  'preferredStages',
  'investmentStage',
  'investmentAmount',
  'investmentAmountCustom',
  'ticketMin',
  'ticketMax',
  'minimumInvestment',
  'maximumInvestment',
  'preferredProductStatuses',
  'preferredBusinessModels',
  'preferredTargetCustomers',
  'revenueExpectation',
  'tractionExpectation',
  'preferredGeographies',
  'equityPreference',
  'valuationApproach',
  'preferredUseOfFunds',
  'investmentThesis',
  'mustHaveSignals',
  'dealBreakers',
  'investorAiAnalysis',
] as const;
