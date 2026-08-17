import { formatProfileCompletedLabel } from '@/features/career-profile/copy';
import { CATEGORY_IDS } from '@/features/listings/config/listing-type-config';
import { DASHBOARD_ROUTES } from '@/features/dashboard/panel/dashboard-nav.constants';
import type { CareerListingKind } from '@/features/matching-engine/types';

export const CAREER_JOURNEY_MAX_MISSING = 3;

export const CAREER_JOURNEY_STACK_CLASS = 'grid min-w-0 grid-cols-1 gap-4';
export const CAREER_JOURNEY_ACTIONS_CLASS = 'mt-4 flex min-w-0 flex-col gap-2 sm:flex-row';
export const CAREER_JOURNEY_BUTTON_CLASS = 'h-10 w-full min-w-0 rounded-2xl sm:flex-1';

export function visibleMissingLabels(labels: readonly string[]): string[] {
  return labels.slice(0, CAREER_JOURNEY_MAX_MISSING);
}

export function formatJourneyPercent(percent: number): string {
  return `%${percent} tamamlandı`;
}

export function formatMatchBannerPercent(percent: number): string {
  return `Profiliniz %${percent} tamamlandı.`;
}

export function careerCreateHref(kind?: CareerListingKind | null): string {
  if (kind === 'seek') return `/ilan/olustur?category=${CATEGORY_IDS.isBul}`;
  if (kind === 'hire') return `/ilan/olustur?category=${CATEGORY_IDS.iseAl}`;
  return '/ilan/olustur';
}

export const CAREER_JOURNEY_EMPTY = {
  title: 'Kariyer profilinizi oluşturun',
  description: 'Size uygun iş fırsatlarını veya adayları keşfetmek için profilinizi oluşturun.',
  ctaLabel: 'Profil Oluştur',
  ctaHref: careerCreateHref(),
} as const;

export function presentCareerJourney(
  kind: CareerListingKind,
  completion: { percent: number; complete: boolean; missingLabels: readonly string[] },
) {
  const seeker = kind === 'seek';
  return {
    kind,
    title: 'Kariyer Profiliniz',
    percentLabel: formatJourneyPercent(completion.percent),
    completedLabel: formatProfileCompletedLabel(completion.percent),
    matchBannerPercent: formatMatchBannerPercent(completion.percent),
    description: completion.complete
      ? seeker
        ? 'Artık size uygun fırsatları daha doğru şekilde keşfedebilirsiniz.'
        : 'Artık pozisyonunuza uygun adayları daha doğru şekilde keşfedebilirsiniz.'
      : seeker
        ? 'Profilinizi tamamlayarak size uygun iş fırsatlarını daha doğru keşfedin.'
        : 'Pozisyonunuza uygun adayları daha doğru keşfetmek için profilinizi tamamlayın.',
    completeTitle: 'Profiliniz tamamlandı.',
    strengthenTitle: 'Profilinizi güçlendirin',
    strengthenCtaLabel: 'Profili Tamamla',
    missingLabels: visibleMissingLabels(completion.missingLabels),
    completeCta: {
      label: seeker ? 'Eşleşmelerimi Gör' : 'Aday Eşleşmelerini Gör',
      href: DASHBOARD_ROUTES.eslesmeler,
    },
    completeSecondary: {
      label: 'Profili düzenle',
      href: DASHBOARD_ROUTES.kariyerProfilim,
    },
    incompletePrimary: {
      label: 'Profilimi Tamamla',
      href: DASHBOARD_ROUTES.kariyerProfilim,
    },
    incompleteSecondary: {
      label: seeker ? 'Eşleşmelerimi Gör' : 'Aday Eşleşmelerini Gör',
      href: DASHBOARD_ROUTES.eslesmeler,
    },
    readyTitle: 'Profiliniz hazır.',
    readyHint: seeker
      ? 'Size uygun fırsatları keşfetmeye başlayın.'
      : 'Pozisyonunuza uygun adayları keşfetmeye başlayın.',
    matchBannerHint: 'Profilinizi tamamlayarak eşleşme kalitenizi artırabilirsiniz.',
    emptyMatches: {
      title: 'Henüz size uygun bir eşleşme bulamadık.',
      description: seeker
        ? 'Profilinizi ve tercihlerinizi güncel tutarak yeni fırsatları keşfedebilirsiniz.'
        : 'Profilinizi ve aradığınız yetenekleri güncel tutarak yeni adayları keşfedebilirsiniz.',
      ctaLabel: 'Profilimi Güncelle',
      ctaHref: DASHBOARD_ROUTES.kariyerProfilim,
    },
    createHref: careerCreateHref(kind),
  };
}

export type CareerMatchEmptyKind = 'no_profile' | 'no_listing' | 'incomplete' | 'no_matches';

export type CareerSourcePresence = 'none' | 'draft' | 'published';

export function resolveCareerMatchEmptyState(input: {
  kind?: CareerListingKind | null;
  hasPublishedSource: boolean;
  hasProfileRecord: boolean;
  complete: boolean;
  matchCount: number;
}) {
  if (input.matchCount > 0) return null;

  const kind = input.kind ?? null;
  const seeker = kind !== 'hire';

  if (!input.hasProfileRecord && !input.hasPublishedSource) {
    return {
      kind: 'no_profile' as const satisfies CareerMatchEmptyKind,
      title: 'Kariyer profilinizi oluşturun.',
      description: CAREER_JOURNEY_EMPTY.description,
      ctaLabel: 'Profil Oluştur',
      ctaHref: careerCreateHref(kind),
    };
  }

  if (!input.hasPublishedSource) {
    return {
      kind: 'no_listing' as const satisfies CareerMatchEmptyKind,
      title: 'Yayında bir ilanınız yok.',
      description: seeker
        ? 'Eşleşmeleri görmek için kariyer ilanınızı oluşturun veya yayınlayın.'
        : 'Aday eşleşmelerini görmek için pozisyon ilanınızı oluşturun veya yayınlayın.',
      ctaLabel: 'İlan Oluştur',
      ctaHref: careerCreateHref(kind),
    };
  }

  if (!input.complete) {
    return {
      kind: 'incomplete' as const satisfies CareerMatchEmptyKind,
      title: seeker
        ? 'Profilinizi tamamlayarak size daha uygun fırsatları keşfedin.'
        : 'Profilinizi tamamlayarak pozisyonunuza daha uygun adayları keşfedin.',
      description: seeker
        ? 'Eksik alanları doldurdukça size uygun işleri daha doğru önerebiliriz.'
        : 'Eksik alanları doldurdukça uygun adayları daha doğru önerebiliriz.',
      ctaLabel: 'Profilimi Tamamla',
      ctaHref: DASHBOARD_ROUTES.kariyerProfilim,
    };
  }

  return {
    kind: 'no_matches' as const satisfies CareerMatchEmptyKind,
    title: 'Henüz size uygun bir eşleşme bulamadık.',
    description: seeker
      ? 'Profilinizi ve tercihlerinizi güncel tutarak yeni fırsatları keşfedebilirsiniz.'
      : 'Profilinizi ve aradığınız yetenekleri güncel tutarak yeni adayları keşfedebilirsiniz.',
    ctaLabel: 'Profilimi Güncelle',
    ctaHref: DASHBOARD_ROUTES.kariyerProfilim,
  };
}
