import { describe, expect, it } from 'vitest';
import { createEmptyCareerExperience } from '@/features/candidates/config/career-profile-fields';
import { findCareerProfileContentViolation } from '@/features/candidates/lib/career-profile-content-policy';
import { buildCareerSummaryDraft, polishCareerSummary, stripCareerContactFluff } from './career-summary';

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
    expect(draft).not.toMatch(/İletişim platform|telefon, e-posta|firma adı paylaşmıyorum/i);
    expect(findCareerProfileContentViolation(draft)).toBeNull();
  });

  it('strips leftover contact-policy sentences from stored summaries', () => {
    expect(
      polishCareerSummary(
        'Kredi uzmanı olarak 2 yıllık deneyimim var. İletişim platform üzerinden yapılır; telefon, e-posta veya firma adı paylaşmıyorum.',
      ),
    ).toBe('Kredi uzmanı olarak 2 yıllık deneyimim var.');
    expect(
      polishCareerSummary(
        'İletişim platform üzerinden yapılır; telefon, e-posta veya firma adı paylaşmıyorum.',
      ),
    ).toBe('');
    expect(
      stripCareerContactFluff(
        'Kredi uzmanı olarak 2 yıllık deneyimim var.\n\nİletişim platform üzerinden yapılır; telefon, e-posta veya firma adı paylaşmıyorum.',
      ),
    ).toBe('Kredi uzmanı olarak 2 yıllık deneyimim var.');
  });

  it('still produces a usable draft when only the role is present', () => {
    const draft = buildCareerSummaryDraft({ desiredRole: 'Hemşire' });
    expect(draft).toMatch(/Hemşire/);
    expect(draft.length).toBeGreaterThanOrEqual(100);
  });

  it('keeps the opening sentence on the target role, not unrelated preferred sectors', () => {
    const draft = buildCareerSummaryDraft({
      desiredRole: 'Resepsiyonist',
      primarySector: 'Turizm / Otelcilik',
      preferredSectors: ['Sigorta', 'Finans / Bankacılık'],
      educationLevel: 'Lisans',
      educationField: 'Makine Mühendisliği',
      professionalSkills: 'Takım çalışması · İletişim',
      technicalSkills: 'Excel · PowerPoint',
      preferredCity: 'İstanbul Anadolu Yakası',
      workplacePreference: 'Ofis',
      workType: 'Tam zamanlı',
      experiences: [
        {
          ...createEmptyCareerExperience(),
          sector: 'Turizm / Otelcilik',
          role: 'Resepsiyonist',
          startMonth: 1,
          startYear: 2018,
          isCurrent: true,
        },
        {
          ...createEmptyCareerExperience(),
          sector: 'Turizm / Otelcilik',
          role: 'Host / hostes',
          startMonth: 1,
          startYear: 2016,
          endMonth: 12,
          endYear: 2017,
        },
      ],
    });

    expect(draft).toMatch(/Resepsiyonist olarak Turizm \/ Otelcilik/);
    expect(draft).not.toMatch(/Resepsiyonist olarak Turizm \/ Otelcilik, Sigorta/);
    expect(draft).toMatch(/Eğitim geçmişim/);
    expect(draft).toMatch(/Host \/ hostes/);
    expect(draft).toMatch(/Sigorta|Finans/);
  });
});
