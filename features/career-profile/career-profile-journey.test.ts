import { describe, expect, it } from 'vitest';
import { calculateCareerProfileCompletion } from '@/features/career-profile/completion';
import {
  CAREER_JOURNEY_ACTIONS_CLASS,
  CAREER_JOURNEY_BUTTON_CLASS,
  CAREER_JOURNEY_EMPTY,
  CAREER_JOURNEY_MAX_MISSING,
  CAREER_JOURNEY_STACK_CLASS,
  careerCreateHref,
  presentCareerJourney,
  resolveCareerMatchEmptyState,
  visibleMissingLabels,
} from '@/features/career-profile/journey';
import { DASHBOARD_NAV_ITEMS, DASHBOARD_ROUTES } from '@/features/dashboard/panel/dashboard-nav.constants';
import { CATEGORY_IDS } from '@/features/listings/config/listing-type-config';
import { getModuleListingDetailPath } from '@/features/listings/config/listing-category-module.config';
import { MATCH_CONTACT_CTA_LABEL, MATCH_SECTION_COPY, emptyMatchResultsCopy } from '@/features/matching-engine/presentation/career-match-copy';
import { calculateCareerMatch } from '@/features/matching-engine/engine';
import type { CareerMatchProfile } from '@/features/matching-engine/types';

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
};

function seekerProfile(): CareerMatchProfile {
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
  };
}

describe('career journey dashboard copy', () => {
  it('uses seeker dashboard language and CTAs', () => {
    const completion = calculateCareerProfileCompletion({
      kind: 'seek',
      source: {
        customFields: {
          desiredRole: 'Yazılım geliştirici',
          primarySector: 'Bilişim / Yazılım',
        },
      },
    });
    const journey = presentCareerJourney('seek', completion);

    expect(journey.title).toBe('Kariyer Profiliniz');
    expect(journey.percentLabel).toBe('%35 tamamlandı');
    expect(journey.description).toBe(
      'Profilinizi tamamlayarak size uygun iş fırsatlarını daha doğru keşfedin.',
    );
    expect(journey.incompletePrimary).toEqual({
      label: 'Profilimi Tamamla',
      href: DASHBOARD_ROUTES.kariyerProfilim,
    });
    expect(journey.incompleteSecondary).toEqual({
      label: 'Eşleşmelerimi Gör',
      href: DASHBOARD_ROUTES.eslesmeler,
    });
    expect(journey.description).toMatch(/fırsat|kariyer|pozisyon|iş/i);
  });

  it('uses employer dashboard language and CTAs', () => {
    const completion = calculateCareerProfileCompletion({
      kind: 'hire',
      source: {
        customFields: {
          desiredRole: 'Satış temsilcisi',
          primarySector: 'Perakende',
        },
      },
    });
    const journey = presentCareerJourney('hire', completion);

    expect(journey.title).toBe('Kariyer Profiliniz');
    expect(journey.description).toBe(
      'Pozisyonunuza uygun adayları daha doğru keşfetmek için profilinizi tamamlayın.',
    );
    expect(journey.incompleteSecondary).toEqual({
      label: 'Aday Eşleşmelerini Gör',
      href: DASHBOARD_ROUTES.eslesmeler,
    });
    expect(journey.description).toMatch(/aday|pozisyon|yetenek|ekip|işe alım/i);
  });

  it('uses the empty-profile create state', () => {
    expect(CAREER_JOURNEY_EMPTY.title).toBe('Kariyer profilinizi oluşturun');
    expect(CAREER_JOURNEY_EMPTY.description).toBe(
      'Size uygun iş fırsatlarını veya adayları keşfetmek için profilinizi oluşturun.',
    );
    expect(CAREER_JOURNEY_EMPTY.ctaLabel).toBe('Profil Oluştur');
    expect(CAREER_JOURNEY_EMPTY.ctaHref).toBe('/ilan/olustur');
  });

  it('deep-links create to the previously chosen career intent', () => {
    expect(careerCreateHref('seek')).toBe(`/ilan/olustur?category=${CATEGORY_IDS.isBul}`);
    expect(careerCreateHref('hire')).toBe(`/ilan/olustur?category=${CATEGORY_IDS.iseAl}`);
    expect(careerCreateHref()).toBe('/ilan/olustur');
  });

  it('presents a 0% profile as incomplete guidance', () => {
    const completion = calculateCareerProfileCompletion({ kind: 'seek' });
    const journey = presentCareerJourney('seek', completion);
    expect(completion.percent).toBe(0);
    expect(journey.percentLabel).toBe('%0 tamamlandı');
    expect(journey.completeTitle).not.toBe(journey.description);
    expect(journey.missingLabels).toHaveLength(CAREER_JOURNEY_MAX_MISSING);
    expect(journey.incompletePrimary.label).toBe('Profilimi Tamamla');
  });

  it('shows at most three missing fields on a partial profile', () => {
    const completion = calculateCareerProfileCompletion({
      kind: 'seek',
      source: {
        customFields: {
          desiredRole: 'Yazılım geliştirici',
          primarySector: 'Bilişim / Yazılım',
        },
      },
    });
    const journey = presentCareerJourney('seek', completion);
    expect(completion.missingLabels.length).toBeGreaterThan(3);
    expect(journey.missingLabels).toHaveLength(3);
    expect(journey.strengthenTitle).toBe('Profilinizi güçlendirin');
    expect(journey.strengthenCtaLabel).toBe('Profili Tamamla');
    expect(visibleMissingLabels(completion.missingLabels)).toEqual(journey.missingLabels);
  });

  it('uses the completed-profile CTA as the primary action at 100%', () => {
    const completion = calculateCareerProfileCompletion({
      kind: 'seek',
      source: { city: 'İstanbul', customFields: FULL_SEEKER_FIELDS },
    });
    const journey = presentCareerJourney('seek', completion);
    expect(completion.percent).toBe(100);
    expect(journey.percentLabel).toBe('%100 tamamlandı');
    expect(journey.completeTitle).toBe('Profiliniz tamamlandı.');
    expect(journey.description).toBe(
      'Artık size uygun fırsatları daha doğru şekilde keşfedebilirsiniz.',
    );
    expect(journey.completeCta).toEqual({
      label: 'Eşleşmelerimi Gör',
      href: '/dashboard/eslesmeler',
    });
    expect(journey.completeSecondary.href).toBe(DASHBOARD_ROUTES.kariyerProfilim);
    expect(journey.readyTitle).toBe('Profiliniz hazır.');
    expect(journey.readyHint).toBe('Size uygun fırsatları keşfetmeye başlayın.');
  });
});

