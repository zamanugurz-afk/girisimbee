import { describe, expect, it } from 'vitest';
import { CareerProfileService } from '@/features/career-profile/career-profile.service';
import { MockListingRepository } from '@/features/listings/repository/mock/listing.repository.mock';
import { ids } from '@/lib/domain/ids';
import { calculateCareerProfileCompletion } from '@/features/career-profile/completion';

describe('Manual Fallback & Legacy Compatibility QA', () => {
  it('allows manual profile creation without CV and calculates accurate profile completion', async () => {
    const ownerId = ids.user('legacy-user-1');
    const repo = new MockListingRepository();
    const service = new CareerProfileService(repo);

    // 1. User creates profile 100% manually without any CV file
    const manualValues = {
      role: 'Grafik Tasarımcı',
      roles: ['Grafik Tasarımcı', 'İllüstratör'],
      sector: 'Pazarlama / Reklam',
      sectors: ['Pazarlama / Reklam'],
      experienceLevel: '3-5 yıl',
      workType: 'Tam zamanlı',
      workplacePreference: 'Hibrit',
      city: 'Ankara',
      educationLevel: 'Lisans',
      educationField: 'Grafik Tasarım',
      languages: 'İngilizce — İyi',
      availability: 'Hemen',
      candidateTraits: 'Kurumsal kimlik ve marka tasarımı konusunda 4 yıllık deneyimli tasarımcı.',
      professionalSkills: 'Yaratıcı Düşünme, Tipografi',
      technicalSkills: 'Photoshop, Illustrator, InDesign, Figma',
      tools: 'Adobe CC, Figma',
    };

    const saved = await service.saveProfile(ownerId, undefined, manualValues);

    // 2. Assert saved successfully
    expect(saved.values.role).toBe('Grafik Tasarımcı');
    expect(saved.values.cvFileName).toBeUndefined();
    expect(saved.completion.percent).toBe(100);
    expect(saved.completion.complete).toBe(true);

    // 3. Assert completion score calculation on partial profile
    const partialCompletion = calculateCareerProfileCompletion({
      kind: 'seek',
      source: {
        customFields: {
          desiredRole: 'Grafik Tasarımcı',
          primarySector: 'Pazarlama / Reklam',
        },
      },
    });

    expect(partialCompletion.percent).toBeLessThan(100);
    expect(partialCompletion.complete).toBe(false);
    expect(partialCompletion.missingLabels).toContain('Deneyim seviyesi');
  });
});
