import { CONTACT_CTA_DEFAULT_LABEL, CONTACT_CTA_PRIVACY_SHORT } from '@/features/contact-requests/config/contact-cta-copy';
import { presentCareerJourney, resolveCareerMatchEmptyState } from '@/features/career-profile/journey';
import type { CareerMatchSection, MatchDirection, MatchExplanation } from '@/features/matching-engine/types';

export const MATCH_PAGE_TITLE = 'Eşleşmeler';
export const MATCH_PAGE_DESCRIPTION = 'Profilinize ve tercihlerinize göre sizin için öne çıkan fırsatları keşfedin.';

export const MATCH_SECTION_COPY: Record<
  MatchDirection,
  {
    title: string;
    description: string;
    whyTitle: string;
    reviewCta: string;
    viewAllCta: string;
    viewAllHref: string;
  }
> = {
  opportunities: {
    title: 'Size Uygun İş İlanları',
    description: 'Profilinize ve tercihlerinize göre sizin için öne çıkan fırsatları keşfedin.',
    whyTitle: 'Neden bu eşleşme?',
    reviewCta: 'İlanı İncele',
    viewAllCta: 'Tüm uygun iş ilanlarını gör',
    viewAllHref: '/is?flow=seek',
  },
  candidates: {
    title: 'Size Uygun Adaylar',
    description: 'Açık pozisyonunuzun gereksinimlerine uygun aday profillerini keşfedin.',
    whyTitle: 'Neden bu eşleşme?',
    reviewCta: 'Adayı İncele',
    viewAllCta: 'Tüm aday profillerini gör',
    viewAllHref: '/is?flow=hire',
  },
};

export const MATCH_CONTACT_CTA_LABEL = CONTACT_CTA_DEFAULT_LABEL;
export const MATCH_PRIVACY_NOTE = CONTACT_CTA_PRIVACY_SHORT;

export const MATCH_EMPTY_NO_LISTING = resolveCareerMatchEmptyState({
  kind: null,
  hasPublishedSource: false,
  hasProfileRecord: false,
  complete: false,
  matchCount: 0,
})!;

export const MATCH_EMPTY_NO_PUBLISHED = resolveCareerMatchEmptyState({
  kind: 'seek',
  hasPublishedSource: false,
  hasProfileRecord: true,
  complete: false,
  matchCount: 0,
})!;

export const MATCH_EMPTY_NO_RESULTS = presentCareerJourney('seek', {
  percent: 100,
  complete: true,
  missingLabels: [],
}).emptyMatches;

export function emptyMatchResultsCopy(direction: MatchDirection) {
  return presentCareerJourney(direction === 'candidates' ? 'hire' : 'seek', {
    percent: 100,
    complete: true,
    missingLabels: [],
  }).emptyMatches;
}

export const MATCH_EMPTY_FILTERED = {
  title: 'Bu filtrelere uygun eşleşme yok.',
  description: 'Minimum uyum, lokasyon veya çalışma modeli filtresini değiştirerek tekrar deneyin.',
} as const;

const CANDIDATE_REASON_ALIASES: Record<string, string> = {
  'Pozisyonunuzla güçlü uyum': 'Pozisyon beklentinizle güçlü uyum',
  'Sektör deneyiminiz uyumlu': 'Sektör deneyimi aranan kriterlere uygun',
};

export function presentMatchReasons(
  reasons: readonly MatchExplanation[],
  direction: MatchDirection,
): MatchExplanation[] {
  if (direction !== 'candidates') return [...reasons];
  return reasons.map((reason) => ({
    ...reason,
    text: CANDIDATE_REASON_ALIASES[reason.text] ?? reason.text,
  }));
}

export function formatMatchScore(score: number): string {
  return `%${score} Uyum`;
}

export function sourceListingEditHref(sourceListingId: string): string {
  return `/ilanlarim/${sourceListingId}/duzenle`;
}

export function sectionCopy(section: Pick<CareerMatchSection, 'direction'>): (typeof MATCH_SECTION_COPY)[MatchDirection] {
  return MATCH_SECTION_COPY[section.direction];
}
