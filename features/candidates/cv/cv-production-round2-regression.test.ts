import { describe, expect, it } from 'vitest';
import { isForbiddenNameCandidate, extractCandidateName } from '@/features/candidates/cv/cv-name-extractor';
import { scoreCandidateName } from '@/features/candidates/cv/cv-candidate-scorer';
import { matchCanonicalPosition, mapCvToCanonicalTaxonomy } from '@/features/candidates/cv/cv-taxonomy-mapper';
import { buildHydratedCustomFieldsFromCvDraft } from '@/features/candidates/cv/cv-form-hydrator';
import { buildProfileDraftFromCanonicalResult } from '@/features/candidates/cv/cv-profile-builder';
import { getAllTaxonomyPositions } from '@/features/candidates/taxonomy/career-taxonomy';

describe('CV Extraction Engine 13.0 — Production Round 2 Forensic Regression Suite', () => {
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

  it('D) Zero Hallucination: Returns clean empty/null when no evidence is present', () => {
    const emptyName = extractCandidateName('Rastgele bir metin\nTelefon yok\nİsim yok');
    expect(emptyName).toBeNull();

    const emptyRoleMatch = matchCanonicalPosition('');
    expect(emptyRoleMatch.canonical).toBe('');
  });
});
