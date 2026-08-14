import { describe, expect, it } from 'vitest';
import { getListingFormSteps } from '@/features/listings/config/listing-form-steps.config';
import { CATEGORY_IDS, SEEKING_INVESTMENT_FIELD_SCHEMA } from '@/features/listings/config/listing-type-config';
import type { ListingDetail } from '@/features/listings/types/listing.types';
import { buildInvestmentCardData } from '@/features/investments/lib/investment-card';
import { buildInvestmentContext } from '@/features/investments/lib/investment-context';

describe('Yatırım Arıyorum form structure', () => {
  it('has 10 wizard steps including publish flow', () => {
    const steps = getListingFormSteps(CATEGORY_IDS.yatirimBul);
    expect(steps.map((step) => step.id)).toEqual([
      'identity',
      'product-market',
      'traction',
      'funding',
      'summary',
      'images',
      'kvkk',
      'preview',
      'package',
      'publish',
    ]);
  });

  it('keeps canonical matching fields in the schema', () => {
    const keys = SEEKING_INVESTMENT_FIELD_SCHEMA.fields.map((field) => field.key);
    expect(keys).toEqual(
      expect.arrayContaining([
        'sector',
        'stage',
        'businessModel',
        'targetCustomer',
        'revenueStatus',
        'investmentAmount',
        'equityOffered',
        'useOfFunds',
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
});
