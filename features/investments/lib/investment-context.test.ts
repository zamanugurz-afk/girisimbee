import { describe, expect, it } from 'vitest';
import {
  buildInvestmentContext,
  hasInvestmentProfileReady,
  listEnteredMetrics,
  validateInvestmentFundingFields,
} from '@/features/investments/lib/investment-context';

function saasMvp(overrides: Record<string, unknown> = {}) {
  return buildInvestmentContext({
    title: 'FaturaAI',
    city: 'İstanbul',
    customFields: {
      sector: 'SaaS / Yazılım',
      stage: 'MVP aşaması',
      productStatus: 'MVP',
      businessModel: ['SaaS', 'Abonelik'],
      targetCustomer: ['B2B', 'KOBİ'],
      problem: 'KOBİ fatura süreçleri dağınık',
      solution: 'Tek panelde fatura ve stok',
      differentiation: 'Sektöre özel şablonlar',
      revenueStatus: 'İlk gelir',
      tractionStatus: 'İlk müşteriler',
      mrr: '120000',
      activeCustomers: '14',
      investmentAmount: '2.500.000 - 5.000.000 TL',
      equityOffered: 10,
      useOfFunds: ['Ürün geliştirme', 'Satış'],
      ...overrides,
    },
  });
}

describe('investment context', () => {
  it('builds canonical matching-ready fields for a revenue SaaS', () => {
    const ctx = saasMvp();
    expect(ctx.sector).toBe('SaaS / Yazılım');
    expect(ctx.category).toBe('SaaS / Yazılım');
    expect(ctx.stage).toBe('MVP aşaması');
    expect(ctx.fundingNeed.amountDisplay).toBe('2.500.000 - 5.000.000 TL');
    expect(ctx.investmentOffer.equityOffered).toBe('10%');
    expect(ctx.investmentThesisSignals).toEqual(
      expect.arrayContaining([
        'sector:SaaS / Yazılım',
        'stage:MVP aşaması',
        'has-revenue',
        'has-customers',
        'has-metrics',
        'model:SaaS',
      ]),
    );
    expect(hasInvestmentProfileReady(ctx)).toBe(true);
  });

  it('keeps custom amount and does not invent metrics', () => {
    const ctx = saasMvp({
      investmentAmount: 'Özel tutar',
      investmentAmountCustom: '3.200.000 TL',
      mrr: '',
      activeCustomers: '',
      revenueStatus: 'Gelir yok',
      tractionStatus: 'Müşteri yok',
    });
    expect(ctx.fundingNeed.amountDisplay).toBe('3.200.000 TL');
    expect(listEnteredMetrics(ctx)).toEqual([]);
    expect(ctx.investmentThesisSignals).not.toContain('has-revenue');
    expect(ctx.investmentThesisSignals).not.toContain('has-customers');
  });

  it('requires custom amount when Özel tutar is selected', () => {
    expect(
      validateInvestmentFundingFields({
        investmentAmount: 'Özel tutar',
        investmentAmountCustom: '',
      }),
    ).toEqual({
      investmentAmountCustom: 'Özel tutar seçildi. Aradığınız tutarı yazın.',
    });
  });

  it('distinguishes no-revenue from missing revenue status', () => {
    const none = saasMvp({ revenueStatus: 'Gelir yok', mrr: '' });
    const missing = saasMvp({ revenueStatus: '', mrr: '' });
    expect(none.revenueStatus).toBe('Gelir yok');
    expect(missing.revenueStatus).toBe('');
    expect(none.investmentThesisSignals).not.toContain('has-revenue');
  });
});
