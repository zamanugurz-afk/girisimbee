import { describe, expect, it } from 'vitest';
import fs from 'fs';
import { cvService } from '@/features/candidates/cv/cv.service';
import { formValuesToCustomFields } from '@/features/career-profile/career-profile.service';
import { valuesFromCareerSource } from '@/features/career-profile/completion';
import { toSafeCareerPreviewInput } from '@/features/career-profile/preview';
import type { CareerProfileFormValues } from '@/features/career-profile/types';

describe('CV Extraction 2.0 - Real Uğur Zaman CV Regression Test', () => {
  const cvPath = 'c:/Users/ugurz/Downloads/CV - UĞUR ZAMAN (4).pdf';

  it('runs complete zero-loss pipeline for Uğur Zaman real CV', async () => {
    if (!fs.existsSync(cvPath)) {
      console.warn(`File not found at ${cvPath}, skipping local file test`);
      return;
    }

    const buf = fs.readFileSync(cvPath);
    const draft = await cvService.processCvBuffer({
      buffer: buf,
      fileName: 'CV - UĞUR ZAMAN (4).pdf',
      mimeType: 'application/pdf',
    });

    // 1. Experiences verification (6 / 6)
    expect(draft.categoriesFound.experiences).toBe(6);
    expect(draft.formValues.experiences?.length).toBe(6);

    // 2. Education verification (2 / 2)
    expect(draft.categoriesFound.education).toBe(2);
    expect(draft.formValues.educationLevel).toBe('Yüksek lisans');
    expect(draft.formValues.educationField).toContain('Marmara');
    expect(draft.formValues.educationField).toContain('Anadolu');

    // 3. Location & Summary
    expect(draft.formValues.city).toBe('İstanbul');
    expect(draft.formValues.residenceCity).toBe('İstanbul');
    expect(draft.formValues.candidateTraits).toContain('19 yıllık');

    // 4. Skills & Tools
    expect(draft.categoriesFound.skills).toBeGreaterThanOrEqual(8);
    expect(draft.formValues.professionalSkillsList?.length).toBeGreaterThanOrEqual(6);

    // 5. Zero-hallucination preferences
    expect(draft.formValues.salaryMin).toBeNull();
    expect(draft.formValues.salaryMax).toBeNull();

    // 6. Save -> Reload -> Preview Chain
    const formState: CareerProfileFormValues = {
      role: draft.formValues.role || '',
      roles: draft.formValues.roles || [],
      sector: draft.formValues.sector || '',
      sectors: draft.formValues.sectors || [],
      experienceLevel: draft.formValues.experienceLevel || '',
      experiences: draft.formValues.experiences || [],
      professionalSkills: draft.formValues.professionalSkills || '',
      professionalSkillsList: draft.formValues.professionalSkillsList || [],
      technicalSkills: draft.formValues.technicalSkills || '',
      technicalSkillsList: draft.formValues.technicalSkillsList || [],
      tools: draft.formValues.tools || '',
      toolsList: draft.formValues.toolsList || [],
      educationLevel: draft.formValues.educationLevel || '',
      educationField: draft.formValues.educationField || '',
      educationHistory: draft.formValues.educationHistory || [],
      languages: draft.formValues.languages || '',
      certificates: draft.formValues.certificates || '',
      city: draft.formValues.city || '',
      residenceCity: draft.formValues.residenceCity || '',
      workType: 'Tam zamanlı',
      workplacePreference: 'Hibrit',
      availability: 'Hemen',
      candidateTraits: draft.formValues.candidateTraits || '',
    };

    const savedFields = formValuesToCustomFields('seek', formState);
    expect((savedFields.experiences as any[]).length).toBe(6);

    const reloaded = valuesFromCareerSource({
      city: formState.city,
      location: formState.city,
      customFields: savedFields,
    });
    expect(reloaded.experiences?.length).toBe(6);
    expect(reloaded.educationLevel).toBe('Yüksek lisans');

    const preview = toSafeCareerPreviewInput({
      kind: 'seek',
      source: { city: reloaded.city, location: reloaded.city, customFields: savedFields },
      displayName: 'Uğur Zaman',
    });
    expect(preview.experiences?.length).toBe(6);
    expect(preview.educationLevel).toBe('Yüksek lisans');
    expect(preview.longDescription).toContain('19 yıllık');
  });
});
