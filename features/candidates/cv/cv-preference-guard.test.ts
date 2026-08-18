import { describe, expect, it } from 'vitest';
import { buildProfileDraftFromCanonicalResult } from '@/features/candidates/cv/cv-profile-builder';
import type { CanonicalTaxonomyMappingResult } from '@/features/candidates/cv/cv.types';

describe('CV Preference Guard QA', () => {
  it('does NOT automatically assume historical data as future user preferences', () => {
    const canonicalResult: CanonicalTaxonomyMappingResult = {
      primaryRole: 'Satış Müdürü',
      matchedRoles: ['Satış Müdürü', 'Kurumsal Satış Yöneticisi'],
      primarySector: 'Sigortacılık',
      matchedSectors: ['Sigortacılık'],
      professionalSkills: ['B2B Satış', 'Müzakere'],
      technicalSkills: ['CRM'],
      tools: ['Salesforce'],
      educationLevel: 'Lisans',
      educationField: 'İktisat',
      educationList: [{ level: 'Lisans', field: 'İktisat' }],
      languages: 'İngilizce',
      certificates: 'SEGEM',
      residenceCity: 'İstanbul',
      experiences: [
        {
          id: 'exp-1',
          role: 'Satış Müdürü',
          sector: 'Sigortacılık',
          duration: '5 yıl',
          startYear: 2019,
          endYear: 2024,
          responsibilities: 'B2B satış ve portföy yönetimi',
          achievements: 'Bölge hedeflerini aştı',
        },
      ],
      summary: '5 yıllık sigorta satış müdürlüğü deneyimi.',
      ambiguousItems: [],
      canonicalConfidence: 1.0,
    };

    const draft = buildProfileDraftFromCanonicalResult(
      canonicalResult,
      'satis_muduru_cv.pdf',
      'doc-123',
    );

    // 1. Preferences must remain empty / unforced for explicit user confirmation
    expect(draft.formValues.workType).toBe('');
    expect(draft.formValues.workplacePreference).toBe('');
    expect(draft.formValues.preferredDistrict).toBe('');
    expect(draft.formValues.availability).toBe('');
    expect(draft.formValues.salaryMin).toBeNull();
    expect(draft.formValues.salaryMax).toBeNull();
    expect(draft.formValues.salary).toBe('');

    // 2. Unconfirmed preference keys must be explicitly declared
    expect(draft.unconfirmedPreferenceKeys).toContain('desiredRole');
    expect(draft.unconfirmedPreferenceKeys).toContain('preferredCity');
    expect(draft.unconfirmedPreferenceKeys).toContain('workplacePreference');
    expect(draft.unconfirmedPreferenceKeys).toContain('salaryMin');
    expect(draft.unconfirmedPreferenceKeys).toContain('availability');

    // 3. Historical data was safely recorded
    expect(draft.formValues.residenceCity).toBe('İstanbul');
    expect(draft.formValues.experiences).toHaveLength(1);
    expect(draft.formValues.experiences?.[0].role).toBe('Satış Müdürü');
    expect(draft.cvFilledFieldKeys).toContain('experiences');
    expect(draft.cvFilledFieldKeys).toContain('professionalSkills');
  });
});
