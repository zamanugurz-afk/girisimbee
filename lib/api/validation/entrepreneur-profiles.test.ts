import { describe, it, expect } from 'vitest';
import { parseEntrepreneurProfileUpsert } from '@/lib/api/validation/entrepreneur-profiles';

describe('entrepreneur-profiles validation', () => {
  it('parses extended profile fields', () => {
    const parsed = parseEntrepreneurProfileUpsert({
      startupName: 'AI Co',
      founderName: 'Ali',
      sehir: 'Istanbul',
      sektor: 'Tech',
      investmentStage: 'seed',
      investmentTarget: 100000,
      telefon: '+905551234567',
      eposta: 'a@example.com',
    });
    expect(parsed.startupName).toBe('AI Co');
    expect(parsed.founderName).toBe('Ali');
  });
});
