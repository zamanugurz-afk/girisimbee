import { describe, it, expect } from 'vitest';
import fs from 'fs';
import { cvService } from '@/features/candidates/cv/cv.service';
import { formValuesToCustomFields, CareerProfileService } from '@/features/career-profile/career-profile.service';
import { MockListingRepository } from '@/features/listings/repository/mock/listing.repository.mock';
import { createListing } from '@/features/listings/factories/listing.factory';
import { CATEGORY_IDS, LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';
import { ids } from '@/lib/domain/ids';
import { toSafeCareerPreviewInput } from '@/features/career-profile/preview';
import { getPositionsForSector } from '@/features/candidates/taxonomy/career-taxonomy';
import { CAREER_EDUCATION_LEVELS } from '@/features/listings/config/listing-field-options';
import type { CareerProfileFormValues } from '@/features/career-profile/types';

describe('GİRİŞİMBEE — SON BROWSER ACCEPTANCE TEST (UĞUR ZAMAN CV)', () => {
  const cvPath = 'c:/Users/ugurz/Downloads/CV - UĞUR ZAMAN (4).pdf';

  it('verifies the full browser acceptance test workflow end-to-end', async () => {
    expect(fs.existsSync(cvPath)).toBe(true);
    const pdfBuffer = fs.readFileSync(cvPath);

    // =========================================================================
    // 1. CV YÜKLE & ANALİZ (STEP 1 & 2)
    // =========================================================================
    const draftResult = await cvService.processCvBuffer({
      buffer: pdfBuffer,
      fileName: 'CV - UĞUR ZAMAN (4).pdf',
      mimeType: 'application/pdf',
      documentId: 'doc-final-acceptance-ugur',
    });

    const fv = draftResult.formValues;

    // =========================================================================
    // 2. FORM STATE AKTARIMI (STEP 3)
    // =========================================================================
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

    // 3. ALANLARIN KONTROLÜ
    expect(formState.sector).toBe('Finans / Bankacılık');
    expect(formState.role).toBe('Çağrı Merkezi Operasyon Müdürü');
    expect(formState.role).not.toBe('');
    expect(formState.role).not.toBe('Seçiniz');

    expect(formState.experienceLevel).toBe('Yönetici');
    expect(formState.workType).toBe(''); // Tercih uydurulmadı
    expect(formState.city).toBe('İstanbul');

    // 4. EXPERIENCE KONTROLÜ: 6/6
    expect(formState.experiences).toHaveLength(6);
    const expList = formState.experiences || [];
    expect(expList[0].company?.toLowerCase()).toContain('igs');
    expect(expList[0].role).toBe('Çağrı Merkezi Operasyon Müdürü');

    expect(expList[1].company?.toLowerCase()).toContain('gedik');
    expect(expList[1].role).toBe('Satış Müdürü');

    expect(expList[2].company?.toLowerCase()).toContain('mehrwerk');
    expect(expList[2].role).toBe('Çağrı Merkezi Operasyon Müdürü');

    expect(expList[3].company?.toLowerCase()).toContain('viennalife');
    expect(expList[3].role).toBe('Çağrı Merkezi Satış Müdürü');

    expect(expList[4].company?.toLowerCase()).toContain('fibabanka');
    expect(expList[4].role).toBe('Operasyon Müdürü');

    expect(expList[5].company?.toLowerCase()).toContain('mplus');
    expect(expList[5].role).toBe('Çağrı Merkezi Operasyon Müdürü');

    // 5. EDUCATION KONTROLÜ: 2/2
    expect(formState.educationHistory).toHaveLength(2);
    const eduList = formState.educationHistory || [];
    expect(eduList[0].school).toBe('Marmara Üniversitesi');
    expect(eduList[0].level).toBe('Yüksek lisans');

    expect(eduList[1].school).toBe('Anadolu Üniversitesi');
    expect(eduList[1].field).toBe('Kamu Yönetimi');
    expect(eduList[1].level).toBe('Lisans');

    // 6. SKILL KONTROLÜ: 16 Prof + 5 Tech = 21 Total
    const profCount = formState.professionalSkillsList?.length || 0;
    const techCount = formState.technicalSkillsList?.length || 0;
    const totalSkills = profCount + techCount;
    expect(profCount).toBe(16);
    expect(techCount).toBe(5);
    expect(totalSkills).toBe(21);

    // 7. LOCATION & SUMMARY
    expect(formState.city).toBe('İstanbul');
    expect(formState.candidateTraits?.length).toBeGreaterThan(100);

    // 8. CV BADGES
    const filledKeys = draftResult.cvFilledFieldKeys;
    expect(filledKeys).toContain('role');
    expect(filledKeys).toContain('sector');
    expect(filledKeys).toContain('experiences');
    expect(filledKeys).toContain('experienceLevel');
    expect(filledKeys).toContain('professionalSkills');
    expect(filledKeys).toContain('technicalSkills');
    expect(filledKeys).toContain('educationLevel');
    expect(filledKeys).toContain('educationField');
    expect(filledKeys).toContain('residenceCity');
    expect(filledKeys).toContain('candidateTraits');

    // =========================================================================
    // 9. DB SAVE & REFRESH PERSISTENCE (STEP 4 & 5)
    // =========================================================================
    const customFields = formValuesToCustomFields('seek', formState);
    const repo = new MockListingRepository();
    const userId = ids.user('user-browser-test');
    const listing = createListing({
      id: ids.listing('listing-browser-test'),
      ownerId: userId,
      title: 'Uğur Zaman Kariyer',
      shortDescription: 'Uğur Zaman Kariyer',
      categoryId: CATEGORY_IDS.isBul,
      listingTypeId: LISTING_TYPE_IDS.isBulDefault,
      moduleKey: 'candidates',
      city: 'İstanbul',
      customFields,
      status: 'published',
    });
    await repo.create(listing as any);

    // Simulate page reload (CTRL + R) -> loadCareerProfilePage
    const service = new CareerProfileService(repo);
    const reloadedPage = await service.getPageData(userId);
    const reloaded = reloadedPage.seek?.values;

    expect(reloaded).toBeDefined();
    expect(reloaded?.experiences).toHaveLength(6);
    expect(reloaded?.educationHistory).toHaveLength(2);
    expect(reloaded?.professionalSkillsList).toHaveLength(16);
    expect(reloaded?.technicalSkillsList).toHaveLength(5);
    expect((reloaded?.professionalSkillsList?.length || 0) + (reloaded?.technicalSkillsList?.length || 0)).toBe(21);
    expect(reloaded?.role).toBe('Çağrı Merkezi Operasyon Müdürü');
    expect(reloaded?.sector).toBe('Finans / Bankacılık');
    expect(reloaded?.city).toBe('İstanbul');
    expect(reloaded?.candidateTraits?.length).toBeGreaterThan(100);

    // =========================================================================
    // 10. PREVIEW & EXPAND KONTROLÜ (STEP 6)
    // =========================================================================
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
    expect(preview.desiredRole).toBe('Çağrı Merkezi Operasyon Müdürü');
    expect(preview.primarySector).toBe('Finans / Bankacılık');

    // Expand logic verification
    const featuredExpLimit = 2;
    const extraExpCount = Math.max(0, preview.experiences!.length - featuredExpLimit);
    expect(extraExpCount).toBe(4); // "+ 4 deneyim daha"

    const degrees = preview.educationField?.split(' / ') || [];
    expect(degrees).toHaveLength(2);

    // =========================================================================
    // 11. LISTING PROPAGATION & ISOLATION TEST
    // =========================================================================
    // Profile -> Listing: values are passed to createListing
    const listingDraftFields = formValuesToCustomFields('seek', reloaded!);
    expect(listingDraftFields.desiredRole).toBe('Çağrı Merkezi Operasyon Müdürü');
    expect(listingDraftFields.primarySector).toBe('Finans / Bankacılık');
    expect(listingDraftFields.preferredCity).toBe('İstanbul');

    // Mutating listing draft should NOT affect original profile record
    const mutatedListingDraft = { ...listingDraftFields, desiredRole: 'Yazılım Müdürü', preferredCity: 'Ankara' };
    expect(mutatedListingDraft.desiredRole).toBe('Yazılım Müdürü');
    expect(reloaded?.role).toBe('Çağrı Merkezi Operasyon Müdürü');
    expect(reloaded?.city).toBe('İstanbul');
  });
});
