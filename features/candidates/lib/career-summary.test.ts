import { describe, expect, it } from 'vitest';
import { createEmptyCareerExperience } from '@/features/candidates/config/career-profile-fields';
import { findCareerProfileContentViolation } from '@/features/candidates/lib/career-profile-content-policy';
import { buildCareerSummaryDraft } from './career-summary';

describe('buildCareerSummaryDraft', () => {
  it('builds an editable Turkish summary from role, skills, and experience', () => {
    const draft = buildCareerSummaryDraft({
      desiredRole: 'Sigorta satış uzmanı',
      experienceLevel: 'Giriş Seviyesi',
      primarySector: 'Sigorta',
      professionalSkills: 'İletişim · Portföy yönetimi',
      technicalSkills: 'CRM · Excel',
      educationLevel: 'Lisans',
      educationField: 'İşletme',
      preferredCity: 'Adıyaman',
      workplacePreference: 'Hibrit',
      workType: 'Tam zamanlı',
      experiences: [
        {
          ...createEmptyCareerExperience(),
          sector: 'Sigorta',
          role: 'Sigorta satış uzmanı',
          startMonth: 1,
          startYear: 2026,
          isCurrent: true,
          responsibilities: 'Müşteri portföyü yönetimi',
        },
      ],
    });

    expect(draft).toMatch(/Sigorta satış uzmanı/);
    expect(draft).toMatch(/CRM|Excel|İletişim/);
    expect(draft.length).toBeGreaterThanOrEqual(100);
    expect(draft).not.toMatch(/@|https?:\/\//i);
    expect(findCareerProfileContentViolation(draft)).toBeNull();
  });

  it('still produces a usable draft when only the role is present', () => {
    const draft = buildCareerSummaryDraft({ desiredRole: 'Hemşire' });
    expect(draft).toMatch(/Hemşire/);
    expect(draft.length).toBeGreaterThanOrEqual(100);
  });
});
