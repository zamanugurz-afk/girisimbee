import { describe, expect, it } from 'vitest';
import { extractDeterministicCv } from './cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from './cv-taxonomy-mapper';

describe('CV Extraction Engine 13.0 — Deep Metamorphic & Mutation Invariance Suite', () => {
  const BASE_CV = `Murat Korkmaz\nmurat.korkmaz@example.com | 0532 999 88 77\nİzmir / Bornova\nKıdemli Backend Geliştirici\n\nÖZET\nYüksek ölçekli dağıtık sistemler üzerinde 6+ yıl tecrübeli yazılım mühendisi.\n\nDENEYİM\nBulut Bilişim A.Ş. - Kıdemli Backend Geliştirici (2018 - 2024)\n• Node.js, Go ve PostgreSQL ile mikroservis geliştirilmesi\n• Docker ve Kubernetes orkestrasyonu\n\nEĞİTİM\nEge Üniversitesi - Bilgisayar Mühendisliği (Lisans) - 2017\n\nBECERİLER\nGo, Node.js, PostgreSQL, Docker, Kubernetes, Redis, Git`;

  it('Invariance 1: UPPERCASE Mutation', () => {
    const mutated = BASE_CV.toUpperCase();
    const det = extractDeterministicCv(mutated);
    const canonical = mapCvToCanonicalTaxonomy(det);

    expect(canonical.fullName).toBe('Murat Korkmaz');
    expect(canonical.primaryRole).toMatch(/Backend|Yazılım|Geliştirici/i);
    expect(canonical.residenceCity).toBe('İzmir');
    expect(canonical.residenceDistrict).toBe('Bornova');
  });

  it('Invariance 2: Bullet Marker Mutations (*, -, •, >, ❖)', () => {
    const mutated = BASE_CV.replace(/•/g, '❖');
    const det = extractDeterministicCv(mutated);
    const canonical = mapCvToCanonicalTaxonomy(det);

    expect(canonical.fullName).toBe('Murat Korkmaz');
    expect(canonical.experiences).toHaveLength(1);
  });

  it('Invariance 3: Section Header Order Permutation (Education first)', () => {
    const mutated = `Murat Korkmaz\nmurat.korkmaz@example.com | 0532 999 88 77\nİzmir / Bornova\nKıdemli Backend Geliştirici\n\nEĞİTİM\nEge Üniversitesi - Bilgisayar Mühendisliği (Lisans) - 2017\n\nDENEYİM\nBulut Bilişim A.Ş. - Kıdemli Backend Geliştirici (2018 - 2024)\n\nBECERİLER\nGo, Node.js, PostgreSQL`;

    const det = extractDeterministicCv(mutated);
    const canonical = mapCvToCanonicalTaxonomy(det);

    expect(canonical.fullName).toBe('Murat Korkmaz');
    expect(canonical.primaryRole).toMatch(/Backend|Yazılım|Geliştirici/i);
    expect(canonical.primarySector).toBe('Bilişim / Yazılım');
    expect(canonical.residenceCity).toBe('İzmir');
  });

  it('Invariance 4: Whitespace and Empty Line Noise', () => {
    const mutated = BASE_CV.replace(/\n/g, '\n\n   \n');
    const det = extractDeterministicCv(mutated);
    const canonical = mapCvToCanonicalTaxonomy(det);

    expect(canonical.fullName).toBe('Murat Korkmaz');
    expect(canonical.primaryRole).toMatch(/Backend|Yazılım|Geliştirici/i);
    expect(canonical.residenceCity).toBe('İzmir');
  });

  it('Invariance 5: Dash & En-Dash / Em-Dash Variation (–, —, -)', () => {
    const mutated = BASE_CV.replace(/-/g, '—');
    const det = extractDeterministicCv(mutated);
    const canonical = mapCvToCanonicalTaxonomy(det);

    expect(canonical.fullName).toBe('Murat Korkmaz');
    expect(canonical.experiences).toHaveLength(1);
  });
});
