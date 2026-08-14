import type { InvestmentContext } from '@/features/investments/lib/investment-context';
import type { InvestmentAiSafeContext } from '@/features/investments/ai/investment-ai.types';
import { redactCareerAiValue } from '@/features/candidates/ai/career-ai-pii';

const TEXT_LIMIT = 280;

function clip(value: string, limit = TEXT_LIMIT): string {
  const text = value.trim();
  return text.length > limit ? text.slice(0, limit) : text;
}

export function stableStringify(value: unknown): string {
  if (value === null || typeof value === 'undefined') return JSON.stringify(value);
  if (typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`).join(',')}}`;
}

/** Deterministic fingerprint — isomorphic (no Node crypto). */
export function fingerprintCanonical(value: unknown): string {
  const canonical = stableStringify(value);
  let hash = 2166136261;
  for (let i = 0; i < canonical.length; i += 1) {
    hash ^= canonical.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function toInvestmentAiSafeContext(ctx: InvestmentContext): InvestmentAiSafeContext {
  return {
    startupName: clip(ctx.startupName, 80),
    productName: clip(ctx.productName, 80),
    sector: ctx.sector,
    stage: ctx.stage,
    productStatus: ctx.productStatus,
    revenueStatus: ctx.revenueStatus,
    tractionStatus: ctx.tractionStatus,
    businessModel: ctx.businessModel.slice(0, 6),
    targetCustomer: ctx.targetCustomer.slice(0, 6),
    problem: clip(ctx.problem),
    solution: clip(ctx.solution),
    differentiation: clip(ctx.differentiation),
    traction: { ...ctx.traction },
    fundingAmount: ctx.fundingNeed.amountDisplay,
    equityOffered: ctx.investmentOffer.equityOffered,
    valuation: ctx.investmentOffer.valuation,
    useOfFunds: ctx.useOfFunds.slice(0, 8),
    useOfFundsDetail: clip(ctx.useOfFundsDetail),
    geography: clip(ctx.geography, 80),
    founderCount: ctx.team.founderCount,
    teamSize: ctx.team.teamSize,
    founderExpertise: ctx.team.founderExpertise.slice(0, 6),
  };
}

export function compactInvestmentAiContext(
  context: InvestmentAiSafeContext,
): InvestmentAiSafeContext {
  return redactCareerAiValue({
    startupName: context.startupName.trim(),
    productName: context.productName.trim(),
    sector: context.sector.trim(),
    stage: context.stage.trim(),
    productStatus: context.productStatus.trim(),
    revenueStatus: context.revenueStatus.trim(),
    tractionStatus: context.tractionStatus.trim(),
    businessModel: context.businessModel.map((item) => item.trim()).filter(Boolean).slice(0, 6),
    targetCustomer: context.targetCustomer.map((item) => item.trim()).filter(Boolean).slice(0, 6),
    problem: clip(context.problem),
    solution: clip(context.solution),
    differentiation: clip(context.differentiation),
    traction: {
      monthlyRevenue: context.traction.monthlyRevenue.trim(),
      mrr: context.traction.mrr.trim(),
      arr: context.traction.arr.trim(),
      activeCustomers: context.traction.activeCustomers.trim(),
      totalCustomers: context.traction.totalCustomers.trim(),
      users: context.traction.users.trim(),
      growthRate: context.traction.growthRate.trim(),
      gmv: context.traction.gmv.trim(),
    },
    fundingAmount: context.fundingAmount.trim(),
    equityOffered: context.equityOffered.trim(),
    valuation: context.valuation.trim(),
    useOfFunds: context.useOfFunds.map((item) => item.trim()).filter(Boolean).slice(0, 8),
    useOfFundsDetail: clip(context.useOfFundsDetail),
    geography: clip(context.geography, 80),
    founderCount: context.founderCount.trim(),
    teamSize: context.teamSize.trim(),
    founderExpertise: context.founderExpertise.map((item) => item.trim()).filter(Boolean).slice(0, 6),
  });
}

export function investmentAiFingerprint(context: InvestmentAiSafeContext): string {
  return fingerprintCanonical(compactInvestmentAiContext(context));
}

export function investmentAiPolishFingerprint(kind: string, text: string): string {
  return fingerprintCanonical({ action: 'polish', kind, text: text.trim() });
}
