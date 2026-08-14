import { describe, expect, it } from 'vitest';
import { MANUAL_OPTION } from '@/features/candidates/taxonomy/career-taxonomy';
import {
  validateCareerEducationStep,
  validateCareerManualOther,
  validateCareerPreferencesStep,
  validateCareerSkillsStep,
} from './career-form-step-validation';

describe('career form step validation', () => {
  it('accepts taxonomy checkbox selections without free-text length rules', () => {
    const errors = validateCareerSkillsStep({
      professionalSkills: 'Hasta bakımı · İlaç uygulama',
      technicalSkills: 'HIS / Hemşirelik modülü',
    });
    expect(errors).toEqual({});
  });

  it('requires quality-checked manual text when Diğer / Kendim gireceğim is selected', () => {
    expect(
      validateCareerManualOther(MANUAL_OPTION, '', 'Pozisyon açıklaması'),
    ).toMatch(/zorunlu/);
    expect(
      validateCareerManualOther(MANUAL_OPTION, '   ', 'Pozisyon açıklaması'),
    ).toMatch(/zorunlu/);
    expect(
      validateCareerManualOther(MANUAL_OPTION, 'asdfgh', 'Pozisyon açıklaması'),
    ).toBeTruthy();
    expect(
      validateCareerManualOther(MANUAL_OPTION, 'Klinik destek hemşiresi', 'Pozisyon açıklaması'),
    ).toBeNull();
    expect(validateCareerManualOther('Hemşire', '', 'Pozisyon açıklaması')).toBeNull();
  });

  it('rejects whitespace-only manual skill and education fallbacks', () => {
    const skillErrors = validateCareerSkillsStep({
      professionalSkills: MANUAL_OPTION,
      professionalSkillsOther: '   ',
    });
    expect(skillErrors.professionalSkillsOther).toMatch(/zorunlu/);

    const educationErrors = validateCareerEducationStep({
      educationLevel: 'Lisans',
      educationField: MANUAL_OPTION,
      educationFieldOther: '   ',
      certificates: MANUAL_OPTION,
      certificatesOther: '   ',
    });
    expect(educationErrors.educationField).toMatch(/zorunlu/);
    expect(educationErrors.certificates).toMatch(/zorunlu/);

    expect(
      validateCareerEducationStep({
        educationLevel: 'Lise',
        educationField: MANUAL_OPTION,
        educationFieldOther: '',
      }),
    ).toEqual({});
  });

  it('requires a related sector pick and quality-checks manual preference text', () => {
    expect(
      validateCareerPreferencesStep({
        preferredSectors: [],
      }).preferredSectors,
    ).toMatch(/sektör/i);

    const manualErrors = validateCareerPreferencesStep({
      preferredSectors: [MANUAL_OPTION],
      sectorOther: '   ',
      preferredRoles: [MANUAL_OPTION],
      preferredRolesOther: '',
    });
    expect(manualErrors.sectorOther).toMatch(/zorunlu/);
    expect(manualErrors.preferredRolesOther).toMatch(/zorunlu/);

    expect(
      validateCareerPreferencesStep({
        preferredSectors: ['Finans / Bankacılık'],
        preferredRoles: ['Şube müdürü'],
      }),
    ).toEqual({});
  });
});
