import { describe, expect, it } from 'vitest';
import { findCareerProfileContentViolation } from '@/features/candidates/lib/career-profile-content-policy';
import { buildHiringSummaryDraft } from './hire-summary';

describe('buildHiringSummaryDraft', () => {
  it('builds an editable Turkish job posting from hire form fields', () => {
    const draft = buildHiringSummaryDraft({
      desiredRole: 'Full-stack geliştirici',
      experienceLevel: 'Senior',
      primarySector: 'Bilişim / Yazılım',
      workType: 'Tam zamanlı',
      professionalSkills: 'Yazılım geliştirme · Kod incelemesi',
      technicalSkills: 'TypeScript · React',
      educationLevel: 'Lisans',
      educationField: 'Bilgisayar Mühendisliği',
      preferredCity: 'İstanbul',
      workplacePreference: 'Hibrit',
      availability: '1 ay içinde',
      salaryRange: '75.000 - 100.000 TL',
      requiredResponsibilities: 'Yazılım özelliklerinin geliştirilmesi · API tasarımı',
    });

    expect(draft).toMatch(/Full-stack geliştirici/);
    expect(draft).toMatch(/arıyoruz/i);
    expect(draft).toMatch(/TypeScript|React|Yazılım/);
    expect(draft.length).toBeGreaterThanOrEqual(100);
    expect(draft).not.toMatch(/@|https?:\/\//i);
    expect(draft).not.toMatch(/telefon ile ulaşır/i);
    expect(findCareerProfileContentViolation(draft)).toBeNull();
  });

  it('still produces a usable draft when only the role is present', () => {
    const draft = buildHiringSummaryDraft({ desiredRole: 'Hemşire' });
    expect(draft).toMatch(/Hemşire/);
    expect(draft).toMatch(/arıyoruz/i);
    expect(draft.length).toBeGreaterThanOrEqual(100);
  });
});
