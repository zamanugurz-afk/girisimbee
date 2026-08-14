/**
 * Seeking-investment catalogs. Reuses listing-field-options; does not invent
 * a second taxonomy. Canonical values stay stable for future
 * Yatırım Yapacağım matching.
 */
export {
  BUSINESS_MODEL_OPTIONS,
  CUSTOM_INVESTMENT_AMOUNT_OPTION,
  FOUNDER_COUNT_OPTIONS,
  INVESTOR_SECTOR_OPTIONS,
  INVESTMENT_AMOUNT_RANGES,
  PARTNER_EXPERTISE_OPTIONS,
  PRODUCT_STATUS_OPTIONS,
  REVENUE_STATUS_OPTIONS,
  SEEKING_INVESTMENT_AMOUNT_RANGES,
  STARTUP_STAGES,
  TARGET_CUSTOMER_OPTIONS,
  TEAM_SIZE_OPTIONS,
  TRACTION_STATUS_OPTIONS,
  USE_OF_FUNDS_OPTIONS,
} from '@/features/listings/config/listing-field-options';

export const INVESTMENT_PUBLISH_CUSTOM_KEYS = [
  'sector',
  'stage',
  'investmentStage',
  'productStatus',
  'productName',
  'foundedYear',
  'businessModel',
  'targetCustomer',
  'problem',
  'solution',
  'differentiation',
  'revenueStatus',
  'tractionStatus',
  'monthlyRevenue',
  'mrr',
  'arr',
  'activeCustomers',
  'totalCustomers',
  'users',
  'growthRate',
  'gmv',
  'investmentAmount',
  'investmentAmountCustom',
  'equityOffered',
  'valuation',
  'useOfFunds',
  'useOfFundsDetail',
  'founderCount',
  'teamSize',
  'founderExpertise',
  'investmentAiAnalysis',
] as const;

export const INVESTMENT_METRIC_KEYS = [
  'monthlyRevenue',
  'mrr',
  'arr',
  'activeCustomers',
  'totalCustomers',
  'users',
  'growthRate',
  'gmv',
] as const;

export const INVESTMENT_METRIC_LABELS: Record<(typeof INVESTMENT_METRIC_KEYS)[number], string> = {
  monthlyRevenue: 'Aylık gelir',
  mrr: 'MRR',
  arr: 'ARR',
  activeCustomers: 'Aktif müşteri',
  totalCustomers: 'Toplam müşteri',
  users: 'Kullanıcı',
  growthRate: 'Büyüme',
  gmv: 'GMV',
};

export function isCustomInvestmentAmount(value: unknown): boolean {
  return String(value ?? '').trim() === 'Özel tutar';
}
