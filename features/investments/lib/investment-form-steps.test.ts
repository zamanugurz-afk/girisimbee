import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { getListingFormSteps } from '@/features/listings/config/listing-form-steps.config';
import { CATEGORY_IDS, SEEKING_INVESTMENT_FIELD_SCHEMA } from '@/features/listings/config/listing-type-config';
import type { CategoryId } from '@/lib/domain/ids';
import type { ListingDetail } from '@/features/listings/types/listing.types';
import { buildInvestmentCardData } from '@/features/investments/lib/investment-card';
import { buildInvestmentContext } from '@/features/investments/lib/investment-context';
import { listingFormValuesToModulePayload } from '@/features/listings/lib/listing-form-publish.mapper';
import type { ListingFormValues } from '@/features/listings/form/category-listing-form';

function stepKeys(categoryId: CategoryId, stepId: string): string[] {
  const step = getListingFormSteps(categoryId).find((item) => item.id === stepId);
  const keys = step?.customFieldKeys;
  return Array.isArray(keys) ? keys : [];
}

describe('Yatırım Arıyorum form structure', () => {
  it('has wizard steps with consolidated package and publish flow', () => {
    const steps = getListingFormSteps(CATEGORY_IDS.yatirimBul);
    expect(steps.find((step) => step.id === 'traction')?.title).toBe('Bugünkü durum');
    expect(steps.map((step) => step.id)).toEqual([
      'identity',
      'product-market',
      'traction',
      'funding',
      'summary',
      'images',
      'package',
    ]);
  });

  it('places identity, product, traction and funding fields without aliases', () => {
    expect(stepKeys(CATEGORY_IDS.yatirimBul, 'identity')).toEqual([
      'productName',
      'sector',
      'businessModel',
      'targetCustomer',
      'foundedYear',
    ]);
    expect(stepKeys(CATEGORY_IDS.yatirimBul, 'product-market')).toEqual([
      'problem',
      'solution',
      'differentiation',
      'productStatus',
    ]);
    expect(stepKeys(CATEGORY_IDS.yatirimBul, 'traction')).toEqual([
      'revenueStatus',
      'tractionStatus',
      'monthlyRevenue',
      'mrr',
      'activeCustomers',
      'users',
      'growthRate',
      'gmv',
    ]);
    expect(stepKeys(CATEGORY_IDS.yatirimBul, 'funding')).toEqual([
      'stage',
      'investmentAmount',
      'investmentAmountCustom',
      'equityOffered',
      'valuation',
      'useOfFunds',
      'useOfFundsDetail',
    ]);

    const allKeys = getListingFormSteps(CATEGORY_IDS.yatirimBul).flatMap((step) =>
      Array.isArray(step.customFieldKeys) ? step.customFieldKeys : [],
    );
    expect(allKeys).not.toContain('investmentStage');
    expect(allKeys).not.toContain('arr');
    expect(allKeys).not.toContain('totalCustomers');
    expect(stepKeys(CATEGORY_IDS.yatirimBul, 'identity')).not.toContain('stage');
    expect(stepKeys(CATEGORY_IDS.yatirimBul, 'identity')).not.toContain('productStatus');
  });

  it('does not change Yatırım Yapacağım step order', () => {
    expect(getListingFormSteps(CATEGORY_IDS.yatirimYap).map((step) => step.id)).toEqual([
      'identity',
      'criteria',
      'ticket',
      'thesis',
      'images',
      'package',
    ]);
  });

  it('keeps canonical matching fields in the schema', () => {
    const keys = SEEKING_INVESTMENT_FIELD_SCHEMA.fields.map((field) => field.key);
    expect(keys).toEqual(
      expect.arrayContaining([
        'sector',
        'stage',
        'productStatus',
        'revenueStatus',
        'tractionStatus',
        'businessModel',
        'targetCustomer',
        'investmentAmount',
        'investmentAmountCustom',
        'equityOffered',
        'valuation',
        'useOfFunds',
        'useOfFundsDetail',
        'arr',
        'totalCustomers',
      ]),
    );
  });

  it('maps card data onto ListingDetail.investmentCard without undefined optionals', () => {
    const data = buildInvestmentCardData({
      context: buildInvestmentContext({
        title: 'Nova',
        customFields: { sector: 'SaaS / Yazılım', stage: 'MVP aşaması' },
      }),
    });
    const listingCard: NonNullable<ListingDetail['investmentCard']> = data;
    expect(listingCard.startupName).toBe('Nova');
    expect(listingCard.productName).toBeNull();
    expect(listingCard.sector).toBe('SaaS / Yazılım');
  });

  it('publishes investmentStage from stage and sector as the only industry input', () => {
    const values: ListingFormValues = {
      core: {
        title: 'Fatura AI',
        shortDescription: 'Fintech alanında ilk müşteriler aşamasında bir girişimdir; B2B müşterilere yöneliktir.',
        longDescription:
          'Fatura AI Fintech sektöründe, ilk müşteriler aşamasında bir girişimdir. Çözülen problem: KOBİ e-fatura. Çözüm: AI ve ERP otomasyonu. Hedef müşteri B2B, KOBİ; iş modeli Abonelik.',
        city: 'İstanbul Anadolu Yakası',
        country: 'TR',
        remotePolicy: null,
      },
      customFields: {
        sector: 'Fintech',
        stage: 'İlk müşteriler',
        investmentStage: 'MVP aşaması',
        productStatus: 'Beta',
        investmentAmount: '1.000.000 - 2.500.000 TL',
        equityOffered: 25,
        useOfFunds: ['Ürün geliştirme', 'Operasyon', 'Pazarlama'],
        investmentAiAnalysis: null,
      },
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

  it('uses a single AI action and a read-only seeking summary by default', () => {
    const form = readFileSync('features/listings/form/category-listing-form.tsx', 'utf8');
    const ai = readFileSync('features/investments/components/InvestmentAiAnalyzePanel.tsx', 'utf8');
    const cityField = readFileSync('features/listings/form/fields/core-fields.tsx', 'utf8');

    expect(form).toContain('editingInvestmentSummary');
    expect(form).toContain('Yatırımcı özeti');
    expect(form).toContain('cityRequired');
    expect(form).toContain('Kullanım detayı ekle');
    expect(ai).toContain('AI ile yatırımcı özetini geliştir');
    expect(ai).not.toContain('AI ile iyileştir');
    expect(ai).not.toContain('AI ile yatırımcı özetini oluştur');
    expect(cityField).toContain('required={cityRequired}');
  });
});
