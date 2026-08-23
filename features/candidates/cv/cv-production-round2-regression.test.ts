import { describe, expect, it } from 'vitest';
import { isForbiddenNameCandidate, extractCandidateName } from '@/features/candidates/cv/cv-name-extractor';
import { scoreCandidateName } from '@/features/candidates/cv/cv-candidate-scorer';
import { matchCanonicalPosition, mapCvToCanonicalTaxonomy } from '@/features/candidates/cv/cv-taxonomy-mapper';
import { buildHydratedCustomFieldsFromCvDraft } from '@/features/candidates/cv/cv-form-hydrator';
import { buildProfileDraftFromCanonicalResult } from '@/features/candidates/cv/cv-profile-builder';
import { getAllTaxonomyPositions, getPositionsForSector } from '@/features/candidates/taxonomy/career-taxonomy';

describe('CV Extraction Engine 13.0 — Production Round 2 & 3 Forensic Regression Suite', () => {
  it('A) Name Regression: Blocks non-person noise/team/metric phrases from being chosen as names', () => {
    const invalidNames = [
      'Satı Ekibiveperformans',
      'Satış Ekibi',
      'Ekip ve Performans',
      'Operasyon ve Ekip',
      'Performans Yönetimi',
      'Satış ve Pazarlama',
      'Müşteri İlişkileri Ekibi',
      'Çağrı Merkezi Operasyon',
      'Portföy Yönetimi',
      'Strateji ve Hedefler',
    ];

    for (const name of invalidNames) {
      expect(isForbiddenNameCandidate(name)).toBe(true);
      const score = scoreCandidateName(name, {
        zone: 'HEADER',
        isTopZone: true,
        lineIndex: 0,
        fullDocText: `${name}\nİstanbul / Maltepe\ninfo@example.com`,
      });
      expect(score.isAccepted).toBe(false);
    }
  });

  it('A.2) Extracts real candidate name when noisy section/team text is near top of document', () => {
    const cvText = `
Satı Ekibiveperformans
Çağrı Merkezi Operasyonları Müdürü
İstanbul / Maltepe
ugur.zaman@example.com | 0532 111 22 33

ÖZGEÇMİŞ
Uğur Zaman
10+ yıl çağrı merkezi operasyon yönetimi deneyimi.

DENEYİM
Tempo Çağrı Merkezi - Çağrı Merkezi Operasyonları Müdürü
2019 - 2024
`;

    const extracted = extractCandidateName(cvText);
    expect(extracted).toBe('Uğur Zaman');
    expect(extracted).not.toBe('Satı Ekibiveperformans');
  });

  it('B) Position Regression: Maps operational management variations to canonical taxonomy position', () => {
    const roleVariations = [
      { raw: 'Çağrı Merkezi Operasyon Müdürü', expected: 'Çağrı Merkezi Operasyon Müdürü' },
      { raw: 'Çağrı Merkezi Operasyonları Müdürü', expected: 'Çağrı Merkezi Operasyon Müdürü' },
      { raw: 'Çağrı Merkezi Operasyon Yöneticisi', expected: 'Çağrı Merkezi Operasyon Müdürü' },
      { raw: 'çağrı merkezi operasyon muduru', expected: 'Çağrı Merkezi Operasyon Müdürü' },
      { raw: 'Call Center Operation Manager', expected: 'Çağrı Merkezi Operasyon Müdürü' },
      { raw: 'Call Center Operations Manager', expected: 'Çağrı Merkezi Operasyon Müdürü' },
      { raw: 'Müşteri Hizmetleri ve Çağrı Merkezi Müdürü', expected: 'Çağrı Merkezi Operasyon Müdürü' },
      { raw: 'Çağrı Merkezi Takım Lideri', expected: 'Çağrı Merkezi Takım Lideri' },
      { raw: 'Çağrı Merkezi Süpervizörü', expected: 'Çağrı Merkezi Süpervizörü' },
    ];

    for (const item of roleVariations) {
      const match = matchCanonicalPosition(item.raw);
      expect(match.canonical).toBe(item.expected);
    }
  });

  it('C) Listing Hydration Regression: Resolves canonical position and never drops to "Diğer" when valid role exists', () => {
    const allTaxonomyPositions = getAllTaxonomyPositions();

    const extraction = {
      fullName: 'Uğur Zaman',
      roles: ['Çağrı Merkezi Operasyonları Müdürü'],
      sectors: ['Çağrı merkezi'],
      experiences: [
        {
          company: 'Tempo Çağrı Merkezi',
          role: 'Çağrı Merkezi Operasyonları Müdürü',
          sector: 'Çağrı merkezi',
          startYear: '2019',
          endYear: '2024',
          isCurrent: true,
          responsibilities: 'Operasyon ve ekip yönetimi.',
          achievements: 'KPI artışı.',
        },
      ],
      education: [
        {
          school: 'Anadolu Üniversitesi',
          field: 'Kamu Yönetimi',
          level: 'Lisans',
        },
      ],
      skills: ['KPI Yönetimi', 'Ekip Liderliği'],
      tools: ['CRM', 'Excel'],
      locations: ['İstanbul', 'Maltepe'],
    };

    const canonical = mapCvToCanonicalTaxonomy(extraction as any);
    expect(canonical.primaryRole).toBe('Çağrı Merkezi Operasyon Müdürü');
    expect(canonical.primarySector).toBe('Çağrı merkezi');

    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv.pdf');
    const hydrated = buildHydratedCustomFieldsFromCvDraft(draft);

    expect(hydrated.nextCustomFields.desiredRole).toBe('Çağrı Merkezi Operasyon Müdürü');
    expect(hydrated.nextCustomFields.desiredRole).not.toBe('Diğer');
    expect(hydrated.nextCustomFields.desiredRole).not.toBe('Diğer / Kendim gireceğim');
    expect(allTaxonomyPositions.includes(hydrated.nextCustomFields.desiredRole as string)).toBe(true);
  });

  it('E) Round 3: Fractured section header "Kış İselbilgiler" is blocked and real name is extracted', () => {
    expect(isForbiddenNameCandidate('Kış İselbilgiler')).toBe(true);
    expect(isForbiddenNameCandidate('Kişisel Bilgiler')).toBe(true);
    expect(isForbiddenNameCandidate('Kişi Sel Bilgiler')).toBe(true);

    const cvText = `
Kış İselbilgiler
5309367745
zamanugurz@gmail.com
Maltepe, İSTANBUL, Türkiye

UĞUR ZAMAN
Telemarketing ve Çağrı Merkezi Operasyonları Direktörü
`;

    const name = extractCandidateName(cvText);
    expect(name).toBe('Uğur Zaman');
    expect(name).not.toBe('Kış İselbilgiler');
  });

  it('F) Round 3: getPositionsForSector works with normalized/ASCII sector keys without dropping to Diğer', () => {
    const cagriPositions = getPositionsForSector('cagri merkezi');
    expect(cagriPositions.length).toBeGreaterThan(5);
    expect(cagriPositions).toContain('Çağrı Merkezi Operasyon Müdürü');

    const bilisimPositions = getPositionsForSector('bilisim');
    expect(bilisimPositions.length).toBeGreaterThan(5);
    expect(bilisimPositions).toContain('Yazılım Geliştirici');
  });

  it('G) Round 4: Business metric "Yenimü Terikazanımı" / "Yeni Müşteri Kazanımı" is blocked and real name is preserved', () => {
    expect(isForbiddenNameCandidate('Yenimü Terikazanımı')).toBe(true);
    expect(isForbiddenNameCandidate('Yeni Müşteri Kazanımı')).toBe(true);
    expect(isForbiddenNameCandidate('Müşteri Kazanımı')).toBe(true);
    expect(isForbiddenNameCandidate('Kurumsal Müşteri Yönetimi')).toBe(true);
    expect(isForbiddenNameCandidate('Inbound Operasyon Yönetimi')).toBe(true);
    expect(isForbiddenNameCandidate('Lead Generation')).toBe(true);

    const cvText = `
Yenimü Terikazanımı
Çağrı Merkezi Satış Yönetimi | Yeni Müşteri Kazanımı ve Satış Geliştirme

Kişisel Bilgiler
zamanugurz@gmail.com
5309367745
Maltepe, İSTANBUL, Türkiye

UĞUR ZAMAN
Telemarketing ve Çağrı Merkezi Operasyonları Direktörü
`;

    const name = extractCandidateName(cvText);
    expect(name).toBe('Uğur Zaman');
    expect(name).not.toBe('Yenimü Terikazanımı');
  });
});
