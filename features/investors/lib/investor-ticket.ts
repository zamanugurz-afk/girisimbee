import { CUSTOM_INVESTMENT_AMOUNT_OPTION } from '@/features/listings/config/listing-field-options';
import { asTrimmedString } from '@/features/investments/lib/investment-text';

export type InvestorTicket = {
  amountRange: string;
  amountCustom: string;
  amountDisplay: string;
  min: number | null;
  max: number | null;
};

const RANGE_BOUNDS: Record<string, { min: number; max: number | null }> = {
  "500.000 TL'ye kadar": { min: 0, max: 500_000 },
  '500.000 - 1.000.000 TL': { min: 500_000, max: 1_000_000 },
  '1.000.000 - 2.500.000 TL': { min: 1_000_000, max: 2_500_000 },
  '2.500.000 - 5.000.000 TL': { min: 2_500_000, max: 5_000_000 },
  '5.000.000 - 10.000.000 TL': { min: 5_000_000, max: 10_000_000 },
  '10.000.000 TL ve üzeri': { min: 10_000_000, max: null },
};

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const text = asTrimmedString(value).replace(/\./g, '').replace(',', '.');
  if (!text) return null;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : null;
}

function explicitBound(value: unknown, allowZero: boolean): number | null {
  const parsed = toNumber(value);
  if (parsed == null) return null;
  if (!allowZero && parsed === 0) return null;
  return parsed;
}

export function resolveInvestorTicket(input: {
  investmentAmount?: unknown;
  investmentAmountCustom?: unknown;
  ticketMin?: unknown;
  ticketMax?: unknown;
}): InvestorTicket {
  const amountRange = asTrimmedString(input.investmentAmount);
  const amountCustom = asTrimmedString(input.investmentAmountCustom);
  const isCustom = amountRange === CUSTOM_INVESTMENT_AMOUNT_OPTION;
  const customMin = explicitBound(input.ticketMin, isCustom);
  const customMax = explicitBound(input.ticketMax, isCustom);
  const bounds = !isCustom ? RANGE_BOUNDS[amountRange] : undefined;

  const min = customMin ?? bounds?.min ?? null;
  const max = customMax ?? bounds?.max ?? null;
  const amountDisplay = isCustom
    ? amountCustom
      || (min != null || max != null
        ? [min, max].filter((value) => value != null).map((value) => `${value} TL`).join(' – ')
        : '')
    : amountRange;

  return { amountRange, amountCustom, amountDisplay, min, max };
}

export function validateInvestorTicketFields(
  customFields: Record<string, unknown>,
): Record<string, string> {
  const errors: Record<string, string> = {};
  const ticket = resolveInvestorTicket(customFields);
  const hasMeaningfulCustom =
    Boolean(ticket.amountCustom)
    || (ticket.min != null && ticket.min > 0)
    || (ticket.max != null && ticket.max > 0);
  if (ticket.amountRange === CUSTOM_INVESTMENT_AMOUNT_OPTION && !hasMeaningfulCustom) {
    errors.investmentAmountCustom = 'Özel tutar seçildi. Bilet tutarını veya min/max değerini yazın.';
  }
  if (ticket.min != null && ticket.max != null && ticket.min > ticket.max) {
    errors.ticketMax = 'Maksimum bilet minimumdan küçük olamaz.';
  }
  return errors;
}
