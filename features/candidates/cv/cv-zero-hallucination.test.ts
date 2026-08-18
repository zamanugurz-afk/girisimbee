import { describe, expect, it } from 'vitest';
import { buildProfileDraftFromCanonicalResult } from '@/features/candidates/cv/cv-profile-builder';
import type { CanonicalTaxonomyMappingResult } from '@/features/candidates/cv/cv.types';

describe('CV Extraction 2.0 - Zero Hallucination & Preference Guard Tests', () => {
  it('strictly keeps future user preferences empty and unforced', () => {
    const canonical: CanonicalTaxonomyMappingResult = {
      primaryRole: 'Yazılım Mühendisi',
      matchedRoles: ['Yazılım Mühendisi'],
      primarySector: 'Bilişim / Yazılım',
      matchedSectors: ['Bilişim / Yazılım'],
      professionalSkills: ['Yazılım Geliştirme'],
      technicalSkills: ['TypeScript', 'React'],
      tools: ['Git'],
      educationLevel: 'Lisans',
      educationField: 'Bilgisayar Mühendisliği',
      educationList: [{ level: 'Lisans', field: 'Bilgisayar Mühendisliği' }],
      languages: 'Türkçe, İngilizce',
      certificates: 'AWS Certified',
      residenceCity: 'İstanbul',
      experiences: [
        {
          id: 'exp-1',
          role: 'Yazılım Mühendisi',
          sector: 'Bilişim / Yazılım',
          duration: '3 yıl',
          startYear: 2021,
          endYear: 2024,
          responsibilities: '',
          achievements: '',
        },
      ],
      summary: 'Yazılım mühendisiyim.',
      ambiguousItems: [],
      canonicalConfidence: 1.0,
    };

    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv.pdf', 'doc-1');

    // PREFERENCE FIELDS MUST BE EMPTY (NO AI HALLUCINATION)
    expect(draft.formValues.salaryMin).toBeNull();
    expect(draft.formValues.salaryMax).toBeNull();
    expect(draft.formValues.salary).toBe('');
    expect(draft.formValues.workType).toBe('');
    expect(draft.formValues.workplacePreference).toBe('');
    expect(draft.formValues.availability).toBe('');
    expect(draft.formValues.preferredDistrict).toBe('');

    // Preference keys must be listed in unconfirmedPreferenceKeys
    expect(draft.unconfirmedPreferenceKeys).toContain('workType');
    expect(draft.unconfirmedPreferenceKeys).toContain('workplacePreference');
    expect(draft.unconfirmedPreferenceKeys).toContain('salaryMin');
    expect(draft.unconfirmedPreferenceKeys).toContain('salaryMax');
  });
});
