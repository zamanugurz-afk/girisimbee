import { describe, expect, it } from 'vitest';
import { VENTURE_PARTNERSHIP_HUB, VENTURE_PARTNERSHIP_OPTIONS } from '@/components/girisimco/home/home-marketplace.data';
import { DASHBOARD_NAV_ITEMS, DASHBOARD_ROUTES } from '@/features/dashboard/panel/dashboard-nav.constants';
import { partnershipDetailHeadline } from '@/features/founders/partnership-intent';
import { selectPartnershipDisplayReasons } from '@/features/partnership-matching/explain';
import {
  DEFAULT_PARTNERSHIP_MATCH_FILTERS,
  filterAndSortPartnershipMatchCards,
  parsePartnershipMatchFilters,
  partnershipMatchFiltersAreDefault,
  partnershipMatchFiltersToQuery,
} from '@/features/partnership-matching/presentation/partnership-match-filters';
import {
  formatPartnershipMatchScore,
  isPartnershipSafeCtaHref,
  PARTNERSHIP_CREATE_HUB_HREF,
  PARTNERSHIP_MATCH_CONTACT_CTA,
  PARTNERSHIP_MATCH_EMPTY_NO_SOURCE,
  PARTNERSHIP_MATCH_PAGE_TITLE,
  PARTNERSHIP_MATCH_SECTION_COPY,
  partnershipSourceEditHref,
  resolvePartnershipMatchEmptyState,
} from '@/features/partnership-matching/presentation/partnership-match-copy';
import { partnershipCardMetaRows } from '@/features/partnership-matching/presentation/partnership-match-party';
import type { PartnershipMatchCard } from '@/features/partnership-matching/types';

function card(overrides: Partial<PartnershipMatchCard> = {}): PartnershipMatchCard {
  return {
    listingId: 'l1',
    slug: 'ortak-profili',
    href: '/ilan/ortak-profili',
    title: 'Ortak profili',
    intent: 'joining',
    expertise: ['React'],
    sectors: ['Fintech'],
    experience: '3-5 yıl',
    location: 'İstanbul',
    commitment: 'Yarı zamanlı',
    partnershipType: 'Teknik Ortak',
    stage: 'MVP aşaması',
    preferredVentureType: 'Teknik Ortak',
    publishedAt: '2026-08-02T00:00:00.000Z',
    score: 86,
    band: 'very_strong',
    bandLabel: 'Çok güçlü ortaklık eşleşmesi',
    reasons: [{ kind: 'match', text: 'Uzmanlık ihtiyacı karşılanıyor' }],
    ...overrides,
  };
}

