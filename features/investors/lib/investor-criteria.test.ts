import { describe, expect, it } from 'vitest';
import {
  buildInvestorCriteriaContext,
  hasInvestorProfileReady,
} from '@/features/investors/lib/investor-criteria';
import { STARTUP_STAGES } from '@/features/listings/config/listing-field-options';

function angel(overrides: Record<string, unknown> = {}) {
  return buildInvestorCriteriaContext({
    title: 'Erken Aşama SaaS Yatırımcısı',
    customFields: {
      investorType: 'Melek yatırımcı',
      sectors: ['Yapay zeka', 'Fintech', 'SaaS / Yazılım'],
      preferredStages: ['Fikir aşaması', 'MVP aşaması', 'İlk müşteriler'],
      investmentAmount: '1.000.000 - 2.500.000 TL',
      preferredProductStatuses: ['MVP', 'Beta'],
      preferredBusinessModels: ['SaaS', 'Abonelik'],
      preferredTargetCustomers: ['B2B', 'KOBİ'],
      revenueExpectation: 'İlk gelir',
      tractionExpectation: 'Pilot',
      preferredGeographies: ['Türkiye geneli', 'İstanbul'],
      equityPreference: 'Azınlık payı',
      valuationApproach: 'Görüşmeye açık',
      preferredUseOfFunds: ['Ürün geliştirme', 'Satış'],
      investmentThesis: 'Erken aşama B2B SaaS ekiplerine yatırım yapmak istiyorum.',
      mustHaveSignals: ['Türkiye odaklı'],
      dealBreakers: ['Yurt dışı istemiyorum'],
      ...overrides,
    },
  });
}

describe('investor criteria context', () => {
  it('keeps multi-stage and multi-sector selections', () => {
    const ctx = angel();
    expect(ctx.preferredSectors).toEqual(['Yapay zeka', 'Fintech', 'SaaS / Yazılım']);
    expect(ctx.preferredStages).toEqual(['Fikir aşaması', 'MVP aşaması', 'İlk müşteriler']);
    expect(ctx.allStages).toBe(false);
    expect(hasInvestorProfileReady(ctx)).toBe(true);
  });

  it('accepts legacy preferredStages string', () => {
    const ctx = angel({ preferredStages: 'MVP aşaması' });
    expect(ctx.preferredStages).toEqual(['MVP aşaması']);
  });

  it('expands Tüm aşamalar into canonical stages', () => {
    const ctx = angel({ preferredStages: ['Tüm aşamalar'] });
    expect(ctx.allStages).toBe(true);
    expect(ctx.preferredStages).toEqual([...STARTUP_STAGES]);
  });

  it('maps custom min/max ticket to numeric bounds', () => {
    const ctx = angel({
      investmentAmount: 'Özel tutar',
      investmentAmountCustom: '750000 - 2000000 TL',
      ticketMin: 750000,
      ticketMax: 2000000,
    });
    expect(ctx.investmentTicket.min).toBe(750000);
    expect(ctx.investmentTicket.max).toBe(2000000);
    expect(ctx.investmentTicket.amountDisplay).toBe('750000 - 2000000 TL');
  });

  it('resolves band ticket to numeric min/max without using the label for matching', () => {
    const ctx = angel({ investmentAmount: '1.000.000 - 2.500.000 TL' });
    expect(ctx.investmentTicket.min).toBe(1_000_000);
    expect(ctx.investmentTicket.max).toBe(2_500_000);
    expect(ctx.investmentTicket.amountRange).toBe('1.000.000 - 2.500.000 TL');
  });

  it('keeps geography, model, customer, revenue, traction, equity and deal breakers', () => {
    const ctx = angel();
    expect(ctx.preferredGeographies).toEqual(['Türkiye geneli', 'İstanbul']);
    expect(ctx.preferredBusinessModels).toEqual(['SaaS', 'Abonelik']);
    expect(ctx.preferredTargetCustomers).toEqual(['B2B', 'KOBİ']);
    expect(ctx.revenueExpectation).toBe('İlk gelir');
    expect(ctx.tractionExpectation).toBe('Pilot');
    expect(ctx.equityPreference).toBe('Azınlık payı');
    expect(ctx.valuationApproach).toBe('Görüşmeye açık');
    expect(ctx.dealBreakers).toEqual(['Yurt dışı istemiyorum']);
    expect(ctx.mustHaveSignals).toEqual(['Türkiye odaklı']);
    expect(ctx.investmentThesisSignals).toEqual(
      expect.arrayContaining([
        'sector:SaaS / Yazılım',
        'stage:MVP aşaması',
        'geo:İstanbul',
        'ticketMin:1000000',
        'break:Yurt dışı istemiyorum',
      ]),
    );
  });

  it('ignores empty default ticketMin/ticketMax on a band', () => {
    const ctx = angel({ ticketMin: 0, ticketMax: 0 });
    expect(ctx.investmentTicket.min).toBe(1_000_000);
    expect(ctx.investmentTicket.max).toBe(2_500_000);
  });
});
