import { describe, expect, it } from 'vitest';
import {
  EXPERIENCE_LEVEL_VALUES,
  getAllTaxonomyPositions,
  getExperienceLevelLabel,
  getPositionsForSector,
  isManualCareerOption,
  MANUAL_OPTION,
  parseCareerLanguages,
  parseSelectedList,
  serializeCareerLanguages,
  suggestAchievements,
  suggestProfessionalSkills,
  suggestResponsibilities,
  suggestTechnicalSkills,
} from './career-taxonomy';

function withoutManual(values: string[]): string[] {
  return values.filter((v) => v !== MANUAL_OPTION);
}

describe('career taxonomy', () => {
  it('keeps internal experience level values while exposing Turkish labels', () => {
    expect(EXPERIENCE_LEVEL_VALUES).toContain('Junior');
    expect(EXPERIENCE_LEVEL_VALUES).toContain('Mid');
    expect(EXPERIENCE_LEVEL_VALUES).toContain('Senior');
    expect(getExperienceLevelLabel('Junior')).toBe('Başlangıç Seviyesi');
    expect(getExperienceLevelLabel('Mid')).toBe('Orta Seviye');
    expect(getExperienceLevelLabel('Senior')).toBe('Kıdemli');
    expect(getExperienceLevelLabel('Direktör')).toBe('Üst Düzey Yönetici');
  });

  it('filters positions by sector and supports manual fallback', () => {
    const health = getPositionsForSector('Sağlık');
    expect(health).toEqual(expect.arrayContaining(['Doktor', 'Hemşire', 'Ebe', MANUAL_OPTION]));

    const finance = getPositionsForSector('Finans / Bankacılık');
    expect(finance).toEqual(
      expect.arrayContaining(['Banka müşteri temsilcisi', 'Portföy yöneticisi', MANUAL_OPTION]),
    );

    const emptySector = getPositionsForSector('Diğer');
    expect(emptySector).toEqual([MANUAL_OPTION]);
  });

  it('suggests responsibilities and achievements from sector + role', () => {
    const responsibilities = suggestResponsibilities({
      sector: 'Sigorta',
      role: 'Sigorta satış uzmanı',
      experienceLevel: 'Senior',
    });
    expect(responsibilities).toEqual(
      expect.arrayContaining(['Müşteri portföyü yönetimi', 'Yeni müşteri kazanımı', MANUAL_OPTION]),
    );

    const achievements = suggestAchievements({
      sector: 'Satış',
      role: 'Saha satış uzmanı',
      experienceLevel: 'Junior',
    });
    expect(achievements).toEqual(
      expect.arrayContaining(['Satış hedeflerinin üzerinde performans', MANUAL_OPTION]),
    );
  });

  it('keeps leadership-oriented skill options for junior levels', () => {
    const skills = suggestProfessionalSkills({
      sector: 'Satış',
      role: 'Satış temsilcisi',
      experienceLevel: 'Yeni Mezun',
    });
    expect(skills).toEqual(
      expect.arrayContaining(['Liderlik', 'Gönüllü ekip liderliği', 'Takım çalışması']),
    );
  });

  it('suggests technical skills by theme', () => {
    expect(suggestTechnicalSkills({ sector: 'Satış', role: 'Satış temsilcisi' })).toEqual(
      expect.arrayContaining(['CRM', 'Excel', MANUAL_OPTION]),
    );
    expect(
      suggestTechnicalSkills({ sector: 'Bilişim / Yazılım', role: 'Yazılım geliştirici' }),
    ).toEqual(expect.arrayContaining(['TypeScript', 'React', MANUAL_OPTION]));
  });

  it('shapes receptionist options by position, not generic sector copy', () => {
    const reception = suggestResponsibilities({
      sector: 'Turizm / Otelcilik',
      role: 'Resepsiyonist',
    });
    const host = suggestResponsibilities({
      sector: 'Turizm / Otelcilik',
      role: 'Host / hostes',
    });
    expect(withoutManual(reception)).not.toEqual(withoutManual(host));
    expect(reception).toEqual(expect.arrayContaining(['Resepsiyon bankosunda misafir kayıt ve yönlendirme']));
    expect(host).toEqual(expect.arrayContaining(['Karşılama noktasında misafir akışının yönlendirilmesi']));
    expect(reception).not.toContain('Günlük operasyonların yürütülmesi');
  });

  it('gives every taxonomy position a role-shaped responsibility list', () => {
    const positions = getAllTaxonomyPositions().filter((role) => role !== MANUAL_OPTION);
    expect(positions.length).toBeGreaterThan(80);
    for (const role of positions) {
      const options = withoutManual(suggestResponsibilities({ role }));
      expect(options.length, role).toBeGreaterThan(2);
      expect(options, role).not.toContain('Günlük operasyonların yürütülmesi');
    }
  });

  it('gives Hemşire and Doktor distinct responsibility and achievement options', () => {
    const nurseResp = suggestResponsibilities({ sector: 'Sağlık', role: 'Hemşire' });
    const doctorResp = suggestResponsibilities({ sector: 'Sağlık', role: 'Doktor' });
    expect(nurseResp).toContain(MANUAL_OPTION);
    expect(doctorResp).toContain(MANUAL_OPTION);
    expect(withoutManual(nurseResp)).not.toEqual(withoutManual(doctorResp));
    expect(nurseResp).toEqual(expect.arrayContaining(['Hasta bakım planının uygulanması']));
    expect(doctorResp).toEqual(expect.arrayContaining(['Hasta muayenesi ve klinik değerlendirme']));
    expect(doctorResp).not.toContain('Hasta bakım planının uygulanması');
    expect(nurseResp).not.toContain('Hasta muayenesi ve klinik değerlendirme');

    const nurseAch = suggestAchievements({ sector: 'Sağlık', role: 'Hemşire' });
    const doctorAch = suggestAchievements({ sector: 'Sağlık', role: 'Doktor' });
    expect(withoutManual(nurseAch)).not.toEqual(withoutManual(doctorAch));
    expect(nurseAch).toEqual(expect.arrayContaining(['Hasta bakım kalitesinin artırılması']));
    expect(doctorAch).toEqual(expect.arrayContaining(['Tanı ve tedavi süreçlerinin hızlandırılması']));
  });

  it('gives Hemşire and Yazılım geliştirici distinct option sets', () => {
    const nurse = {
      sector: 'Sağlık',
      role: 'Hemşire',
    };
    const dev = {
      sector: 'Bilişim / Yazılım',
      role: 'Yazılım geliştirici',
    };
    expect(withoutManual(suggestResponsibilities(nurse))).not.toEqual(
      withoutManual(suggestResponsibilities(dev)),
    );
    expect(withoutManual(suggestAchievements(nurse))).not.toEqual(
      withoutManual(suggestAchievements(dev)),
    );
    expect(withoutManual(suggestProfessionalSkills(nurse))).not.toEqual(
      withoutManual(suggestProfessionalSkills(dev)),
    );
    expect(withoutManual(suggestTechnicalSkills(nurse))).not.toEqual(
      withoutManual(suggestTechnicalSkills(dev)),
    );
    expect(suggestTechnicalSkills(dev)).toEqual(
      expect.arrayContaining(['TypeScript', 'React', MANUAL_OPTION]),
    );
  });

  it('keeps leadership options when career level changes', () => {
    const junior = suggestProfessionalSkills({
      sector: 'Sağlık',
      role: 'Hemşire',
      experienceLevel: 'Junior',
    });
    const senior = suggestProfessionalSkills({
      sector: 'Sağlık',
      role: 'Hemşire',
      experienceLevel: 'Senior',
    });
    for (const option of ['Liderlik', 'Gönüllü ekip liderliği', 'Takım çalışması', MANUAL_OPTION]) {
      expect(junior).toContain(option);
      expect(senior).toContain(option);
    }
    expect(senior.indexOf('Liderlik')).toBeLessThan(senior.indexOf('Hasta bakımı'));
    expect(junior.indexOf('Hasta bakımı')).toBeLessThan(junior.indexOf('Liderlik'));
  });

  it('parses joined selections without splitting Diğer / Kendim gireceğim', () => {
    expect(parseSelectedList(MANUAL_OPTION)).toEqual([MANUAL_OPTION]);
    expect(parseSelectedList(`Hasta bakımı · ${MANUAL_OPTION}`)).toEqual([
      'Hasta bakımı',
      MANUAL_OPTION,
    ]);
  });

  it('recognizes both manual fallback labels', () => {
    expect(isManualCareerOption(MANUAL_OPTION)).toBe(true);
    expect(isManualCareerOption('Diğer')).toBe(true);
    expect(isManualCareerOption('Hemşire')).toBe(false);
  });

  it('parses and serializes language + level separately', () => {
    const parsed = parseCareerLanguages('İngilizce — İyi, Almanca — Orta');
    expect(parsed).toHaveLength(2);
    expect(parsed[0]?.language).toBe('İngilizce');
    expect(parsed[0]?.level).toBe('İyi');

    const serialized = serializeCareerLanguages([
      { id: '1', language: 'İngilizce', level: 'İleri' },
      { id: '2', language: 'Diğer', languageOther: 'Korece', level: 'Temel' },
    ]);
    expect(serialized).toContain('İngilizce — İleri');
    expect(serialized).toContain('Korece — Temel');
  });
});
