import { describe, it, expect } from 'vitest';
import {
  candidateModuleProfileUpsertSchema,
  parseCandidateProfileUpsert,
} from '@/lib/api/validation/candidate-profiles';

describe('candidate profile validation', () => {
  it('accepts valid candidate profile fields', () => {
    const parsed = candidateModuleProfileUpsertSchema.parse({
      fullName: 'Ayşe Yılmaz',
      city: 'Istanbul',
      district: 'Kadıköy',
      education: 'Computer Engineering',
      experienceYears: 5,
      skills: ['TypeScript', 'React'],
      languages: ['English', 'Turkish'],
      certifications: ['AWS'],
      expectedSalary: 50000,
      remotePreference: 'hybrid',
      linkedIn: 'https://linkedin.com/in/ayse',
      portfolio: 'https://ayse.dev',
      telefon: '+905551234567',
      eposta: 'ayse@example.com',
      whatsapp: '+905551234567',
    });

    expect(parsed.fullName).toBe('Ayşe Yılmaz');
    expect(parsed.skills).toEqual(['TypeScript', 'React']);
  });

  it('parseCandidateProfileUpsert maps expectedSalary to salaryExpectation', () => {
    const parsed = parseCandidateProfileUpsert({ expectedSalary: 45000 });
    expect(parsed.salaryExpectation).toBe(45000);
  });
});
