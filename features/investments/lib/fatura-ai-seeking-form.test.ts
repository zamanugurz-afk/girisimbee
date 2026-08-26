import { describe, expect, it } from 'vitest';
import { getListingFormSteps } from '@/features/listings/config/listing-form-steps.config';
import { CATEGORY_IDS } from '@/features/listings/config/listing-type-config';
import { listingFormValuesToModulePayload } from '@/features/listings/lib/listing-form-publish.mapper';
import type { ListingFormValues } from '@/features/listings/form/category-listing-form';
import { buildInvestmentContext } from '@/features/investments/lib/investment-context';
import { buildInvestmentSummaryDraft } from '@/features/investments/lib/investment-summary';
import { buildInvestmentCardData } from '@/features/investments/lib/investment-card';
import {
  filterVisibleSeekingCustomFields,
  hasDistinctProductName,
  materializeSeekingInvestmentFields,
} from '@/features/investments/lib/seeking-form-visibility';

const FATURA_AI = {
  title: 'Fatura AI',
  city: 'İstanbul Anadolu Yakası',
  customFields: {
    productName: 'Fatura AI',
    sector: 'Fintech',
    businessModel: ['Abonelik'],
    targetCustomer: ['B2B', 'KOBİ'],
    foundedYear: '2024',
    problem: 'Kobilerin AI E- Fatura',
    solution: 'Otomasyonla ERP',
    differentiation: 'Tamamen Yapay Zeka İle Çalışıyor',
    productStatus: 'Beta',
    revenueStatus: 'Gelir yok',
    tractionStatus: 'Pilot',
    activeCustomers: '20',
    growthRate: '12',
    users: '1200',
    totalCustomers: '45',
    monthlyRevenue: '',
    mrr: '',
    arr: '',
    gmv: '',
    stage: 'İlk müşteriler',
    investmentStage: 'MVP aşaması',
    investmentAmount: '1.000.000 - 2.500.000 TL',
    investmentAmountCustom: '',
    equityOffered: 25,
    valuation: '',
    useOfFunds: ['Ürün geliştirme', 'Operasyon', 'Pazarlama'],
    useOfFundsDetail: '',
    founderCount: '1',
    teamSize: '3-5',
    founderExpertise: ['Yazılım geliştirme', 'CFO / Finans', 'Satış'],
    investmentAiAnalysis: null,
  },
};

function stepCustomKeys(stepId: string): string[] {
  const step = getListingFormSteps(CATEGORY_IDS.yatirimBul).find((item) => item.id === stepId);
  const keys = step?.customFieldKeys;
  return Array.isArray(keys) ? keys : [];
}

function visibleOn(stepId: string): string[] {
  return filterVisibleSeekingCustomFields(stepCustomKeys(stepId), {
    customFields: FATURA_AI.customFields,
    title: FATURA_AI.title,
  });
}

