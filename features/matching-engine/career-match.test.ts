import { describe, expect, it } from 'vitest';
import { CATEGORY_IDS, LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';
import { createListing } from '@/features/listings/factories/listing.factory';
import { ids } from '@/lib/domain/ids';
import { extractCareerMatchProfile } from '@/features/matching-engine/adapters/career-fields';
import { toPublicCareerMatchCard } from '@/features/matching-engine/adapters/public-card';
import { calculateCareerMatch } from '@/features/matching-engine/engine';
import { getMatchBand, getMatchReasons, isRecommendableMatch } from '@/features/matching-engine/explain';
import { normalizeMatchScore, locationScore } from '@/features/matching-engine/scoring';
import { scoreNormalizedCareerSources } from '@/features/matching-engine/normalized-match';
import type { CareerMatchProfile } from '@/features/matching-engine/types';

const ALIGNED: CareerMatchProfile = {
  role: 'Yazılım geliştirici',
  roles: ['Yazılım geliştirici'],
  sector: 'Bilişim / Yazılım',
  sectors: ['Bilişim / Yazılım'],
  professionalSkills: ['İletişim', 'Analitik düşünme', 'Problem çözme', 'Takım çalışması'],
  technicalSkills: ['JavaScript', 'TypeScript', 'React', 'SQL'],
  experienceLevel: 'Mid',
  workType: 'Tam zamanlı',
  workplacePreference: 'Hibrit',
  city: 'İstanbul',
  languages: ['İngilizce', 'Türkçe'],
  educationLevel: 'Lisans',
};

function profile(overrides: Partial<CareerMatchProfile> = {}): CareerMatchProfile {
  return { ...ALIGNED, ...overrides };
}

function leakPayload(value: unknown): string {
  return JSON.stringify(value);
}

function expectNoContactLeak(value: unknown) {
  const json = leakPayload(value);
  expect(json).not.toMatch(/contactPhone|contactEmail|contactWhatsapp|contactWebsite/i);
  expect(json).not.toContain('05551234567');
  expect(json).not.toContain('gizli@example.com');
  expect(json).not.toContain('+905551112233');
}

describe('Career Matching Engine V1', () => {
  // Test 1: Aday -> uygun iş ilanı
  it('1. scores a fully aligned pair in the very-strong band', () => {
    const result = calculateCareerMatch(ALIGNED, ALIGNED);
    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.band).toBe('very_strong');
    expect(result.bandLabel).toBe('Çok güçlü eşleşme');
    expect(result.recommendable).toBe(true);
  });

  // Test 2: Aday -> ilgisiz iş ilanı düşük skor
  it('2. produces low score for unrelated pair', () => {
    const mismatched = calculateCareerMatch(
      profile({
        role: 'Aşçı',
        roles: ['Aşçı'],
        sector: 'Restoran / Kafe',
        sectors: ['Restoran / Kafe'],
        professionalSkills: ['Mutfak yönetimi'],
        technicalSkills: ['Izgara'],
      }),
      ALIGNED,
    );
    expect(mismatched.score).toBeLessThan(50);
    expect(mismatched.recommendable).toBe(false);
  });

  // Test 3: Aynı şehir
  it('3. gives top location score (1.0) for same city', () => {
    expect(locationScore('İstanbul', 'İstanbul')).toBe(1.0);
    expect(locationScore('Ankara', 'Ankara')).toBe(1.0);
  });

  // Test 4: İstanbul Anadolu -> İstanbul Avrupa -> SONUÇTAN ELENMEZ
  it('4. calculates 85% location score for Istanbul Anadolu <-> Istanbul Avrupa and is NOT eliminated', () => {
    const loc = locationScore('İstanbul Anadolu', 'İstanbul Avrupa');
    expect(loc).toBe(0.85);

    const seeker = profile({ city: 'İstanbul Anadolu' });
    const hire = profile({ city: 'İstanbul Avrupa' });
    const result = calculateCareerMatch(seeker, hire);
    expect(result.recommendable).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.reasons.some((r) => r.text.includes('İstanbul Anadolu ↔ İstanbul Avrupa'))).toBe(true);
  });

  // Test 5: Farklı şehir -> SONUÇTAN ELENMEZ (50% lokasyon puanı alır)
  it('5. gives 50% location score for different cities and does NOT eliminate from results', () => {
    const loc = locationScore('Ankara', 'İstanbul');
    expect(loc).toBe(0.50);

    const seeker = profile({ city: 'Ankara' });
    const hire = profile({ city: 'İstanbul' });
    const result = calculateCareerMatch(seeker, hire);
    expect(result.recommendable).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(70);
    expect(result.reasons.some((r) => r.text.includes('Farklı şehir'))).toBe(true);
  });

  // Test 6: Remote / uzaktan -> Lokasyon nedeniyle dezavantaj oluşturmaz
  it('6. remote work gives 100% location score regardless of city', () => {
    const loc = locationScore('İzmir', 'İstanbul', 'Uzaktan', 'Hibrit');
    expect(loc).toBe(1.0);
  });

  // Test 7: Eksik lokasyon -> matching devam eder (renormalize edilir)
  it('7. missing location renormalizes smoothly without dropping overall score', () => {
    const withCity = calculateCareerMatch(ALIGNED, ALIGNED);
    const emptyLocation = calculateCareerMatch(
      profile({ city: null }),
      profile({ city: null }),
    );
    expect(emptyLocation.score).toBe(withCity.score);
    expect(emptyLocation.dimensions.find((d) => d.key === 'location')?.comparable).toBe(false);
  });

  // Test 8: Ücret uyuşmazlığı -> skor düşebilir fakat hard filter olmaz
  it('8. salary mismatch is NOT a hard filter', () => {
    const seeker = profile({ salaryMin: 80000, salaryMax: 100000 });
    const hire = profile({ salaryMin: 50000, salaryMax: 60000 });
    const result = calculateCareerMatch(seeker, hire);
    expect(result.recommendable).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(75);
  });

  // Test 9: Pozisyon uyumsuzluğu -> skor ciddi şekilde düşer
  it('9. position mismatch sharply reduces score', () => {
    const aligned = calculateCareerMatch(ALIGNED, ALIGNED);
    const mismatched = calculateCareerMatch(
      profile({ role: 'Satış temsilcisi', roles: ['Satış temsilcisi'] }),
      ALIGNED,
    );
    expect(aligned.score - mismatched.score).toBeGreaterThanOrEqual(15);
  });

  // Test 10, 11, 12, 13, 14: Safety, privacy, threshold, exclusion
  it('10-14. preserves privacy, excludes below threshold and invalid listings', () => {
    const listing = createListing({
      ownerId: ids.user('user-2'),
      categoryId: CATEGORY_IDS.iseAl,
      listingTypeId: LISTING_TYPE_IDS.iseAlDefault,
      title: 'Backend geliştirici',
      shortDescription: 'Yazılım geliştirici arıyoruz, en az yirmi karakter.',
      status: 'published',
      contactPhone: '05551234567',
      contactEmail: 'gizli@example.com',
      contactWhatsapp: '+905551112233',
      customFields: {
        desiredRole: 'Yazılım geliştirici',
        primarySector: 'Bilişim / Yazılım',
        contactPhone: '05551234567',
        contactEmail: 'gizli@example.com',
      },
    });

    const extracted = extractCareerMatchProfile(listing);
    const match = calculateCareerMatch(ALIGNED, extracted);
    const card = toPublicCareerMatchCard(listing, 'hire', match);

    expect(card).not.toBeNull();
    expect(card).not.toHaveProperty('contactPhone');
    expect(card).not.toHaveProperty('contactEmail');
    expect(card).not.toHaveProperty('customFields');
    expectNoContactLeak(extracted);
    expectNoContactLeak(match);
    expectNoContactLeak(card);
  });

  // Test 15: Aynı aday + aynı ilan -> dashboard ve detail aynı skor üretir
  it('15. produces exactly the same score for dashboard and detail via single score engine', () => {
    const seekerListing = createListing({
      ownerId: ids.user('seeker-1'),
      categoryId: CATEGORY_IDS.isBul,
      listingTypeId: LISTING_TYPE_IDS.isBulDefault,
      title: 'Frontend Geliştirici',
      shortDescription: 'React ve Next.js geliştirici adayı, yirmi karakter açıklama.',
      status: 'published',
      customFields: {
        desiredRole: 'Yazılım geliştirici',
        primarySector: 'Bilişim / Yazılım',
        professionalSkills: ['İletişim', 'Problem çözme'],
        technicalSkills: ['JavaScript', 'TypeScript', 'React'],
        preferredCity: 'İstanbul',
      },
    });

    const hireListing = createListing({
      ownerId: ids.user('hire-1'),
      categoryId: CATEGORY_IDS.iseAl,
      listingTypeId: LISTING_TYPE_IDS.iseAlDefault,
      title: 'Kıdemli Frontend Geliştirici',
      shortDescription: 'Frontend geliştirici arıyoruz, en az yirmi karakter.',
      status: 'published',
      customFields: {
        positionTitle: 'Yazılım geliştirici',
        primarySector: 'Bilişim / Yazılım',
        professionalSkills: ['İletişim', 'Problem çözme'],
        technicalSkills: ['JavaScript', 'TypeScript', 'React'],
        city: 'İstanbul',
      },
    });

    const matchForDashboard = scoreNormalizedCareerSources(seekerListing, hireListing);
    const matchForDetail = scoreNormalizedCareerSources(seekerListing, hireListing);

    expect(matchForDashboard.score).toBe(matchForDetail.score);
    expect(matchForDashboard.band).toBe(matchForDetail.band);
    expect(matchForDashboard.recommendable).toBe(matchForDetail.recommendable);
  });

  // Test 16: Reason duplicate olmayacak
  it('16. deduplicates matching reasons', () => {
    const result = calculateCareerMatch(ALIGNED, ALIGNED);
    const reasons = getMatchReasons(result.dimensions);
    const texts = reasons.map((r) => r.text);
    const unique = new Set(texts);
    expect(texts.length).toBe(unique.size);
  });

  // Test 17: Threshold altı gösterilmeyecek
  it('17. excludes scores of 49 and below from public cards', () => {
    const lowMatch = calculateCareerMatch(
      profile({
        role: 'Mimar',
        roles: ['Mimar'],
        sector: 'Mimarlık',
        sectors: ['Mimarlık'],
        technicalSkills: ['AutoCAD'],
        professionalSkills: ['Çizim'],
      }),
      ALIGNED,
    );
    expect(lowMatch.score).toBeLessThan(50);
    expect(lowMatch.recommendable).toBe(false);
    expect(isRecommendableMatch(lowMatch.score)).toBe(false);

    const listing = createListing({
      ownerId: ids.user('user-3'),
      categoryId: CATEGORY_IDS.iseAl,
      listingTypeId: LISTING_TYPE_IDS.iseAlDefault,
      title: 'İlgisiz ilan',
      shortDescription: 'Yazılım geliştirici arıyoruz, en az yirmi karakter.',
      status: 'published',
    });
    expect(toPublicCareerMatchCard(listing, 'hire', lowMatch)).toBeNull();
  });
});
