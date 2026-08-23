import { describe, expect, it } from 'vitest';
import { extractDeterministicCv } from './cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from './cv-taxonomy-mapper';

describe('CV Extraction Engine 13.0 — Golden Fixture Complete Isolation Suite (100 Scenarios)', () => {
  const FORBIDDEN_GOLDEN_ENTITIES = [
    'Uğur Zaman',
    'Çağrı Merkezi Operasyon Müdürü',
    'IGS Türkiye',
    'Gedik Yatırım',
    'Mehrwerk',
    'Viennalife',
    'Fibabanka',
    'Mplus Group',
  ];

  const FIRST_NAMES = [
    'Hande', 'Barış', 'Hazal', 'Kerem', 'Demet', 'Can', 'Neslihan', 'Kadir', 'Serenay', 'Kıvanç',
  ];

  const LAST_NAMES = [
    'Erçel', 'Arduç', 'Kaya', 'Bürsin', 'Özdemir', 'Yaman', 'Atagül', 'Doğulu', 'Sarıkaya', 'Tatlıtuğ',
  ];

  const NON_GOLDEN_SECTORS = [
    { role: 'İnşaat Mühendisi', sector: 'İnşaat / Gayrimenkul', city: 'Ankara', dist: 'Çankaya' },
    { role: 'Gemi Kaptanı', sector: 'Denizcilik / Liman', city: 'İzmir', dist: 'Konak' },
    { role: 'Uçak Bakım Teknisyeni', sector: 'Havacılık', city: 'Eskişehir', dist: 'Tepebaşı' },
    { role: 'Ziraat Mühendisi', sector: 'Kimya / Plastik', city: 'Antalya', dist: 'Muratpaşa' },
    { role: 'Çocuk Gelişimi Öğretmeni', sector: 'Eğitim', city: 'Bursa', dist: 'Nilüfer' },
    { role: 'Avukat', sector: 'Hukuk', city: 'Adana', dist: 'Seyhan' },
    { role: 'Klinik Psikolog', sector: 'Sağlık', city: 'Trabzon', dist: 'Ortahisar' },
    { role: 'Restoran Şefi', sector: 'Gıda / Restoran', city: 'Muğla', dist: 'Bodrum' },
    { role: 'Maden Jeolojisi Uzmanı', sector: 'Madencilik', city: 'Zonguldak', dist: 'Merkez' },
    { role: 'Görsel Düzenleme Müdürü', sector: 'Perakende / Mağaza', city: 'Kocaeli', dist: 'İzmit' },
  ];

  for (let i = 0; i < 100; i++) {
    const name = `${FIRST_NAMES[i % 10]} ${LAST_NAMES[Math.floor(i / 10)]}`;
    const prof = NON_GOLDEN_SECTORS[i % NON_GOLDEN_SECTORS.length];
    const rawCv = `${name}\n${FIRST_NAMES[i % 10].toLowerCase()}.${LAST_NAMES[Math.floor(i / 10)].toLowerCase()}@example.com | 0532 ${100 + i} 00 11\n${prof.city} / ${prof.dist}\n${prof.role}\n\nDENEYİM\nSektör Lideri A.Ş. - ${prof.role} (2018 - 2024)\n\nEĞİTİM\nBölge Üniversitesi - ${prof.role} (Lisans) - 2017`;

    it(`[GOLDEN_ISOLATION_${i + 1}/100] Candidate "${name}" (${prof.role}) has ZERO golden value leakage`, () => {
      const det = extractDeterministicCv(rawCv);
      const canonical = mapCvToCanonicalTaxonomy(det);

      // 1. Candidate Full Name purity
      expect(canonical.fullName).toBe(name);
      expect(canonical.fullName).not.toBe('Uğur Zaman');
      expect(canonical.fullName).not.toMatch(/Uğur|Zaman/i);

      // 2. Role purity
      expect(canonical.primaryRole).not.toBe('Çağrı Merkezi Operasyon Müdürü');

      // 3. Sector purity
      expect(canonical.primarySector).toBe(prof.sector);
      expect(canonical.primarySector).not.toBe('Çağrı merkezi');

      // 4. Location purity
      expect(canonical.residenceCity).toBe(prof.city);
      expect(canonical.residenceCity).not.toBe('İstanbul');
      expect(canonical.residenceDistrict).toBe(prof.dist);
      expect(canonical.residenceDistrict).not.toBe('Maltepe');

      // 5. Check no golden companies
      const expCompanies = canonical.experiences.map((e) => e.company);
      for (const goldenComp of FORBIDDEN_GOLDEN_ENTITIES) {
        expect(expCompanies).not.toContain(goldenComp);
      }
    });
  }
});
