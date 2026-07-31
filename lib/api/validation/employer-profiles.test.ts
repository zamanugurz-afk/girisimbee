import { describe, it, expect } from 'vitest';
import {
  employerModuleProfileUpsertSchema,
  parseEmployerProfileUpsert,
} from '@/lib/api/validation/employer-profiles';

describe('employer profile validation', () => {
  it('accepts valid employer profile fields', () => {
    const parsed = employerModuleProfileUpsertSchema.parse({
      companyName: 'Acme A.Ş.',
      sehir: 'Istanbul',
      ilce: 'Kadıköy',
      sektor: 'Technology',
      aciklama: 'Leading tech employer',
      telefon: '+905551234567',
      eposta: 'hr@acme.com',
      website: 'https://acme.com',
      whatsapp: '+905551234567',
      companySize: '50-200',
    });

    expect(parsed.companyName).toBe('Acme A.Ş.');
    expect(parsed.sehir).toBe('Istanbul');
  });

  it('parseEmployerProfileUpsert delegates to schema', () => {
    const parsed = parseEmployerProfileUpsert({ companyName: 'Test Co' });
    expect(parsed.companyName).toBe('Test Co');
  });
});
