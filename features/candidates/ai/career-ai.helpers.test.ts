import { describe, expect, it } from 'vitest';
import { matchTaxonomyOptions } from './match-taxonomy';
import { composeAchievementWithMetric } from './compose-achievement';
import { detectCareerProgression } from './career-progression';
import { pickHighlightedSkills } from './skill-relevance';
import { rankCareerOptionsByLevel } from './rank-options-by-level';
import {
  assertNoPii,
  buildCareerAiSafeContext,
  fingerprintCanonical,
} from './career-ai-context';
import { MANUAL_OPTION } from '@/features/candidates/taxonomy/career-taxonomy';
import type { CareerExperience } from '@/features/candidates/config/career-profile-fields';

function exp(partial: Partial<CareerExperience>): CareerExperience {
  return {
    id: partial.id ?? '1',
    sector: partial.sector ?? 'Sağlık',
    role: partial.role ?? 'Hemşire',
    duration: partial.duration ?? '',
    responsibilities: partial.responsibilities ?? 'Hasta bakımı',
    achievements: partial.achievements ?? '',
    company: partial.company,
    roleOther: partial.roleOther,
    startMonth: partial.startMonth ?? 1,
    startYear: partial.startYear ?? 2020,
    endMonth: partial.endMonth ?? 1,
    endYear: partial.endYear ?? 2022,
    isCurrent: partial.isCurrent,
    selectedResponsibilities: partial.selectedResponsibilities,
    responsibilitiesOther: partial.responsibilitiesOther,
    selectedAchievements: partial.selectedAchievements,
    achievementsOther: partial.achievementsOther,
    achievementMetric: partial.achievementMetric,
  };
}

describe('matchTaxonomyOptions', () => {
  it('returns closest catalog labels without inventing new ones', () => {
    const catalog = ['CRM kullanımı', 'Satış Operasyonları', 'Müşteri Yönetimi', 'Hemşirelik', MANUAL_OPTION];
    const hits = matchTaxonomyOptions('CRM süreçlerini yönettim.', catalog);
    expect(hits).toContain('CRM kullanımı');
    expect(hits.every((item) => catalog.includes(item))).toBe(true);
    expect(hits).not.toContain(MANUAL_OPTION);
  });
});

describe('composeAchievementWithMetric', () => {
  it('joins user metric without inventing numbers', () => {
    expect(composeAchievementWithMetric('Hasta memnuniyetini artırdım.', '%18')).toBe(
      'Hasta memnuniyetini artırdım (%18).',
    );
    expect(composeAchievementWithMetric('Hasta memnuniyetini artırdım.', '')).toBe(
      'Hasta memnuniyetini artırdım.',
    );
  });
});

describe('detectCareerProgression', () => {
  it('detects same-company role change and does not invent titles', () => {
    const rows = [
      exp({
        id: 'a',
        role: 'Satış Uzmanı',
        company: 'Acme',
        startMonth: 1,
        startYear: 2018,
        endMonth: 12,
        endYear: 2020,
      }),
      exp({
        id: 'b',
        role: 'Satış Müdürü',
        company: 'Acme',
        startMonth: 1,
        startYear: 2021,
        endMonth: 12,
        endYear: 2023,
      }),
    ];
    expect(detectCareerProgression(rows)).toEqual([{ from: 'Satış Uzmanı', to: 'Satış Müdürü' }]);
    expect(detectCareerProgression([rows[0]!])).toEqual([]);
  });
});

describe('pickHighlightedSkills', () => {
  it('caps to 7 skills related to the role', () => {
    const professionalSkills = [
      'Hasta bakımı',
      'CRM',
      'Müzakere',
      'Excel',
      'Satış yönetimi',
      'Portföy yönetimi',
      'Saha satış',
      'B2B satış',
      'Key Account Management',
      'İhtiyaç analizi',
    ].join(' · ');
    const picked = pickHighlightedSkills({
      professionalSkills,
      desiredRole: 'Hemşire',
      primarySector: 'Sağlık',
      experiences: [exp({ role: 'Hemşire', responsibilities: 'Hasta bakımı' })],
      limit: 7,
    });
    expect(picked.length).toBeLessThanOrEqual(7);
    expect(picked[0]).toBe('Hasta bakımı');
  });
});

describe('rankCareerOptionsByLevel', () => {
  it('keeps all options and moves leadership last for junior', () => {
    const options = ['Hasta bakımı', 'Ekip yönetimi', 'Raporlama', MANUAL_OPTION];
    const junior = rankCareerOptionsByLevel(options, 'Junior');
    const senior = rankCareerOptionsByLevel(options, 'Senior');
    expect(junior).toEqual(expect.arrayContaining(options));
    expect(junior.indexOf('Hasta bakımı')).toBeLessThan(junior.indexOf('Ekip yönetimi'));
    expect(senior.indexOf('Ekip yönetimi')).toBeLessThan(senior.indexOf('Hasta bakımı'));
    expect(junior.at(-1)).toBe(MANUAL_OPTION);
  });
});

describe('career AI safe context', () => {
  it('strips company and does not include gender/birth/residence keys', () => {
    const ctx = buildCareerAiSafeContext({
      primarySector: 'Sağlık',
      desiredRole: 'Hemşire',
      experienceLevel: 'Mid',
      experiences: [exp({ company: 'Gizli Hastane', role: 'Hemşire' })],
      totalExperienceYears: 4,
    });
    expect(JSON.stringify(ctx)).not.toMatch(/Gizli Hastane/);
    expect(assertNoPii(ctx)).toEqual([]);
    expect(ctx).not.toHaveProperty('preferredCity');
    expect(ctx).not.toHaveProperty('tools');
    expect(ctx).not.toHaveProperty('workType');
    expect(ctx.experiences[0]?.role).toBe('Hemşire');
    expect(fingerprintCanonical(ctx)).toMatch(/^[0-9a-f]+$/);
  });

  it('keeps compact experience and skill limits', () => {
    const rows = Array.from({ length: 10 }, (_, index) =>
      exp({
        id: String(index),
        role: `Rol ${index}`,
        responsibilities: 'Hasta bakımı\nRaporlama\nEğitim\nNöbet\nEkip',
        achievements: 'Memnuniyet\nSüreç\nKalite\nHata',
        startYear: 2010 + index,
      }),
    );
    const ctx = buildCareerAiSafeContext({
      desiredRole: 'Hemşire',
      professionalSkills: Array.from({ length: 20 }, (_, i) => `Yetkinlik ${i}`).join(' · '),
      experiences: rows,
      certificates: Array.from({ length: 12 }, (_, i) => `Sertifika ${i}`).join(' · '),
    });
    expect(ctx.experiences.length).toBeLessThanOrEqual(6);
    expect(ctx.professionalSkills.length).toBeLessThanOrEqual(8);
    expect(ctx.certificates.length).toBeLessThanOrEqual(5);
    expect(ctx.experiences[0]?.responsibilities.length).toBeLessThanOrEqual(4);
    expect(ctx.experiences[0]?.achievements.length).toBeLessThanOrEqual(3);
  });
});
