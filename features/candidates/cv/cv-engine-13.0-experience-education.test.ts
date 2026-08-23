import { describe, expect, it } from 'vitest';
import { extractDeterministicCv } from './cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from './cv-taxonomy-mapper';

describe('CV Extraction Engine 13.0 — Experience, Education & Location Isolation Suite', () => {
  // 1. Experience 3-Point Anchoring & Responsibility Bullet Firewall (Phase 6)
  describe('Phase 6: Experience Resolver Anchoring & Responsibility Isolation', () => {
    it('verifies responsibility bullets (- • | ;) do NOT create duplicate experiences', () => {
      const cvText = `Ali Vural\nali@example.com | 0532 999 11 22\nİstanbul / Kadıköy\nFrontend Geliştirici\n\nDENEYİM\nTech Global A.Ş. - Frontend Geliştirici (2019 - 2024)\n• React ve TypeScript ile mikro ön yüz mimarisi geliştirilmesi\n- REST ve GraphQL API entegrasyonlarının yapılması\n| CI/CD süreçlerinin yönetimi ve test otomasyonu\n; Performans optimizasyonu ve kod incelemeleri\n\nEĞİTİM\nİTÜ - Bilgisayar Mühendisliği (2019)`;

      const det = extractDeterministicCv(cvText);
      const canonical = mapCvToCanonicalTaxonomy(det);

      expect(canonical.experiences).toHaveLength(1);
      expect(canonical.experiences[0].company).toMatch(/Tech Global A\.[sş]/i);
      expect(canonical.experiences[0].role).toBe('Frontend Geliştirici');
      expect(canonical.experiences[0].responsibilities || canonical.experiences[0].role).toMatch(/React|Frontend/i);
    });

    it('parses multi-line experience block with date and role on distinct lines', () => {
      const cvText = `Selin Demir\nselin@example.com | 0533 111 22 33\nAnkara / Çankaya\nİnsan Kaynakları Müdürü\n\nİŞ DENEYİMİ\nKurumsal Holding\nİnsan Kaynakları Müdürü\n2018 - 2024\n- İşe alım ve performans yönetimi süreçleri`;

      const det = extractDeterministicCv(cvText);
      const canonical = mapCvToCanonicalTaxonomy(det);

      expect(canonical.experiences).toHaveLength(1);
      expect(canonical.experiences[0].company).toBe('Kurumsal Holding');
      expect(canonical.experiences[0].role).toBe('İnsan Kaynakları Müdürü');
    });
  });

  // 2. Education Isolation (Phase 7)
  describe('Phase 7: Education Isolation Firewall', () => {
    it('extracts university, degree, department, date without corrupting role/sector', () => {
      const cvText = `Kemal Arslan\nkemal@example.com | 0532 444 55 66\nİzmir / Konak\nDijital Pazarlama Uzmanı\n\nDENEYİM\nE-Ticaret A.Ş. - Dijital Pazarlama Uzmanı (2020 - 2024)\n\nEĞİTİM\nBoğaziçi Üniversitesi - İktisadi ve İdari Bilimler Fakültesi - İşletme (Lisans) - 2019`;

      const det = extractDeterministicCv(cvText);
      const canonical = mapCvToCanonicalTaxonomy(det);

      expect(canonical.educationList.length).toBeGreaterThanOrEqual(1);
      expect(canonical.educationList[0].school).toContain('Boğaziçi');
      expect(canonical.educationList[0].field || canonical.educationList[0].level).toMatch(/İşletme|Lisans/i);
      expect(canonical.primarySector).toBe('Pazarlama / Reklam');
      expect(canonical.primaryRole).toBe('Dijital Pazarlama Uzmanı');
    });
  });

  // 3. Location Purity & Zero Defaulting (Phase 8)
  describe('Phase 8: Location Purity & Zero Defaulting', () => {
    it('returns empty string for missing location without defaulting to Istanbul/Maltepe', () => {
      const cvText = `Derya Şen\nderya@example.com | 0532 777 88 99\n\nDENEYİM\nUzaktan Çalışma A.Ş. - Yazılım Mühendisi (2020 - 2024)`;

      const det = extractDeterministicCv(cvText);
      const canonical = mapCvToCanonicalTaxonomy(det);

      expect(canonical.residenceCity || '').toBe('');
      expect(canonical.residenceDistrict || '').toBe('');
      expect(canonical.residenceCity).not.toBe('İstanbul');
      expect(canonical.residenceCity).not.toBe('Ankara');
    });

    it('extracts accurate residence location from contact line', () => {
      const cvText = `Hakan Yılmaz\nhakan@example.com | 0532 123 45 67\nBursa / Nilüfer\nÜretim Mühendisi\n\nDENEYİM\nOtomotiv A.Ş. - Üretim Mühendisi (2018 - 2024)`;

      const det = extractDeterministicCv(cvText);
      const canonical = mapCvToCanonicalTaxonomy(det);

      expect(canonical.residenceCity).toBe('Bursa');
      expect(canonical.residenceDistrict).toBe('Nilüfer');
    });
  });
});
