import { describe, expect, it } from 'vitest';
import { CONTACT_CTA_DEFAULT_LABEL, CONTACT_CTA_PRIVACY_SHORT } from '@/features/contact-requests/config/contact-cta-copy';
import {
  MATCH_CARD_LAYOUT_CLASS,
  MATCH_GRID_CLASS,
} from '@/features/matching-engine/presentation/career-match-layout';
import {
  MATCH_CONTACT_CTA_LABEL,
  MATCH_EMPTY_NO_LISTING,
  MATCH_EMPTY_NO_RESULTS,
  MATCH_PRIVACY_NOTE,
  emptyMatchResultsCopy,
  MATCH_SECTION_COPY,
  formatMatchScore,
  presentMatchReasons,
  sourceListingEditHref,
} from '@/features/matching-engine/presentation/career-match-copy';
import {
  DEFAULT_MATCH_FILTERS,
  filterAndSortMatchCards,
} from '@/features/matching-engine/presentation/career-match-filters';
import { resolveMatchPartyLabel } from '@/features/matching-engine/presentation/career-match-party';
import type { CareerMatchCard, MatchExplanation } from '@/features/matching-engine/types';

function card(overrides: Partial<CareerMatchCard> = {}): CareerMatchCard {
  return {
    listingId: 'listing-1',
    slug: 'ilan',
    href: '/ilan/ilan',
    title: 'Yazılım geliştirici',
    listingKind: 'hire',
    listingTypeLabel: 'İşe Alıyorum',
    partyLabel: 'Açık Yazılım A.Ş.',
    experienceLabel: 'Orta Seviye',
    highlightSkills: ['React', 'TypeScript'],
    location: 'İstanbul',
    workModel: 'Hibrit',
    publishedAt: '2026-08-01T00:00:00.000Z',
    score: 87,
    band: 'very_strong',
    bandLabel: 'Çok güçlü eşleşme',
    reasons: [
      { kind: 'match', text: 'Pozisyonunuzla güçlü uyum' },
      { kind: 'match', text: 'Sektör deneyiminiz uyumlu' },
      { kind: 'match', text: 'Yetkinlikleriniz ilanla örtüşüyor' },
    ],
    ...overrides,
  };
}

