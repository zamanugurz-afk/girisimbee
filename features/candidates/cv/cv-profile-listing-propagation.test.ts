import { describe, expect, it } from 'vitest';
import { CareerProfileService } from '@/features/career-profile/career-profile.service';
import { MockListingRepository } from '@/features/listings/repository/mock/listing.repository.mock';
import { ids } from '@/lib/domain/ids';
import { CATEGORY_IDS, LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';
import { createListing } from '@/features/listings/factories/listing.factory';

describe('CV Profile to Listing Propagation QA', () => {
  it('propagates profile data to listing creation, and listing edit does NOT overwrite profile', async () => {
    const ownerId = ids.user('cv-user-1');
    const repo = new MockListingRepository();
    const service = new CareerProfileService(repo);

    const profileListingId = ids.listing('profile-seek-1');
    const profileListing = createListing({
      id: profileListingId,
      ownerId,
      categoryId: CATEGORY_IDS.isBul,
      listingTypeId: LISTING_TYPE_IDS.isBulDefault,
      moduleKey: 'candidates',
      title: 'Kıdemli Yazılım Geliştirici',
      shortDescription: 'Kıdemli yazılım geliştirici profili.',
      city: 'İzmir',
      status: 'published',
      publishedAt: '2026-08-01T00:00:00.000Z',
      customFields: {
        desiredRole: 'Kıdemli Yazılım Geliştirici',
        primarySector: 'Bilişim / Yazılım',
        cvFileName: 'ugur-zaman-cv.pdf',
      },
    });
    repo.save(profileListing);

    // 1. User saves career profile with CV-extracted data
    const savedProfile = await service.saveProfile(ownerId, profileListingId, {
      role: 'Kıdemli Yazılım Geliştirici',
      roles: ['Kıdemli Yazılım Geliştirici', 'Yazılım Mimarı'],
      sector: 'Bilişim / Yazılım',
      sectors: ['Bilişim / Yazılım'],
      experienceLevel: '5+ yıl',
      workType: 'Tam zamanlı',
      workplacePreference: 'Uzaktan',
      city: 'İzmir',
      educationLevel: 'Lisans',
      languages: 'İngilizce — İleri',
      certificates: 'AWS Architect',
      availability: '1 ay içinde',
      candidateTraits: 'Deneyimli backend ve bulut mimarı.',
      professionalSkills: 'Mikroservisler',
      technicalSkills: 'TypeScript, PostgreSQL',
      tools: 'Docker, Git',
      cvFileName: 'ugur-zaman-cv.pdf',
    });

    expect(savedProfile.values.role).toBe('Kıdemli Yazılım Geliştirici');
    expect(savedProfile.values.cvFileName).toBe('ugur-zaman-cv.pdf');

    // 2. User creates a separate listing on /ilan/olustur with copied values
    const separateListingId = ids.listing('listing-career-2');
    const newListing = createListing({
      id: separateListingId,
      ownerId,
      categoryId: CATEGORY_IDS.isBul,
      listingTypeId: LISTING_TYPE_IDS.isBulDefault,
      moduleKey: 'candidates',
      title: savedProfile.values.role,
      shortDescription: 'Ayrı bir iş arıyorum ilanı.',
      city: savedProfile.values.city,
      status: 'published',
      publishedAt: '2026-08-02T00:00:00.000Z',
      customFields: {
        desiredRole: savedProfile.values.role,
        primarySector: savedProfile.values.sector,
        experienceLevel: savedProfile.values.experienceLevel,
        cvFileName: savedProfile.values.cvFileName,
      },
    });
    repo.save(newListing);

    // Assert initial propagation
    const storedListing = await repo.findById(separateListingId);
    expect(storedListing?.customFields.desiredRole).toBe('Kıdemli Yazılım Geliştirici');
    expect(storedListing?.customFields.cvFileName).toBe('ugur-zaman-cv.pdf');

    // 3. User edits the separate listing directly (e.g. changes desiredRole to "Proje Yöneticisi")
    await repo.update(separateListingId, {
      title: 'Proje Yöneticisi',
      customFields: {
        ...storedListing?.customFields,
        desiredRole: 'Proje Yöneticisi',
      },
    });

    // 4. Verify separate listing was updated
    const updatedListing = await repo.findById(separateListingId);
    expect(updatedListing?.title).toBe('Proje Yöneticisi');
    expect(updatedListing?.customFields.desiredRole).toBe('Proje Yöneticisi');

    // 5. Assert PROFILE listing was NOT overwritten (remains "Kıdemli Yazılım Geliştirici")
    const originalProfileListing = await repo.findById(profileListingId);
    expect(originalProfileListing?.customFields.desiredRole).toBe('Kıdemli Yazılım Geliştirici');
    expect(originalProfileListing?.customFields.cvFileName).toBe('ugur-zaman-cv.pdf');
  });
});
