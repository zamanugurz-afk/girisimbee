import { describe, expect, it } from 'vitest';
import { extractCvText, CvExtractionError } from './cv-text-extractor';
import { detectCvFormatFromBuffer } from './cv-format-detector';
import { extractCandidateName } from './cv-name-extractor';
import {
  extractDeterministicCv,
  extractDeterministicExperiences,
  extractDeterministicEducation,
  extractDeterministicSkillsAndTools,
} from './cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from './cv-taxonomy-mapper';
import { cvService } from './cv.service';

describe('CV Extraction Engine 7.0 — Fuzz, Malformed Inputs & Mutation Resilience', () => {
  // ==========================================
  // SECTION 1: MALFORMED INPUTS & CORRUPTED FILES
  // ==========================================

  it('Malformed 1: Rejects 0-byte empty buffer gracefully without unhandled exception', async () => {
    const emptyBuf = Buffer.alloc(0);
    await expect(cvService.processCvBuffer({
      buffer: emptyBuf,
      fileName: 'empty.pdf',
      mimeType: 'application/pdf',
    })).rejects.toThrow(CvExtractionError);
  });

  it('Malformed 2: Rejects oversized file (> 5MB) with clear error message', async () => {
    const hugeBuf = Buffer.alloc(6 * 1024 * 1024);
    await expect(cvService.processCvBuffer({
      buffer: hugeBuf,
      fileName: 'huge.pdf',
      mimeType: 'application/pdf',
    })).rejects.toThrow(/Dosya boyutu çok büyük/);
  });

  it('Malformed 3: Corrupted PDF header is caught by format detector', () => {
    const fakePdf = Buffer.from('NOT_A_REAL_PDF_CONTENT_HERE_XYZ');
    const detection = detectCvFormatFromBuffer(fakePdf, 'fake.pdf', 'application/pdf');
    expect(detection.isValidSignature).toBe(false);
  });

  it('Malformed 4: Corrupted DOCX zip header is rejected gracefully', async () => {
    const badDocx = Buffer.from('PK\x03\x04CORRUPTED_ZIP_BODY_1234567890');
    await expect(extractCvText(badDocx, 'bad.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'))
      .rejects.toThrow();
  });

  it('Malformed 5: Null bytes and binary control chars do not crash parser', () => {
    const dirtyText = 'Uğur Zaman\x00\x01\x02\x03\nİstanbul / Maltepe\nSatış Müdürü\x00\nDENEYİM\nMplus Group - Çağrı Merkezi Müdürü (2018 - 2024)';
    const res = extractDeterministicCv(dirtyText);
    expect(res.fullName).toBe('Uğur Zaman');
    expect(res.experiences).toHaveLength(1);
  });

  it('Malformed 6: 10,000 character single line does not cause catastrophic regex backtracking', () => {
    const longLine = 'Uğur Zaman ' + 'kelime '.repeat(2000) + '\nİstanbul / Maltepe\nDENEYİM\nIGS Türkiye - Müdür (2020 - 2024)';
    const startTime = Date.now();
    const res = extractDeterministicCv(longLine);
    const elapsed = Date.now() - startTime;

    expect(elapsed).toBeLessThan(5000); // must execute in under 5 seconds under concurrent load
    expect(res.fullName).toBe('Uğur Zaman');
  });

  // ==========================================
  // SECTION 2: FUZZ MUTATION & STRUCTURAL INVARIANTS
  // ==========================================

  it('Fuzz 1: Adding random pipe separators inside descriptions does not inflate experience count', () => {
    const baseText = `
Uğur Zaman
İstanbul / Maltepe
Telemarketing ve Çağrı Merkezi Operasyonları Direktörü

DENEYİM
IGS Türkiye - Müdür (2025 - 2026)
Çağrı Merkezi Yönetimi ve Müşteri İlişkileri

Gedik Yatırım - Müdür (2023 - 2025)
Satış Stratejileri ve Kanal Geliştirme

Mehrwerk - Müdür (2019 - 2023)
Operasyon Yönetimi ve Kalite Kontrol
`;
    const fuzzedText = `
Uğur Zaman
İstanbul / Maltepe
Telemarketing ve Çağrı Merkezi Operasyonları Direktörü

DENEYİM
IGS Türkiye | Müdür | 2025 - 2026
Çağrı Merkezi Yönetimi | Müşteri İlişkileri | Raporlama | KPI | Ekip Yönetimi

Gedik Yatırım | Müdür | 2023 - 2025
Satış Stratejileri | Kanal Geliştirme | Saha Satış | Bayi Yönetimi

Mehrwerk | Müdür | 2019 - 2023
Operasyon Yönetimi | Kalite Kontrol | SLA | Vardiya Planlama
`;
    const resBase = extractDeterministicCv(baseText);
    const resFuzzed = extractDeterministicCv(fuzzedText);

    expect(resBase.experiences).toHaveLength(3);
    expect(resFuzzed.experiences).toHaveLength(3);
    expect(resBase.experiences.length).toBe(resFuzzed.experiences.length);
  });

  it('Fuzz 2: Adding random bullet points, emojis and dashes does not alter candidate identity', () => {
    const cleanCv = `
Zeynep Kaya
Ankara / Çankaya
Veri Analisti
DENEYİM
Aselsan - Veri Analisti (2020 - 2024)
`;
    const mutatedCv = `
★ 👤 Zeynep Kaya 📊 ★
▶ • Ankara / Çankaya • ◀
🚀 Veri Analisti 🎯
■ DENEYİM ■
👉 Aselsan | Veri Analisti (2020 - 2024)
`;
    const name1 = extractCandidateName(cleanCv);
    const name2 = extractCandidateName(mutatedCv);

    expect(name1).toBe('Zeynep Kaya');
    expect(name2).toBe('Zeynep Kaya');
  });

  it('Fuzz 3: Changing date formatting variations does not corrupt startYear/endYear extraction', () => {
    const dateVariations = [
      '2019 - 2023',
      '2019–2023',
      '2019 — 2023',
      '03/2019 - 08/2023',
      'Mar 2019 – Aug 2023',
      '2019 / 2023',
      '2019-present',
      '2019 - Present',
      '2019 - Günümüz',
      '03.2019 - 08.2023',
    ];

    for (const d of dateVariations) {
      const cv = `
Ali Vural
İstanbul / Şişli
Yazılım Geliştirici
DENEYİM
Trendyol - Developer (${d})
`;
      const res = extractDeterministicCv(cv);
      expect(res.experiences).toHaveLength(1);
      expect(res.experiences[0].startYear).toBe(2019);
    }
  });

  it('Fuzz 4: Zero-loss preservation for completely custom unlisted position names', () => {
    const customRole = 'Agile Chapter Lead and Transformation Specialist';
    const cv = `
Selin Demir
İstanbul / Beşiktaş
${customRole}
DENEYİM
ING Bank - ${customRole} (2020 - 2024)
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.primaryRole).toBeDefined();
    // System must preserve custom title without dropping it to "Uzman"
    expect(canonical.primaryRole).not.toBe('Uzman');
  });
});
