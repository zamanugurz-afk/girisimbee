import { describe, expect, it } from 'vitest';
import { listingFormValuesToModulePayload } from '@/features/listings/lib/listing-form-publish.mapper';
import { CATEGORY_IDS } from '@/features/listings/config/listing-type-config';
import type { ListingFormValues } from '@/features/listings/form/category-listing-form';

function values(customFields: Record<string, unknown>): ListingFormValues {
  return {
    core: {
      title: 'SaaS Melek',
      shortDescription: 'Erken aşama SaaS ve fintech girişimlerine odaklanan melek yatırımcı profili.',
      longDescription:
        'SaaS Melek bir melek yatırımcı. Odak sektörler: SaaS / Yazılım. Tercih edilen aşamalar: Fikir aşaması, MVP aşaması. Yatırım bileti 1.000.000 - 2.500.000 TL.',
      city: 'İstanbul',
      country: 'TR',
      remotePolicy: null,
    },
    customFields,
    tags: [],
    images: [],
    contactPhone: '05551234567',
  };
}

describe('investor publish payload', () => {
  it('publishes multi-stage array and numeric ticket bounds', () => {
    const payload = listingFormValuesToModulePayload(
      CATEGORY_IDS.yatirimYap,
      values({
        investorType: 'Melek yatırımcı',
        sectors: ['SaaS / Yazılım', 'Fintech'],
        preferredStages: ['Fikir aşaması', 'MVP aşaması'],
        investmentAmount: '1.000.000 - 2.500.000 TL',
        preferredGeographies: ['İstanbul'],
        investorAiAnalysis: {
          accepted: false,
          fingerprint: 'x',
          professionalInvestorSummary: 'Taslak',
        },
      }),
    );

    expect(payload.preferredStages).toEqual(['Fikir aşaması', 'MVP aşaması']);
    expect(payload.investmentStage).toBe('Fikir aşaması');
    expect(payload.minimumInvestment).toBe(1_000_000);
    expect(payload.maximumInvestment).toBe(2_500_000);
    expect(payload.investorAiAnalysis).toBeNull();
  });
});
