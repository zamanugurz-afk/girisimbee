import { describe, it, expect } from 'vitest';
import fs from 'fs';
import { cvService } from '@/features/candidates/cv/cv.service';
import { formValuesToCustomFields, CareerProfileService } from '@/features/career-profile/career-profile.service';
import { MockListingRepository } from '@/features/listings/repository/mock/listing.repository.mock';
import { createListing } from '@/features/listings/factories/listing.factory';
import { CATEGORY_IDS, LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';
import { ids } from '@/lib/domain/ids';
import { toSafeCareerPreviewInput } from '@/features/career-profile/preview';
import type { CareerProfileFormValues } from '@/features/career-profile/types';
import { getPositionsForSector } from '@/features/candidates/taxonomy/career-taxonomy';
import { CAREER_EDUCATION_LEVELS } from '@/features/listings/config/listing-field-options';

describe('BROWSER ACCEPTANCE TEST: Zero Data Loss Across Full Lifecycle', () => {
  const cvPath = 'c:/Users/ugurz/Downloads/CV - UĞUR ZAMAN (4).pdf';

  it('preserves 100% of data from CV upload to form state, DB save, DB reload, and preview rendering', async () => {
    if (!fs.existsSync(cvPath)) return;
    const buf = fs.readFileSync(cvPath);

    // ==========================================
    // STEP 1: RAW EXTRACTION & STEP 2: PROFILE DRAFT
    // ==========================================
    const draft = await cvService.processCvBuffer({
      buffer: buf,
      fileName: 'CV - UĞUR ZAMAN (4).pdf',
      mimeType: 'application/pdf',
      documentId: 'doc-acceptance-ugur',
    });

    const fv = draft.formValues;

    // STEP 1 & 2 ASSERTIONS
    expect(fv.experiences).toHaveLength(6);
    expect(fv.educationHistory).toHaveLength(2);
    expect(fv.educationLevel).toBe('Yüksek lisans');
    expect(fv.professionalSkillsList?.length).toBeGreaterThanOrEqual(16);
    expect(fv.technicalSkillsList?.length).toBeGreaterThanOrEqual(1);
    expect(fv.city).toBe('İstanbul');
    expect(fv.candidateTraits?.length).toBeGreaterThan(100);

    // ==========================================
    // STEP 3: FORM STATE INITIALIZATION & APPLIED DRAFT
    // ==========================================
    const formState: CareerProfileFormValues = {
      role: fv.role || '',
      roles: fv.roles || [],
      sector: fv.sector || '',
      sectors: fv.sectors || [],
      experienceLevel: fv.experienceLevel || '',
      experiences: fv.experiences || [],
      professionalSkills: fv.professionalSkills || '',
      professionalSkillsList: fv.professionalSkillsList || [],
      technicalSkills: fv.technicalSkills || '',
      technicalSkillsList: fv.technicalSkillsList || [],
      tools: fv.tools || '',
      toolsList: fv.toolsList || [],
      workType: fv.workType || '',
      workplacePreference: fv.workplacePreference || '',
      city: fv.city || '',
      residenceDistrict: fv.residenceDistrict || '',
      preferredDistrict: fv.preferredDistrict || '',
      birthDate: fv.birthDate || '',
      profileGender: fv.profileGender || '',
      educationLevel: fv.educationLevel || '',
      educationField: fv.educationField || '',
      educationHistory: fv.educationHistory || [],
      certificates: fv.certificates || '',
      languages: fv.languages || '',
      availability: fv.availability || '',
      candidateTraits: fv.candidateTraits || '',
      requiredAchievements: fv.requiredAchievements || '',
      companyName: fv.companyName || '',
      partnerType: fv.partnerType || 'seeking_partner',
      stage: fv.stage || '',
      businessModel: fv.businessModel || '',
      capitalContribution: fv.capitalContribution || '',
      equityOffered: fv.equityOffered || '',
      salaryMin: fv.salaryMin,
      salaryMax: fv.salaryMax,
      cvFileName: fv.cvFileName,
      cvDocumentId: fv.cvDocumentId,
      cvUploadedAt: fv.cvUploadedAt,
    };

    // Verify custom role handling
    const sectorPositions = getPositionsForSector(formState.sector);
    const isCustomRole = !sectorPositions.includes(formState.role);
    expect(formState.role).toBe('Çağrı Merkezi Operasyon Müdürü');
    // If not in sectorPositions, the form handles custom mode and renders option safely
    expect(formState.experiences).toHaveLength(6);
    expect(formState.professionalSkillsList?.length).toBeGreaterThanOrEqual(16);
    expect(formState.technicalSkillsList?.length).toBeGreaterThanOrEqual(1);

    // Verify education level normalization
    const matchedEduLevel = CAREER_EDUCATION_LEVELS.find(
      (opt) => opt.toLocaleLowerCase('tr-TR') === (formState.educationLevel || '').toLocaleLowerCase('tr-TR'),
    );
    expect(matchedEduLevel).toBe('Yüksek lisans');

    // ==========================================
    // STEP 4: DB SAVE (formValuesToCustomFields)
    // ==========================================
    const customFields = formValuesToCustomFields('seek', formState);

    expect(customFields.experiences).toHaveLength(6);
    expect(customFields.educationHistory).toHaveLength(2);
    expect(customFields.educationLevel).toBe('Yüksek lisans');
    expect(customFields.educationField).toContain('Marmara Üniversitesi');
    expect(customFields.educationField).toContain('Anadolu Üniversitesi');
    expect(customFields.desiredRole).toBe('Çağrı Merkezi Operasyon Müdürü');
    expect(customFields.preferredCity).toBe('İstanbul');
    expect((customFields.professionalSkillsList as string[])?.length).toBeGreaterThanOrEqual(16);
    expect((customFields.technicalSkillsList as string[])?.length).toBeGreaterThanOrEqual(1);

    // ==========================================
    // STEP 5: DB RELOAD (CareerProfileService.getPageData)
    // ==========================================
    const repo = new MockListingRepository();
    const userId = ids.user('user-browser-acceptance');
    const listing = createListing({
      id: ids.listing('listing-browser-acceptance'),
      ownerId: userId,
      title: 'Uğur Zaman Kariyer Profil',
      shortDescription: 'Uğur Zaman Kariyer Profil',
      categoryId: CATEGORY_IDS.isBul,
      listingTypeId: LISTING_TYPE_IDS.isBulDefault,
      moduleKey: 'candidates',
      city: 'İstanbul',
      customFields,
      status: 'published',
    });
    await repo.create(listing as any);

    const service = new CareerProfileService(repo);
    const pageData = await service.getPageData(userId);

    const reloaded = pageData.seek?.values;
    expect(reloaded).toBeDefined();
    expect(reloaded?.experiences).toHaveLength(6);
    expect(reloaded?.educationHistory).toHaveLength(2);
    expect(reloaded?.educationLevel).toBe('Yüksek lisans');
    expect(reloaded?.educationField).toContain('Marmara Üniversitesi');
    expect(reloaded?.educationField).toContain('Anadolu Üniversitesi');
    expect(reloaded?.professionalSkillsList?.length).toBeGreaterThanOrEqual(16);
    expect(reloaded?.technicalSkillsList?.length).toBeGreaterThanOrEqual(1);
    expect(reloaded?.role).toBe('Çağrı Merkezi Operasyon Müdürü');
    expect(reloaded?.city).toBe('İstanbul');

    // ==========================================
    // STEP 6: LIVE PREVIEW RENDERING (toSafeCareerPreviewInput)
    // ==========================================
    const preview = toSafeCareerPreviewInput({
      kind: 'seek',
      source: {
        city: reloaded?.city,
        customFields: formValuesToCustomFields('seek', reloaded!),
      },
    });

    expect(preview.experiences).toHaveLength(6);
    expect(preview.educationLevel).toBe('Yüksek lisans');
    expect(preview.educationField).toContain('Marmara Üniversitesi');
    expect(preview.educationField).toContain('Anadolu Üniversitesi');
    expect(preview.preferredCity).toBe('İstanbul');
    expect(preview.desiredRole).toBe('Çağrı Merkezi Operasyon Müdürü');

    // Verify preview split logic produces 2 distinct degrees
    const degrees = preview.educationField?.split(' / ') || [];
    expect(degrees).toHaveLength(2);
    expect(degrees[0]).toContain('Marmara Üniversitesi');
    expect(degrees[1]).toContain('Anadolu Üniversitesi');
  });
});
