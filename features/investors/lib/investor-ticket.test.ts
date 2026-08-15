import { describe, expect, it } from 'vitest';
import {
  resolveInvestorTicket,
  validateInvestorTicketFields,
} from '@/features/investors/lib/investor-ticket';

describe('investor ticket', () => {
  it('maps open-ended upper band to null max', () => {
    const ticket = resolveInvestorTicket({
      investmentAmount: '10.000.000 TL ve üzeri',
    });
    expect(ticket.min).toBe(10_000_000);
    expect(ticket.max).toBeNull();
  });

  it('requires a custom amount or min/max when Özel tutar is selected', () => {
    expect(
      validateInvestorTicketFields({
        investmentAmount: 'Özel tutar',
        investmentAmountCustom: '',
        ticketMin: 0,
        ticketMax: 0,
      }),
    ).toEqual({
      investmentAmountCustom: 'Özel tutar seçildi. Bilet tutarını veya min/max değerini yazın.',
    });
  });

  it('rejects inverted custom min/max', () => {
    expect(
      validateInvestorTicketFields({
        investmentAmount: 'Özel tutar',
        ticketMin: 2_000_000,
        ticketMax: 500_000,
      }),
    ).toEqual({
      ticketMax: 'Maksimum bilet minimumdan küçük olamaz.',
    });
  });
});
