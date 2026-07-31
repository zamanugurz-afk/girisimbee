import { describe, it, expect } from 'vitest';
import {
  moduleKeySchema,
  submitApplicationSchema,
  createMatchSchema,
  packageCheckoutSchema,
  registerDocumentSchema,
  entrepreneurProfileSchema,
  franchisePublishSchema,
  publishJobSchema,
} from '@/lib/api/validation';

describe('API validation schemas', () => {
  describe('moduleKeySchema', () => {
    it('accepts valid module keys', () => {
      expect(moduleKeySchema.parse('entrepreneurs')).toBe('entrepreneurs');
      expect(moduleKeySchema.parse('franchise')).toBe('franchise');
    });

    it('rejects invalid module keys', () => {
      expect(() => moduleKeySchema.parse('invalid')).toThrow();
    });
  });

  describe('submitApplicationSchema', () => {
    it('requires listingId', () => {
      const result = submitApplicationSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('accepts valid application input', () => {
      const result = submitApplicationSchema.parse({
        listingId: '550e8400-e29b-41d4-a716-446655440000',
        coverMessage: 'Merhaba',
      });
      expect(result.coverMessage).toBe('Merhaba');
    });
  });

  describe('createMatchSchema', () => {
    it('requires moduleKey and targetProfileId', () => {
      expect(
        createMatchSchema.safeParse({
          moduleKey: 'investors',
          targetProfileId: '550e8400-e29b-41d4-a716-446655440000',
        }).success,
      ).toBe(true);
    });
  });

  describe('packageCheckoutSchema', () => {
    it('requires valid URLs', () => {
      expect(
        packageCheckoutSchema.safeParse({
          packageSlug: 'single_listing',
          successUrl: 'not-a-url',
          cancelUrl: 'https://example.com/cancel',
        }).success,
      ).toBe(false);
    });
  });

  describe('registerDocumentSchema', () => {
    it('validates document registration', () => {
      const doc = registerDocumentSchema.parse({
        documentType: 'cv',
        name: 'CV.pdf',
        storagePath: 'user/cv.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 1024,
      });
      expect(doc.documentType).toBe('cv');
    });
  });

  describe('entrepreneurProfileSchema', () => {
    it('accepts partial profile updates', () => {
      const profile = entrepreneurProfileSchema.parse({ startupName: 'Acme' });
      expect(profile.startupName).toBe('Acme');
    });
  });

  describe('franchisePublishSchema', () => {
    it('requires flow buy or give', () => {
      expect(
        franchisePublishSchema.safeParse({
          flow: 'give',
          title: 'Franchise Fırsatı',
          shortDescription: 'Kısa açıklama en az on karakter',
          longDescription: 'Uzun açıklama en az yirmi karakter olmalıdır.',
        }).success,
      ).toBe(true);
    });
  });

  describe('publishJobSchema', () => {
    it('validates job publish payload', () => {
      const job = publishJobSchema.parse({
        title: 'Senior Developer',
        shortDescription: 'Kısa açıklama en az on karakter',
        longDescription: 'Uzun açıklama en az yirmi karakter olmalıdır.',
        city: 'İstanbul',
      });
      expect(job.city).toBe('İstanbul');
    });
  });
});
