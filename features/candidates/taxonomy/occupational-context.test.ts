import { describe, expect, it } from 'vitest';
import { MANUAL_OPTION, needsEducationField } from '@/features/candidates/taxonomy/career-taxonomy';
import { suggestTools } from '@/features/candidates/taxonomy/career-tools';
import {
  suggestProfessionalSkills,
  suggestTechnicalSkills,
} from '@/features/candidates/taxonomy/career-taxonomy';
import {
  familiesAreOccupationallyRelated,
  occupationalConfidence,
  buildOccupationalContext,
  shouldUseOccupationalAi,
} from '@/features/candidates/taxonomy/occupational-context';
import { resolveOccupationalSuggestions } from '@/features/candidates/taxonomy/occupational-suggestions';

function withoutManual(values: string[]): string[] {
  return values.filter((item) => item !== MANUAL_OPTION);
}

const OFF_TOPIC = ['SQL', 'CRM', 'Salesforce', 'HubSpot', 'Kredi analizi', 'Finansal analiz', 'Photoshop'];

describe('occupational context engine', () => {
  it('keeps factory beginner suggestions operational and excludes finance/software noise', () => {
    const input = {
      sector: 'Üretim / Sanayi',
      role: 'Fabrika işçisi',
      experienceLevel: 'Junior',
      totalExperienceYears: 1,
    };
    const result = resolveOccupationalSuggestions(input);
    expect(result.needsAi).toBe(false);
    expect(withoutManual(result.professionalSkills)).toEqual(
      expect.arrayContaining(['Üretim operasyonu', 'Kalite kontrol', 'İSG']),
    );
    expect(result.professionalSkills).not.toEqual(expect.arrayContaining(OFF_TOPIC));
    expect(result.technicalSkills).toEqual(expect.arrayContaining(['MES / üretim kaydı', MANUAL_OPTION]));
    expect(result.technicalSkills).not.toContain('Excel');
    expect(result.technicalSkills).not.toEqual(expect.arrayContaining(['SQL', 'Python', 'CRM']));
    expect(suggestTools(input)).not.toEqual(expect.arrayContaining(['Salesforce', 'HubSpot', 'CRM', 'SQL', 'Excel']));
    expect(result.tools).toEqual(expect.arrayContaining(['MES / üretim kaydı', MANUAL_OPTION]));
    expect(result.tools).not.toContain('Excel');
    expect(result.certificates).toEqual(
      expect.arrayContaining(['İSG C Sınıfı', 'İlk yardım sertifikası', 'Forklift operatör belgesi', MANUAL_OPTION]),
    );
    expect(result.certificates).not.toEqual(
      expect.arrayContaining(['TOEFL', 'IELTS', 'Microsoft Office uzmanlığı', 'Excel ileri seviye', 'SMMM Stajyerlik']),
    );
  });

  it('gives senior factory line experience adjacent production skills without CRM/SQL', () => {
    const junior = resolveOccupationalSuggestions({
      sector: 'Üretim / Sanayi',
      role: 'Fabrika işçisi',
      experienceLevel: 'Junior',
      totalExperienceYears: 1,
    });
    const senior = resolveOccupationalSuggestions({
      sector: 'Üretim / Sanayi',
      role: 'Fabrika işçisi',
      experienceLevel: 'Senior',
      totalExperienceYears: 15,
      experiences: [
        {
          sector: 'Üretim / Sanayi',
          role: 'Fabrika işçisi',
          responsibilities: 'Üretim hattı sorumluluğu, makine kullanımı, kalite kontrol',
        },
      ],
    });
    expect(senior.professionalSkills).not.toEqual(junior.professionalSkills);
    expect(withoutManual(senior.professionalSkills).some((item) => /vardiya|üretim yönetimi|planlama|problem/i.test(item))).toBe(
      true,
    );
    expect(senior.professionalSkills).not.toEqual(expect.arrayContaining(['CRM', 'Kredi analizi', 'SQL']));
    expect(senior.tools).not.toEqual(expect.arrayContaining(['Salesforce', 'HubSpot']));
  });

  it('ranks regional sales manager skills around team/target management and CRM', () => {
    const result = resolveOccupationalSuggestions({
      sector: 'Satış',
      role: 'Bölge satış müdürü',
      experienceLevel: 'Yönetici',
      totalExperienceYears: 12,
    });
    expect(withoutManual(result.professionalSkills).some((item) => /satış|hedef|koçluk|bölge/i.test(item))).toBe(true);
    expect(result.technicalSkills).toEqual(expect.arrayContaining(['CRM', 'Excel', MANUAL_OPTION]));
    expect(result.technicalSkills).not.toContain('SQL');
    expect(result.relatedOccupations.some((item) => /saha satış|satış müdürü/i.test(item.title))).toBe(true);
  });

  it('keeps mid-level field sales manager close to regional sales without turning into finance', () => {
    const result = resolveOccupationalSuggestions({
      sector: 'Satış',
      role: 'Saha satış müdürü',
      experienceLevel: 'Mid',
      totalExperienceYears: 4,
    });
    expect(result.technicalSkills).toEqual(expect.arrayContaining(['CRM', MANUAL_OPTION]));
    expect(result.professionalSkills).not.toContain('Kredi analizi');
    expect(familiesAreOccupationallyRelated('Bölge satış müdürü', 'Saha satış müdürü')).toBe(true);
  });

  it('suggests credit analysis for Kredi Analisti and not factory ops', () => {
    const result = resolveOccupationalSuggestions({
      sector: 'Finans / Bankacılık',
      role: 'Kredi analisti',
    });
    expect(withoutManual(result.professionalSkills)).toEqual(expect.arrayContaining(['Kredi analizi']));
    expect(result.professionalSkills).not.toContain('Üretim operasyonu');
    expect(result.tools).not.toContain('Salesforce');
  });

  it('suggests frontend stack for Frontend Developer without credit/factory tools', () => {
    const result = resolveOccupationalSuggestions({
      sector: 'Bilişim / Yazılım',
      role: 'Frontend Developer',
    });
    expect(result.technicalSkills).toEqual(expect.arrayContaining(['React', 'JavaScript', MANUAL_OPTION]));
    expect(result.professionalSkills).not.toContain('Kredi analizi');
    expect(result.tools).toEqual(expect.arrayContaining(['Git', 'Jira', MANUAL_OPTION]));
    expect(result.tools).not.toContain('CRM');
  });

  it('keeps nurse clinical skills and HIS, not SQL/CRM', () => {
    const result = resolveOccupationalSuggestions({
      sector: 'Sağlık',
      role: 'Hemşire',
    });
    expect(withoutManual(result.professionalSkills).length).toBeGreaterThan(3);
    expect(result.technicalSkills.join(' ')).toMatch(/HIS|Excel/);
    expect(result.technicalSkills).not.toContain('SQL');
    expect(result.tools).not.toContain('Salesforce');
  });

  it('suggests HR skills for İK Uzmanı', () => {
    const result = resolveOccupationalSuggestions({
      sector: 'İnsan kaynakları',
      role: 'İK Uzmanı',
    });
    expect(withoutManual(result.professionalSkills).some((item) => /işe alım|mülakat|performans|çalışan/i.test(item))).toBe(
      true,
    );
    expect(result.professionalSkills).not.toContain('Üretim operasyonu');
    expect(result.tools).not.toContain('Salesforce');
  });

  it('does not treat regional sales manager as related to finance manager', () => {
    expect(familiesAreOccupationallyRelated('Bölge satış müdürü', 'Saha satış müdürü')).toBe(true);
    expect(familiesAreOccupationallyRelated('Bölge satış müdürü', 'Satış müdürü')).toBe(true);
    expect(familiesAreOccupationallyRelated('Bölge satış müdürü', 'Finans Müdürü')).toBe(false);
    expect(familiesAreOccupationallyRelated('Fabrika işçisi', 'Frontend Developer')).toBe(false);
  });

  it('skips AI when the role family is known', () => {
    const factory = buildOccupationalContext({
      sector: 'Üretim / Sanayi',
      role: 'Fabrika işçisi',
      experienceLevel: 'Junior',
    });
    expect(factory.family).toBe('factory');
    expect(shouldUseOccupationalAi(occupationalConfidence(factory), factory)).toBe(false);
  });

  it('uses the same engine for hire audience without inventing off-topic tools', () => {
    const hire = suggestProfessionalSkills({
      audience: 'hire',
      sector: 'Üretim / Sanayi',
      role: 'Fabrika işçisi',
      experienceLevel: 'Junior',
    });
    const seeker = suggestProfessionalSkills({
      audience: 'seeker',
      sector: 'Üretim / Sanayi',
      role: 'Fabrika işçisi',
      experienceLevel: 'Junior',
    });
    expect(withoutManual(hire)).toEqual(withoutManual(seeker));
    expect(suggestTechnicalSkills({ audience: 'hire', sector: 'Üretim / Sanayi', role: 'Fabrika işçisi' })).not.toContain(
      'SQL',
    );
  });

  it('changes factory suggestions across Junior / Mid / Senior / Yönetici', () => {
    const base = { sector: 'Üretim / Sanayi', role: 'Fabrika işçisi', totalExperienceYears: 1 };
    const junior = withoutManual(resolveOccupationalSuggestions({ ...base, experienceLevel: 'Junior' }).professionalSkills);
    const mid = withoutManual(resolveOccupationalSuggestions({ ...base, experienceLevel: 'Mid' }).professionalSkills);
    const senior = withoutManual(resolveOccupationalSuggestions({ ...base, experienceLevel: 'Senior' }).professionalSkills);
    const manager = withoutManual(
      resolveOccupationalSuggestions({ ...base, experienceLevel: 'Yönetici' }).professionalSkills,
    );
    expect(mid).not.toEqual(junior);
    expect(senior).not.toEqual(mid);
    expect(manager).not.toEqual(senior);
    expect(junior).not.toContain('Vardiya yönetimi');
    expect(junior).not.toContain('Üretim yönetimi');
    expect(mid).toContain('Vardiya yönetimi');
    expect(mid).not.toContain('Üretim yönetimi');
    expect(senior).toContain('Vardiya yönetimi');
    expect(senior).not.toContain('Üretim yönetimi');
    expect(manager).toContain('Üretim yönetimi');
    expect(manager).toContain('Planlama');
    expect(manager).not.toEqual(expect.arrayContaining(OFF_TOPIC));
  });

  it('changes factory suggestions across 1 / 5 / 15 years at the same level', () => {
    const base = { sector: 'Üretim / Sanayi', role: 'Fabrika işçisi', experienceLevel: 'Junior' };
    const one = withoutManual(resolveOccupationalSuggestions({ ...base, totalExperienceYears: 1 }).professionalSkills);
    const five = withoutManual(resolveOccupationalSuggestions({ ...base, totalExperienceYears: 5 }).professionalSkills);
    const fifteen = withoutManual(
      resolveOccupationalSuggestions({ ...base, totalExperienceYears: 15 }).professionalSkills,
    );
    expect(five).not.toEqual(one);
    expect(fifteen).not.toEqual(five);
    expect(one).not.toContain('Vardiya yönetimi');
    expect(one).not.toContain('Üretim yönetimi');
    expect(five).toContain('Vardiya yönetimi');
    expect(five).not.toContain('Üretim yönetimi');
    expect(fifteen).toContain('Vardiya yönetimi');
    expect(fifteen).toContain('Üretim yönetimi');
  });

  it('does not let an unrelated past sales role pollute a factory skill catalog', () => {
    const clean = resolveOccupationalSuggestions({
      audience: 'seeker',
      sector: 'Üretim / Sanayi',
      role: 'Fabrika işçisi',
      experienceLevel: 'Junior',
      totalExperienceYears: 1,
    });
    const polluted = resolveOccupationalSuggestions({
      audience: 'seeker',
      sector: 'Üretim / Sanayi',
      role: 'Fabrika işçisi',
      experienceLevel: 'Junior',
      totalExperienceYears: 1,
      experiences: [
        { sector: 'Satış', role: 'Satış temsilcisi', responsibilities: 'CRM ile portföy yönetimi ve kredi analizi' },
      ],
    });
    expect(withoutManual(polluted.professionalSkills)).toEqual(withoutManual(clean.professionalSkills));
    expect(polluted.professionalSkills).not.toEqual(expect.arrayContaining(['CRM', 'Saha satış', 'Kredi analizi']));
    expect(polluted.technicalSkills).not.toContain('CRM');
    expect(polluted.tools).not.toEqual(expect.arrayContaining(['Salesforce', 'HubSpot', 'CRM']));
  });

  it('uses the same canonical skill and tool labels for seeker and hire', () => {
    const input = {
      sector: 'Satış',
      role: 'Bölge satış müdürü',
      experienceLevel: 'Yönetici',
      totalExperienceYears: 12,
    };
    const seeker = resolveOccupationalSuggestions({ ...input, audience: 'seeker' });
    const hire = resolveOccupationalSuggestions({ ...input, audience: 'hire' });
    expect(withoutManual(seeker.professionalSkills)).toEqual(withoutManual(hire.professionalSkills));
    expect(withoutManual(seeker.technicalSkills)).toEqual(withoutManual(hire.technicalSkills));
    expect(withoutManual(seeker.tools)).toEqual(withoutManual(hire.tools));
    expect(seeker.professionalSkills).toContain(MANUAL_OPTION);
    expect(hire.professionalSkills).toContain(MANUAL_OPTION);
    expect(withoutManual(seeker.certificates)).toEqual(withoutManual(hire.certificates));
  });

  it('hides university majors for primary and high school', () => {
    expect(needsEducationField('İlköğretim')).toBe(false);
    expect(needsEducationField('Lise')).toBe(false);
    expect(needsEducationField('')).toBe(false);
    expect(needsEducationField('Lisans')).toBe(true);
    expect(needsEducationField('Ön lisans')).toBe(true);
    expect(needsEducationField('Meslek yüksekokulu')).toBe(true);
  });
});