describe('career journey matching connections', () => {
  it('keeps match review on the existing listing detail route', () => {
    expect(MATCH_SECTION_COPY.opportunities.reviewCta).toBe('İlanı İncele');
    expect(MATCH_SECTION_COPY.candidates.reviewCta).toBe('Adayı İncele');
    expect(getModuleListingDetailPath(CATEGORY_IDS.isBul, 'aday-ozeti')).toBe('/ilan/aday-ozeti');
    expect(getModuleListingDetailPath(CATEGORY_IDS.iseAl, 'acik-pozisyon')).toBe('/ilan/acik-pozisyon');
  });

  it('reuses the existing contact-request CTA', () => {
    expect(MATCH_CONTACT_CTA_LABEL).toBe('İletişim Talebi Gönder');
  });

  it('uses the empty matching copy and profile update CTA', () => {
    const seekerEmpty = emptyMatchResultsCopy('opportunities');
    expect(seekerEmpty.title).toBe('Henüz size uygun bir eşleşme bulamadık.');
    expect(seekerEmpty.description).toBe(
      'Profilinizi ve tercihlerinizi güncel tutarak yeni fırsatları keşfedebilirsiniz.',
    );
    expect(seekerEmpty.ctaLabel).toBe('Profilimi Güncelle');
    expect(seekerEmpty.ctaHref).toBe('/dashboard/kariyer-profilim');
    expect(emptyMatchResultsCopy('candidates').description).toMatch(/aday/);
  });

  it('does not change the matching score from profile completion', () => {
    const seeker = seekerProfile();
    const before = calculateCareerMatch(seeker, seeker);
    const zero = presentCareerJourney('seek', { percent: 0, complete: false, missingLabels: [] });
    const full = presentCareerJourney('seek', { percent: 100, complete: true, missingLabels: [] });
    const after = calculateCareerMatch(seeker, seeker);
    expect(zero.percentLabel).toBe('%0 tamamlandı');
    expect(full.percentLabel).toBe('%100 tamamlandı');
    expect(after.score).toBe(before.score);
    expect(after.recommendable).toBe(before.recommendable);
  });

  it('retires Kariyer Profilim and Eşleşmeler from primary sidebar navigation', () => {
    const ids = DASHBOARD_NAV_ITEMS.map((item) => item.id);
    expect(ids).not.toContain('kariyerProfilim');
    expect(ids).not.toContain('eslesmeler');
  });

  it('separates matching empty states for profile, listing, incomplete, and no-match', () => {
    expect(
      resolveCareerMatchEmptyState({
        kind: 'seek',
        hasPublishedSource: false,
        hasProfileRecord: false,
        complete: false,
        matchCount: 0,
      }),
    ).toMatchObject({ kind: 'no_profile', ctaLabel: 'Profil Oluştur' });
    expect(
      resolveCareerMatchEmptyState({
        kind: 'hire',
        hasPublishedSource: false,
        hasProfileRecord: true,
        complete: false,
        matchCount: 0,
      }),
    ).toMatchObject({ kind: 'no_listing', ctaLabel: 'İlan Oluştur' });
    expect(
      resolveCareerMatchEmptyState({
        kind: 'seek',
        hasPublishedSource: true,
        hasProfileRecord: true,
        complete: false,
        matchCount: 0,
      }),
    ).toMatchObject({
      kind: 'incomplete',
      title: 'Profilinizi tamamlayarak size daha uygun fırsatları keşfedin.',
      ctaLabel: 'Profilimi Tamamla',
    });
    expect(
      resolveCareerMatchEmptyState({
        kind: 'seek',
        hasPublishedSource: true,
        hasProfileRecord: true,
        complete: true,
        matchCount: 0,
      }),
    ).toMatchObject({
      kind: 'no_matches',
      title: 'Henüz size uygun bir eşleşme bulamadık.',
      ctaLabel: 'Profilimi Güncelle',
    });
    expect(
      resolveCareerMatchEmptyState({
        kind: 'seek',
        hasPublishedSource: true,
        hasProfileRecord: true,
        complete: true,
        matchCount: 2,
      }),
    ).toBeNull();
  });

  it('uses a single-column mobile layout without fixed pixel widths', () => {
    const classes = `${CAREER_JOURNEY_STACK_CLASS} ${CAREER_JOURNEY_ACTIONS_CLASS} ${CAREER_JOURNEY_BUTTON_CLASS}`;
    expect(CAREER_JOURNEY_STACK_CLASS).toMatch(/grid-cols-1/);
    expect(CAREER_JOURNEY_ACTIONS_CLASS).toMatch(/flex-col/);
    expect(CAREER_JOURNEY_BUTTON_CLASS).toMatch(/w-full/);
    expect(classes).not.toMatch(/w-\[\d+px\]|min-w-\[\d+px\]/);
  });
});
