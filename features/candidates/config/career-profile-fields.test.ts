import { describe, expect, it } from 'vitest';
import {
  createEmptyCareerExperience,
  parseCareerExperiences,
  validateCareerExperiences,
} from './career-profile-fields';
import { MANUAL_OPTION } from '@/features/candidates/taxonomy/career-taxonomy';

describe('career experience validation', () => {
  it('accepts structured month/year periods and current job', () => {
    const row = {
      ...createEmptyCareerExperience(),
      sector: 'Sigorta',
      role: 'Sigorta satış uzmanı',
      startMonth: 3,
      startYear: 2018,
      endMonth: 7,
      endYear: 2022,
      selectedResponsibilities: ['Müşteri portföyü yönetimi', 'Yeni müşteri kazanımı'],
      responsibilities: 'Müşteri portföyü yönetimi\nYeni müşteri kazanımı',
      selectedAchievements: ['Satış hedeflerinin üzerinde performans'],
      achievements: 'Satış hedeflerinin üzerinde performans',
    };
    expect(validateCareerExperiences([row])).toBeNull();

    const current = {
      ...row,
      id: '2',
      endMonth: null,
      endYear: null,
      isCurrent: true,
    };
    expect(validateCareerExperiences([current])).toBeNull();
  });

  it('rejects missing start, missing end, end before start, and future dates', () => {
    const base = {
      ...createEmptyCareerExperience(),
      sector: 'Sağlık',
      role: 'Hemşire',
      selectedResponsibilities: ['Hasta ilişkileri', 'Klinik süreçleri', 'Hasta kabul'],
      responsibilities: 'Hasta ilişkileri\nKlinik süreçleri\nHasta kabul',
    };

    expect(
      validateCareerExperiences([{ ...base, startMonth: null, startYear: 2020 }]),
    ).toMatch(/Başlangıç/);

    expect(
      validateCareerExperiences([
        { ...base, startMonth: 1, startYear: 2020, isCurrent: false, endMonth: null, endYear: null },
      ]),
    ).toMatch(/Bitiş/);

    expect(
      validateCareerExperiences([
        {
          ...base,
          startMonth: 6,
          startYear: 2022,
          endMonth: 1,
          endYear: 2021,
          isCurrent: false,
        },
      ]),
    ).toMatch(/önce olamaz/);

    expect(
      validateCareerExperiences([
        {
          ...base,
          startMonth: 1,
          startYear: 2099,
          endMonth: 2,
          endYear: 2099,
          isCurrent: false,
        },
      ]),
    ).toMatch(/gelecekte/);
  });

  it('rejects whitespace-only manual role and responsibility text', () => {
    const row = {
      ...createEmptyCareerExperience(),
      sector: 'Sağlık',
      role: MANUAL_OPTION,
      roleOther: '   ',
      startMonth: 1,
      startYear: 2020,
      isCurrent: true,
      selectedResponsibilities: [MANUAL_OPTION],
      responsibilitiesOther: '   ',
    };
    expect(validateCareerExperiences([row])).toMatch(/zorunlu|Pozisyon|sorumluluk/i);
  });

  it('accepts taxonomy responsibility selections without extra free-text', () => {
    const row = {
      ...createEmptyCareerExperience(),
      sector: 'Sağlık',
      role: 'Hemşire',
      startMonth: 1,
      startYear: 2020,
      isCurrent: true,
      selectedResponsibilities: ['Hasta bakım planının uygulanması', 'Vital bulguların ölçümü ve kaydı'],
      responsibilities: 'Hasta bakım planının uygulanması\nVital bulguların ölçümü ve kaydı',
    };
    expect(validateCareerExperiences([row])).toBeNull();
  });

  it('requires manual text when Diğer is selected', () => {
    const row = {
      ...createEmptyCareerExperience(),
      sector: 'Sağlık',
      role: MANUAL_OPTION,
      roleOther: '',
      startMonth: 1,
      startYear: 2020,
      isCurrent: true,
      selectedResponsibilities: [MANUAL_OPTION],
      responsibilitiesOther: '',
    };
    expect(validateCareerExperiences([row])).toMatch(/Pozisyon|sorumluluk/i);
  });

  it('parses legacy duration-only rows and redacts company via separate fields', () => {
    const parsed = parseCareerExperiences([
      {
        id: 'x',
        sector: 'Satış',
        role: 'Uzman',
        company: 'Gizli A.Ş.',
        duration: '5 yıl',
        responsibilities: 'Kurumsal müşteri yönetimi ve yeni iş geliştirme',
        achievements: '',
      },
    ]);
    expect(parsed[0]?.company).toBe('Gizli A.Ş.');
    expect(parsed[0]?.duration).toBe('5 yıl');
    expect(validateCareerExperiences(parsed)).toBeNull();
  });

  it('rejects a second experience that overlaps an existing period', () => {
    const first = {
      ...createEmptyCareerExperience(),
      id: '1',
      sector: 'Sigorta',
      role: 'Sigorta satış uzmanı',
      startMonth: 1,
      startYear: 2026,
      endMonth: 6,
      endYear: 2026,
      selectedResponsibilities: ['Müşteri portföyü yönetimi', 'Yeni müşteri kazanımı'],
      responsibilities: 'Müşteri portföyü yönetimi\nYeni müşteri kazanımı',
    };
    const overlapping = {
      ...first,
      id: '2',
      role: 'Sigorta teknik uzmanı',
      startMonth: 2,
      startYear: 2026,
      endMonth: 5,
      endYear: 2026,
    };
    expect(validateCareerExperiences([first, overlapping])).toMatch(/çakışıyor/);
  });
});
