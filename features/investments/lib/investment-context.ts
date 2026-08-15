/**
 * Canonical investment context for Yatırım Arıyorum.
 * Built from structured form fields. Safe for future matching against
 * Yatırım Yapacağım criteria — no matching algorithm here.
 */
import {
  CUSTOM_INVESTMENT_AMOUNT_OPTION,
  INVESTMENT_METRIC_KEYS,
  INVESTMENT_METRIC_LABELS,
  isCustomInvestmentAmount,
} from '@/features/investments/taxonomy/investment-catalog';
import { asStringList, asTrimmedString, joinList } from '@/features/investments/lib/investment-text';

export type InvestmentTractionMetrics = {
  monthlyRevenue: string;
  mrr: string;
  arr: string;
  activeCustomers: string;
  totalCustomers: string;
  users: string;
  growthRate: string;
  gmv: string;
};

export type InvestmentContext = {
  startupName: string;
  productName: string;
  sector: string;
  category: string;
  stage: string;
  productStatus: string;
  revenueStatus: string;
  tractionStatus: string;
  businessModel: string[];
  targetCustomer: string[];
  problem: string;
  solution: string;
  differentiation: string;
  traction: InvestmentTractionMetrics;
  fundingNeed: {
    amountRange: string;
    amountCustom: string;
    amountDisplay: string;
  };
  investmentOffer: {
    equityOffered: string;
    valuation: string;
  };
  useOfFunds: string[];
  useOfFundsDetail: string;
  geography: string;
  team: {
    founderCount: string;
    teamSize: string;
    founderExpertise: string[];
  };
  /** Deterministic flags for future investor ↔ startup matching. */
  investmentThesisSignals: string[];
};

export type InvestmentContextInput = {
  title?: unknown;
  city?: unknown;
  customFields?: Record<string, unknown> | null;
};

function formatFundingDisplay(amountRange: string, amountCustom: string): string {
  if (isCustomInvestmentAmount(amountRange) && amountCustom) return amountCustom;
  if (amountRange && amountRange !== CUSTOM_INVESTMENT_AMOUNT_OPTION) return amountRange;
  return amountCustom;
}

function formatEquity(value: unknown): string {
  const text = asTrimmedString(value);
  if (!text) return '';
  return text.endsWith('%') ? text : `${text}%`;
}

function deriveThesisSignals(ctx: Omit<InvestmentContext, 'investmentThesisSignals'>): string[] {
  const signals: string[] = [];
  if (ctx.sector) signals.push(`sector:${ctx.sector}`);
  if (ctx.stage) signals.push(`stage:${ctx.stage}`);
  if (ctx.productStatus) signals.push(`product:${ctx.productStatus}`);
  if (ctx.revenueStatus) signals.push(`revenue:${ctx.revenueStatus}`);
  if (ctx.tractionStatus) signals.push(`traction:${ctx.tractionStatus}`);
  ctx.businessModel.forEach((model) => signals.push(`model:${model}`));
  ctx.targetCustomer.forEach((customer) => signals.push(`customer:${customer}`));
  if (ctx.fundingNeed.amountDisplay) signals.push(`funding:${ctx.fundingNeed.amountDisplay}`);
  if (ctx.investmentOffer.equityOffered) {
    signals.push(`equity:${ctx.investmentOffer.equityOffered}`);
  }
  if (ctx.geography) signals.push(`geo:${ctx.geography}`);
  if (ctx.revenueStatus && ctx.revenueStatus !== 'Gelir yok') signals.push('has-revenue');
  if (ctx.tractionStatus && ctx.tractionStatus !== 'Müşteri yok') signals.push('has-customers');
  const hasMetric = INVESTMENT_METRIC_KEYS.some((key) => ctx.traction[key]);
  if (hasMetric) signals.push('has-metrics');
  return signals;
}

