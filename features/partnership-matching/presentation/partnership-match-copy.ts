import type { PartnershipIntent } from '@/features/founders/partnership-intent';
import { CONTACT_CTA_PRIVACY_SHORT } from '@/features/contact-requests/config/contact-cta-copy';
import type { PartnershipMatchDirection, PartnershipMatchExplanation } from '@/features/partnership-matching/types';

export const PARTNERSHIP_MATCH_PAGE_TITLE = 'Ortaklık Eşleşmeleri';

export const PARTNERSHIP_MATCH_SECTION_COPY: Record<
  PartnershipMatchDirection,
  { title: string; description: string; whyTitle: string; reviewCta: string }
> = {
  partners: {
    title: 'Size Uygun Ortaklar',
    description: 'Girişiminizin ihtiyaçlarına ve aradığınız ortak profiline göre öne çıkan kişileri keşfedin.',
    whyTitle: 'Bu eşleşme neden önerildi?',
    reviewCta: 'Ortağı İncele',
  },
  ventures: {
    title: 'Size Uygun Girişimler',
    description: 'Uzmanlığınıza, sektör tercihlerinize ve ortaklık beklentilerinize uygun girişimleri keşfedin.',
    whyTitle: 'Bu eşleşme neden önerildi?',
    reviewCta: 'Girişimi İncele',
  },
};

export const PARTNERSHIP_MATCH_CONTACT_CTA = 'Ortaklık İletişim Talebi Gönder';
export const PARTNERSHIP_MATCH_PRIVACY_NOTE = CONTACT_CTA_PRIVACY_SHORT;

export const PARTNERSHIP_MATCH_EMPTY_FILTERED = {
  title: 'Bu filtrelere uygun eşleşme yok.',
  description: 'Minimum uyum, lokasyon veya ortaklık tipi filtresini değiştirerek tekrar deneyin.',
} as const;

export const PARTNERSHIP_CREATE_HUB_HREF = '/ilan/olustur?hub=venture';

export const PARTNERSHIP_MATCH_EMPTY_NO_SOURCE = {
  title: 'Henüz yayınlanmış bir ortaklık ilanı bulunmuyor.',
  description: 'Eşleşmeleri görmek için bir ortaklık ilanı oluşturun ve yayınlayın.',
  ctaLabel: 'İlan Oluştur',
  ctaHref: PARTNERSHIP_CREATE_HUB_HREF,
} as const;

export const PARTNERSHIP_MATCH_CLEAR_FILTERS_LABEL = 'Filtreleri temizle';

export function isPartnershipSafeCtaHref(href: string): boolean {
  return (
    !href.includes('/is')
    && !href.includes('kariyer')
    && !href.includes('/dashboard/eslesmeler')
    && !href.includes('/api/career')
  );
}

export function partnershipSourceEditHref(sourceListingId: string): string {
  return `/ilanlarim/${sourceListingId}/duzenle`;
}

export function formatPartnershipMatchScore(score: number): string {
  return `%${score} Uyum`;
}

export function presentPartnershipMatchReasons(
  reasons: readonly PartnershipMatchExplanation[],
): PartnershipMatchExplanation[] {
  return [...reasons];
}

export function resolvePartnershipMatchEmptyState(input: {
  intent: PartnershipIntent | null;
  hasPublishedSource: boolean;
  hasDraftSource: boolean;
  complete: boolean;
  matchCount: number;
  sourceListingId?: string | null;
  /** Section empty copy is about matches; page empty copy can still ask to complete a profile. */
  focus?: 'source' | 'matches';
}): { title: string; description: string; ctaLabel: string; ctaHref: string } | null {
  if (!input.hasPublishedSource && !input.hasDraftSource) {
    return { ...PARTNERSHIP_MATCH_EMPTY_NO_SOURCE };
  }

  const editHref = input.sourceListingId
    ? partnershipSourceEditHref(input.sourceListingId)
    : '/dashboard/ilanlarim';

  if (input.focus !== 'matches' && (!input.hasPublishedSource || !input.complete)) {
    return {
      title: 'Daha doğru ortaklık eşleşmeleri için profilinizi tamamlayın.',
      description: 'Eksik ortaklık bilgilerini tamamladığınızda daha isabetli öneriler görürsünüz.',
      ctaLabel: 'Profilimi Tamamla',
      ctaHref: editHref,
    };
  }

  if (input.matchCount > 0) return null;

  if (input.intent === 'joining') {
    return {
      title: 'Henüz size uygun bir girişim bulamadık.',
      description: 'Profilinizi güncelleyerek daha fazla girişimle eşleşebilirsiniz.',
      ctaLabel: 'Profilimi Güncelle',
      ctaHref: editHref,
    };
  }

  return {
    title: 'Henüz size uygun bir ortak bulamadık.',
    description: 'Aradığınız ortak profilini güncelleyerek daha fazla eşleşme görebilirsiniz.',
    ctaLabel: 'Profilimi Güncelle',
    ctaHref: editHref,
  };
}
