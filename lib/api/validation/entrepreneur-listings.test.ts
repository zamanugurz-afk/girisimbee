import { describe, it, expect } from 'vitest';
import { parseEntrepreneurListingCreate } from '@/lib/api/validation/entrepreneur-listings';
import { listingFormValuesToModulePayload } from '@/features/listings/lib/listing-form-publish.mapper';
import { CATEGORY_IDS } from '@/features/listings/config/listing-type-config';
import type { ListingFormValues } from '@/features/listings/form/category-listing-form';

describe('entrepreneur-listings validation', () => {
  it('parses startup listing create payload', () => {
    const parsed = parseEntrepreneurListingCreate({
      title: 'AI SaaS Platform',
      shortDescription: 'B2B analytics platform seeking seed investment',
      city: 'Istanbul',
      sector: 'Technology',
      investmentStage: 'seed',
      contactEmail: 'founder@example.com',
    });
    expect(parsed.title).toBe('AI SaaS Platform');
    expect(parsed.investmentStage).toBe('seed');
  });

  it('accepts structured seeking-investment fields used by the wizard', () => {
    const parsed = parseEntrepreneurListingCreate({
      title: 'FaturaAI',
      shortDescription:
        'FaturaAI, SaaS / Yazılım alanında MVP aşaması bir girişimdir; KOBİ müşterilere yöneliktir.',
      longDescription:
        'FaturaAI SaaS / Yazılım sektöründe, MVP aşaması bir girişimdir. Çözülen problem: KOBİ’lerin fatura ve stok takibi dağınık ve manuel.',
      city: 'İstanbul',
      sector: 'SaaS / Yazılım',
      stage: 'MVP aşaması',
      investmentStage: 'MVP aşaması',
      businessModel: ['SaaS', 'Abonelik'],
      targetCustomer: ['B2B', 'KOBİ'],
      teamSize: '3-5',
      monthlyRevenue: '120000',
      valuation: 'Görüşmeye açık',
      equityOffered: 12,
      useOfFunds: ['Ürün geliştirme', 'Satış'],
    });
    expect(parsed.businessModel).toEqual(['SaaS', 'Abonelik']);
    expect(parsed.teamSize).toBe('3-5');
    expect(parsed.monthlyRevenue).toBe('120000');
    expect(parsed.valuation).toBe('Görüşmeye açık');
  });

  it('accepts the wizard publish payload without number/array type errors', () => {
    const values: ListingFormValues = {
      core: {
        title: 'FaturaAI',
        shortDescription:
          'FaturaAI, SaaS / Yazılım alanında MVP aşaması bir girişimdir; KOBİ müşterilere yöneliktir.',
        longDescription:
          'FaturaAI SaaS / Yazılım sektöründe, MVP aşaması bir girişimdir. Çözülen problem: KOBİ’lerin fatura ve stok takibi dağınık ve manuel.',
        city: 'İstanbul',
        country: 'TR',
        remotePolicy: null,
      },
      customFields: {
        sector: 'SaaS / Yazılım',
        stage: 'MVP aşaması',
        businessModel: ['SaaS', 'Abonelik'],
        targetCustomer: ['B2B'],
        teamSize: '3-5',
        monthlyRevenue: '120000',
        valuation: '',
        equityOffered: 12,
        useOfFunds: ['Ürün geliştirme'],
      },
      tags: [],
      images: [],
      contactPhone: '05551234567',
    };
    expect(() =>
      parseEntrepreneurListingCreate(
        listingFormValuesToModulePayload(CATEGORY_IDS.yatirimBul, values),
      ),
    ).not.toThrow();
  });
});
