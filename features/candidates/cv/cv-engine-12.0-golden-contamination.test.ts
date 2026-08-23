import { describe, expect, it } from 'vitest';
import { extractDeterministicCv } from './cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from './cv-taxonomy-mapper';

describe('CV Extraction Engine 12.0 — Golden Contamination & Global Reference Isolation', () => {
  // Test distinct non-Uğur candidate profiles across various sectors and locations
  const testCandidates = [
    {
      name: 'Melike Şahin',
      city: 'Ankara',
      dist: 'Çankaya',
      role: 'Klinik Psikolog',
      sector: 'Sağlık',
      text: `Melike Şahin\nmelike@psikoloji.com | 0532 999 11 22\nAnkara / Çankaya\nKlinik Psikolog\n\nDENEYİM\nÖzel Boylam Psikiyatri Hastanesi - Uzman Psikolog (2019 - 2024)\n\nEĞİTİM\nHacettepe Üniversitesi - Psikoloji (Lisans) - 2018`,
    },
    {
      name: 'Okan Kurtuluş',
      city: 'İzmir',
      dist: 'Bornova',
      role: 'Ziraat Mühendisi',
      sector: 'Kimya / Plastik',
      text: `Okan Kurtuluş\nokan@ziraat.com | İzmir / Bornova\nZiraat Mühendisi\n\nDENEYİM\nToros Tarım - Ziraat Mühendisi (2020 - 2024)\n\nEĞİTİM\nEge Üniversitesi - Ziraat Fakültesi - 2019`,
    },
    {
      name: 'Selin Doğan',
      city: 'Antalya',
      dist: 'Muratpaşa',
      role: 'Avukat',
      sector: 'Hukuk',
      text: `Selin Doğan\nselin@hukuk.com | 0544 333 22 11\nAntalya / Muratpaşa\nAvukat\n\nDENEYİM\nDoğan Hukuk Bürosu - Kıdemli Avukat (2018 - 2024)\n\nEĞİTİM\nAkdeniz Üniversitesi - Hukuk Fakültesi - 2017`,
    },
    {
      name: 'Taner Güler',
      city: 'Bursa',
      dist: 'Osmangazi',
      role: 'Makam Şoförü',
      sector: 'Ulaşım / Şoförlük',
      text: `Taner Güler\ntaner@sofor.com | Bursa / Osmangazi\nMakam Şoförü\n\nDENEYİM\nBursa Çimento - Makam Şoförü (2016 - 2024)`,
    },
  ];

  testCandidates.forEach((c) => {
    it(`Golden Contamination Check: ${c.name} does NOT inherit any Golden Uğur Zaman values`, () => {
      const det = extractDeterministicCv(c.text);
      const canonical = mapCvToCanonicalTaxonomy(det);

      // 1. Full name must NOT be Uğur Zaman or contain Zaman
      expect(canonical.fullName).toBe(c.name);
      expect(canonical.fullName).not.toBe('Uğur Zaman');
      expect(canonical.fullName).not.toMatch(/Uğur|Zaman/i);

      // 2. Role must NOT be Çağrı Merkezi Operasyon Müdürü
      expect(canonical.primaryRole).not.toBe('Çağrı Merkezi Operasyon Müdürü');
      expect(canonical.primaryRole).not.toMatch(/Çağrı Merkezi Operasyon/i);

      // 3. Sector must NOT be Çağrı merkezi
      expect(canonical.primarySector).not.toBe('Çağrı merkezi');

      // 4. City and District must match candidate and NEVER default to İstanbul / Maltepe
      expect(canonical.residenceCity).toBe(c.city);
      expect(canonical.residenceCity).not.toBe('İstanbul');
      if (c.dist) {
        expect(canonical.residenceDistrict).toBe(c.dist);
        expect(canonical.residenceDistrict).not.toBe('Maltepe');
      }
    });
  });

  it('Golden Contamination Check: Completely empty or headless CV never leaks golden fields', () => {
    const headless = `EĞİTİM\nAnadolu Üniversitesi - Kamu Yönetimi (2015 - 2019)\n\nDENEYİM\nBelediye - Memur (2020 - 2024)`;
    const det = extractDeterministicCv(headless);
    const canonical = mapCvToCanonicalTaxonomy(det);

    expect(canonical.fullName || '').not.toBe('Uğur Zaman');
    expect(canonical.primaryRole || '').not.toBe('Çağrı Merkezi Operasyon Müdürü');
    expect(canonical.primarySector || '').not.toBe('Çağrı merkezi');
    expect(canonical.residenceCity || '').not.toBe('İstanbul');
    expect(canonical.residenceDistrict || '').not.toBe('Maltepe');
  });
});
