import { describe, expect, it } from 'vitest';
import { CAREER_FLOW_OPTIONS } from '@/components/girisimco/home/home-marketplace.data';
import { CREATE_LISTING_CAREER_COPY } from '@/components/girisimco/listing/create-listing-career.data';
import { calculateCareerMatch } from '@/features/matching-engine/engine';
import { extractCareerMatchProfile } from '@/features/matching-engine/adapters/career-fields';
import type { CareerMatchProfile } from '@/features/matching-engine/types';
import {
  CAREER_PROFILE_FIELD_LABELS,
  calculateCareerProfileCompletion,
  valuesFromCareerSource,
} from '@/features/career-profile/completion';
import { CAREER_PROFILE_COMPLETE_TITLE, formatProfileCompletedLabel } from '@/features/career-profile/copy';
import { presentCareerJourney } from '@/features/career-profile/journey';
import { previewHasContactLeak, toSafeCareerPreviewInput } from '@/features/career-profile/preview';
import { CareerProfileService, formValuesToCustomFields } from '@/features/career-profile/career-profile.service';
import { CATEGORY_IDS, LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';
import { createListing } from '@/features/listings/factories/listing.factory';
import { MockListingRepository } from '@/features/listings/repository/mock/listing.repository.mock';
import { ids } from '@/lib/domain/ids';

const FULL_SEEKER_FIELDS = {
  desiredRole: 'Yazılım geliştirici',
  primarySector: 'Bilişim / Yazılım',
  experienceLevel: 'Mid',
  professionalSkills: 'İletişim · Analitik düşünme',
  technicalSkills: 'JavaScript · React',
  workType: 'Tam zamanlı',
  workplacePreference: 'Hibrit',
  preferredCity: 'İstanbul',
  educationLevel: 'Lisans',
  languages: 'İngilizce — İyi, Türkçe — Ana Dil',
  availability: 'Hemen',
  contactPhone: '05551234567',
  contactEmail: 'gizli@example.com',
};

const FULL_HIRE_FIELDS = {
  ...FULL_SEEKER_FIELDS,
  requiredResponsibilities: 'Takım içinde teslimat yapabilen aday',
};

function seekerProfile(overrides: Partial<CareerMatchProfile> = {}): CareerMatchProfile {
  return {
    role: 'Yazılım geliştirici',
    roles: ['Yazılım geliştirici'],
    sector: 'Bilişim / Yazılım',
    sectors: ['Bilişim / Yazılım'],
    professionalSkills: ['İletişim', 'Analitik düşünme'],
    technicalSkills: ['JavaScript', 'React'],
    experienceLevel: 'Mid',
    workType: 'Tam zamanlı',
    workplacePreference: 'Hibrit',
    city: 'İstanbul',
    languages: ['İngilizce', 'Türkçe'],
    educationLevel: 'Lisans',
    ...overrides,
  };
}

describe('career profile completion', () => {
  it('returns a low score for an empty profile', () => {
    const result = calculateCareerProfileCompletion({ kind: 'seek' });
    expect(result.percent).toBe(0);
    expect(result.complete).toBe(false);
    expect(result.missingLabels.length).toBeGreaterThan(5);
  });

  it('returns 100 when every seeker matching field is filled', () => {
    const result = calculateCareerProfileCompletion({
      kind: 'seek',
      listingId: 'seek-1',
      source: { city: 'İstanbul', customFields: FULL_SEEKER_FIELDS },
    });
    expect(result.percent).toBe(100);
    expect(result.complete).toBe(true);
    expect(result.missingLabels).toEqual([]);
  });

  it('calculates a partial percentage from filled weights', () => {
    const result = calculateCareerProfileCompletion({
      kind: 'seek',
      source: {
        customFields: {
          desiredRole: 'Yazılım geliştirici',
          primarySector: 'Bilişim / Yazılım',
        },
      },
    });
    expect(result.percent).toBe(35);
    expect(result.missingLabels).toEqual(
      expect.arrayContaining(['Teknik yetkinlikler', 'Çalışma tercihi', 'Diller']),
    );
  });

  it('lists missing fields with seeker labels', () => {
    const result = calculateCareerProfileCompletion({
      kind: 'seek',
      source: { customFields: { desiredRole: 'Satış temsilcisi' } },
    });
    expect(CAREER_PROFILE_FIELD_LABELS.seek.role).toBe('Hedef pozisyon');
    expect(result.missingLabels).toContain('Sektör');
    expect(result.missingLabels).toContain('İşe başlama uygunluğu');
    expect(result.fields.some((field) => field.key === 'candidateTraits')).toBe(false);
  });

  it('lists hire-specific fields including candidate traits', () => {
    const result = calculateCareerProfileCompletion({
      kind: 'hire',
      source: { customFields: FULL_HIRE_FIELDS },
    });
    expect(CAREER_PROFILE_FIELD_LABELS.hire.role).toBe('Pozisyon');
    expect(CAREER_PROFILE_FIELD_LABELS.hire.candidateTraits).toBe('Aranan aday özellikleri');
    expect(result.percent).toBe(100);
    expect(result.fields.some((field) => field.key === 'availability')).toBe(false);
    expect(result.fields.some((field) => field.key === 'candidateTraits')).toBe(true);
  });
});

describe('career profile preview privacy', () => {
  it('keeps phone and email out of the public preview', () => {
    const preview = toSafeCareerPreviewInput({
      kind: 'seek',
      displayName: 'Ayşe Yılmaz',
      source: { city: 'İstanbul', customFields: FULL_SEEKER_FIELDS },
    });
    expect(preview.desiredRole).toBe('Yazılım geliştirici');
    expect(preview.primarySector).toBe('Bilişim / Yazılım');
    expect(preview.professionalSkills).toContain('İletişim');
    expect(preview.workplacePreference).toBe('Hibrit');
    expect(preview.preferredCity).toBe('İstanbul');
    expect(preview.displayName).toBeNull();
    expect(preview.displayNameMasked).toBe('Ayşe ******');
    expect(preview).not.toHaveProperty('contactPhone');
    expect(preview).not.toHaveProperty('contactEmail');
    expect(JSON.stringify(preview)).not.toContain('05551234567');
    expect(JSON.stringify(preview)).not.toContain('gizli@example.com');
    expect(previewHasContactLeak(preview)).toBe(false);
  });

  it('shows the completed-profile copy at 100%', () => {
    expect(formatProfileCompletedLabel(100)).toBe('Profiliniz %100 tamamlandı');
    expect(CAREER_PROFILE_COMPLETE_TITLE).toBe('Profiliniz tamamlandı.');
    expect(presentCareerJourney('seek', { percent: 100, complete: true, missingLabels: [] }).description).toContain(
      'daha doğru şekilde keşfedebilirsiniz',
    );
  });
});

describe('career profile does not change matching or existing career flows', () => {
  it('does not change the matching score for the same profiles', () => {
    const seeker = seekerProfile();
    const hire = seekerProfile();
    const before = calculateCareerMatch(seeker, hire);
    calculateCareerProfileCompletion({
      kind: 'seek',
      source: { customFields: FULL_SEEKER_FIELDS },
    });
    const after = calculateCareerMatch(seeker, hire);
    expect(after.score).toBe(before.score);
    expect(after.recommendable).toBe(before.recommendable);
  });

  it('uses İş Arıyorum / İşe Alıyorum on the /is landing', () => {
    expect(CAREER_FLOW_OPTIONS.map((item) => item.label)).toEqual(['İş Arıyorum', 'İşe Alıyorum']);
  });

  it('keeps listing-create career copy unchanged', () => {
    expect(CREATE_LISTING_CAREER_COPY.options[0]?.label).toBe('İş Arıyorum');
    expect(CREATE_LISTING_CAREER_COPY.options[1]?.label).toBe('İşe Alıyorum');
  });

  it('saves only allowlisted career fields and keeps contact channels off the profile DTO', async () => {
    const ownerId = ids.user('owner-1');
    const listing = createListing({
      ownerId,
      categoryId: CATEGORY_IDS.isBul,
      listingTypeId: LISTING_TYPE_IDS.isBulDefault,
      moduleKey: 'candidates',
      title: 'İş arıyorum',
      shortDescription: 'Anonim kariyer özeti, en az yirmi karakter.',
      status: 'published',
      contactPhone: '05551234567',
      contactEmail: 'gizli@example.com',
      customFields: { desiredRole: 'Satış', contactPhone: '05551234567' },
    });
    const repo = new MockListingRepository();
    repo.save(listing);
    const service = new CareerProfileService(repo);
    const saved = await service.saveProfile(ownerId, listing.id, {
      ...valuesFromCareerSource({ customFields: FULL_SEEKER_FIELDS }),
    });
    expect(saved.completion.percent).toBe(100);
    expect(JSON.stringify(saved)).not.toContain('05551234567');
    expect(JSON.stringify(saved)).not.toContain('gizli@example.com');
    const stored = await repo.findById(listing.id);
    expect(stored?.customFields.desiredRole).toBe('Yazılım geliştirici');
    expect(stored?.title).toBe('Yazılım geliştirici');
    expect(stored?.city).toBe('İstanbul');
    expect(stored?.contactPhone).toBe('05551234567');

    const deleted = await service.deleteProfile(ownerId, listing.id, 'seek');
    expect(deleted).toBe(true);
  });

  it('does not write contact channels when mapping form values', () => {
    const fields = formValuesToCustomFields('seek', valuesFromCareerSource({
      customFields: FULL_SEEKER_FIELDS,
    }));
    expect(fields).not.toHaveProperty('contactPhone');
    expect(fields).not.toHaveProperty('contactEmail');
    expect(extractCareerMatchProfile({ customFields: fields }).role).toBe('Yazılım geliştirici');
  });
});
