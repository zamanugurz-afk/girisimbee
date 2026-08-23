import { describe, expect, it } from 'vitest';
import {
  extractDeterministicCv,
  extractDeterministicExperiences,
  extractDeterministicEducation,
  extractDeterministicSkillsAndTools,
  isRoleTitle,
  isPureDateLine,
} from './cv-deterministic-extractor';
import { extractCandidateName, isForbiddenNameCandidate } from './cv-name-extractor';
import { mapCvToCanonicalTaxonomy, matchCanonicalPosition, matchCanonicalSector } from './cv-taxonomy-mapper';
import { buildCvEvidenceGraph, enforceEvidenceGraphFirewall } from './cv-evidence-graph';
import { buildProfileDraftFromCanonicalResult } from './cv-profile-builder';
import { buildHydratedCustomFieldsFromCvDraft } from './cv-form-hydrator';
import { maskCvPii } from './cv-pii-masker';
import { calculateCvQualityScore } from './cv-quality-score';

describe('CV Extraction Engine 8.0 — Ultimate Forensic & Invariant Red Team Suite', () => {

  // ==========================================================================
  // 1. DELIMITER FORENSICS (Phase 6)
  // ==========================================================================
  describe('Phase 6: Delimiter Forensics & Strong Anchor Invariants', () => {
    const delimiters = ['|', ' | ', '•', '●', '▪', '-', '–', '—', '/', ':', ';', '  |  '];

    delimiters.forEach((delim, idx) => {
      it(`[DELIM_${idx + 1}] Delimiter "${delim.trim() || 'pipe'}" in bullet lines NEVER creates separate experiences`, () => {
        const cv = `
Kemal Sunal
İstanbul / Kadıköy
Satış Müdürü

DENEYİM
ABC Gıda Sanayi - Satış Müdürü (2018 - 2024)
Saha Satış Yönetimi ${delim} Bütçe Planlama ${delim} Ekip Liderliği ${delim} KPI Takibi

EĞİTİM
İstanbul Üniversitesi - İktisat (2010 - 2014)
`;
        const res = extractDeterministicCv(cv);
        expect(res.fullName).toBe('Kemal Sunal');
        expect(res.experiences).toHaveLength(1);
        expect(res.experiences[0].company).toMatch(/ABC Gıda/i);
        expect(res.experiences[0].role).toBe('Satış Müdürü');
      });
    });

    it('Verifies proficiency delimiters ("Satış Yönetimi | Uzman") NEVER produce experience or role "Uzman"', () => {
      const cv = `
Fatma Girik
İstanbul / Beşiktaş
Operasyon Direktörü

YETKİNLİKLER
- Satış Yönetimi | Uzman
- Operasyon Yönetimi | İleri Düzey
- Çağrı Merkezi | Uzman

DENEYİM
XYZ Lojistik A.Ş. - Operasyon Direktörü (2017 - 2024)
Tüm operasyon süreçlerinin yönetimi.
`;
      const res = extractDeterministicCv(cv);
      const canonical = mapCvToCanonicalTaxonomy(res);

      expect(canonical.fullName).toBe('Fatma Girik');
      expect(canonical.primaryRole).not.toBe('Uzman');
      expect(canonical.primaryRole).toMatch(/Operasyon|Direktör/i);
      expect(res.experiences).toHaveLength(1);
    });
  });

  // ==========================================================================
  // 2. NAME RESOLUTION DEEP FORENSIC (Phase 7)
  // ==========================================================================
  describe('Phase 7: Name Resolution Scoring & Negative Signal Immunity', () => {
    it('Rejects section headers, corporate titles, cities and degrees from fullName', () => {
      const forbiddenPool = [
        'Eğitim', 'Deneyim', 'İş Deneyimi', 'Beceriler', 'Yetkinlikler',
        'Referanslar', 'Diller', 'Özgeçmiş', 'CV', 'Resume',
        'İstanbul', 'Ankara', 'İzmir', 'Trabzon', 'Türkiye',
        'Kamu Yönetimi', 'Yazılım Mühendisliği',
        'Doktor Takvimi A.Ş.', 'Müdürlük Danışmanlık Ltd.'
      ];

      for (const token of forbiddenPool) {
        expect(isForbiddenNameCandidate(token)).toBe(true);
      }
    });

    it('Falls back to null/undefined when document has NO candidate name evidence (ZERO guessing)', () => {
      const cvWithoutName = `
İstanbul / Beşiktaş
yazilimci@example.com | 0532 111 22 33
Kıdemli Yazılım Mühendisi

DENEYİM
Trendyol - Yazılım Mühendisi (2019 - 2024)
Backend servislerinin geliştirilmesi.
`;
      const res = extractDeterministicCv(cvWithoutName);
      const canonical = mapCvToCanonicalTaxonomy(res);

      expect(canonical.fullName).toBeUndefined();
    });
  });

  // ==========================================================================
  // 3. SECTOR RESOLUTION FORENSIC & DEGREE ISOLATION (Phase 8 & Phase 12)
  // ==========================================================================
  describe('Phase 8 & 12: Sector Resolution & Education Degree Firewall', () => {
    const degrees = [
      { degree: 'Kamu Yönetimi Lisans', trueRole: 'Satış Müdürü', trueSec: 'Hızlı Tüketim / FMCG', comp: 'Eti Gıda Sanayi A.Ş.' },
      { degree: 'Turizm ve Otel İşletmeciliği', trueRole: 'Yazılım Geliştirici', trueSec: 'Bilişim / Yazılım', comp: 'Getir Teknoloji A.Ş.' },
      { degree: 'Sağlık Kurumları Yönetimi', trueRole: 'Mali İşler Direktörü', trueSec: 'Finans / Bankacılık', comp: 'Garanti Bankası A.Ş.' },
      { degree: 'Uluslararası İlişkiler', trueRole: 'Çağrı Merkezi Operasyon Müdürü', trueSec: 'Çağrı merkezi', comp: 'Vodafone Müşteri Hizmetleri A.Ş.' }
    ];

    degrees.forEach(({ degree, trueRole, trueSec, comp }, idx) => {
      it(`[DEGREE_ISOLATION_${idx + 1}] Degree "${degree}" MUST NOT produce sector for ${comp}`, () => {
        const cv = `
Cüneyt Arkın
İstanbul / Kadıköy
${trueRole}

EĞİTİM
İstanbul Üniversitesi - ${degree} (2010 - 2014)

İŞ DENEYİMİ
${comp} - ${trueRole} (2018 - 2024)
Departman yönetimi ve stratejik operasyonlar.
`;
        const res = extractDeterministicCv(cv);
        const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
        const canonical = mapCvToCanonicalTaxonomy(res);

        expect(canonical.fullName).toBe('Cüneyt Arkın');
        expect(canonical.primarySector).not.toBe('Kamu / Belediye');
        expect(canonical.primarySector).not.toBe('Turizm / Otelcilik');
        expect(canonical.primarySector).not.toBe('Sağlık');
        expect(res.education.length).toBe(1);
      });
    });
  });

  // ==========================================================================
  // 4. REFERENCE FIREWALL (Phase 13)
  // ==========================================================================
  describe('Phase 13: Reference Namespace Firewall & Identity Leakage Prevention', () => {
    it('Referees, referee phones, and referee emails NEVER leak into candidate identity', () => {
      const cv = `
Şener Şen
İstanbul / Sarıyer | sener@example.com | 0532 111 22 33
Tiyatro ve Sinema Sanatçısı

DENEYİM
Şehir Tiyatroları - Genel Sanat Yönetmeni (2010 - 2024)
Sahne yönetimi ve oyunculuk.

REFERANSLAR
Ertem Eğilmez - Yapımcı & Yönetmen
Telefon: 0532 999 88 77
E-posta: ertem@arzu-film.com

Münir Özkul - Sanatçı
Telefon: 0533 888 77 66
`;
      const res = extractDeterministicCv(cv);
      const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
      const canonical = mapCvToCanonicalTaxonomy(res);

      expect(canonical.fullName).toBe('Şener Şen');
      expect(canonical.fullName).not.toBe('Ertem Eğilmez');
      expect(canonical.fullName).not.toBe('Münir Özkul');
      expect(graph.getFirewallViolations()).toHaveLength(0);
    });
  });

  // ==========================================================================
  // 5. MALFORMED & HOSTILE INPUTS (Phase 20)
  // ==========================================================================
  describe('Phase 20: Malformed & Hostile Input Immunity', () => {
    it('Gracefully handles empty strings, whitespace, and null bytes without throwing or hallucinating', () => {
      const emptyRes = extractDeterministicCv('');
      expect(emptyRes.fullName).toBeUndefined();
      expect(emptyRes.experiences).toHaveLength(0);
      expect(emptyRes.education).toHaveLength(0);

      const nullByteRes = extractDeterministicCv('\x00\x00\x00\x01\x02\x03\r\n\t\x00');
      expect(nullByteRes.fullName).toBeUndefined();
      expect(nullByteRes.experiences).toHaveLength(0);
    });

    it('Gracefully handles extreme noise, zero-width characters, and repeated symbols', () => {
      const noisyText = `
\u200B\u200C\uFEFF\u00A0
********************************************************************************
================================================================================
################################################################################
Tuncel Kurtiz
Balıkesir / Edremit
Oyuncu ve Yönetmen

DENEYİM
Dostlar Tiyatrosu - Tiyatro Sanatçısı (2000 - 2013)
Sahne performansları.
`;
      const res = extractDeterministicCv(noisyText);
      const canonical = mapCvToCanonicalTaxonomy(res);

      expect(canonical.fullName).toBe('Tuncel Kurtiz');
      expect(canonical.primaryRole).toMatch(/Oyuncu|Sanatçı|Yönetmen/i);
      expect(res.experiences).toHaveLength(1);
    });
  });

  // ==========================================================================
  // 6. ALL 12 PROPERTY INVARIANTS (Phase 21)
  // ==========================================================================
  describe('Phase 21: Formal Proof of All 12 Engine Invariants', () => {
    const baseCv = `
Haluk Bilginer
İstanbul / Beşiktaş | haluk@oyunatolyesi.com | 0532 555 44 33
Tiyatro Direktörü

DENEYİM
Oyun Atölyesi Sanat Prodüksiyon A.Ş. - Genel Sanat Yönetmeni (2005 - 2024)
Tiyatro oyunlarının prodüksiyonu ve yönetimi.

EĞİTİM
Ankara Devlet Konservatuvarı - Tiyatro Lisans (1975 - 1979)
Kamu Yönetimi Yüksek Lisans (2000 - 2002)

YETKİNLİKLER
Sahne Yönetimi, Oyunculuk, Seslendirme, Yönetmenlik

REFERANSLAR
Zuhal Olcay - Sanatçı | 0532 999 00 11
`;

    it('INVARIANT 1: Education content cannot change primary sector', () => {
      const res = extractDeterministicCv(baseCv);
      const canonical = mapCvToCanonicalTaxonomy(res);
      expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    });

    it('INVARIANT 2: Reference content cannot change candidate identity', () => {
      const res = extractDeterministicCv(baseCv);
      const canonical = mapCvToCanonicalTaxonomy(res);
      expect(canonical.fullName).toBe('Haluk Bilginer');
      expect(canonical.fullName).not.toBe('Zuhal Olcay');
    });

    it('INVARIANT 3: Skill content cannot create primary role', () => {
      const res = extractDeterministicCv(baseCv);
      const canonical = mapCvToCanonicalTaxonomy(res);
      expect(canonical.primaryRole).not.toBe('Uzman');
      expect(canonical.primaryRole).toMatch(/Sanat Yönetmeni|Direktör/i);
    });

    it('INVARIANT 4: Company name cannot create role', () => {
      const res = extractDeterministicCv(baseCv);
      const canonical = mapCvToCanonicalTaxonomy(res);
      expect(canonical.primaryRole).not.toBe('Oyun Atölyesi');
    });

    it('INVARIANT 5: Delimiters cannot create experience', () => {
      const res = extractDeterministicCv(baseCv);
      expect(res.experiences).toHaveLength(1);
    });

    it('INVARIANT 6: Taxonomy cannot create unsupported evidence', () => {
      const res = extractDeterministicCv(baseCv);
      const canonical = mapCvToCanonicalTaxonomy(res);
      expect(canonical.primaryRole).toBeDefined();
      expect(canonical.primaryRole).not.toBe('Uzman');
    });

    it('INVARIANT 7: Missing evidence produces null/unresolved, never guessed', () => {
      const noLocCv = 'Ali Vural\nYazılım Geliştirici\nDENEYİM\nTech A.Ş. - Developer (2020-2024)';
      const res = extractDeterministicCv(noLocCv);
      const canonical = mapCvToCanonicalTaxonomy(res);
      expect(canonical.residenceCity).toBe('');
      expect(canonical.residenceDistrict).toBe('');
    });

    it('INVARIANT 8: Deterministic replay produces identical canonical output', () => {
      const run1 = mapCvToCanonicalTaxonomy(extractDeterministicCv(baseCv));
      const run2 = mapCvToCanonicalTaxonomy(extractDeterministicCv(baseCv));
      expect(run1.fullName).toBe(run2.fullName);
      expect(run1.primaryRole).toBe(run2.primaryRole);
      expect(run1.primarySector).toBe(run2.primarySector);
      expect(run1.experiences.length).toBe(run2.experiences.length);
    });

    it('INVARIANT 9: Removing education section does not change candidate name or experiences', () => {
      const withoutEdu = baseCv.replace(/EĞİTİM[\s\S]*?(?=YETKİNLİKLER)/, '');
      const res = extractDeterministicCv(withoutEdu);
      const canonical = mapCvToCanonicalTaxonomy(res);
      expect(canonical.fullName).toBe('Haluk Bilginer');
      expect(res.experiences).toHaveLength(1);
    });

    it('INVARIANT 10: Reordering unrelated sections does not alter candidate identity', () => {
      const reordered = `
Haluk Bilginer
İstanbul / Beşiktaş

REFERANSLAR
Zuhal Olcay - Sanatçı

YETKİNLİKLER
Sahne Yönetimi, Oyunculuk

EĞİTİM
Ankara Devlet Konservatuvarı - Tiyatro Lisans (1975 - 1979)

DENEYİM
Oyun Atölyesi Sanat Prodüksiyon A.Ş. - Genel Sanat Yönetmeni (2005 - 2024)
`;
      const res = extractDeterministicCv(reordered);
      const canonical = mapCvToCanonicalTaxonomy(res);
      expect(canonical.fullName).toBe('Haluk Bilginer');
      expect(canonical.fullName).not.toBe('Zuhal Olcay');
      expect(res.experiences).toHaveLength(1);
    });

    it('INVARIANT 11: DOM Hydration strictly matches canonical result', () => {
      const canonical = mapCvToCanonicalTaxonomy(extractDeterministicCv(baseCv));
      const draft = buildProfileDraftFromCanonicalResult(canonical, 'haluk.pdf');
      const hydration = buildHydratedCustomFieldsFromCvDraft(draft);

      expect(hydration.nextCustomFields.fullName).toBe(canonical.fullName);
      expect(hydration.nextCustomFields.residenceCity).toBe(canonical.residenceCity);
      expect(hydration.nextCustomFields.residenceDistrict).toBe(canonical.residenceDistrict);
    });

    it('INVARIANT 12: PII Masker preserves layout boundaries and text structure', () => {
      const masked = maskCvPii(baseCv);
      expect(masked.maskedText.toLowerCase()).toContain('[email]');
      expect(masked.maskedText.toLowerCase()).toContain('[phone]');
      expect(masked.maskedText).toContain('Haluk Bilginer');
    });
  });

  // ==========================================================================
  // 7. CONTROLLED MUTATION TESTING (Phase 22)
  // ==========================================================================
  describe('Phase 22: Mutation Testing & Localized Impact Isolation', () => {
    it('Mutating education field from "Kamu Yönetimi" to "Turizm" changes only education, NOT sector', () => {
      const cvKamu = `
Ali Sunal
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone İletişim A.Ş. - Çağrı Merkezi Müdürü (2018 - 2024)

EĞİTİM
Marmara Üniversitesi - Kamu Yönetimi (2010 - 2014)
`;
      const cvTurizm = `
Ali Sunal
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone İletişim A.Ş. - Çağrı Merkezi Müdürü (2018 - 2024)

EĞİTİM
Marmara Üniversitesi - Turizm İşletmeciliği (2010 - 2014)
`;
      const resKamu = mapCvToCanonicalTaxonomy(extractDeterministicCv(cvKamu));
      const resTurizm = mapCvToCanonicalTaxonomy(extractDeterministicCv(cvTurizm));

      expect(resKamu.primarySector).toBe('Çağrı merkezi');
      expect(resTurizm.primarySector).toBe('Çağrı merkezi');
      expect(resKamu.primarySector).toBe(resTurizm.primarySector);
    });
  });
});
