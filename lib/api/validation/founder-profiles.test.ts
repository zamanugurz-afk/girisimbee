import { describe, it, expect } from 'vitest';
import { parseFounderProfileUpsert } from '@/lib/api/validation/founder-profiles';

describe('founder-profiles validation', () => {
  it('parses extended founder profile fields', () => {
    const parsed = parseFounderProfileUpsert({
      fullName: 'Ali Kurucu',
      city: 'Istanbul',
      founderType: 'technical',
      startupStage: 'mvp',
      sectors: ['Fintech'],
      requiredSkills: ['React'],
      offeredSkills: ['Product'],
      telefon: '+905551234567',
      eposta: 'founder@example.com',
    });

    expect(parsed.fullName).toBe('Ali Kurucu');
    expect(parsed.sectors).toEqual(['Fintech']);
  });
});
