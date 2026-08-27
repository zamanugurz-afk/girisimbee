import { describe, it, expect } from 'vitest';
import { getListingFormSteps } from '@/features/listings/config/listing-form-steps.config';
import { CATEGORY_IDS, LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';

describe('All Listing Form Wizard Flows Regression Suite', () => {
  describe('Flow 1: Ortak Arıyorum & Ortak Olmak İstiyorum (Founders)', () => {
    it('returns clean step configuration for seeking partner', () => {
      const steps = getListingFormSteps(CATEGORY_IDS.ortakBul, {
        partnershipIntent: 'seeking',
        listingTypeId: LISTING_TYPE_IDS.partnerSearch,
      });
      expect(steps.length).toBe(4);
      expect(steps[0].id).toBe('basics');
      expect(steps[1].id).toBe('partnership');
      expect(steps[2].id).toBe('details');
      expect(steps[3].id).toBe('package');
      expect(steps[2].customFieldKeys).toContain('contactPhone');
    });

    it('returns clean step configuration for joining as partner', () => {
      const steps = getListingFormSteps(CATEGORY_IDS.ortakBul, {
        partnershipIntent: 'joining',
        listingTypeId: LISTING_TYPE_IDS.partnerCandidate,
      });
      expect(steps.length).toBe(4);
      expect(steps[0].id).toBe('basics');
      expect(steps[1].id).toBe('partnership');
      expect(steps[2].id).toBe('details');
      expect(steps[3].id).toBe('package');
    });
  });

  describe('Flow 2: İşletme Devri (Business Transfer)', () => {
    it('returns clean step configuration for business transfer sell', () => {
      const steps = getListingFormSteps(CATEGORY_IDS.isletmeDevri, {
        businessTransferIntent: 'sell',
        listingTypeId: LISTING_TYPE_IDS.businessTransferSellDefault,
      });
      expect(steps.length).toBe(4);
      expect(steps[0].id).toBe('basics');
      expect(steps[1].id).toBe('financials');
      expect(steps[2].id).toBe('details');
      expect(steps[3].id).toBe('package');
    });

    it('returns clean step configuration for business transfer buy', () => {
      const steps = getListingFormSteps(CATEGORY_IDS.isletmeDevri, {
        businessTransferIntent: 'buy',
        listingTypeId: LISTING_TYPE_IDS.businessTransferBuyDefault,
      });
      expect(steps.length).toBe(4);
      expect(steps[0].id).toBe('basics');
      expect(steps[1].id).toBe('financials');
      expect(steps[2].id).toBe('details');
      expect(steps[3].id).toBe('package');
    });
  });

  describe('Flow 3: Franchise & Bayilik', () => {
    it('returns clean step configuration for franchise giving', () => {
      const steps = getListingFormSteps(CATEGORY_IDS.bayilikAl);
      expect(steps.length).toBe(4);
      expect(steps[0].id).toBe('basics');
      expect(steps[1].id).toBe('financials');
      expect(steps[2].id).toBe('details');
      expect(steps[3].id).toBe('package');
      expect(steps[2].customFieldKeys).toContain('contactPhone');
    });
  });

  describe('Flow 4: İş Arıyorum (Candidates)', () => {
    it('returns structured career profile wizard', () => {
      const steps = getListingFormSteps(CATEGORY_IDS.isBul, {
        listingTypeId: LISTING_TYPE_IDS.jobSeeker,
      });
      expect(steps.length).toBe(7);
      expect(steps[0].id).toBe('basics');
      expect(steps[1].id).toBe('experiences');
      expect(steps[2].id).toBe('education');
      expect(steps[3].id).toBe('skills');
      expect(steps[4].id).toBe('preferences');
      expect(steps[5].id).toBe('summary');
      expect(steps[6].id).toBe('package');
    });
  });

  describe('Flow 5: İşe Alıyorum (Employers)', () => {
    it('returns structured hiring wizard', () => {
      const steps = getListingFormSteps(CATEGORY_IDS.iseAl, {
        listingTypeId: LISTING_TYPE_IDS.hiringDefault,
      });
      expect(steps.length).toBe(6);
      expect(steps[0].id).toBe('basics');
      expect(steps[1].id).toBe('profile');
      expect(steps[2].id).toBe('education');
      expect(steps[3].id).toBe('offer');
      expect(steps[4].id).toBe('description');
      expect(steps[5].id).toBe('package');
    });
  });

  describe('Flow 6: Dijital & AI Girişimleri', () => {
    it('returns digital ai product wizard steps', () => {
      const steps = getListingFormSteps(CATEGORY_IDS.dijitalAi);
      expect(steps.length).toBe(6);
      expect(steps[0].id).toBe('basics');
      expect(steps[1].id).toBe('digital-ai-identity');
      expect(steps[2].id).toBe('digital-ai-capabilities');
      expect(steps[3].id).toBe('digital-ai-scope');
      expect(steps[4].id).toBe('images');
      expect(steps[5].id).toBe('package');
    });
  });
});
