import { describe, expect, it } from 'vitest';
import {
  deriveArrFromMrr,
  filterVisibleSeekingCustomFields,
  hasDistinctProductName,
  isSeekingCustomFieldVisible,
  materializeSeekingInvestmentFields,
  parseTurkishAmount,
  seekingFieldChangeExtras,
} from '@/features/investments/lib/seeking-form-visibility';

const TRACTION_KEYS = [
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
];

const FATURA_AI_FIELDS = {
  revenueStatus: 'Gelir yok',
  tractionStatus: 'Pilot',
  businessModel: ['Abonelik'],
  targetCustomer: ['B2B', 'KOBİ'],
};

describe('seeking form visibility', () => {
  it('hides stage aliases and never asks ARR or totalCustomers', () => {
    expect(isSeekingCustomFieldVisible('investmentStage', { customFields: {} })).toBe(false);
    expect(isSeekingCustomFieldVisible('arr', { customFields: FATURA_AI_FIELDS })).toBe(false);
    expect(isSeekingCustomFieldVisible('totalCustomers', { customFields: FATURA_AI_FIELDS })).toBe(false);
  });

  it('shows Fatura AI traction fields without revenue boxes or growthRate', () => {
    expect(
      filterVisibleSeekingCustomFields(TRACTION_KEYS, { customFields: FATURA_AI_FIELDS }),
    ).toEqual(['revenueStatus', 'tractionStatus', 'activeCustomers']);
  });

  it('hides growthRate when there is no revenue', () => {
    expect(
      isSeekingCustomFieldVisible('growthRate', {
        customFields: {
          revenueStatus: 'Gelir yok',
          tractionStatus: 'Pilot',
        },
      }),
    ).toBe(false);
    expect(
      isSeekingCustomFieldVisible('growthRate', {
        customFields: {
          revenueStatus: 'İlk gelir',
          tractionStatus: 'Pilot',
        },
      }),
    ).toBe(true);
  });

  it('hides useOfFundsDetail until the user asks to add it', () => {
    expect(
      isSeekingCustomFieldVisible('useOfFundsDetail', {
        customFields: { useOfFundsDetail: '' },
      }),
    ).toBe(false);
    expect(
      isSeekingCustomFieldVisible('useOfFundsDetail', {
        customFields: { useOfFundsDetail: '' },
        revealUseOfFundsDetail: true,
      }),
    ).toBe(true);
  });

  it('shows a single subscription revenue field as MRR when there is revenue', () => {
    const visible = filterVisibleSeekingCustomFields(TRACTION_KEYS, {
      customFields: {
        revenueStatus: 'İlk gelir',
        tractionStatus: 'İlk müşteriler',
        businessModel: ['Abonelik'],
        targetCustomer: ['B2B'],
      },
    });
    expect(visible).toContain('mrr');
    expect(visible).not.toContain('monthlyRevenue');
    expect(visible).not.toContain('arr');
  });

  it('shows monthlyRevenue instead of MRR for non-subscription revenue', () => {
    const visible = filterVisibleSeekingCustomFields(TRACTION_KEYS, {
      customFields: {
        revenueStatus: 'Düzenli gelir',
        tractionStatus: 'Aktif müşteri tabanı',
        businessModel: ['Hizmet'],
        targetCustomer: ['B2B'],
      },
    });
    expect(visible).toContain('monthlyRevenue');
    expect(visible).not.toContain('mrr');
  });

  it('hides customer metrics when there are no customers', () => {
    const visible = filterVisibleSeekingCustomFields(TRACTION_KEYS, {
      customFields: {
        revenueStatus: 'Gelir yok',
        tractionStatus: 'Müşteri yok',
        businessModel: ['SaaS'],
        targetCustomer: ['B2C'],
      },
    });
    expect(visible).toEqual(['revenueStatus', 'tractionStatus']);
  });

  it('shows GMV only for marketplace/e-commerce with revenue', () => {
    expect(
      isSeekingCustomFieldVisible('gmv', {
        customFields: {
          revenueStatus: 'İlk gelir',
          businessModel: ['Marketplace'],
        },
      }),
    ).toBe(true);
    expect(
      isSeekingCustomFieldVisible('gmv', {
        customFields: {
          revenueStatus: 'Gelir yok',
          businessModel: ['Marketplace'],
        },
      }),
    ).toBe(false);
    expect(
      isSeekingCustomFieldVisible('gmv', {
        customFields: {
          revenueStatus: 'İlk gelir',
          businessModel: ['Abonelik'],
        },
      }),
    ).toBe(false);
  });

  it('shows users only for consumer-facing models with customers', () => {
    expect(
      isSeekingCustomFieldVisible('users', {
        customFields: {
          tractionStatus: 'Pilot',
          targetCustomer: ['B2C'],
        },
      }),
    ).toBe(true);
    expect(
      isSeekingCustomFieldVisible('users', {
        customFields: FATURA_AI_FIELDS,
      }),
    ).toBe(false);
  });

  it('shows custom amount only when Özel tutar is selected', () => {
    expect(
      isSeekingCustomFieldVisible('investmentAmountCustom', {
        customFields: { investmentAmount: '1.000.000 - 2.500.000 TL' },
      }),
    ).toBe(false);
    expect(
      isSeekingCustomFieldVisible('investmentAmountCustom', {
        customFields: { investmentAmount: 'Özel tutar' },
      }),
    ).toBe(true);
  });

  it('hides productName unless it differs from the startup name', () => {
    expect(
      hasDistinctProductName('Fatura AI', 'Fatura AI'),
    ).toBe(false);
    expect(
      isSeekingCustomFieldVisible('productName', {
        customFields: { productName: 'Fatura AI' },
        title: 'Fatura AI',
      }),
    ).toBe(false);
    expect(
      isSeekingCustomFieldVisible('productName', {
        customFields: { productName: 'Fatura AI' },
        title: 'Fatura AI',
        revealProductName: true,
      }),
    ).toBe(true);
  });

  it('derives ARR from MRR and copies investmentStage from stage', () => {
    expect(parseTurkishAmount('120.000 TL')).toBe(120000);
    expect(deriveArrFromMrr('120.000 TL')).toBe('1.440.000 TL');
    expect(seekingFieldChangeExtras('mrr', '120.000 TL')).toEqual({
      monthlyRevenue: '120.000 TL',
      arr: '1.440.000 TL',
    });

    const materialized = materializeSeekingInvestmentFields({
      customFields: {
        stage: 'İlk müşteriler',
        businessModel: ['Abonelik'],
        mrr: '120.000 TL',
      },
    });
    expect(materialized.investmentStage).toBe('İlk müşteriler');
    expect(materialized.arr).toBe('1.440.000 TL');
    expect(materialized.monthlyRevenue).toBe('120.000 TL');
  });
});
