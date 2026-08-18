import { describe, expect, it } from 'vitest';
import fs from 'fs';
import { cvService } from '@/features/candidates/cv/cv.service';
import { CareerProfileService } from '@/features/career-profile/career-profile.service';
import { MockListingRepository } from '@/features/listings/repository/mock/listing.repository.mock';
import { createListing } from '@/features/listings/factories/listing.factory';
import { CATEGORY_IDS, LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';
import { ids } from '@/lib/domain/ids';
import { toSafeCareerPreviewInput } from '@/features/career-profile/preview';
import { scoreCareerDimensions, normalizeMatchScore } from '@/features/matching-engine/scoring';
import type { CareerMatchProfile } from '@/features/matching-engine/types';

describe('Real CV Binary File Final Acceptance Test - CV - UĞUR ZAMAN (4).pdf', () => {
  const realPdfPath = 'c:/Users/ugurz/Downloads/CV - UĞUR ZAMAN (4).pdf';

  it('verifies the entire end-to-end pipeline with the actual binary file from disk', async () => {
    // 1. Read the actual binary PDF file from disk
    expect(fs.existsSync(realPdfPath)).toBe(true);
    const pdfBuffer = fs.readFileSync(realPdfPath);
    expect(pdfBuffer.length).toBeGreaterThan(10000);

    // 2. Run universal pipeline: Text Extraction -> PII Masking -> Deterministic + AI -> Canonical Taxonomy -> Draft
    const draft = await cvService.processCvBuffer({
      buffer: pdfBuffer,
      fileName: 'CV - UĞUR ZAMAN (4).pdf',
      mimeType: 'application/pdf',
      documentId: 'doc-real-ugur-zaman',
    });

    // 3. Minimum Acceptance Criteria Assertions
    // Position
    expect(draft.formValues.role).toBeTruthy();
    expect(draft.formValues.role).not.toBe('Pozisyon belirtilmedi');
    expect(draft.formValues.role).toMatch(/Çağrı Merkezi|Operasyon|Satış|Direktör|Müdür/i);

    // Experiences (Must be 6)
    expect(draft.formValues.experiences).toBeDefined();
    expect(draft.formValues.experiences!.length).toBeGreaterThanOrEqual(6);
    expect(draft.categoriesFound.experiences).toBeGreaterThanOrEqual(6);

    // Verify Experience fields
    const exps = draft.formValues.experiences!;
    expect(exps.length).toBeGreaterThanOrEqual(6);
    expect(exps.every((e) => Boolean(e.role))).toBe(true);

    // Skills (Must be >= 6)
    const profSkills = (draft.formValues.professionalSkillsList || []).concat(
      draft.formValues.professionalSkills ? draft.formValues.professionalSkills.split(',').map((s) => s.trim()) : [],
    );
    expect(profSkills.length).toBeGreaterThanOrEqual(6);
    expect(profSkills.some((s) => /Satış Yönetimi/i.test(s))).toBe(true);
    expect(profSkills.some((s) => /Operasyon Yönetimi/i.test(s))).toBe(true);
    expect(profSkills.some((s) => /Çağrı Merkezi/i.test(s))).toBe(true);

    // Education (Yüksek lisans as highest level, preserving fields)
    expect(draft.formValues.educationLevel).toBe('Yüksek lisans');
    expect(draft.formValues.educationField).toBeTruthy();
    expect(draft.formValues.educationField).toMatch(/Sermaye Piyasası|Kamu Yönetimi/i);

    // Location (Residence: İstanbul, preferences clean)
    expect(draft.formValues.city).toBe('İstanbul');
    expect(draft.formValues.residenceCity).toBe('İstanbul');
    expect(draft.formValues.preferredDistrict).toBe('');
    expect(draft.formValues.workType).toBe('');
    expect(draft.formValues.workplacePreference).toBe('');
    expect(draft.formValues.salaryMin).toBeNull();
    expect(draft.formValues.salaryMax).toBeNull();
    expect(draft.formValues.availability).toBe('');

    // Career Summary (Must be populated and grounded)
    expect(draft.formValues.candidateTraits).toBeTruthy();
    expect(draft.formValues.candidateTraits).toContain('19 yıl');

    // 4. Persistence Simulation (Save -> Reload)
    const ownerId = ids.user('user-ugur-zaman-real');
    const repo = new MockListingRepository();
    const profileService = new CareerProfileService(repo);

    const profileListingId = ids.listing('profile-seek-ugur-zaman');
    const profileListing = createListing({
      id: profileListingId,
      ownerId,
      categoryId: CATEGORY_IDS.isBul,
      listingTypeId: LISTING_TYPE_IDS.isBulDefault,
      moduleKey: 'candidates',
      title: draft.formValues.role || 'Çağrı Merkezi Operasyon Müdürü',
      shortDescription: draft.formValues.candidateTraits || '19 yıllık kariyer özeti',
      city: 'İstanbul',
      status: 'published',
      publishedAt: '2026-08-01T00:00:00.000Z',
      customFields: {
        desiredRole: draft.formValues.role,
        primarySector: draft.formValues.sector,
        cvFileName: draft.formValues.cvFileName,
      },
    });
    repo.save(profileListing);

    // Save profile with confirmed values
    const saved = await profileService.saveProfile(ownerId, profileListingId, {
      ...draft.formValues,
      role: draft.formValues.role || 'Çağrı Merkezi Operasyon Müdürü',
      sector: draft.formValues.sector || 'Finans / Bankacılık',
      experienceLevel: 'Direktör',
      educationLevel: draft.formValues.educationLevel || 'Yüksek lisans',
      city: 'İstanbul',
      workType: 'Tam zamanlı',
      workplacePreference: 'Hibrit',
      availability: '1 ay içinde',
      professionalSkills: draft.formValues.professionalSkills || 'Satış Yönetimi, Operasyon Yönetimi',
      technicalSkills: draft.formValues.technicalSkills || 'CRM, MS Excel',
      candidateTraits: draft.formValues.candidateTraits || '19 yıllık deneyimli yönetici',
      languages: 'Türkçe, İngilizce',
    });

    expect(saved.values.role).toBe(draft.formValues.role);
    expect(saved.values.experiences?.length).toBeGreaterThanOrEqual(6);
    expect(saved.values.educationLevel).toBe('Yüksek lisans');

    // Reload (Hard refresh simulation)
    const pageData = await profileService.getPageData(ownerId);
    const reloaded = pageData.seek;
    expect(reloaded).not.toBeNull();
    expect(reloaded!.values.role).toBe(saved.values.role);
    expect(reloaded!.values.experiences?.length).toBe(saved.values.experiences?.length);
    expect(reloaded!.values.educationLevel).toBe('Yüksek lisans');
    expect(reloaded!.values.city).toBe('İstanbul');

    // 5. Safe Live Card Preview DTO Verification
    const publicCard = toSafeCareerPreviewInput({
      kind: 'seek',
      displayName: 'Uğur Zaman',
      source: {
        city: saved.values.city,
        customFields: {
          desiredRole: saved.values.role,
          primarySector: saved.values.sector,
          professionalSkills: saved.values.professionalSkills,
          technicalSkills: saved.values.technicalSkills,
          educationLevel: saved.values.educationLevel,
          educationField: saved.values.educationField,
          experiences: saved.values.experiences,
          candidateTraits: saved.values.candidateTraits,
          contactPhone: '05309367745',
          contactEmail: 'zamanugurz@gmail.com',
          cvFileName: saved.values.cvFileName,
        },
      },
    });

    expect(publicCard.displayNameMasked).toBe('Uğur *****');
    expect(publicCard.displayName).toBeNull();
    expect(publicCard).not.toHaveProperty('contactPhone');
    expect(publicCard).not.toHaveProperty('contactEmail');
    expect(publicCard.experiences?.length).toBeGreaterThanOrEqual(6);
    expect(publicCard.educationLevel).toBe('Yüksek lisans');

    // 6. Listing Propagation and Isolation Test
    // Creating a job listing from the profile
    const seekerListingId = ids.listing('listing-ugur-zaman-job-seek');
    const createdSeekerListing = createListing({
      id: seekerListingId,
      ownerId,
      categoryId: CATEGORY_IDS.isBul,
      listingTypeId: LISTING_TYPE_IDS.isBulDefault,
      moduleKey: 'candidates',
      title: saved.values.role,
      shortDescription: 'Kariyer ilanı',
      city: saved.values.city,
      status: 'published',
      publishedAt: '2026-08-01T00:00:00.000Z',
      customFields: {
        desiredRole: saved.values.role,
        primarySector: saved.values.sector,
        professionalSkills: saved.values.professionalSkills,
        educationLevel: saved.values.educationLevel,
        experiences: saved.values.experiences,
      },
    });
    repo.save(createdSeekerListing);

    // Edit listing custom fields (simulate user editing the listing)
    const modifiedListing = {
      ...createdSeekerListing,
      customFields: {
        ...createdSeekerListing.customFields,
        desiredRole: 'Satış ve Pazarlama Direktörü',
        primarySector: 'Pazarlama / Reklam',
      },
    };
    repo.save(modifiedListing);

    // Verify Career Profile was NOT mutated (Strict Isolation)
    const profileListingPreserved = await repo.findById(profileListingId);
    expect(profileListingPreserved).not.toBeNull();
    expect(profileListingPreserved!.customFields?.desiredRole).toBe(saved.values.role);
    expect(profileListingPreserved!.customFields?.desiredRole).not.toBe('Satış ve Pazarlama Direktörü');
    expect(profileListingPreserved!.customFields?.primarySector).toBe(saved.values.sector);

    // 7. Matching Engine Scoring Verification
    const seekerSectors = saved.values.sectors && saved.values.sectors.length > 0
      ? saved.values.sectors
      : [saved.values.sector || 'Sigortacılık'];

    const seekerMatchProfile: CareerMatchProfile = {
      role: saved.values.role,
      roles: [saved.values.role, 'Satış Müdürü', 'Operasyon Müdürü'],
      sector: saved.values.sector || 'Sigortacılık',
      sectors: seekerSectors,
      professionalSkills: ['Satış Yönetimi', 'Operasyon Yönetimi', 'Çağrı Merkezi Yönetimi', 'Ekip Yönetimi'],
      technicalSkills: ['CRM', 'MS Excel'],
      experienceLevel: 'Direktör',
      city: 'İstanbul',
      workplacePreference: 'Hibrit',
      workType: 'Tam zamanlı',
      educationLevel: 'Yüksek lisans',
      languages: ['Türkçe', 'İngilizce'],
      salaryMin: null,
      salaryMax: null,
      availability: '1 ay içinde',
    };

    const employerMatchProfile: CareerMatchProfile = {
      role: 'Çağrı Merkezi Operasyon Müdürü',
      roles: ['Çağrı Merkezi Operasyon Müdürü', 'Çağrı Merkezi Müdürü'],
      sector: saved.values.sector || 'Sigortacılık',
      sectors: [saved.values.sector || 'Sigortacılık', 'Finans / Bankacılık'],
      professionalSkills: ['Satış Yönetimi', 'Operasyon Yönetimi', 'Çağrı Merkezi Yönetimi'],
      technicalSkills: ['CRM'],
      experienceLevel: 'Yönetici',
      city: 'İstanbul',
      workplacePreference: 'Hibrit',
      workType: 'Tam zamanlı',
      educationLevel: 'Lisans',
      languages: ['Türkçe'],
      salaryMin: null,
      salaryMax: null,
      availability: 'Hemen',
    };

    const dimensions = scoreCareerDimensions(seekerMatchProfile, employerMatchProfile);
    let weightedSum = 0;
    let usedWeight = 0;
    for (const d of dimensions) {
      if (d.comparable && d.score != null) {
        weightedSum += d.score * d.weight;
        usedWeight += d.weight;
      }
    }
    const finalScore = normalizeMatchScore(weightedSum, usedWeight);

    // Consistency assertions
    expect(finalScore).toBeGreaterThanOrEqual(80);
    expect(dimensions.find((d) => d.key === 'role')?.score).toBe(1);
    expect(dimensions.find((d) => d.key === 'sector')?.score).toBe(1);
    expect(dimensions.find((d) => d.key === 'professionalSkills')?.score).toBe(1);
    expect(dimensions.find((d) => d.key === 'location')?.score).toBe(1);
  });
});