describe('career match presentation', () => {
  it('uses the seeker section title and description', () => {
    expect(MATCH_SECTION_COPY.opportunities.title).toBe('Size Uygun İş İlanları');
    expect(MATCH_SECTION_COPY.opportunities.description).toBe(
      'Profilinize ve tercihlerinize göre sizin için öne çıkan fırsatları keşfedin.',
    );
    expect(MATCH_SECTION_COPY.opportunities.reviewCta).toBe('İlanı İncele');
    expect(MATCH_SECTION_COPY.opportunities.whyTitle).toBe('Neden bu eşleşme?');
  });

  it('uses the employer section title and description', () => {
    expect(MATCH_SECTION_COPY.candidates.title).toBe('Size Uygun Adaylar');
    expect(MATCH_SECTION_COPY.candidates.description).toBe(
      'Açık pozisyonunuzun gereksinimlerine uygun aday profillerini keşfedin.',
    );
    expect(MATCH_SECTION_COPY.candidates.reviewCta).toBe('Adayı İncele');
    expect(MATCH_SECTION_COPY.candidates.whyTitle).toBe('Neden bu eşleşme?');
  });

  it('formats the match score for the card', () => {
    expect(formatMatchScore(87)).toBe('%87 Uyum');
    expect(formatMatchScore(74)).toBe('%74 Uyum');
  });

  it('keeps seeker reasons and aliases employer reasons', () => {
    const reasons: MatchExplanation[] = [
      { kind: 'match', text: 'Pozisyonunuzla güçlü uyum' },
      { kind: 'match', text: 'Sektör deneyiminiz uyumlu' },
      { kind: 'gap', text: '1 teknik yetkinlik eksik' },
    ];
    expect(presentMatchReasons(reasons, 'opportunities')[0]?.text).toBe('Pozisyonunuzla güçlü uyum');
    expect(presentMatchReasons(reasons, 'candidates').map((reason) => reason.text)).toEqual([
      'Pozisyon beklentinizle güçlü uyum',
      'Sektör deneyimi aranan kriterlere uygun',
      '1 teknik yetkinlik eksik',
    ]);
  });

  it('drops scores below 50 from the visible list', () => {
    const visible = filterAndSortMatchCards(
      [card({ listingId: 'low', score: 49, band: 'suitable' }), card({ listingId: 'ok', score: 64 })],
      DEFAULT_MATCH_FILTERS,
    );
    expect(visible.map((item) => item.listingId)).toEqual(['ok']);
  });

  it('reuses the existing contact-request CTA and privacy copy', () => {
    expect(MATCH_CONTACT_CTA_LABEL).toBe(CONTACT_CTA_DEFAULT_LABEL);
    expect(MATCH_CONTACT_CTA_LABEL).toBe('İletişim Talebi Gönder');
    expect(MATCH_PRIVACY_NOTE).toBe(CONTACT_CTA_PRIVACY_SHORT);
    expect(MATCH_PRIVACY_NOTE).toBe('İletişim bilgileriniz gizli kalır.');
  });

  it('never puts phone or email on the presented party label', () => {
    expect(
      resolveMatchPartyLabel({
        kind: 'hire',
        companyName: 'Açık Yazılım A.Ş.',
        ownerDisplayName: 'gizli@example.com',
      }),
    ).toBe('Açık Yazılım A.Ş.');
    expect(
      resolveMatchPartyLabel({
        kind: 'seek',
        ownerDisplayName: 'Ayşe Yılmaz',
      }),
    ).toBe('Ayşe ******');
    expect(
      JSON.stringify(
        card({
          partyLabel: resolveMatchPartyLabel({ kind: 'seek', ownerDisplayName: 'Ayşe Yılmaz' }),
        }),
      ),
    ).not.toMatch(/0555|@example\.com|contactPhone|contactEmail/);
  });

  it('uses the empty-state copy and existing create/edit routes', () => {
    expect(MATCH_EMPTY_NO_RESULTS.title).toBe('Henüz size uygun bir eşleşme bulamadık.');
    expect(MATCH_EMPTY_NO_RESULTS.ctaLabel).toBe('Profilimi Güncelle');
    expect(MATCH_EMPTY_NO_RESULTS.ctaHref).toBe('/dashboard/kariyer-profilim');
    expect(emptyMatchResultsCopy('opportunities').description).toContain('yeni fırsatları');
    expect(emptyMatchResultsCopy('candidates').description).toContain('yeni adayları');
    expect(sourceListingEditHref('abc')).toBe('/ilanlarim/abc/duzenle');
    expect(MATCH_EMPTY_NO_LISTING.ctaHref).toBe('/ilan/olustur');
    expect(MATCH_EMPTY_NO_LISTING.ctaLabel).toBe('Profil Oluştur');
    expect(MATCH_EMPTY_NO_LISTING.title).toBe('Kariyer profilinizi oluşturun.');
  });

  it('avoids fixed pixel widths that break the mobile layout', () => {
    expect(MATCH_CARD_LAYOUT_CLASS).toMatch(/min-w-0/);
    expect(MATCH_CARD_LAYOUT_CLASS).toMatch(/w-full/);
    expect(MATCH_CARD_LAYOUT_CLASS).toMatch(/overflow-hidden/);
    expect(MATCH_GRID_CLASS).toMatch(/grid-cols-1/);
    expect(MATCH_GRID_CLASS).toMatch(/lg:grid-cols-3/);
    expect(`${MATCH_CARD_LAYOUT_CLASS} ${MATCH_GRID_CLASS}`).not.toMatch(/w-\[\d+px\]|min-w-\[\d+px\]/);
  });

  it('filters by minimum score, location, and work model', () => {
    const visible = filterAndSortMatchCards(
      [
        card({ listingId: 'a', score: 90, location: 'İstanbul', workModel: 'Hibrit' }),
        card({ listingId: 'b', score: 70, location: 'Ankara', workModel: 'Uzaktan' }),
      ],
      { minScore: '80', location: 'İstanbul', workModel: 'Hibrit', sort: 'score' },
    );
    expect(visible.map((item) => item.listingId)).toEqual(['a']);
  });

  it('sorts by newest when requested', () => {
    const visible = filterAndSortMatchCards(
      [
        card({ listingId: 'old', score: 90, publishedAt: '2026-01-01T00:00:00.000Z' }),
        card({ listingId: 'new', score: 70, publishedAt: '2026-08-01T00:00:00.000Z' }),
      ],
      { ...DEFAULT_MATCH_FILTERS, sort: 'newest' },
    );
    expect(visible.map((item) => item.listingId)).toEqual(['new', 'old']);
  });
});
