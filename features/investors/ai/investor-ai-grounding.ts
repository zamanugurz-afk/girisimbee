import {
  BUSINESS_MODEL_OPTIONS,
  EQUITY_PREFERENCE_OPTIONS,
  INVESTMENT_AMOUNT_RANGES,
  INVESTOR_DEAL_BREAKER_OPTIONS,
  INVESTOR_MUST_HAVE_OPTIONS,
  INVESTOR_SECTOR_OPTIONS,
  INVESTOR_TYPE_OPTIONS,
  PRODUCT_STATUS_OPTIONS,
  REVENUE_STATUS_OPTIONS,
  STARTUP_STAGES,
  TARGET_CUSTOMER_OPTIONS,
  TRACTION_STATUS_OPTIONS,
  USE_OF_FUNDS_OPTIONS,
  VALUATION_APPROACH_OPTIONS,
} from '@/features/listings/config/listing-field-options';
import { hasUngroundedNumbers } from '@/features/candidates/ai/career-ai-grounding';

const CRITERIA_LABELS = [
  ...INVESTOR_SECTOR_OPTIONS,
  ...STARTUP_STAGES,
  'Tüm aşamalar',
  ...INVESTMENT_AMOUNT_RANGES,
  'Özel tutar',
  ...PRODUCT_STATUS_OPTIONS,
  ...BUSINESS_MODEL_OPTIONS,
  ...TARGET_CUSTOMER_OPTIONS,
  ...REVENUE_STATUS_OPTIONS,
  ...TRACTION_STATUS_OPTIONS,
  ...EQUITY_PREFERENCE_OPTIONS,
  ...VALUATION_APPROACH_OPTIONS,
  ...USE_OF_FUNDS_OPTIONS,
  ...INVESTOR_TYPE_OPTIONS,
  ...INVESTOR_MUST_HAVE_OPTIONS,
  ...INVESTOR_DEAL_BREAKER_OPTIONS,
  'Türkiye geneli',
  'Yurt dışı',
].slice()
  .sort((a, b) => b.length - a.length);

function normalizeLabel(value: string): string {
  return value.toLocaleLowerCase('tr-TR').trim();
}

export function extractInvestorCriteriaLabels(text: string): string[] {
  const haystack = normalizeLabel(text);
  const hits: string[] = [];
  for (const label of CRITERIA_LABELS) {
    const needle = normalizeLabel(label);
    if (needle.length < 3) continue;
    if (haystack.includes(needle)) hits.push(label);
  }
  return hits;
}

export function hasUngroundedInvestorCriteria(output: string, evidence: string): boolean {
  if (!output.trim()) return false;
  const allowed = new Set(extractInvestorCriteriaLabels(evidence).map(normalizeLabel));
  return extractInvestorCriteriaLabels(output).some((label) => !allowed.has(normalizeLabel(label)));
}

export function groundedInvestorTextOrEmpty(output: string, evidence: string): string {
  const text = output.trim();
  if (!text) return '';
  if (hasUngroundedNumbers(text, evidence)) return '';
  if (hasUngroundedInvestorCriteria(text, evidence)) return '';
  return text;
}

export function groundedInvestorList(items: string[], evidence: string): string[] {
  return items.filter((item) => Boolean(groundedInvestorTextOrEmpty(item, evidence)));
}
