import { describe, expect, it } from 'vitest';
import zlib from 'zlib';
import { cvService } from '@/features/candidates/cv/cv.service';
import { CareerProfileService } from '@/features/career-profile/career-profile.service';
import { MockListingRepository } from '@/features/listings/repository/mock/listing.repository.mock';
import { createListing } from '@/features/listings/factories/listing.factory';
import { CATEGORY_IDS, LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';
import { ids } from '@/lib/domain/ids';
import { toSafeCareerPreviewInput } from '@/features/career-profile/preview';
import { scoreCareerDimensions, normalizeMatchScore } from '@/features/matching-engine/scoring';
import type { CareerMatchProfile } from '@/features/matching-engine/types';

/**
 * Helper to create a valid binary PDF with real text stream content.
 */
function createMockCvPdfBuffer(textLines: string[]): Buffer {
  const stream = `
BT
/F1 12 Tf
${textLines.map((line) => `(${line}) Tj\nT*`).join('\n')}
ET
  `;
  const compressed = zlib.deflateSync(Buffer.from(stream, 'utf8'));
  const pdfString = `%PDF-1.4\n1 0 obj\n<< /Length ${compressed.length} /Filter /FlateDecode >>\nstream\n${compressed.toString('binary')}\nendstream\nendobj\n%%EOF`;
  return Buffer.from(pdfString, 'binary');
}

describe('Girişimbee Real CV End-to-End Acceptance Test', () => {
  const realisticCvLines = [
    'Ugur Can Canbolat',
    'Kidemli Yazilim Muhendisi - Senior Software Engineer',
    'Istanbul, Turkiye',
    'E-posta: ugur.canbolat@example.com | Tel: +90 532 999 88 77 | LinkedIn: linkedin.com/in/ugurcanbolat',
    'Ozet: 8 yillik kurumsal yazilim deneyimine sahip, yuksek olcekli web ve bulut mimarilerinde uzman.',
    'Deneyim: XYZ Teknoloji A.S. | Kidemli Yazilim Gelistirici | 2021 - Gunumuz',
    'Sorumluluklar: TypeScript, Next.js ve Go ile mikroservis mimarileri gelistirildi.',
    'Basarilar: Sistem yanit sureleri %35 iyilestirildi.',
    'Deneyim: ABC Bilisim | Yazilim Uzmani | 2017 - 2021',
    'Sorumluluklar: React, Node.js ve PostgreSQL ile kurumsal SaaS platformu gelistirildi.',
    'Egitim: Istanbul Teknik Universitesi - Bilgisayar Muhendisligi (Lisans) | 2013 - 2017',
    'Yetkinlikler: TypeScript, React, Node.js, Go, Python, PostgreSQL, Redis, Docker, Kubernetes, AWS',
    'Mesleki Yetkinlikler: Sistem Mimarisi, Kod Inceleme, Ekip Liderligi, Agile Scrum',
    'Araclar: Git, Jira, Figma, Postman, Linux',
    'Diller: Turkce, Ingilizce, Almanca',
    'Sertifikalar: AWS Certified Solutions Architect, Professional Scrum Master I',
  ];

  it('executes the complete pipeline: Buffer -> Extraction -> Taxonomy -> Profile Draft -> Save -> Listing -> Live Card -> Matching', async () => {
    const pdfBuffer = createMockCvPdfBuffer(realisticCvLines);

    // 1. Process CV Buffer through universal pipeline
    const draft = await cvService.processCvBuffer({
      buffer: pdfBuffer,
      fileName: 'ugur-canbolat-cv.pdf',
      mimeType: 'application/pdf',
      documentId: 'doc-cv-101',
    });

    // Verify Extraction & Metrics
    expect(draft.extractedCount).toBeGreaterThan(10);
    expect(draft.formValues.cvFileName).toBe('ugur-canbolat-cv.pdf');
    expect(draft.metrics.aiCallCount).toBe(1);

    // 2. Verify Canonical Taxonomy Mapping
    expect(draft.formValues.role).toBeTruthy();
    expect(draft.formValues.sector).toBeTruthy();
    expect(draft.formValues.city).toBe('İstanbul');

    // 3. Verify Preference Protection (Future preferences MUST be left for user choice)
    expect(draft.formValues.workType).toBe('');
    expect(draft.formValues.workplacePreference).toBe('');
    expect(draft.formValues.salaryMin).toBeNull();
    expect(draft.formValues.salaryMax).toBeNull();
    expect(draft.formValues.availability).toBe('');
    expect(draft.unconfirmedPreferenceKeys).toContain('workplacePreference');

    // 4. Verify Experiences & Categories Breakdown
    expect(draft.categoriesFound.experiences).toBeGreaterThanOrEqual(1);
    expect(draft.categoriesFound.roles).toBeGreaterThanOrEqual(1);
    expect(draft.categoriesFound.skills).toBeGreaterThanOrEqual(1);

    // 5. Save Career Profile via CareerProfileService
    const ownerId = ids.user('test-user-e2e');
    const repo = new MockListingRepository();
    const profileService = new CareerProfileService(repo);

    const profileListingId = ids.listing('profile-seek-e2e');
    const profileListing = createListing({
      id: profileListingId,
      ownerId,
      categoryId: CATEGORY_IDS.isBul,
      listingTypeId: LISTING_TYPE_IDS.isBulDefault,
      moduleKey: 'candidates',
      title: draft.formValues.role || 'Yazılım Geliştirici',
      shortDescription: draft.formValues.candidateTraits || 'Kariyer profili',
      city: draft.formValues.city || 'İstanbul',
      status: 'published',
      publishedAt: '2026-08-01T00:00:00.000Z',
      customFields: {
        desiredRole: draft.formValues.role || 'Yazılım Geliştirici',
        primarySector: draft.formValues.sector || 'Bilişim / Yazılım',
        cvFileName: draft.formValues.cvFileName,
      },
    });
    repo.save(profileListing);

    const savedProfile = await profileService.saveProfile(ownerId, profileListingId, {
      role: draft.formValues.role || 'Yazılım Geliştirici',
      roles: draft.formValues.roles || ['Yazılım Geliştirici'],
      sector: draft.formValues.sector || 'Bilişim / Yazılım',
      sectors: draft.formValues.sectors || ['Bilişim / Yazılım'],
      experienceLevel: draft.formValues.experienceLevel || '5+ yıl',
      city: draft.formValues.city || 'İstanbul',
      educationLevel: draft.formValues.educationLevel || 'Lisans',
      languages: draft.formValues.languages || 'İngilizce',
      availability: '1 ay içinde',
      candidateTraits: draft.formValues.candidateTraits || 'Kariyer özeti',
      professionalSkills: draft.formValues.professionalSkills || 'Sistem Mimarisi',
      technicalSkills: draft.formValues.technicalSkills || 'TypeScript, Go',
      workType: 'Tam zamanlı',
      workplacePreference: 'Uzaktan',
      cvFileName: draft.formValues.cvFileName,
    });

    expect(savedProfile.values.role).toBe(draft.formValues.role || 'Yazılım Geliştirici');
    expect(savedProfile.values.cvFileName).toBe('ugur-canbolat-cv.pdf');

    // 6. Verify Safe Public Preview Card DTO (No PII leak)
    const publicPreview = toSafeCareerPreviewInput({
      kind: 'seek',
      displayName: 'Uğur Can Canbolat',
      source: {
        city: savedProfile.values.city,
        customFields: {
          desiredRole: savedProfile.values.role,
          primarySector: savedProfile.values.sector,
          technicalSkills: savedProfile.values.technicalSkills,
          contactPhone: '05329998877',
          contactEmail: 'ugur.canbolat@example.com',
          cvFileName: savedProfile.values.cvFileName,
        },
      },
    });

    expect(publicPreview.displayNameMasked).toMatch(/^Uğur \*{3,}$/);
    expect(publicPreview.displayName).toBeNull();
    expect(publicPreview).not.toHaveProperty('contactPhone');
    expect(publicPreview).not.toHaveProperty('contactEmail');

    // 7. Verify Matching Engine Scoring
    const seekerProfile: CareerMatchProfile = {
      role: savedProfile.values.role || 'Yazılım Geliştirici',
      roles: [savedProfile.values.role || 'Yazılım Geliştirici'],
      sector: savedProfile.values.sector || 'Bilişim / Yazılım',
      sectors: [savedProfile.values.sector || 'Bilişim / Yazılım'],
      professionalSkills: ['Sistem Mimarisi', 'Kod İnceleme', 'Ekip Liderliği'],
      technicalSkills: ['TypeScript', 'React', 'Node.js', 'Go'],
      experienceLevel: '5+ yıl',
      city: 'İstanbul',
      workplacePreference: 'Uzaktan',
      workType: 'Tam zamanlı',
      educationLevel: 'Lisans',
      languages: ['Türkçe', 'İngilizce'],
      salaryMin: null,
      salaryMax: null,
      availability: '1 ay içinde',
    };

    const employerProfile: CareerMatchProfile = {
      role: 'Yazılım Geliştirici',
      roles: ['Yazılım Geliştirici', 'Kıdemli Yazılım Geliştirici'],
      sector: 'Bilişim / Yazılım',
      sectors: ['Bilişim / Yazılım'],
      professionalSkills: ['Sistem Mimarisi', 'Ekip Liderliği'],
      technicalSkills: ['TypeScript', 'React', 'Node.js'],
      experienceLevel: '3-5 yıl',
      city: 'İstanbul',
      workplacePreference: 'Uzaktan',
      workType: 'Tam zamanlı',
      educationLevel: 'Lisans',
      languages: ['İngilizce'],
      salaryMin: null,
      salaryMax: null,
      availability: 'Hemen',
    };

    const dimensions = scoreCareerDimensions(seekerProfile, employerProfile);
    let weightedSum = 0;
    let usedWeight = 0;
    for (const d of dimensions) {
      if (d.comparable && d.score != null) {
        weightedSum += d.score * d.weight;
        usedWeight += d.weight;
      }
    }
    const finalScore = normalizeMatchScore(weightedSum, usedWeight);

    expect(finalScore).toBeGreaterThanOrEqual(80);
    expect(dimensions.find((d) => d.key === 'role')?.score).toBe(1);
    expect(dimensions.find((d) => d.key === 'sector')?.score).toBe(1);
  });
});
