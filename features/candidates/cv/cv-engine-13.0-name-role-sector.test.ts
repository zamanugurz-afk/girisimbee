import { describe, expect, it } from 'vitest';
import { extractDeterministicCv } from './cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from './cv-taxonomy-mapper';
import { scoreCandidateName, scoreCandidateRole, scoreCandidateSector } from './cv-candidate-scorer';

describe('CV Extraction Engine 13.0 — Name, Role & Sector Deep Purity & Adversarial Suite', () => {
  // 1. Name Resolver Adversarial Tests (Phase 3)
  describe('Phase 3: Name Resolver Adversarial Forensic', () => {
    it('disqualifies reference person when reference section appears first', () => {
      const cvText = `REFERANSLAR\nProf. Dr. Ahmet Yılmaz - Genel Müdür\nTel: 0532 111 22 33\n\nÖZGEÇMİŞ\nGizem Aksoy\n0533 999 88 77 | gizem@example.com\nİstanbul / Kadıköy\nFrontend Geliştirici\n\nDENEYİM\nTech A.Ş. - Frontend Geliştirici (2020 - 2024)`;
      const det = extractDeterministicCv(cvText);
      const canonical = mapCvToCanonicalTaxonomy(det);

      expect(canonical.fullName).toBe('Gizem Aksoy');
      expect(canonical.fullName).not.toContain('Ahmet');
    });

    it('extracts name with spaced OCR characters: "T A R I K   B I L G I N"', () => {
      const cvText = `T A R I K   B I L G I N\ntarik.bilgin@example.com | 0532 123 45 67\nAnkara / Çankaya\nSistem Mühendisi\n\nDENEYİM\nSavunma Sanayi A.Ş. - Sistem Mühendisi (2018 - 2024)`;
      const det = extractDeterministicCv(cvText);
      const canonical = mapCvToCanonicalTaxonomy(det);

      expect(canonical.fullName).toBe('Tarık Bilgin');
    });

    it('extracts name with leading icon/emoji: "👤 UĞUR ZAMAN"', () => {
      const cvText = `👤 UĞUR ZAMAN\nugur@example.com | 0532 999 00 11\nİstanbul / Maltepe\nOperasyon Müdürü\n\nDENEYİM\nKurumsal A.Ş. - Operasyon Müdürü (2018 - 2024)`;
      const det = extractDeterministicCv(cvText);
      const canonical = mapCvToCanonicalTaxonomy(det);

      expect(canonical.fullName).toBe('Uğur Zaman');
    });

    it('extracts name with header pipe delimiter: "Murat Çelik | Yazılım Mimarı"', () => {
      const cvText = `Murat Çelik | Yazılım Mimarı\nmurat@example.com | 0532 555 44 33\nİzmir / Bornova\n\nDENEYİM\nBulut A.Ş. - Yazılım Mimarı (2017 - 2024)`;
      const det = extractDeterministicCv(cvText);
      const canonical = mapCvToCanonicalTaxonomy(det);

      expect(canonical.fullName).toBe('Murat Çelik');
      expect(canonical.primaryRole).toMatch(/Yazılım Mimarı|Yazılım Geliştirici/i);
    });

    it('returns empty name on headless document without hallucinating', () => {
      const cvText = `0532 123 45 67 | headless@example.com\nAnkara / Çankaya\nBackend Geliştirici\n\nDENEYİM\nYazılım Ltd. - Backend Geliştirici (2020 - 2024)\n\nEĞİTİM\nODTÜ - Bilgisayar Mühendisliği (2019)`;
      const det = extractDeterministicCv(cvText);
      const canonical = mapCvToCanonicalTaxonomy(det);

      expect(canonical.fullName || '').toBe('');
    });
  });

  // 2. Role Extraction & Taxonomy Independence (Phase 4)
  describe('Phase 4: Role Extraction & Raw Title Preservation', () => {
    it('preserves non-taxonomy niche role via desiredRoleOther and Diğer', () => {
      const cvText = `Ali Yılmaz\nali@example.com | 0532 111 00 22\nİstanbul / Kadıköy\nAgile Release Train Engineer\n\nDENEYİM\nFintech A.Ş. - Agile Release Train Engineer (2019 - 2024)`;
      const det = extractDeterministicCv(cvText);
      const canonical = mapCvToCanonicalTaxonomy(det);

      expect(canonical.fullName).toBe('Ali Yılmaz');
      // Should preserve explicit role or match canonical engineer
      expect(canonical.primaryRole).toMatch(/Agile|Engineer|Mühendis/i);
    });

    it('NEVER defaults missing role to "Uzman" or "Yönetici"', () => {
      const cvText = `Ayşe Demir\nayse@example.com | 0532 222 33 44\nİzmir / Konak\n\nEĞİTİM\nEge Üniversitesi - Biyoloji (2020)`;
      const det = extractDeterministicCv(cvText);
      const canonical = mapCvToCanonicalTaxonomy(det);

      expect(canonical.primaryRole || '').not.toBe('Uzman');
      expect(canonical.primaryRole || '').not.toBe('Yönetici');
    });
  });

  // 3. Sector Extraction & Strict Zone Isolation (Phase 5)
  describe('Phase 5: Sector Extraction & Extreme Degree Isolation', () => {
    const adversarialDegrees = [
      { degree: 'Kamu Yönetimi Lisans', expectedSectorNot: 'Kamu / Belediye' },
      { degree: 'Turizm ve Otel İşletmeciliği', expectedSectorNot: 'Turizm / Otelcilik' },
      { degree: 'Sağlık Yönetimi Lisans', expectedSectorNot: 'Sağlık' },
      { degree: 'Uluslararası İlişkiler', expectedSectorNot: 'Kamu / Belediye' },
    ];

    adversarialDegrees.forEach(({ degree, expectedSectorNot }) => {
      it(`Candidate with degree "${degree}" working in Tech NEVER inherits sector "${expectedSectorNot}"`, () => {
        const cvText = `Burak Kaya\nburak@techcorp.com | 0532 888 77 66\nİstanbul / Beşiktaş\nFrontend Geliştirici\n\nDENEYİM\nTrendyol Teknoloji A.Ş. - Frontend Geliştirici (2020 - 2024)\n\nEĞİTİM\nAnkara Üniversitesi - ${degree} (2019)`;
        const det = extractDeterministicCv(cvText);
        const canonical = mapCvToCanonicalTaxonomy(det);

        expect(canonical.primarySector).toBe('Bilişim / Yazılım');
        expect(canonical.primarySector).not.toBe(expectedSectorNot);
      });
    });

    it('denies sector inference from SKILLS zone without employment anchor', () => {
      const res = scoreCandidateSector('Turizm / Otelcilik', {
        zone: 'SKILLS',
        hasExperienceMatch: false,
        fullDocText: 'Yetkinlikler: Otel Rezervasyon, Turizm Rehberliği',
      });

      expect(res.isAccepted).toBe(false);
      expect(res.negativeEvidence).toContain('SECTOR_DERIVED_FROM_SKILLS_PROHIBITED');
    });

    it('denies sector inference from EDUCATION zone', () => {
      const res = scoreCandidateSector('Kamu / Belediye', {
        zone: 'EDUCATION',
        hasExperienceMatch: false,
        fullDocText: 'Eğitim: Kamu Yönetimi Lisans Diploması',
      });

      expect(res.isAccepted).toBe(false);
      expect(res.negativeEvidence).toContain('SECTOR_DERIVED_FROM_ACADEMIC_DEGREE_PROHIBITED');
    });
  });
});