describe('GC-CBA9994B Fatura AI seeking form walkthrough', () => {
  it('keeps the 10-step architecture and isolates stage / product / traction', () => {
    expect(getListingFormSteps(CATEGORY_IDS.yatirimBul).map((step) => step.id)).toEqual([
      'identity',
      'product-market',
      'traction',
      'funding',
      'summary',
      'images',
      'package',
    ]);
    expect(stepCustomKeys('identity')).not.toContain('stage');
    expect(stepCustomKeys('identity')).not.toContain('productStatus');
    expect(stepCustomKeys('product-market')).toEqual([
      'problem',
      'solution',
      'differentiation',
      'productStatus',
    ]);
    expect(stepCustomKeys('traction')).toEqual(
      expect.arrayContaining(['revenueStatus', 'tractionStatus']),
    );
    expect(stepCustomKeys('funding')[0]).toBe('stage');
  });

  it('asks Fatura AI only the identity facts that differ from the startup name', () => {
    expect(hasDistinctProductName(FATURA_AI.title, FATURA_AI.customFields.productName)).toBe(false);
    expect(visibleOn('identity')).toEqual([
      'sector',
      'businessModel',
      'targetCustomer',
      'foundedYear',
    ]);
  });

  it('hides ARR, MRR, GMV, totalCustomers and users on the Fatura AI traction step', () => {
    expect(visibleOn('traction')).toEqual([
      'revenueStatus',
      'tractionStatus',
      'activeCustomers',
    ]);
    expect(visibleOn('traction')).not.toEqual(
      expect.arrayContaining(['mrr', 'monthlyRevenue', 'arr', 'gmv', 'users', 'totalCustomers']),
    );
  });

  it('asks stage once on funding and does not show investmentStage or a custom amount', () => {
    expect(visibleOn('funding')).toEqual([
      'stage',
      'investmentAmount',
      'equityOffered',
      'valuation',
      'useOfFunds',
    ]);
    expect(visibleOn('funding')).not.toContain('useOfFundsDetail');
    expect(visibleOn('funding')).not.toContain('investmentAmountCustom');
    expect(visibleOn('funding')).not.toContain('investmentStage');
  });

  it('builds a deterministic investor summary without asking the user to write it', () => {
    const draft = buildInvestmentSummaryDraft(
      buildInvestmentContext({
        title: FATURA_AI.title,
        city: FATURA_AI.city,
        customFields: FATURA_AI.customFields,
      }),
    );
    expect(draft.shortDescription.length).toBeGreaterThanOrEqual(30);
    expect(draft.longDescription.length).toBeGreaterThanOrEqual(100);
    expect(draft.shortDescription).toMatch(/Fatura AI/i);
    expect(draft.longDescription).toMatch(/Pilot/);
    expect(draft.longDescription).toMatch(/20/);
    expect(draft.longDescription).not.toMatch(/OpenAI|uydur/i);
  });

  it('publishes sector once and overwrites stale investmentStage from stage', () => {
    const materialized = materializeSeekingInvestmentFields({
      customFields: FATURA_AI.customFields,
      title: FATURA_AI.title,
    });
    expect(materialized.investmentStage).toBe('İlk müşteriler');
    expect(materialized.arr).toBe('');

    const values: ListingFormValues = {
      core: {
        title: FATURA_AI.title,
        shortDescription: 'Fatura AI, Fintech alanında ilk müşteriler aşamasında bir girişimdir; B2B, KOBİ müşterilere yöneliktir.',
        longDescription:
          'Fatura AI Fintech sektöründe, ilk müşteriler aşamasında bir girişimdir. Çözülen problem: Kobilerin AI E- Fatura. Çözüm: Otomasyonla ERP. Hedef müşteri B2B, KOBİ; iş modeli Abonelik. Mevcut durum: Beta, Gelir yok, Pilot.',
        city: FATURA_AI.city,
        country: 'TR',
        remotePolicy: null,
      },
      customFields: materialized,
      tags: [],
      images: [],
      contactPhone: '05551234567',
    };
    const payload = listingFormValuesToModulePayload(CATEGORY_IDS.yatirimBul, values);
    expect(payload.sector).toBe('Fintech');
    expect(payload.stage).toBe('İlk müşteriler');
    expect(payload.investmentStage).toBe('İlk müşteriler');
    expect(payload.investmentAiAnalysis).toBeNull();
  });

  it('renders the investor card from structured Fatura AI fields', () => {
    const card = buildInvestmentCardData({
      context: buildInvestmentContext({
        title: FATURA_AI.title,
        city: FATURA_AI.city,
        customFields: FATURA_AI.customFields,
      }),
    });
    expect(card.startupName).toBe('Fatura AI');
    expect(card.sector).toBe('Fintech');
    expect(card.productStatus).toBe('Beta');
    expect(card.stage).toBe('İlk müşteriler');
    expect(card.fundingAmount).toBe('1.000.000 - 2.500.000 TL');
    expect(card.equityOffered).toBe('25%');
    expect(card.revenueStatus).toBe('Gelir yok');
    expect(card.tractionStatus).toBe('Pilot');
    expect(card.tractionMetrics.map((row) => row.label)).toEqual(
      expect.arrayContaining(['Aktif müşteri', 'Büyüme']),
    );
    expect(card.tractionMetrics.map((row) => row.label)).not.toEqual(
      expect.arrayContaining(['MRR', 'ARR', 'GMV', 'Toplam müşteri']),
    );
  });
});
