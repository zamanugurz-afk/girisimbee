/**
 * Yatırım Arıyorum form visibility + side effects.
 * Canonical customFields keys stay unchanged; only UI and write-through mapping change.
 */
import { CUSTOM_INVESTMENT_AMOUNT_OPTION } from '@/features/listings/config/listing-field-options';

export const SEEKING_REVENUE_NONE = 'Gelir yok';
export const SEEKING_TRACTION_NONE = 'Müşteri yok';

const SUBSCRIPTION_MODELS = new Set(['SaaS', 'Abonelik', 'Freemium']);
const MARKETPLACE_MODELS = new Set(['Marketplace', 'E-ticaret']);
const USER_BASED_CUSTOMERS = new Set(['B2C', 'B2B2C', 'Tüketici']);

const NEVER_ASK_KEYS = new Set(['arr', 'totalCustomers', 'investmentStage']);

export type SeekingVisibilityInput = {
  customFields: Record<string, unknown>;
  title?: unknown;
  revealProductName?: boolean;
  revealUseOfFundsDetail?: boolean;
};

function asList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === 'string' && value.trim()) {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

function asText(value: unknown): string {
  return String(value ?? '').trim();
}

export function hasDistinctProductName(title: unknown, productName: unknown): boolean {
  const name = asText(title).toLocaleLowerCase('tr-TR');
  const product = asText(productName).toLocaleLowerCase('tr-TR');
  return Boolean(product && product !== name);
}

export function hasSeekingRevenue(customFields: Record<string, unknown>): boolean {
  const status = asText(customFields.revenueStatus);
  return Boolean(status && status !== SEEKING_REVENUE_NONE);
}

export function hasSeekingCustomers(customFields: Record<string, unknown>): boolean {
  const status = asText(customFields.tractionStatus);
  return Boolean(status && status !== SEEKING_TRACTION_NONE);
}

export function isSubscriptionBusinessModel(customFields: Record<string, unknown>): boolean {
  return asList(customFields.businessModel).some((model) => SUBSCRIPTION_MODELS.has(model));
}

export function isMarketplaceBusinessModel(customFields: Record<string, unknown>): boolean {
  return asList(customFields.businessModel).some((model) => MARKETPLACE_MODELS.has(model));
}

export function isUserBasedCustomer(customFields: Record<string, unknown>): boolean {
  return asList(customFields.targetCustomer).some((item) => USER_BASED_CUSTOMERS.has(item));
}

export function parseTurkishAmount(value: unknown): number | null {
  const text = asText(value);
  if (!text) return null;
  const cleaned = text.replace(/[^\d,.-]/g, '');
  if (!cleaned) return null;

  if (cleaned.includes(',') && cleaned.includes('.')) {
    const parsed = Number(cleaned.replace(/\./g, '').replace(',', '.'));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }
  if (cleaned.includes(',')) {
    const parsed = Number(cleaned.replace(',', '.'));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }
  if (/^\d{1,3}(\.\d{3})+$/.test(cleaned)) {
    const parsed = Number(cleaned.replace(/\./g, ''));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function formatTurkishAmount(value: number): string {
  return `${Math.round(value).toLocaleString('tr-TR')} TL`;
}

export function deriveArrFromMrr(mrr: unknown): string {
  const amount = parseTurkishAmount(mrr);
  if (!amount) return '';
  return formatTurkishAmount(amount * 12);
}

export function isSeekingCustomFieldVisible(
  key: string,
  input: SeekingVisibilityInput,
): boolean {
  if (NEVER_ASK_KEYS.has(key)) return false;

  const { customFields } = input;
  const hasRevenue = hasSeekingRevenue(customFields);
  const hasCustomers = hasSeekingCustomers(customFields);

  switch (key) {
    case 'productName':
      return Boolean(
        input.revealProductName
        || hasDistinctProductName(input.title, customFields.productName),
      );
    case 'investmentAmountCustom':
      return asText(customFields.investmentAmount) === CUSTOM_INVESTMENT_AMOUNT_OPTION;
    case 'monthlyRevenue':
      return hasRevenue && !isSubscriptionBusinessModel(customFields);
    case 'mrr':
      return hasRevenue && isSubscriptionBusinessModel(customFields);
    case 'gmv':
      return hasRevenue && isMarketplaceBusinessModel(customFields);
    case 'activeCustomers':
      return hasCustomers;
    case 'users':
      return hasCustomers && isUserBasedCustomer(customFields);
    case 'growthRate':
      return hasRevenue;
    case 'useOfFundsDetail':
      return Boolean(
        input.revealUseOfFundsDetail
        || asText(customFields.useOfFundsDetail),
      );
    default:
      return true;
  }
}

export function filterVisibleSeekingCustomFields(
  keys: string[],
  input: SeekingVisibilityInput,
): string[] {
  return keys.filter((key) => isSeekingCustomFieldVisible(key, input));
}

export function seekingFieldChangeExtras(
  key: string,
  value: unknown,
): Record<string, unknown> {
  if (key !== 'mrr') return {};
  const extras: Record<string, unknown> = { monthlyRevenue: value };
  const arr = deriveArrFromMrr(value);
  if (arr) extras.arr = arr;
  return extras;
}

export function materializeSeekingInvestmentFields(input: {
  customFields: Record<string, unknown>;
  title?: unknown;
}): Record<string, unknown> {
  const customFields = { ...input.customFields };
  const stage = asText(customFields.stage);
  if (stage) customFields.investmentStage = stage;

  if (isSubscriptionBusinessModel(customFields)) {
    const mrr = asText(customFields.mrr) || asText(customFields.monthlyRevenue);
    if (mrr) {
      customFields.mrr = mrr;
      if (!asText(customFields.monthlyRevenue)) customFields.monthlyRevenue = mrr;
    }
  }

  const derivedArr = deriveArrFromMrr(customFields.mrr);
  if (derivedArr) customFields.arr = derivedArr;

  return customFields;
}

export function displaySeekingMetricValue(
  key: string,
  customFields: Record<string, unknown>,
): unknown {
  if (key === 'mrr') {
    return asText(customFields.mrr) || customFields.monthlyRevenue;
  }
  if (key === 'monthlyRevenue') {
    return asText(customFields.monthlyRevenue) || customFields.mrr;
  }
  return customFields[key];
}
