import { describe, expect, it } from 'vitest';
import { MANUAL_OPTION } from '@/features/candidates/taxonomy/career-taxonomy';
import {
  validateCareerEducationStep,
  validateCareerManualOther,
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
      educationField: MANUAL_OPTION,
      educationFieldOther: '   ',
      certificates: MANUAL_OPTION,
      certificatesOther: '   ',
    });
    expect(educationErrors.educationField).toMatch(/zorunlu/);
    expect(educationErrors.certificates).toMatch(/zorunlu/);
  });
});
