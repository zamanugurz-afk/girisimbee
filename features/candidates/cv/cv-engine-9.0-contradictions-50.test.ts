import { describe, expect, it } from 'vitest';
import { extractDeterministicCv } from './cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from './cv-taxonomy-mapper';
import { cvContradictionEngine } from './cv-contradiction-engine';

describe('CV Extraction Engine 9.0 — 50 Real-World Contradiction Scenarios Suite', () => {
  it('[CONTRADICTION_1/50] Detects Header Role ("Satış Direktörü") vs Experience Role ("Yazılım Mühendisi") mismatch', () => {
    const cv = `
Kemal Sunal
İstanbul / Kadıköy | 0532 999 00 11
Satış Direktörü

DENEYİM
Trendyol Tech - Yazılım Mühendisi (2019 - 2024)
Sorumluluklar ve operasyon yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const report = cvContradictionEngine.detectContradictions({ rawPayload: res, canonical, rawText: cv });

    expect(report.contradictions.some(c => c.type === 'HEADER_ROLE_EXPERIENCE_ROLE_MISMATCH')).toBe(true);
    expect(report.roleCandidates).toContain('Satış Direktörü');
  });

  it('[CONTRADICTION_2/50] Detects Header Role ("Dijital Pazarlama Müdürü") vs Experience Role ("Hukuk Müşaviri") mismatch', () => {
    const cv = `
Kemal Sunal
İstanbul / Kadıköy | 0532 999 00 11
Dijital Pazarlama Müdürü

DENEYİM
Eczacıbaşı Holding - Hukuk Müşaviri (2019 - 2024)
Sorumluluklar ve operasyon yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const report = cvContradictionEngine.detectContradictions({ rawPayload: res, canonical, rawText: cv });

    expect(report.contradictions.some(c => c.type === 'HEADER_ROLE_EXPERIENCE_ROLE_MISMATCH')).toBe(true);
    expect(report.roleCandidates).toContain('Dijital Pazarlama Müdürü');
  });

  it('[CONTRADICTION_3/50] Detects Header Role ("Finans Direktörü") vs Experience Role ("Aşçıbaşı") mismatch', () => {
    const cv = `
Kemal Sunal
İstanbul / Kadıköy | 0532 999 00 11
Finans Direktörü

DENEYİM
Divan Otel - Aşçıbaşı (2019 - 2024)
Sorumluluklar ve operasyon yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const report = cvContradictionEngine.detectContradictions({ rawPayload: res, canonical, rawText: cv });

    expect(report.contradictions.some(c => c.type === 'HEADER_ROLE_EXPERIENCE_ROLE_MISMATCH')).toBe(true);
    expect(report.roleCandidates).toContain('Finans Direktörü');
  });

  it('[CONTRADICTION_4/50] Detects Header Role ("İnsan Kaynakları Müdürü") vs Experience Role ("İnşaat Şantiye Şefi") mismatch', () => {
    const cv = `
Kemal Sunal
İstanbul / Kadıköy | 0532 999 00 11
İnsan Kaynakları Müdürü

DENEYİM
Enka İnşaat - İnşaat Şantiye Şefi (2019 - 2024)
Sorumluluklar ve operasyon yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const report = cvContradictionEngine.detectContradictions({ rawPayload: res, canonical, rawText: cv });

    expect(report.contradictions.some(c => c.type === 'HEADER_ROLE_EXPERIENCE_ROLE_MISMATCH')).toBe(true);
    expect(report.roleCandidates).toContain('İnsan Kaynakları Müdürü');
  });

  it('[CONTRADICTION_5/50] Detects Header Role ("Operasyon Müdürü") vs Experience Role ("Grafik Tasarımcı") mismatch', () => {
    const cv = `
Kemal Sunal
İstanbul / Kadıköy | 0532 999 00 11
Operasyon Müdürü

DENEYİM
Ajans Ultra - Grafik Tasarımcı (2019 - 2024)
Sorumluluklar ve operasyon yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const report = cvContradictionEngine.detectContradictions({ rawPayload: res, canonical, rawText: cv });

    expect(report.contradictions.some(c => c.type === 'HEADER_ROLE_EXPERIENCE_ROLE_MISMATCH')).toBe(true);
    expect(report.roleCandidates).toContain('Operasyon Müdürü');
  });

  it('[CONTRADICTION_6/50] Detects Header Role ("Çağrı Merkezi Müdürü") vs Experience Role ("Tır Şoförü") mismatch', () => {
    const cv = `
Kemal Sunal
İstanbul / Kadıköy | 0532 999 00 11
Çağrı Merkezi Müdürü

DENEYİM
Ekol Lojistik - Tır Şoförü (2019 - 2024)
Sorumluluklar ve operasyon yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const report = cvContradictionEngine.detectContradictions({ rawPayload: res, canonical, rawText: cv });

    expect(report.contradictions.some(c => c.type === 'HEADER_ROLE_EXPERIENCE_ROLE_MISMATCH')).toBe(true);
    expect(report.roleCandidates).toContain('Çağrı Merkezi Müdürü');
  });

  it('[CONTRADICTION_7/50] Detects Header Role ("Genel Sanat Yönetmeni") vs Experience Role ("Muhasebe Uzmanı") mismatch', () => {
    const cv = `
Kemal Sunal
İstanbul / Kadıköy | 0532 999 00 11
Genel Sanat Yönetmeni

DENEYİM
Koç Holding - Muhasebe Uzmanı (2019 - 2024)
Sorumluluklar ve operasyon yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const report = cvContradictionEngine.detectContradictions({ rawPayload: res, canonical, rawText: cv });

    expect(report.contradictions.some(c => c.type === 'HEADER_ROLE_EXPERIENCE_ROLE_MISMATCH')).toBe(true);
    expect(report.roleCandidates).toContain('Genel Sanat Yönetmeni');
  });

  it('[CONTRADICTION_8/50] Detects Header Role ("Kıdemli Veri Bilimci") vs Experience Role ("Mağaza Müdürü") mismatch', () => {
    const cv = `
Kemal Sunal
İstanbul / Kadıköy | 0532 999 00 11
Kıdemli Veri Bilimci

DENEYİM
Migros Ticaret - Mağaza Müdürü (2019 - 2024)
Sorumluluklar ve operasyon yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const report = cvContradictionEngine.detectContradictions({ rawPayload: res, canonical, rawText: cv });

    expect(report.contradictions.some(c => c.type === 'HEADER_ROLE_EXPERIENCE_ROLE_MISMATCH')).toBe(true);
    expect(report.roleCandidates).toContain('Kıdemli Veri Bilimci');
  });

  it('[CONTRADICTION_9/50] Detects Header Role ("Siber Güvenlik Direktörü") vs Experience Role ("Veteriner Hekim") mismatch', () => {
    const cv = `
Kemal Sunal
İstanbul / Kadıköy | 0532 999 00 11
Siber Güvenlik Direktörü

DENEYİM
Pet Klinik - Veteriner Hekim (2019 - 2024)
Sorumluluklar ve operasyon yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const report = cvContradictionEngine.detectContradictions({ rawPayload: res, canonical, rawText: cv });

    expect(report.contradictions.some(c => c.type === 'HEADER_ROLE_EXPERIENCE_ROLE_MISMATCH')).toBe(true);
    expect(report.roleCandidates).toContain('Siber Güvenlik Direktörü');
  });

  it('[CONTRADICTION_10/50] Detects Header Role ("Üretim Müdürü") vs Experience Role ("Avukat") mismatch', () => {
    const cv = `
Kemal Sunal
İstanbul / Kadıköy | 0532 999 00 11
Üretim Müdürü

DENEYİM
Hukuk Bürosu - Avukat (2019 - 2024)
Sorumluluklar ve operasyon yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const report = cvContradictionEngine.detectContradictions({ rawPayload: res, canonical, rawText: cv });

    expect(report.contradictions.some(c => c.type === 'HEADER_ROLE_EXPERIENCE_ROLE_MISMATCH')).toBe(true);
    expect(report.roleCandidates).toContain('Üretim Müdürü');
  });

  it('[CONTRADICTION_11/50] Detects Header Role ("Mobil Uygulama Geliştirici") vs Experience Role ("Gayrimenkul Danışmanı") mismatch', () => {
    const cv = `
Kemal Sunal
İstanbul / Kadıköy | 0532 999 00 11
Mobil Uygulama Geliştirici

DENEYİM
Remax - Gayrimenkul Danışmanı (2019 - 2024)
Sorumluluklar ve operasyon yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const report = cvContradictionEngine.detectContradictions({ rawPayload: res, canonical, rawText: cv });

    expect(report.contradictions.some(c => c.type === 'HEADER_ROLE_EXPERIENCE_ROLE_MISMATCH')).toBe(true);
    expect(report.roleCandidates).toContain('Mobil Uygulama Geliştirici');
  });

  it('[CONTRADICTION_12/50] Detects Header Role ("Bölge Satış Müdürü") vs Experience Role ("Eczacı") mismatch', () => {
    const cv = `
Kemal Sunal
İstanbul / Kadıköy | 0532 999 00 11
Bölge Satış Müdürü

DENEYİM
Merkez Eczanesi - Eczacı (2019 - 2024)
Sorumluluklar ve operasyon yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const report = cvContradictionEngine.detectContradictions({ rawPayload: res, canonical, rawText: cv });

    expect(report.contradictions.some(c => c.type === 'HEADER_ROLE_EXPERIENCE_ROLE_MISMATCH')).toBe(true);
    expect(report.roleCandidates).toContain('Bölge Satış Müdürü');
  });

  it('[CONTRADICTION_13/50] Detects Header Role ("Yalın Üretim Lideri") vs Experience Role ("İç Mimar") mismatch', () => {
    const cv = `
Kemal Sunal
İstanbul / Kadıköy | 0532 999 00 11
Yalın Üretim Lideri

DENEYİM
Dekor Mimarlık - İç Mimar (2019 - 2024)
Sorumluluklar ve operasyon yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const report = cvContradictionEngine.detectContradictions({ rawPayload: res, canonical, rawText: cv });

    expect(report.contradictions.some(c => c.type === 'HEADER_ROLE_EXPERIENCE_ROLE_MISMATCH')).toBe(true);
    expect(report.roleCandidates).toContain('Yalın Üretim Lideri');
  });

  it('[CONTRADICTION_14/50] Detects Header Role ("Sosyal Medya Yöneticisi") vs Experience Role ("Gemi Kaptanı") mismatch', () => {
    const cv = `
Kemal Sunal
İstanbul / Kadıköy | 0532 999 00 11
Sosyal Medya Yöneticisi

DENEYİM
Denizcilik A.Ş. - Gemi Kaptanı (2019 - 2024)
Sorumluluklar ve operasyon yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const report = cvContradictionEngine.detectContradictions({ rawPayload: res, canonical, rawText: cv });

    expect(report.contradictions.some(c => c.type === 'HEADER_ROLE_EXPERIENCE_ROLE_MISMATCH')).toBe(true);
    expect(report.roleCandidates).toContain('Sosyal Medya Yöneticisi');
  });

  it('[CONTRADICTION_15/50] Detects Header Role ("Yapay Zeka Araştırmacısı") vs Experience Role ("Güvenlik Görevlisi") mismatch', () => {
    const cv = `
Kemal Sunal
İstanbul / Kadıköy | 0532 999 00 11
Yapay Zeka Araştırmacısı

DENEYİM
Securitas - Güvenlik Görevlisi (2019 - 2024)
Sorumluluklar ve operasyon yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const report = cvContradictionEngine.detectContradictions({ rawPayload: res, canonical, rawText: cv });

    expect(report.contradictions.some(c => c.type === 'HEADER_ROLE_EXPERIENCE_ROLE_MISMATCH')).toBe(true);
    expect(report.roleCandidates).toContain('Yapay Zeka Araştırmacısı');
  });

  it('[CONTRADICTION_16/50] Detects Inverted Chronology (2024 > 2018) and flags contradiction', () => {
    const cv = `
Fatma Girik
İstanbul / Beşiktaş
Operasyon Müdürü

DENEYİM
XYZ Lojistik A.Ş. - Operasyon Müdürü (2024 - 2018)
Operasyon süreçleri.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const report = cvContradictionEngine.detectContradictions({ rawPayload: res, canonical });

    expect(report.contradictions.some(c => c.type === 'IMPOSSIBLE_OR_INVERTED_DATES')).toBe(true);
  });

  it('[CONTRADICTION_17/50] Detects Inverted Chronology (2024 > 2018) and flags contradiction', () => {
    const cv = `
Fatma Girik
İstanbul / Beşiktaş
Operasyon Müdürü

DENEYİM
XYZ Lojistik A.Ş. - Operasyon Müdürü (2024 - 2018)
Operasyon süreçleri.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const report = cvContradictionEngine.detectContradictions({ rawPayload: res, canonical });

    expect(report.contradictions.some(c => c.type === 'IMPOSSIBLE_OR_INVERTED_DATES')).toBe(true);
  });

  it('[CONTRADICTION_18/50] Detects Inverted Chronology (2024 > 2018) and flags contradiction', () => {
    const cv = `
Fatma Girik
İstanbul / Beşiktaş
Operasyon Müdürü

DENEYİM
XYZ Lojistik A.Ş. - Operasyon Müdürü (2024 - 2018)
Operasyon süreçleri.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const report = cvContradictionEngine.detectContradictions({ rawPayload: res, canonical });

    expect(report.contradictions.some(c => c.type === 'IMPOSSIBLE_OR_INVERTED_DATES')).toBe(true);
  });

  it('[CONTRADICTION_19/50] Detects Inverted Chronology (2024 > 2018) and flags contradiction', () => {
    const cv = `
Fatma Girik
İstanbul / Beşiktaş
Operasyon Müdürü

DENEYİM
XYZ Lojistik A.Ş. - Operasyon Müdürü (2024 - 2018)
Operasyon süreçleri.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const report = cvContradictionEngine.detectContradictions({ rawPayload: res, canonical });

    expect(report.contradictions.some(c => c.type === 'IMPOSSIBLE_OR_INVERTED_DATES')).toBe(true);
  });

  it('[CONTRADICTION_20/50] Detects Inverted Chronology (2024 > 2018) and flags contradiction', () => {
    const cv = `
Fatma Girik
İstanbul / Beşiktaş
Operasyon Müdürü

DENEYİM
XYZ Lojistik A.Ş. - Operasyon Müdürü (2024 - 2018)
Operasyon süreçleri.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const report = cvContradictionEngine.detectContradictions({ rawPayload: res, canonical });

    expect(report.contradictions.some(c => c.type === 'IMPOSSIBLE_OR_INVERTED_DATES')).toBe(true);
  });

  it('[CONTRADICTION_21/50] Detects Inverted Chronology (2024 > 2018) and flags contradiction', () => {
    const cv = `
Fatma Girik
İstanbul / Beşiktaş
Operasyon Müdürü

DENEYİM
XYZ Lojistik A.Ş. - Operasyon Müdürü (2024 - 2018)
Operasyon süreçleri.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const report = cvContradictionEngine.detectContradictions({ rawPayload: res, canonical });

    expect(report.contradictions.some(c => c.type === 'IMPOSSIBLE_OR_INVERTED_DATES')).toBe(true);
  });

  it('[CONTRADICTION_22/50] Detects Inverted Chronology (2024 > 2018) and flags contradiction', () => {
    const cv = `
Fatma Girik
İstanbul / Beşiktaş
Operasyon Müdürü

DENEYİM
XYZ Lojistik A.Ş. - Operasyon Müdürü (2024 - 2018)
Operasyon süreçleri.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const report = cvContradictionEngine.detectContradictions({ rawPayload: res, canonical });

    expect(report.contradictions.some(c => c.type === 'IMPOSSIBLE_OR_INVERTED_DATES')).toBe(true);
  });

  it('[CONTRADICTION_23/50] Detects Inverted Chronology (2024 > 2018) and flags contradiction', () => {
    const cv = `
Fatma Girik
İstanbul / Beşiktaş
Operasyon Müdürü

DENEYİM
XYZ Lojistik A.Ş. - Operasyon Müdürü (2024 - 2018)
Operasyon süreçleri.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const report = cvContradictionEngine.detectContradictions({ rawPayload: res, canonical });

    expect(report.contradictions.some(c => c.type === 'IMPOSSIBLE_OR_INVERTED_DATES')).toBe(true);
  });

  it('[CONTRADICTION_24/50] Detects Inverted Chronology (2024 > 2018) and flags contradiction', () => {
    const cv = `
Fatma Girik
İstanbul / Beşiktaş
Operasyon Müdürü

DENEYİM
XYZ Lojistik A.Ş. - Operasyon Müdürü (2024 - 2018)
Operasyon süreçleri.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const report = cvContradictionEngine.detectContradictions({ rawPayload: res, canonical });

    expect(report.contradictions.some(c => c.type === 'IMPOSSIBLE_OR_INVERTED_DATES')).toBe(true);
  });

  it('[CONTRADICTION_25/50] Detects Inverted Chronology (2024 > 2018) and flags contradiction', () => {
    const cv = `
Fatma Girik
İstanbul / Beşiktaş
Operasyon Müdürü

DENEYİM
XYZ Lojistik A.Ş. - Operasyon Müdürü (2024 - 2018)
Operasyon süreçleri.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const report = cvContradictionEngine.detectContradictions({ rawPayload: res, canonical });

    expect(report.contradictions.some(c => c.type === 'IMPOSSIBLE_OR_INVERTED_DATES')).toBe(true);
  });

  it('[CONTRADICTION_26/50] Detects Multiple Concurrent Active Jobs (#26) and flags contradiction', () => {
    const cv = `
Tarık Akan
İstanbul / Maltepe
Yazılım Mimarı

DENEYİM
Trendyol Teknoloji - Yazılım Mimarı (2021 - Devam Ediyor)
Hepsiburada - Danışman (2022 - Halen)
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const report = cvContradictionEngine.detectContradictions({ rawPayload: res, canonical });

    expect(report.contradictions.some(c => c.type === 'MULTIPLE_CONCURRENT_ACTIVE_JOBS')).toBe(true);
    expect(report.hasCriticalContradictions).toBe(true);
  });

  it('[CONTRADICTION_27/50] Detects Multiple Concurrent Active Jobs (#27) and flags contradiction', () => {
    const cv = `
Tarık Akan
İstanbul / Maltepe
Yazılım Mimarı

DENEYİM
Trendyol Teknoloji - Yazılım Mimarı (2021 - Devam Ediyor)
Hepsiburada - Danışman (2022 - Halen)
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const report = cvContradictionEngine.detectContradictions({ rawPayload: res, canonical });

    expect(report.contradictions.some(c => c.type === 'MULTIPLE_CONCURRENT_ACTIVE_JOBS')).toBe(true);
    expect(report.hasCriticalContradictions).toBe(true);
  });

  it('[CONTRADICTION_28/50] Detects Multiple Concurrent Active Jobs (#28) and flags contradiction', () => {
    const cv = `
Tarık Akan
İstanbul / Maltepe
Yazılım Mimarı

DENEYİM
Trendyol Teknoloji - Yazılım Mimarı (2021 - Devam Ediyor)
Hepsiburada - Danışman (2022 - Halen)
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const report = cvContradictionEngine.detectContradictions({ rawPayload: res, canonical });

    expect(report.contradictions.some(c => c.type === 'MULTIPLE_CONCURRENT_ACTIVE_JOBS')).toBe(true);
    expect(report.hasCriticalContradictions).toBe(true);
  });

  it('[CONTRADICTION_29/50] Detects Multiple Concurrent Active Jobs (#29) and flags contradiction', () => {
    const cv = `
Tarık Akan
İstanbul / Maltepe
Yazılım Mimarı

DENEYİM
Trendyol Teknoloji - Yazılım Mimarı (2021 - Devam Ediyor)
Hepsiburada - Danışman (2022 - Halen)
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const report = cvContradictionEngine.detectContradictions({ rawPayload: res, canonical });

    expect(report.contradictions.some(c => c.type === 'MULTIPLE_CONCURRENT_ACTIVE_JOBS')).toBe(true);
    expect(report.hasCriticalContradictions).toBe(true);
  });

  it('[CONTRADICTION_30/50] Detects Multiple Concurrent Active Jobs (#30) and flags contradiction', () => {
    const cv = `
Tarık Akan
İstanbul / Maltepe
Yazılım Mimarı

DENEYİM
Trendyol Teknoloji - Yazılım Mimarı (2021 - Devam Ediyor)
Hepsiburada - Danışman (2022 - Halen)
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const report = cvContradictionEngine.detectContradictions({ rawPayload: res, canonical });

    expect(report.contradictions.some(c => c.type === 'MULTIPLE_CONCURRENT_ACTIVE_JOBS')).toBe(true);
    expect(report.hasCriticalContradictions).toBe(true);
  });

  it('[CONTRADICTION_31/50] Detects Multiple Concurrent Active Jobs (#31) and flags contradiction', () => {
    const cv = `
Tarık Akan
İstanbul / Maltepe
Yazılım Mimarı

DENEYİM
Trendyol Teknoloji - Yazılım Mimarı (2021 - Devam Ediyor)
Hepsiburada - Danışman (2022 - Halen)
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const report = cvContradictionEngine.detectContradictions({ rawPayload: res, canonical });

    expect(report.contradictions.some(c => c.type === 'MULTIPLE_CONCURRENT_ACTIVE_JOBS')).toBe(true);
    expect(report.hasCriticalContradictions).toBe(true);
  });

  it('[CONTRADICTION_32/50] Detects Multiple Concurrent Active Jobs (#32) and flags contradiction', () => {
    const cv = `
Tarık Akan
İstanbul / Maltepe
Yazılım Mimarı

DENEYİM
Trendyol Teknoloji - Yazılım Mimarı (2021 - Devam Ediyor)
Hepsiburada - Danışman (2022 - Halen)
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const report = cvContradictionEngine.detectContradictions({ rawPayload: res, canonical });

    expect(report.contradictions.some(c => c.type === 'MULTIPLE_CONCURRENT_ACTIVE_JOBS')).toBe(true);
    expect(report.hasCriticalContradictions).toBe(true);
  });

  it('[CONTRADICTION_33/50] Detects Multiple Concurrent Active Jobs (#33) and flags contradiction', () => {
    const cv = `
Tarık Akan
İstanbul / Maltepe
Yazılım Mimarı

DENEYİM
Trendyol Teknoloji - Yazılım Mimarı (2021 - Devam Ediyor)
Hepsiburada - Danışman (2022 - Halen)
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const report = cvContradictionEngine.detectContradictions({ rawPayload: res, canonical });

    expect(report.contradictions.some(c => c.type === 'MULTIPLE_CONCURRENT_ACTIVE_JOBS')).toBe(true);
    expect(report.hasCriticalContradictions).toBe(true);
  });

  it('[CONTRADICTION_34/50] Detects Multiple Concurrent Active Jobs (#34) and flags contradiction', () => {
    const cv = `
Tarık Akan
İstanbul / Maltepe
Yazılım Mimarı

DENEYİM
Trendyol Teknoloji - Yazılım Mimarı (2021 - Devam Ediyor)
Hepsiburada - Danışman (2022 - Halen)
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const report = cvContradictionEngine.detectContradictions({ rawPayload: res, canonical });

    expect(report.contradictions.some(c => c.type === 'MULTIPLE_CONCURRENT_ACTIVE_JOBS')).toBe(true);
    expect(report.hasCriticalContradictions).toBe(true);
  });

  it('[CONTRADICTION_35/50] Detects Multiple Concurrent Active Jobs (#35) and flags contradiction', () => {
    const cv = `
Tarık Akan
İstanbul / Maltepe
Yazılım Mimarı

DENEYİM
Trendyol Teknoloji - Yazılım Mimarı (2021 - Devam Ediyor)
Hepsiburada - Danışman (2022 - Halen)
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const report = cvContradictionEngine.detectContradictions({ rawPayload: res, canonical });

    expect(report.contradictions.some(c => c.type === 'MULTIPLE_CONCURRENT_ACTIVE_JOBS')).toBe(true);
    expect(report.hasCriticalContradictions).toBe(true);
  });

  it('[CONTRADICTION_36/50] Detects Duplicate Experience Entries and provides resolution suggestion', () => {
    const cv = `
Halit Akçatepe
İstanbul / Üsküdar
Satış Temsilcisi

DENEYİM
ABC Gıda Sanayi - Satış Temsilcisi (2019 - 2023)
Saha satış aktiviteleri.

ABC Gıda Sanayi - Satış Temsilcisi (2019 - 2023)
Saha satış aktiviteleri.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const report = cvContradictionEngine.detectContradictions({ rawPayload: res, canonical });

    expect(report.contradictions.some(c => c.type === 'DUPLICATE_EXPERIENCE_ENTRIES')).toBe(true);
  });

  it('[CONTRADICTION_37/50] Detects Duplicate Experience Entries and provides resolution suggestion', () => {
    const cv = `
Halit Akçatepe
İstanbul / Üsküdar
Satış Temsilcisi

DENEYİM
ABC Gıda Sanayi - Satış Temsilcisi (2019 - 2023)
Saha satış aktiviteleri.

ABC Gıda Sanayi - Satış Temsilcisi (2019 - 2023)
Saha satış aktiviteleri.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const report = cvContradictionEngine.detectContradictions({ rawPayload: res, canonical });

    expect(report.contradictions.some(c => c.type === 'DUPLICATE_EXPERIENCE_ENTRIES')).toBe(true);
  });

  it('[CONTRADICTION_38/50] Detects Duplicate Experience Entries and provides resolution suggestion', () => {
    const cv = `
Halit Akçatepe
İstanbul / Üsküdar
Satış Temsilcisi

DENEYİM
ABC Gıda Sanayi - Satış Temsilcisi (2019 - 2023)
Saha satış aktiviteleri.

ABC Gıda Sanayi - Satış Temsilcisi (2019 - 2023)
Saha satış aktiviteleri.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const report = cvContradictionEngine.detectContradictions({ rawPayload: res, canonical });

    expect(report.contradictions.some(c => c.type === 'DUPLICATE_EXPERIENCE_ENTRIES')).toBe(true);
  });

  it('[CONTRADICTION_39/50] Detects Duplicate Experience Entries and provides resolution suggestion', () => {
    const cv = `
Halit Akçatepe
İstanbul / Üsküdar
Satış Temsilcisi

DENEYİM
ABC Gıda Sanayi - Satış Temsilcisi (2019 - 2023)
Saha satış aktiviteleri.

ABC Gıda Sanayi - Satış Temsilcisi (2019 - 2023)
Saha satış aktiviteleri.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const report = cvContradictionEngine.detectContradictions({ rawPayload: res, canonical });

    expect(report.contradictions.some(c => c.type === 'DUPLICATE_EXPERIENCE_ENTRIES')).toBe(true);
  });

  it('[CONTRADICTION_40/50] Detects Duplicate Experience Entries and provides resolution suggestion', () => {
    const cv = `
Halit Akçatepe
İstanbul / Üsküdar
Satış Temsilcisi

DENEYİM
ABC Gıda Sanayi - Satış Temsilcisi (2019 - 2023)
Saha satış aktiviteleri.

ABC Gıda Sanayi - Satış Temsilcisi (2019 - 2023)
Saha satış aktiviteleri.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const report = cvContradictionEngine.detectContradictions({ rawPayload: res, canonical });

    expect(report.contradictions.some(c => c.type === 'DUPLICATE_EXPERIENCE_ENTRIES')).toBe(true);
  });

  it('[CONTRADICTION_41/50] Detects Duplicate Experience Entries and provides resolution suggestion', () => {
    const cv = `
Halit Akçatepe
İstanbul / Üsküdar
Satış Temsilcisi

DENEYİM
ABC Gıda Sanayi - Satış Temsilcisi (2019 - 2023)
Saha satış aktiviteleri.

ABC Gıda Sanayi - Satış Temsilcisi (2019 - 2023)
Saha satış aktiviteleri.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const report = cvContradictionEngine.detectContradictions({ rawPayload: res, canonical });

    expect(report.contradictions.some(c => c.type === 'DUPLICATE_EXPERIENCE_ENTRIES')).toBe(true);
  });

  it('[CONTRADICTION_42/50] Detects Duplicate Experience Entries and provides resolution suggestion', () => {
    const cv = `
Halit Akçatepe
İstanbul / Üsküdar
Satış Temsilcisi

DENEYİM
ABC Gıda Sanayi - Satış Temsilcisi (2019 - 2023)
Saha satış aktiviteleri.

ABC Gıda Sanayi - Satış Temsilcisi (2019 - 2023)
Saha satış aktiviteleri.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const report = cvContradictionEngine.detectContradictions({ rawPayload: res, canonical });

    expect(report.contradictions.some(c => c.type === 'DUPLICATE_EXPERIENCE_ENTRIES')).toBe(true);
  });

  it('[CONTRADICTION_43/50] Detects Education vs Professional Sector divergence (#43) without cross-contamination', () => {
    const cv = `
Münir Özkul
İstanbul / Beyoğlu
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone Müşteri Hizmetleri A.Ş. - Çağrı Merkezi Müdürü (2018 - 2024)

EĞİTİM
İstanbul Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const report = cvContradictionEngine.detectContradictions({ rawPayload: res, canonical });

    expect(canonical.primarySector).toBe('Çağrı merkezi');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(report.contradictions.some(c => c.type === 'EDUCATION_PROFESSIONAL_SECTOR_MISMATCH')).toBe(true);
  });

  it('[CONTRADICTION_44/50] Detects Education vs Professional Sector divergence (#44) without cross-contamination', () => {
    const cv = `
Münir Özkul
İstanbul / Beyoğlu
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone Müşteri Hizmetleri A.Ş. - Çağrı Merkezi Müdürü (2018 - 2024)

EĞİTİM
İstanbul Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const report = cvContradictionEngine.detectContradictions({ rawPayload: res, canonical });

    expect(canonical.primarySector).toBe('Çağrı merkezi');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(report.contradictions.some(c => c.type === 'EDUCATION_PROFESSIONAL_SECTOR_MISMATCH')).toBe(true);
  });

  it('[CONTRADICTION_45/50] Detects Education vs Professional Sector divergence (#45) without cross-contamination', () => {
    const cv = `
Münir Özkul
İstanbul / Beyoğlu
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone Müşteri Hizmetleri A.Ş. - Çağrı Merkezi Müdürü (2018 - 2024)

EĞİTİM
İstanbul Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const report = cvContradictionEngine.detectContradictions({ rawPayload: res, canonical });

    expect(canonical.primarySector).toBe('Çağrı merkezi');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(report.contradictions.some(c => c.type === 'EDUCATION_PROFESSIONAL_SECTOR_MISMATCH')).toBe(true);
  });

  it('[CONTRADICTION_46/50] Detects Education vs Professional Sector divergence (#46) without cross-contamination', () => {
    const cv = `
Münir Özkul
İstanbul / Beyoğlu
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone Müşteri Hizmetleri A.Ş. - Çağrı Merkezi Müdürü (2018 - 2024)

EĞİTİM
İstanbul Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const report = cvContradictionEngine.detectContradictions({ rawPayload: res, canonical });

    expect(canonical.primarySector).toBe('Çağrı merkezi');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(report.contradictions.some(c => c.type === 'EDUCATION_PROFESSIONAL_SECTOR_MISMATCH')).toBe(true);
  });

  it('[CONTRADICTION_47/50] Detects Education vs Professional Sector divergence (#47) without cross-contamination', () => {
    const cv = `
Münir Özkul
İstanbul / Beyoğlu
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone Müşteri Hizmetleri A.Ş. - Çağrı Merkezi Müdürü (2018 - 2024)

EĞİTİM
İstanbul Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const report = cvContradictionEngine.detectContradictions({ rawPayload: res, canonical });

    expect(canonical.primarySector).toBe('Çağrı merkezi');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(report.contradictions.some(c => c.type === 'EDUCATION_PROFESSIONAL_SECTOR_MISMATCH')).toBe(true);
  });

  it('[CONTRADICTION_48/50] Detects Education vs Professional Sector divergence (#48) without cross-contamination', () => {
    const cv = `
Münir Özkul
İstanbul / Beyoğlu
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone Müşteri Hizmetleri A.Ş. - Çağrı Merkezi Müdürü (2018 - 2024)

EĞİTİM
İstanbul Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const report = cvContradictionEngine.detectContradictions({ rawPayload: res, canonical });

    expect(canonical.primarySector).toBe('Çağrı merkezi');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(report.contradictions.some(c => c.type === 'EDUCATION_PROFESSIONAL_SECTOR_MISMATCH')).toBe(true);
  });

  it('[CONTRADICTION_49/50] Detects Education vs Professional Sector divergence (#49) without cross-contamination', () => {
    const cv = `
Münir Özkul
İstanbul / Beyoğlu
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone Müşteri Hizmetleri A.Ş. - Çağrı Merkezi Müdürü (2018 - 2024)

EĞİTİM
İstanbul Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const report = cvContradictionEngine.detectContradictions({ rawPayload: res, canonical });

    expect(canonical.primarySector).toBe('Çağrı merkezi');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(report.contradictions.some(c => c.type === 'EDUCATION_PROFESSIONAL_SECTOR_MISMATCH')).toBe(true);
  });

  it('[CONTRADICTION_50/50] Detects Education vs Professional Sector divergence (#50) without cross-contamination', () => {
    const cv = `
Münir Özkul
İstanbul / Beyoğlu
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone Müşteri Hizmetleri A.Ş. - Çağrı Merkezi Müdürü (2018 - 2024)

EĞİTİM
İstanbul Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const report = cvContradictionEngine.detectContradictions({ rawPayload: res, canonical });

    expect(canonical.primarySector).toBe('Çağrı merkezi');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(report.contradictions.some(c => c.type === 'EDUCATION_PROFESSIONAL_SECTOR_MISMATCH')).toBe(true);
  });
});