describe('partnership match presentation', () => {
  it('uses partnership-only dashboard copy and CTAs', () => {
    expect(PARTNERSHIP_MATCH_PAGE_TITLE).toBe('Ortaklık Eşleşmeleri');
    expect(PARTNERSHIP_MATCH_SECTION_COPY.partners.reviewCta).toBe('Ortağı İncele');
    expect(PARTNERSHIP_MATCH_SECTION_COPY.ventures.reviewCta).toBe('Girişimi İncele');
    expect(PARTNERSHIP_MATCH_CONTACT_CTA).toBe('Ortaklık İletişim Talebi Gönder');
    expect(formatPartnershipMatchScore(86)).toBe('%86 Uyum');
    expect(partnershipSourceEditHref('abc')).toBe('/ilanlarim/abc/duzenle');
    expect(PARTNERSHIP_MATCH_CONTACT_CTA).not.toMatch(/Başvur|WhatsApp|Telefonla Ara/i);
    const userCopy = [
      PARTNERSHIP_MATCH_PAGE_TITLE,
      PARTNERSHIP_MATCH_SECTION_COPY.partners.title,
      PARTNERSHIP_MATCH_SECTION_COPY.partners.description,
      PARTNERSHIP_MATCH_SECTION_COPY.ventures.title,
      PARTNERSHIP_MATCH_SECTION_COPY.ventures.description,
      PARTNERSHIP_MATCH_SECTION_COPY.partners.whyTitle,
      PARTNERSHIP_MATCH_CONTACT_CTA,
    ].join(' ');
    expect(userCopy).not.toMatch(/canonical|matching score|weight|normalized|customFields|runtime/i);
    expect(userCopy).not.toContain('intent');
  });

  it('separates empty states for source, incomplete, seeking, and joining', () => {
    expect(
      resolvePartnershipMatchEmptyState({
        intent: null,
        hasPublishedSource: false,
        hasDraftSource: false,
        complete: false,
        matchCount: 0,
      })?.title,
    ).toBe('Henüz yayınlanmış bir ortaklık ilanı bulunmuyor.');

    expect(
      resolvePartnershipMatchEmptyState({
        intent: 'seeking',
        hasPublishedSource: true,
        hasDraftSource: false,
        complete: false,
        matchCount: 0,
        sourceListingId: 'src-1',
      }),
    ).toMatchObject({
      title: 'Daha doğru ortaklık eşleşmeleri için profilinizi tamamlayın.',
      ctaLabel: 'Profilimi Tamamla',
      ctaHref: '/ilanlarim/src-1/duzenle',
    });

    expect(
      resolvePartnershipMatchEmptyState({
        intent: 'seeking',
        hasPublishedSource: true,
        hasDraftSource: false,
        complete: true,
        matchCount: 0,
        sourceListingId: 'src-1',
      })?.title,
    ).toBe('Henüz size uygun bir ortak bulamadık.');

    expect(
      resolvePartnershipMatchEmptyState({
        intent: 'joining',
        hasPublishedSource: true,
        hasDraftSource: false,
        complete: true,
        matchCount: 0,
        sourceListingId: 'src-2',
      })?.title,
    ).toBe('Henüz size uygun bir girişim bulamadık.');

    expect(
      resolvePartnershipMatchEmptyState({
        intent: 'seeking',
        hasPublishedSource: true,
        hasDraftSource: false,
        complete: false,
        matchCount: 0,
        sourceListingId: 'src-1',
        focus: 'matches',
      })?.title,
    ).toBe('Henüz size uygun bir ortak bulamadık.');

    expect(PARTNERSHIP_MATCH_EMPTY_NO_SOURCE.ctaHref).toBe(PARTNERSHIP_CREATE_HUB_HREF);
    expect(isPartnershipSafeCtaHref(PARTNERSHIP_MATCH_EMPTY_NO_SOURCE.ctaHref)).toBe(true);
    expect(isPartnershipSafeCtaHref('/ilanlarim/src-1/duzenle')).toBe(true);
    expect(isPartnershipSafeCtaHref('/is')).toBe(false);
    expect(isPartnershipSafeCtaHref('/dashboard/kariyer-profilim')).toBe(false);
  });

  it('filters by minimum fit, location, partnership type, and sort', () => {
    const cards = [
      card({ listingId: 'a', title: 'A', score: 86, location: 'İstanbul', partnershipType: 'Teknik Ortak', publishedAt: '2026-08-01T00:00:00.000Z' }),
      card({ listingId: 'b', title: 'B', score: 70, location: 'Ankara', partnershipType: 'İş Ortağı', publishedAt: '2026-08-03T00:00:00.000Z' }),
      card({ listingId: 'c', title: 'C', score: 52, location: 'İstanbul', partnershipType: 'Teknik Ortak', publishedAt: '2026-08-04T00:00:00.000Z' }),
    ];

    expect(
      filterAndSortPartnershipMatchCards(cards, { ...DEFAULT_PARTNERSHIP_MATCH_FILTERS, minScore: '80' }).map(
        (item) => item.listingId,
      ),
    ).toEqual(['a']);

    expect(
      filterAndSortPartnershipMatchCards(cards, { ...DEFAULT_PARTNERSHIP_MATCH_FILTERS, location: 'Ankara' }).map(
        (item) => item.listingId,
      ),
    ).toEqual(['b']);

    expect(
      filterAndSortPartnershipMatchCards(cards, {
        ...DEFAULT_PARTNERSHIP_MATCH_FILTERS,
        partnershipType: 'Teknik Ortak',
        sort: 'newest',
      }).map((item) => item.listingId),
    ).toEqual(['c', 'a']);
  });

  it('retires Ortaklık Eşleşmeleri and career Eşleşmeler from sidebar nav', () => {
    const navIds = DASHBOARD_NAV_ITEMS.map((item) => item.id);
    expect(DASHBOARD_ROUTES.ortaklikEslesmeleri).toBe('/dashboard/ortaklik-eslesmeleri');
    expect(DASHBOARD_ROUTES.eslesmeler).toBe('/dashboard/eslesmeler');
    expect(navIds).not.toContain('ortaklikEslesmeleri');
    expect(navIds).not.toContain('eslesmeler');
  });

  it('keeps Ortaklık Eşleşmeleri highlight separate from career Eşleşmeler', () => {
    const pathname = DASHBOARD_ROUTES.ortaklikEslesmeleri;
    const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
    expect(isActive(DASHBOARD_ROUTES.ortaklikEslesmeleri)).toBe(true);
    expect(isActive(DASHBOARD_ROUTES.eslesmeler)).toBe(false);
    expect(isActive(DASHBOARD_ROUTES.kariyerProfilim)).toBe(false);
  });

  it('preserves and clears filter query params', () => {
    const next = parsePartnershipMatchFilters({
      uyum: '80',
      lokasyon: 'Ankara',
      tip: 'Teknik Ortak',
      sira: 'newest',
    });
    expect(next).toEqual({
      minScore: '80',
      location: 'Ankara',
      partnershipType: 'Teknik Ortak',
      sort: 'newest',
    });
    expect(partnershipMatchFiltersAreDefault(next)).toBe(false);
    expect(partnershipMatchFiltersToQuery(next)).toBe('uyum=80&lokasyon=Ankara&tip=Teknik+Ortak&sira=newest');
    expect(partnershipMatchFiltersToQuery(DEFAULT_PARTNERSHIP_MATCH_FILTERS)).toBe('');
    expect(parsePartnershipMatchFilters(new URLSearchParams())).toEqual(DEFAULT_PARTNERSHIP_MATCH_FILTERS);
  });

  it('shows only the fields that belong to the viewer direction', () => {
    const joiningCard = card();
    const seekingCard = card({
      intent: 'seeking',
      title: 'Fintech girişimi',
      stage: 'MVP aşaması',
      preferredVentureType: null,
    });
    const partnerRows = partnershipCardMetaRows(joiningCard, 'partners').join(' | ');
    const ventureRows = partnershipCardMetaRows(seekingCard, 'ventures').join(' | ');
    expect(partnerRows).toContain('Uzmanlık:');
    expect(partnerRows).toContain('Deneyim:');
    expect(partnerRows).toContain('Tercih edilen girişim tipi:');
    expect(partnerRows).not.toContain('Aşama:');
    expect(partnerRows).not.toContain('Aranan ortak tipi:');
    expect(ventureRows).toContain('Aşama:');
    expect(ventureRows).toContain('Aranan ortak tipi:');
    expect(ventureRows).toContain('Aranan uzmanlık:');
    expect(ventureRows).not.toContain('Deneyim:');
    expect(ventureRows).not.toContain('Tercih edilen girişim tipi:');
  });

  it('dedupes match reasons and uses user-facing skill gap copy', () => {
    const reasons = selectPartnershipDisplayReasons([
      { kind: 'match', text: 'Uzmanlık ihtiyacı karşılanıyor' },
      { kind: 'match', text: 'Uzmanlık ihtiyacı karşılanıyor' },
      { kind: 'match', text: 'Sektör tercihi uyumlu' },
      { kind: 'gap', text: 'Bazı yetkinlikler eksik' },
      { kind: 'gap', text: 'Lokasyon tercihi kısmen uyumlu' },
    ]);
    expect(reasons.filter((reason) => reason.text === 'Uzmanlık ihtiyacı karşılanıyor')).toHaveLength(1);
    expect(reasons.some((reason) => reason.text === 'Bazı yetkinlikler eksik')).toBe(true);
    expect(reasons.map((reason) => reason.text).join(' ')).not.toMatch(/canonical|weight|matching score/i);
  });

  it('keeps the hub → browse → detail copy on the partnership path', () => {
    expect(VENTURE_PARTNERSHIP_HUB.href).toBe('/girisim-ortaklik');
    expect(VENTURE_PARTNERSHIP_OPTIONS[0]?.href).toBe('/partners?intent=seeking');
    expect(VENTURE_PARTNERSHIP_OPTIONS[1]?.href).toBe('/partners?intent=joining');
    expect(partnershipDetailHeadline('seeking')).toBe('Bu girişim bir ortak arıyor.');
    expect(partnershipDetailHeadline('joining')).toBe('Bu kullanıcı bir girişime ortak olmak istiyor.');
  });
});