export function buildInvestmentContext(input: InvestmentContextInput): InvestmentContext {
  const cf = input.customFields ?? {};
  const sector = asTrimmedString(cf.sector);
  const amountRange = asTrimmedString(cf.investmentAmount);
  const amountCustom = asTrimmedString(cf.investmentAmountCustom);
  const traction: InvestmentTractionMetrics = {
    monthlyRevenue: asTrimmedString(cf.monthlyRevenue),
    mrr: asTrimmedString(cf.mrr),
    arr: asTrimmedString(cf.arr),
    activeCustomers: asTrimmedString(cf.activeCustomers),
    totalCustomers: asTrimmedString(cf.totalCustomers),
    users: asTrimmedString(cf.users),
    growthRate: asTrimmedString(cf.growthRate),
    gmv: asTrimmedString(cf.gmv),
  };

  const base: Omit<InvestmentContext, 'investmentThesisSignals'> = {
    startupName: asTrimmedString(input.title),
    productName: asTrimmedString(cf.productName),
    sector,
    category: sector,
    stage: asTrimmedString(cf.stage) || asTrimmedString(cf.investmentStage),
    productStatus: asTrimmedString(cf.productStatus),
    revenueStatus: asTrimmedString(cf.revenueStatus),
    tractionStatus: asTrimmedString(cf.tractionStatus),
    businessModel: asStringList(cf.businessModel),
    targetCustomer: asStringList(cf.targetCustomer),
    problem: asTrimmedString(cf.problem),
    solution: asTrimmedString(cf.solution),
    differentiation: asTrimmedString(cf.differentiation),
    traction,
    fundingNeed: {
      amountRange,
      amountCustom,
      amountDisplay: formatFundingDisplay(amountRange, amountCustom),
    },
    investmentOffer: {
      equityOffered: formatEquity(cf.equityOffered),
      valuation: asTrimmedString(cf.valuation),
    },
    useOfFunds: asStringList(cf.useOfFunds),
    useOfFundsDetail: asTrimmedString(cf.useOfFundsDetail),
    geography: asTrimmedString(input.city),
    team: {
      founderCount: asTrimmedString(cf.founderCount),
      teamSize: asTrimmedString(cf.teamSize),
      founderExpertise: asStringList(cf.founderExpertise),
    },
  };

  return {
    ...base,
    investmentThesisSignals: deriveThesisSignals(base),
  };
}

export function hasInvestmentProfileReady(ctx: InvestmentContext): boolean {
  return Boolean(
    ctx.startupName
    && ctx.sector
    && ctx.stage
    && ctx.productStatus
    && ctx.businessModel.length > 0
    && ctx.targetCustomer.length > 0
    && ctx.problem
    && ctx.solution
    && ctx.revenueStatus
    && ctx.tractionStatus
    && ctx.fundingNeed.amountDisplay
    && ctx.investmentOffer.equityOffered
    && ctx.useOfFunds.length > 0,
  );
}

export function listEnteredMetrics(ctx: InvestmentContext): Array<{ key: string; label: string; value: string }> {
  return INVESTMENT_METRIC_KEYS
    .map((key) => ({
      key,
      label: INVESTMENT_METRIC_LABELS[key],
      value: ctx.traction[key],
    }))
    .filter((row) => {
      if (!row.value) return false;
      if (row.key === 'monthlyRevenue' && ctx.traction.mrr && ctx.traction.mrr === row.value) {
        return false;
      }
      return true;
    });
}

export function formatTeamLabel(ctx: InvestmentContext): string {
  const parts: string[] = [];
  if (ctx.team.founderCount) {
    parts.push(
      ctx.team.founderCount === '1'
        ? '1 kurucu'
        : `${ctx.team.founderCount} kurucu`,
    );
  }
  if (ctx.team.teamSize) parts.push(`${ctx.team.teamSize} kişilik ekip`);
  if (ctx.team.founderExpertise.length) {
    parts.push(joinList(ctx.team.founderExpertise));
  }
  return joinList(parts, ' · ');
}

export function validateInvestmentFundingFields(
  customFields: Record<string, unknown>,
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (
    isCustomInvestmentAmount(customFields.investmentAmount)
    && !asTrimmedString(customFields.investmentAmountCustom)
  ) {
    errors.investmentAmountCustom = 'Özel tutar seçildi. Aradığınız tutarı yazın.';
  }
  return errors;
}
