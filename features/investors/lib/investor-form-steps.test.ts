import { describe, expect, it } from 'vitest';
import { getListingFormSteps } from '@/features/listings/config/listing-form-steps.config';
import { CATEGORY_IDS, INVESTOR_FIELD_SCHEMA } from '@/features/listings/config/listing-type-config';
import type { ListingDetail } from '@/features/listings/types/listing.types';
import { buildInvestorCardData } from '@/features/investors/lib/investor-card';
import { buildInvestorCriteriaContext } from '@/features/investors/lib/investor-criteria';

describe('Yatırım Yapacağım form structure', () => {
  it('has wizard steps with consolidated package and publish flow', () => {
    const steps = getListingFormSteps(CATEGORY_IDS.yatirimYap);
    expect(steps.map((step) => step.id)).toEqual([
      'identity',
      'criteria',
      'ticket',
      'thesis',
      'images',
      'package',
    ]);
  });

  it('uses multi-select stages and shared seeking catalogs', () => {
    const byKey = Object.fromEntries(INVESTOR_FIELD_SCHEMA.fields.map((field) => [field.key, field]));
    expect(byKey.preferredStages.type).toBe('multi-enum');
    expect(byKey.sectors.options).toContain('SaaS / Yazılım');
    expect(byKey.preferredProductStatuses.options).toContain('MVP');
    expect(byKey.preferredBusinessModels.options).toContain('SaaS');
    expect(byKey.preferredTargetCustomers.options).toContain('B2B');
    expect(byKey.revenueExpectation.options).toContain('İlk gelir');
    expect(byKey.tractionExpectation.options).toContain('Pilot');
    expect(byKey.preferredUseOfFunds.options).toContain('Ürün geliştirme');
  });

  it('maps card data onto ListingDetail.investorCard', () => {
    const data = buildInvestorCardData({
      context: buildInvestorCriteriaContext({
        title: 'Melek',
        customFields: {
          investorType: 'Melek yatırımcı',
          sectors: ['Fintech'],
          preferredStages: ['MVP aşaması'],
          investmentAmount: '500.000 - 1.000.000 TL',
        },
      }),
    });
    const listingCard: NonNullable<ListingDetail['investorCard']> = data;
    expect(listingCard.displayName).toBe('Melek');
    expect(listingCard.investorType).toBe('Melek yatırımcı');
    expect(listingCard.ticket).toBe('500.000 - 1.000.000 TL');
  });
});
