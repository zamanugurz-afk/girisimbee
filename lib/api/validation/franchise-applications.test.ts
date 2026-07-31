import { describe, it, expect } from 'vitest';
import {
  franchiseApplicationSubmitSchema,
  franchiseApplicationListQuerySchema,
  franchiseApplicationStatusUpdateSchema,
  franchiseApplicationNoteSchema,
  franchiseApplicationStatusSchema,
} from '@/lib/api/validation/franchise-applications';

const LISTING_ID = '550e8400-e29b-41d4-a716-446655440000';

describe('franchise application validation', () => {
  describe('franchiseApplicationSubmitSchema', () => {
    it('requires listingId', () => {
      expect(franchiseApplicationSubmitSchema.safeParse({}).success).toBe(false);
    });

    it('accepts cover message and initial note', () => {
      const result = franchiseApplicationSubmitSchema.parse({
        listingId: LISTING_ID,
        coverMessage: 'Merhaba',
        initialNote: 'Ek bilgi',
      });
      expect(result.coverMessage).toBe('Merhaba');
      expect(result.initialNote).toBe('Ek bilgi');
    });
  });

  describe('franchiseApplicationListQuerySchema', () => {
    it('accepts status filter and date range', () => {
      const result = franchiseApplicationListQuerySchema.parse({
        listingId: LISTING_ID,
        status: ['pending', 'reviewing'],
        submittedAfter: '2026-01-01T00:00:00.000Z',
      });
      expect(result.status).toEqual(['pending', 'reviewing']);
    });
  });

  describe('franchiseApplicationStatusUpdateSchema', () => {
    it('accepts franchise status transitions', () => {
      for (const status of franchiseApplicationStatusSchema.options) {
        expect(
          franchiseApplicationStatusUpdateSchema.safeParse({ status }).success,
        ).toBe(true);
      }
    });

    it('accepts optional note with status', () => {
      const result = franchiseApplicationStatusUpdateSchema.parse({
        status: 'approved',
        note: 'Onaylandı',
      });
      expect(result.note).toBe('Onaylandı');
    });
  });

  describe('franchiseApplicationNoteSchema', () => {
    it('requires non-empty note', () => {
      expect(franchiseApplicationNoteSchema.safeParse({ note: '' }).success).toBe(false);
      expect(franchiseApplicationNoteSchema.safeParse({ note: 'Not' }).success).toBe(true);
    });
  });
});
