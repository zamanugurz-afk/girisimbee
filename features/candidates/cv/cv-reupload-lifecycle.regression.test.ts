import { describe, expect, it } from 'vitest';
import { buildHydratedCustomFieldsFromCvDraft } from '@/features/candidates/cv/cv-form-hydrator';
import { JOB_SEEKER_FIELD_SCHEMA } from '@/features/listings/config/listing-type-config';
import type { CvProfileDraftResult } from '@/features/candidates/cv/cv.types';
import { UGUR_ZAMAN_CV_TEXT } from './cv-real-world-ugur-zaman.test';
import { maskCvPii } from './cv-pii-masker';
import { extractDeterministicCv } from './cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from './cv-taxonomy-mapper';
import { buildProfileDraftFromCanonicalResult } from './cv-profile-builder';

describe('CV Reupload & Form State Lifecycle Regression Tests (Scenarios A through F)', () => {
  const ugurPii = maskCvPii(UGUR_ZAMAN_CV_TEXT);
  const ugurDeterministic = extractDeterministicCv(ugurPii.maskedText);
  const ugurCanonical = mapCvToCanonicalTaxonomy(ugurDeterministic);
  const ugurDraft: CvProfileDraftResult = buildProfileDraftFromCanonicalResult(
    ugurCanonical,
    'CV - UĞUR ZAMAN (4).pdf',
  );

  // TEST A: Old persisted draft overwritten by New API draft
  it('TEST A: overwrites old corrupted draft values with fresh canonical draft payload', () => {
    const oldCorruptedCustomFields: Record<string, unknown> = {
      fullName: 'Eğitim',
      primarySector: 'Kamu / Belediye',
      desiredRole: 'Uzman',
      experienceLevel: 'Yönetici',
      experiences: Array.from({ length: 11 }, (_, i) => ({
        id: `exp-${i}`,
        title: `Old Role ${i}`,
        company: `Old Company ${i}`,
      })),
      cvFileName: 'old_broken_cv.pdf',
      cvAnalysisVersion: '1.0.0',
    };

    const { nextCustomFields, appliedKeys } = buildHydratedCustomFieldsFromCvDraft(
      ugurDraft,
      oldCorruptedCustomFields,
      JOB_SEEKER_FIELD_SCHEMA,
    );

    expect(nextCustomFields.fullName).toBe('Uğur Zaman');
    expect(nextCustomFields.fullName).not.toBe('Eğitim');
    expect(nextCustomFields.desiredRole).toBe('Çağrı Merkezi Operasyon Müdürü');
    expect(nextCustomFields.desiredRole).not.toBe('Uzman');
    expect(nextCustomFields.residenceCity).toBe('İstanbul');
    expect(nextCustomFields.residenceDistrict).toBe('Maltepe');
    expect(nextCustomFields.cvFileName).toBe('CV - UĞUR ZAMAN (4).pdf');
    expect(nextCustomFields.cvAnalysisVersion).toBe('3.0.0');

    // Experience count must be the new 6 experiences, not the old 11
    const exps = nextCustomFields.experiences as any[];
    expect(exps).toBeDefined();
    expect(exps.length).toBe(6);
    expect(appliedKeys).toContain('fullName');
    expect(appliedKeys).toContain('desiredRole');
  });

  // TEST B: New CV upload -> autosave serialization -> restored draft preserves new values
  it('TEST B: simulates autosave serialization and restore without reverting to old state', () => {
    const { nextCustomFields } = buildHydratedCustomFieldsFromCvDraft(
      ugurDraft,
      {},
      JOB_SEEKER_FIELD_SCHEMA,
    );

    const serialized = JSON.stringify({
      customFields: nextCustomFields,
      savedAt: Date.now(),
    });

    const restored = JSON.parse(serialized);
    expect(restored.customFields.fullName).toBe('Uğur Zaman');
    expect(restored.customFields.desiredRole).toBe('Çağrı Merkezi Operasyon Müdürü');
    expect(restored.customFields.residenceDistrict).toBe('Maltepe');
    expect(restored.customFields.cvAnalysisVersion).toBe('3.0.0');
    expect((restored.customFields.experiences as any[]).length).toBe(6);
  });

  // TEST C: Headless CV produces clean empty fullName
  it('TEST C: headless CV with section headings never leaks headings into fullName', () => {
    const headlessCanonical = {
      ...ugurCanonical,
      fullName: undefined,
    };
    const headlessDraft = buildProfileDraftFromCanonicalResult(headlessCanonical, 'headless.pdf');
    const { nextCustomFields } = buildHydratedCustomFieldsFromCvDraft(
      headlessDraft,
      { fullName: 'Eğitim' },
      JOB_SEEKER_FIELD_SCHEMA,
    );

    expect(nextCustomFields.fullName).toBe('');
    expect(nextCustomFields.fullName).not.toBe('Eğitim');
  });

  // TEST D: Reuploading with a second candidate completely replaces first candidate
  it('TEST D: second CV upload cleanly replaces all first CV fields', () => {
    const { nextCustomFields: firstCandidateFields } = buildHydratedCustomFieldsFromCvDraft(
      ugurDraft,
      {},
      JOB_SEEKER_FIELD_SCHEMA,
    );

    const secondCandidateDraft: CvProfileDraftResult = {
      ...ugurDraft,
      formValues: {
        ...ugurDraft.formValues,
        fullName: 'Gülriz Sururi',
        desiredRole: 'Satış Müdürü',
        primarySector: 'Turizm / Otelcilik',
        residenceCity: 'İzmir',
        residenceDistrict: 'Çeşme',
        experiences: [
          {
            id: 'exp-1',
            title: 'Satış Müdürü',
            company: 'Alaçatı Otel',
          },
        ] as any,
        cvFileName: 'gulriz.pdf',
      },
    };

    const { nextCustomFields: secondCandidateFields } = buildHydratedCustomFieldsFromCvDraft(
      secondCandidateDraft,
      firstCandidateFields,
      JOB_SEEKER_FIELD_SCHEMA,
    );

    expect(secondCandidateFields.fullName).toBe('Gülriz Sururi');
    expect(secondCandidateFields.desiredRole).toBe('Satış Müdürü');
    expect(secondCandidateFields.primarySector).toBe('Turizm / Otelcilik');
    expect(secondCandidateFields.residenceCity).toBe('İzmir');
    expect(secondCandidateFields.residenceDistrict).toBe('Çeşme');
    expect(secondCandidateFields.cvFileName).toBe('gulriz.pdf');
    expect((secondCandidateFields.experiences as any[]).length).toBe(1);
  });

  // TEST E: LocalStorage draft overwrite when API produces new canonical values
  it('TEST E: overwrites stale localStorage payload with updated canonical values', () => {
    const staleLocalStorageData = {
      fullName: 'Eğitim',
      primarySector: 'Kamu / Belediye',
      desiredRole: 'Uzman',
      experienceLevel: 'Yönetici',
      experiences: Array(11).fill({ title: 'Old' }),
    };

    const { nextCustomFields } = buildHydratedCustomFieldsFromCvDraft(
      ugurDraft,
      staleLocalStorageData,
      JOB_SEEKER_FIELD_SCHEMA,
    );

    expect(nextCustomFields.fullName).toBe('Uğur Zaman');
    expect(nextCustomFields.desiredRole).toBe('Çağrı Merkezi Operasyon Müdürü');
    expect((nextCustomFields.experiences as any[]).length).toBe(6);
  });

  // TEST F: Preserves manual non-CV user fields during CV hydration
  it('TEST F: preserves non-CV manual preferences during CV hydration', () => {
    const existingUserCustomFields: Record<string, unknown> = {
      salaryMin: '50000',
      salaryMax: '75000',
      salaryCurrency: 'TRY',
      workTypes: ['Tam Zamanlı', 'Hibrit'],
      preferredCities: ['İstanbul', 'Kocaeli'],
      availability: 'Hemen',
      notes: 'Özel not',
    };

    const { nextCustomFields } = buildHydratedCustomFieldsFromCvDraft(
      ugurDraft,
      existingUserCustomFields,
      JOB_SEEKER_FIELD_SCHEMA,
    );

    // CV fields are hydrated
    expect(nextCustomFields.fullName).toBe('Uğur Zaman');
    expect(nextCustomFields.desiredRole).toBe('Çağrı Merkezi Operasyon Müdürü');
    expect(nextCustomFields.residenceCity).toBe('İstanbul');

    // Non-CV manual preferences remain intact
    expect(nextCustomFields.salaryMin).toBe('50000');
    expect(nextCustomFields.salaryMax).toBe('75000');
    expect(nextCustomFields.salaryCurrency).toBe('TRY');
    expect(nextCustomFields.workTypes).toEqual(['Tam Zamanlı', 'Hibrit']);
    expect(nextCustomFields.preferredCities).toEqual(['İstanbul', 'Kocaeli']);
    expect(nextCustomFields.availability).toBe('Hemen');
    expect(nextCustomFields.notes).toBe('Özel not');
  });
});
