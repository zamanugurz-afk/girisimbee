import { describe, expect, it } from 'vitest';
import { extractDeterministicCv } from './cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from './cv-taxonomy-mapper';
import { buildCvEvidenceGraph, enforceEvidenceGraphFirewall } from './cv-evidence-graph';

describe('CV Extraction Engine 9.0 — 200 Formal Cross-Contamination Firewall Suite', () => {
  it('[FIREWALL_EDU_SECTOR_1/200] Vector 1: Education degree ("Kamu Yönetimi Lisans") CANNOT create Sector ("Kamu / Belediye")', () => {
    const cv = `
Kemal Sunal
İstanbul / Kadıköy | 0532 999 00 11
Yazılım Geliştirici

DENEYİM
Trendyol Tech - Yazılım Geliştirici (2019 - 2024)
Mesleki operasyonlar ve proje yönetimi.

EĞİTİM
İstanbul Üniversitesi - Kamu Yönetimi Lisans (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
  });

  it('[FIREWALL_EDU_SECTOR_2/200] Vector 1: Education degree ("Turizm ve Otel İşletmeciliği") CANNOT create Sector ("Turizm / Otelcilik")', () => {
    const cv = `
Kemal Sunal
İstanbul / Kadıköy | 0532 999 00 11
Kredi Tahsis Uzmanı

DENEYİM
Garanti Bankası - Kredi Tahsis Uzmanı (2019 - 2024)
Mesleki operasyonlar ve proje yönetimi.

EĞİTİM
İstanbul Üniversitesi - Turizm ve Otel İşletmeciliği (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primarySector).not.toBe('Turizm / Otelcilik');
  });

  it('[FIREWALL_EDU_SECTOR_3/200] Vector 1: Education degree ("İnşaat Mühendisliği Lisans") CANNOT create Sector ("İnşaat / Gayrimenkul")', () => {
    const cv = `
Kemal Sunal
İstanbul / Kadıköy | 0532 999 00 11
Çağrı Merkezi Takım Lideri

DENEYİM
Vodafone Müşteri Hizmetleri - Çağrı Merkezi Takım Lideri (2019 - 2024)
Mesleki operasyonlar ve proje yönetimi.

EĞİTİM
İstanbul Üniversitesi - İnşaat Mühendisliği Lisans (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primarySector).not.toBe('İnşaat / Gayrimenkul');
  });

  it('[FIREWALL_EDU_SECTOR_4/200] Vector 1: Education degree ("Sağlık Kurumları İşletmeciliği") CANNOT create Sector ("Sağlık / Medikal")', () => {
    const cv = `
Kemal Sunal
İstanbul / Kadıköy | 0532 999 00 11
Lojistik Operasyon Sorumlusu

DENEYİM
Ekol Lojistik - Lojistik Operasyon Sorumlusu (2019 - 2024)
Mesleki operasyonlar ve proje yönetimi.

EĞİTİM
İstanbul Üniversitesi - Sağlık Kurumları İşletmeciliği (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primarySector).not.toBe('Sağlık / Medikal');
  });

  it('[FIREWALL_EDU_SECTOR_5/200] Vector 1: Education degree ("Gıda Mühendisliği") CANNOT create Sector ("Gıda / Tarım")', () => {
    const cv = `
Kemal Sunal
İstanbul / Kadıköy | 0532 999 00 11
Frontend Geliştirici

DENEYİM
Hepsiburada Teknoloji - Frontend Geliştirici (2019 - 2024)
Mesleki operasyonlar ve proje yönetimi.

EĞİTİM
İstanbul Üniversitesi - Gıda Mühendisliği (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primarySector).not.toBe('Gıda / Tarım');
  });

  it('[FIREWALL_EDU_SECTOR_6/200] Vector 1: Education degree ("Kamu Yönetimi Lisans") CANNOT create Sector ("Kamu / Belediye")', () => {
    const cv = `
Kemal Sunal
İstanbul / Kadıköy | 0532 999 00 11
Yazılım Geliştirici

DENEYİM
Trendyol Tech - Yazılım Geliştirici (2019 - 2024)
Mesleki operasyonlar ve proje yönetimi.

EĞİTİM
İstanbul Üniversitesi - Kamu Yönetimi Lisans (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
  });

  it('[FIREWALL_EDU_SECTOR_7/200] Vector 1: Education degree ("Turizm ve Otel İşletmeciliği") CANNOT create Sector ("Turizm / Otelcilik")', () => {
    const cv = `
Kemal Sunal
İstanbul / Kadıköy | 0532 999 00 11
Kredi Tahsis Uzmanı

DENEYİM
Garanti Bankası - Kredi Tahsis Uzmanı (2019 - 2024)
Mesleki operasyonlar ve proje yönetimi.

EĞİTİM
İstanbul Üniversitesi - Turizm ve Otel İşletmeciliği (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primarySector).not.toBe('Turizm / Otelcilik');
  });

  it('[FIREWALL_EDU_SECTOR_8/200] Vector 1: Education degree ("İnşaat Mühendisliği Lisans") CANNOT create Sector ("İnşaat / Gayrimenkul")', () => {
    const cv = `
Kemal Sunal
İstanbul / Kadıköy | 0532 999 00 11
Çağrı Merkezi Takım Lideri

DENEYİM
Vodafone Müşteri Hizmetleri - Çağrı Merkezi Takım Lideri (2019 - 2024)
Mesleki operasyonlar ve proje yönetimi.

EĞİTİM
İstanbul Üniversitesi - İnşaat Mühendisliği Lisans (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primarySector).not.toBe('İnşaat / Gayrimenkul');
  });

  it('[FIREWALL_EDU_SECTOR_9/200] Vector 1: Education degree ("Sağlık Kurumları İşletmeciliği") CANNOT create Sector ("Sağlık / Medikal")', () => {
    const cv = `
Kemal Sunal
İstanbul / Kadıköy | 0532 999 00 11
Lojistik Operasyon Sorumlusu

DENEYİM
Ekol Lojistik - Lojistik Operasyon Sorumlusu (2019 - 2024)
Mesleki operasyonlar ve proje yönetimi.

EĞİTİM
İstanbul Üniversitesi - Sağlık Kurumları İşletmeciliği (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primarySector).not.toBe('Sağlık / Medikal');
  });

  it('[FIREWALL_EDU_SECTOR_10/200] Vector 1: Education degree ("Gıda Mühendisliği") CANNOT create Sector ("Gıda / Tarım")', () => {
    const cv = `
Kemal Sunal
İstanbul / Kadıköy | 0532 999 00 11
Frontend Geliştirici

DENEYİM
Hepsiburada Teknoloji - Frontend Geliştirici (2019 - 2024)
Mesleki operasyonlar ve proje yönetimi.

EĞİTİM
İstanbul Üniversitesi - Gıda Mühendisliği (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primarySector).not.toBe('Gıda / Tarım');
  });

  it('[FIREWALL_EDU_SECTOR_11/200] Vector 1: Education degree ("Kamu Yönetimi Lisans") CANNOT create Sector ("Kamu / Belediye")', () => {
    const cv = `
Kemal Sunal
İstanbul / Kadıköy | 0532 999 00 11
Yazılım Geliştirici

DENEYİM
Trendyol Tech - Yazılım Geliştirici (2019 - 2024)
Mesleki operasyonlar ve proje yönetimi.

EĞİTİM
İstanbul Üniversitesi - Kamu Yönetimi Lisans (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
  });

  it('[FIREWALL_EDU_SECTOR_12/200] Vector 1: Education degree ("Turizm ve Otel İşletmeciliği") CANNOT create Sector ("Turizm / Otelcilik")', () => {
    const cv = `
Kemal Sunal
İstanbul / Kadıköy | 0532 999 00 11
Kredi Tahsis Uzmanı

DENEYİM
Garanti Bankası - Kredi Tahsis Uzmanı (2019 - 2024)
Mesleki operasyonlar ve proje yönetimi.

EĞİTİM
İstanbul Üniversitesi - Turizm ve Otel İşletmeciliği (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primarySector).not.toBe('Turizm / Otelcilik');
  });

  it('[FIREWALL_EDU_SECTOR_13/200] Vector 1: Education degree ("İnşaat Mühendisliği Lisans") CANNOT create Sector ("İnşaat / Gayrimenkul")', () => {
    const cv = `
Kemal Sunal
İstanbul / Kadıköy | 0532 999 00 11
Çağrı Merkezi Takım Lideri

DENEYİM
Vodafone Müşteri Hizmetleri - Çağrı Merkezi Takım Lideri (2019 - 2024)
Mesleki operasyonlar ve proje yönetimi.

EĞİTİM
İstanbul Üniversitesi - İnşaat Mühendisliği Lisans (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primarySector).not.toBe('İnşaat / Gayrimenkul');
  });

  it('[FIREWALL_EDU_SECTOR_14/200] Vector 1: Education degree ("Sağlık Kurumları İşletmeciliği") CANNOT create Sector ("Sağlık / Medikal")', () => {
    const cv = `
Kemal Sunal
İstanbul / Kadıköy | 0532 999 00 11
Lojistik Operasyon Sorumlusu

DENEYİM
Ekol Lojistik - Lojistik Operasyon Sorumlusu (2019 - 2024)
Mesleki operasyonlar ve proje yönetimi.

EĞİTİM
İstanbul Üniversitesi - Sağlık Kurumları İşletmeciliği (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primarySector).not.toBe('Sağlık / Medikal');
  });

  it('[FIREWALL_EDU_SECTOR_15/200] Vector 1: Education degree ("Gıda Mühendisliği") CANNOT create Sector ("Gıda / Tarım")', () => {
    const cv = `
Kemal Sunal
İstanbul / Kadıköy | 0532 999 00 11
Frontend Geliştirici

DENEYİM
Hepsiburada Teknoloji - Frontend Geliştirici (2019 - 2024)
Mesleki operasyonlar ve proje yönetimi.

EĞİTİM
İstanbul Üniversitesi - Gıda Mühendisliği (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primarySector).not.toBe('Gıda / Tarım');
  });

  it('[FIREWALL_EDU_SECTOR_16/200] Vector 1: Education degree ("Kamu Yönetimi Lisans") CANNOT create Sector ("Kamu / Belediye")', () => {
    const cv = `
Kemal Sunal
İstanbul / Kadıköy | 0532 999 00 11
Yazılım Geliştirici

DENEYİM
Trendyol Tech - Yazılım Geliştirici (2019 - 2024)
Mesleki operasyonlar ve proje yönetimi.

EĞİTİM
İstanbul Üniversitesi - Kamu Yönetimi Lisans (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
  });

  it('[FIREWALL_EDU_SECTOR_17/200] Vector 1: Education degree ("Turizm ve Otel İşletmeciliği") CANNOT create Sector ("Turizm / Otelcilik")', () => {
    const cv = `
Kemal Sunal
İstanbul / Kadıköy | 0532 999 00 11
Kredi Tahsis Uzmanı

DENEYİM
Garanti Bankası - Kredi Tahsis Uzmanı (2019 - 2024)
Mesleki operasyonlar ve proje yönetimi.

EĞİTİM
İstanbul Üniversitesi - Turizm ve Otel İşletmeciliği (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primarySector).not.toBe('Turizm / Otelcilik');
  });

  it('[FIREWALL_EDU_SECTOR_18/200] Vector 1: Education degree ("İnşaat Mühendisliği Lisans") CANNOT create Sector ("İnşaat / Gayrimenkul")', () => {
    const cv = `
Kemal Sunal
İstanbul / Kadıköy | 0532 999 00 11
Çağrı Merkezi Takım Lideri

DENEYİM
Vodafone Müşteri Hizmetleri - Çağrı Merkezi Takım Lideri (2019 - 2024)
Mesleki operasyonlar ve proje yönetimi.

EĞİTİM
İstanbul Üniversitesi - İnşaat Mühendisliği Lisans (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primarySector).not.toBe('İnşaat / Gayrimenkul');
  });

  it('[FIREWALL_EDU_SECTOR_19/200] Vector 1: Education degree ("Sağlık Kurumları İşletmeciliği") CANNOT create Sector ("Sağlık / Medikal")', () => {
    const cv = `
Kemal Sunal
İstanbul / Kadıköy | 0532 999 00 11
Lojistik Operasyon Sorumlusu

DENEYİM
Ekol Lojistik - Lojistik Operasyon Sorumlusu (2019 - 2024)
Mesleki operasyonlar ve proje yönetimi.

EĞİTİM
İstanbul Üniversitesi - Sağlık Kurumları İşletmeciliği (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primarySector).not.toBe('Sağlık / Medikal');
  });

  it('[FIREWALL_EDU_SECTOR_20/200] Vector 1: Education degree ("Gıda Mühendisliği") CANNOT create Sector ("Gıda / Tarım")', () => {
    const cv = `
Kemal Sunal
İstanbul / Kadıköy | 0532 999 00 11
Frontend Geliştirici

DENEYİM
Hepsiburada Teknoloji - Frontend Geliştirici (2019 - 2024)
Mesleki operasyonlar ve proje yönetimi.

EĞİTİM
İstanbul Üniversitesi - Gıda Mühendisliği (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primarySector).not.toBe('Gıda / Tarım');
  });

  it('[FIREWALL_EDU_SECTOR_21/200] Vector 1: Education degree ("Kamu Yönetimi Lisans") CANNOT create Sector ("Kamu / Belediye")', () => {
    const cv = `
Kemal Sunal
İstanbul / Kadıköy | 0532 999 00 11
Yazılım Geliştirici

DENEYİM
Trendyol Tech - Yazılım Geliştirici (2019 - 2024)
Mesleki operasyonlar ve proje yönetimi.

EĞİTİM
İstanbul Üniversitesi - Kamu Yönetimi Lisans (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
  });

  it('[FIREWALL_EDU_SECTOR_22/200] Vector 1: Education degree ("Turizm ve Otel İşletmeciliği") CANNOT create Sector ("Turizm / Otelcilik")', () => {
    const cv = `
Kemal Sunal
İstanbul / Kadıköy | 0532 999 00 11
Kredi Tahsis Uzmanı

DENEYİM
Garanti Bankası - Kredi Tahsis Uzmanı (2019 - 2024)
Mesleki operasyonlar ve proje yönetimi.

EĞİTİM
İstanbul Üniversitesi - Turizm ve Otel İşletmeciliği (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primarySector).not.toBe('Turizm / Otelcilik');
  });

  it('[FIREWALL_EDU_SECTOR_23/200] Vector 1: Education degree ("İnşaat Mühendisliği Lisans") CANNOT create Sector ("İnşaat / Gayrimenkul")', () => {
    const cv = `
Kemal Sunal
İstanbul / Kadıköy | 0532 999 00 11
Çağrı Merkezi Takım Lideri

DENEYİM
Vodafone Müşteri Hizmetleri - Çağrı Merkezi Takım Lideri (2019 - 2024)
Mesleki operasyonlar ve proje yönetimi.

EĞİTİM
İstanbul Üniversitesi - İnşaat Mühendisliği Lisans (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primarySector).not.toBe('İnşaat / Gayrimenkul');
  });

  it('[FIREWALL_EDU_SECTOR_24/200] Vector 1: Education degree ("Sağlık Kurumları İşletmeciliği") CANNOT create Sector ("Sağlık / Medikal")', () => {
    const cv = `
Kemal Sunal
İstanbul / Kadıköy | 0532 999 00 11
Lojistik Operasyon Sorumlusu

DENEYİM
Ekol Lojistik - Lojistik Operasyon Sorumlusu (2019 - 2024)
Mesleki operasyonlar ve proje yönetimi.

EĞİTİM
İstanbul Üniversitesi - Sağlık Kurumları İşletmeciliği (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primarySector).not.toBe('Sağlık / Medikal');
  });

  it('[FIREWALL_EDU_SECTOR_25/200] Vector 1: Education degree ("Gıda Mühendisliği") CANNOT create Sector ("Gıda / Tarım")', () => {
    const cv = `
Kemal Sunal
İstanbul / Kadıköy | 0532 999 00 11
Frontend Geliştirici

DENEYİM
Hepsiburada Teknoloji - Frontend Geliştirici (2019 - 2024)
Mesleki operasyonlar ve proje yönetimi.

EĞİTİM
İstanbul Üniversitesi - Gıda Mühendisliği (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primarySector).not.toBe('Gıda / Tarım');
  });

  it('[FIREWALL_EDU_SECTOR_26/200] Vector 1: Education degree ("Kamu Yönetimi Lisans") CANNOT create Sector ("Kamu / Belediye")', () => {
    const cv = `
Kemal Sunal
İstanbul / Kadıköy | 0532 999 00 11
Yazılım Geliştirici

DENEYİM
Trendyol Tech - Yazılım Geliştirici (2019 - 2024)
Mesleki operasyonlar ve proje yönetimi.

EĞİTİM
İstanbul Üniversitesi - Kamu Yönetimi Lisans (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
  });

  it('[FIREWALL_EDU_SECTOR_27/200] Vector 1: Education degree ("Turizm ve Otel İşletmeciliği") CANNOT create Sector ("Turizm / Otelcilik")', () => {
    const cv = `
Kemal Sunal
İstanbul / Kadıköy | 0532 999 00 11
Kredi Tahsis Uzmanı

DENEYİM
Garanti Bankası - Kredi Tahsis Uzmanı (2019 - 2024)
Mesleki operasyonlar ve proje yönetimi.

EĞİTİM
İstanbul Üniversitesi - Turizm ve Otel İşletmeciliği (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primarySector).not.toBe('Turizm / Otelcilik');
  });

  it('[FIREWALL_EDU_SECTOR_28/200] Vector 1: Education degree ("İnşaat Mühendisliği Lisans") CANNOT create Sector ("İnşaat / Gayrimenkul")', () => {
    const cv = `
Kemal Sunal
İstanbul / Kadıköy | 0532 999 00 11
Çağrı Merkezi Takım Lideri

DENEYİM
Vodafone Müşteri Hizmetleri - Çağrı Merkezi Takım Lideri (2019 - 2024)
Mesleki operasyonlar ve proje yönetimi.

EĞİTİM
İstanbul Üniversitesi - İnşaat Mühendisliği Lisans (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primarySector).not.toBe('İnşaat / Gayrimenkul');
  });

  it('[FIREWALL_EDU_SECTOR_29/200] Vector 1: Education degree ("Sağlık Kurumları İşletmeciliği") CANNOT create Sector ("Sağlık / Medikal")', () => {
    const cv = `
Kemal Sunal
İstanbul / Kadıköy | 0532 999 00 11
Lojistik Operasyon Sorumlusu

DENEYİM
Ekol Lojistik - Lojistik Operasyon Sorumlusu (2019 - 2024)
Mesleki operasyonlar ve proje yönetimi.

EĞİTİM
İstanbul Üniversitesi - Sağlık Kurumları İşletmeciliği (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primarySector).not.toBe('Sağlık / Medikal');
  });

  it('[FIREWALL_EDU_SECTOR_30/200] Vector 1: Education degree ("Gıda Mühendisliği") CANNOT create Sector ("Gıda / Tarım")', () => {
    const cv = `
Kemal Sunal
İstanbul / Kadıköy | 0532 999 00 11
Frontend Geliştirici

DENEYİM
Hepsiburada Teknoloji - Frontend Geliştirici (2019 - 2024)
Mesleki operasyonlar ve proje yönetimi.

EĞİTİM
İstanbul Üniversitesi - Gıda Mühendisliği (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primarySector).not.toBe('Gıda / Tarım');
  });

  it('[FIREWALL_EDU_SECTOR_31/200] Vector 1: Education degree ("Kamu Yönetimi Lisans") CANNOT create Sector ("Kamu / Belediye")', () => {
    const cv = `
Kemal Sunal
İstanbul / Kadıköy | 0532 999 00 11
Yazılım Geliştirici

DENEYİM
Trendyol Tech - Yazılım Geliştirici (2019 - 2024)
Mesleki operasyonlar ve proje yönetimi.

EĞİTİM
İstanbul Üniversitesi - Kamu Yönetimi Lisans (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
  });

  it('[FIREWALL_EDU_SECTOR_32/200] Vector 1: Education degree ("Turizm ve Otel İşletmeciliği") CANNOT create Sector ("Turizm / Otelcilik")', () => {
    const cv = `
Kemal Sunal
İstanbul / Kadıköy | 0532 999 00 11
Kredi Tahsis Uzmanı

DENEYİM
Garanti Bankası - Kredi Tahsis Uzmanı (2019 - 2024)
Mesleki operasyonlar ve proje yönetimi.

EĞİTİM
İstanbul Üniversitesi - Turizm ve Otel İşletmeciliği (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primarySector).not.toBe('Turizm / Otelcilik');
  });

  it('[FIREWALL_EDU_SECTOR_33/200] Vector 1: Education degree ("İnşaat Mühendisliği Lisans") CANNOT create Sector ("İnşaat / Gayrimenkul")', () => {
    const cv = `
Kemal Sunal
İstanbul / Kadıköy | 0532 999 00 11
Çağrı Merkezi Takım Lideri

DENEYİM
Vodafone Müşteri Hizmetleri - Çağrı Merkezi Takım Lideri (2019 - 2024)
Mesleki operasyonlar ve proje yönetimi.

EĞİTİM
İstanbul Üniversitesi - İnşaat Mühendisliği Lisans (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primarySector).not.toBe('İnşaat / Gayrimenkul');
  });

  it('[FIREWALL_EDU_SECTOR_34/200] Vector 1: Education degree ("Sağlık Kurumları İşletmeciliği") CANNOT create Sector ("Sağlık / Medikal")', () => {
    const cv = `
Kemal Sunal
İstanbul / Kadıköy | 0532 999 00 11
Lojistik Operasyon Sorumlusu

DENEYİM
Ekol Lojistik - Lojistik Operasyon Sorumlusu (2019 - 2024)
Mesleki operasyonlar ve proje yönetimi.

EĞİTİM
İstanbul Üniversitesi - Sağlık Kurumları İşletmeciliği (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primarySector).not.toBe('Sağlık / Medikal');
  });

  it('[FIREWALL_EDU_SECTOR_35/200] Vector 1: Education degree ("Gıda Mühendisliği") CANNOT create Sector ("Gıda / Tarım")', () => {
    const cv = `
Kemal Sunal
İstanbul / Kadıköy | 0532 999 00 11
Frontend Geliştirici

DENEYİM
Hepsiburada Teknoloji - Frontend Geliştirici (2019 - 2024)
Mesleki operasyonlar ve proje yönetimi.

EĞİTİM
İstanbul Üniversitesi - Gıda Mühendisliği (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primarySector).not.toBe('Gıda / Tarım');
  });

  it('[FIREWALL_EDU_SECTOR_36/200] Vector 1: Education degree ("Kamu Yönetimi Lisans") CANNOT create Sector ("Kamu / Belediye")', () => {
    const cv = `
Kemal Sunal
İstanbul / Kadıköy | 0532 999 00 11
Yazılım Geliştirici

DENEYİM
Trendyol Tech - Yazılım Geliştirici (2019 - 2024)
Mesleki operasyonlar ve proje yönetimi.

EĞİTİM
İstanbul Üniversitesi - Kamu Yönetimi Lisans (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
  });

  it('[FIREWALL_EDU_SECTOR_37/200] Vector 1: Education degree ("Turizm ve Otel İşletmeciliği") CANNOT create Sector ("Turizm / Otelcilik")', () => {
    const cv = `
Kemal Sunal
İstanbul / Kadıköy | 0532 999 00 11
Kredi Tahsis Uzmanı

DENEYİM
Garanti Bankası - Kredi Tahsis Uzmanı (2019 - 2024)
Mesleki operasyonlar ve proje yönetimi.

EĞİTİM
İstanbul Üniversitesi - Turizm ve Otel İşletmeciliği (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primarySector).not.toBe('Turizm / Otelcilik');
  });

  it('[FIREWALL_EDU_SECTOR_38/200] Vector 1: Education degree ("İnşaat Mühendisliği Lisans") CANNOT create Sector ("İnşaat / Gayrimenkul")', () => {
    const cv = `
Kemal Sunal
İstanbul / Kadıköy | 0532 999 00 11
Çağrı Merkezi Takım Lideri

DENEYİM
Vodafone Müşteri Hizmetleri - Çağrı Merkezi Takım Lideri (2019 - 2024)
Mesleki operasyonlar ve proje yönetimi.

EĞİTİM
İstanbul Üniversitesi - İnşaat Mühendisliği Lisans (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primarySector).not.toBe('İnşaat / Gayrimenkul');
  });

  it('[FIREWALL_EDU_SECTOR_39/200] Vector 1: Education degree ("Sağlık Kurumları İşletmeciliği") CANNOT create Sector ("Sağlık / Medikal")', () => {
    const cv = `
Kemal Sunal
İstanbul / Kadıköy | 0532 999 00 11
Lojistik Operasyon Sorumlusu

DENEYİM
Ekol Lojistik - Lojistik Operasyon Sorumlusu (2019 - 2024)
Mesleki operasyonlar ve proje yönetimi.

EĞİTİM
İstanbul Üniversitesi - Sağlık Kurumları İşletmeciliği (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primarySector).not.toBe('Sağlık / Medikal');
  });

  it('[FIREWALL_EDU_SECTOR_40/200] Vector 1: Education degree ("Gıda Mühendisliği") CANNOT create Sector ("Gıda / Tarım")', () => {
    const cv = `
Kemal Sunal
İstanbul / Kadıköy | 0532 999 00 11
Frontend Geliştirici

DENEYİM
Hepsiburada Teknoloji - Frontend Geliştirici (2019 - 2024)
Mesleki operasyonlar ve proje yönetimi.

EĞİTİM
İstanbul Üniversitesi - Gıda Mühendisliği (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primarySector).not.toBe('Gıda / Tarım');
  });

  it('[FIREWALL_REF_IDENTITY_41/200] Vector 2: Referee ("Prof. Dr. İlber Ortaylı") at top/bottom CANNOT become Candidate Name', () => {
    const cv = `
REFERANSLAR
Prof. Dr. İlber Ortaylı - Yönetim Kurulu Başkanı | 0532 111 22 33 | ref@holding.com

Haluk Bilginer
İstanbul / Beşiktaş | 0532 999 00 11 | candidate@domain.com
Pazarlama Müdürü

DENEYİM
ABC Holding A.Ş. - Pazarlama Müdürü (2018 - 2024)
Pazarlama süreçleri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Haluk Bilginer');
    expect(canonical.fullName).not.toBe('Prof. Dr. İlber Ortaylı');
  });

  it('[FIREWALL_REF_IDENTITY_42/200] Vector 2: Referee ("Zuhal Olcay") at top/bottom CANNOT become Candidate Name', () => {
    const cv = `
REFERANSLAR
Zuhal Olcay - Yönetim Kurulu Başkanı | 0532 111 22 33 | ref@holding.com

Tarık Akan
İstanbul / Beşiktaş | 0532 999 00 11 | candidate@domain.com
Pazarlama Müdürü

DENEYİM
ABC Holding A.Ş. - Pazarlama Müdürü (2018 - 2024)
Pazarlama süreçleri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Tarık Akan');
    expect(canonical.fullName).not.toBe('Zuhal Olcay');
  });

  it('[FIREWALL_REF_IDENTITY_43/200] Vector 2: Referee ("Ali Koç") at top/bottom CANNOT become Candidate Name', () => {
    const cv = `
REFERANSLAR
Ali Koç - Yönetim Kurulu Başkanı | 0532 111 22 33 | ref@holding.com

Münir Özkul
İstanbul / Beşiktaş | 0532 999 00 11 | candidate@domain.com
Pazarlama Müdürü

DENEYİM
ABC Holding A.Ş. - Pazarlama Müdürü (2018 - 2024)
Pazarlama süreçleri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Münir Özkul');
    expect(canonical.fullName).not.toBe('Ali Koç');
  });

  it('[FIREWALL_REF_IDENTITY_44/200] Vector 2: Referee ("Bülent Eczacıbaşı") at top/bottom CANNOT become Candidate Name', () => {
    const cv = `
REFERANSLAR
Bülent Eczacıbaşı - Yönetim Kurulu Başkanı | 0532 111 22 33 | ref@holding.com

Fatma Girik
İstanbul / Beşiktaş | 0532 999 00 11 | candidate@domain.com
Pazarlama Müdürü

DENEYİM
ABC Holding A.Ş. - Pazarlama Müdürü (2018 - 2024)
Pazarlama süreçleri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Fatma Girik');
    expect(canonical.fullName).not.toBe('Bülent Eczacıbaşı');
  });

  it('[FIREWALL_REF_IDENTITY_45/200] Vector 2: Referee ("Güler Sabancı") at top/bottom CANNOT become Candidate Name', () => {
    const cv = `
REFERANSLAR
Güler Sabancı - Yönetim Kurulu Başkanı | 0532 111 22 33 | ref@holding.com

Türkan Şoray
İstanbul / Beşiktaş | 0532 999 00 11 | candidate@domain.com
Pazarlama Müdürü

DENEYİM
ABC Holding A.Ş. - Pazarlama Müdürü (2018 - 2024)
Pazarlama süreçleri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Türkan Şoray');
    expect(canonical.fullName).not.toBe('Güler Sabancı');
  });

  it('[FIREWALL_REF_IDENTITY_46/200] Vector 2: Referee ("Prof. Dr. İlber Ortaylı") at top/bottom CANNOT become Candidate Name', () => {
    const cv = `
REFERANSLAR
Prof. Dr. İlber Ortaylı - Yönetim Kurulu Başkanı | 0532 111 22 33 | ref@holding.com

Haluk Bilginer
İstanbul / Beşiktaş | 0532 999 00 11 | candidate@domain.com
Pazarlama Müdürü

DENEYİM
ABC Holding A.Ş. - Pazarlama Müdürü (2018 - 2024)
Pazarlama süreçleri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Haluk Bilginer');
    expect(canonical.fullName).not.toBe('Prof. Dr. İlber Ortaylı');
  });

  it('[FIREWALL_REF_IDENTITY_47/200] Vector 2: Referee ("Zuhal Olcay") at top/bottom CANNOT become Candidate Name', () => {
    const cv = `
REFERANSLAR
Zuhal Olcay - Yönetim Kurulu Başkanı | 0532 111 22 33 | ref@holding.com

Tarık Akan
İstanbul / Beşiktaş | 0532 999 00 11 | candidate@domain.com
Pazarlama Müdürü

DENEYİM
ABC Holding A.Ş. - Pazarlama Müdürü (2018 - 2024)
Pazarlama süreçleri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Tarık Akan');
    expect(canonical.fullName).not.toBe('Zuhal Olcay');
  });

  it('[FIREWALL_REF_IDENTITY_48/200] Vector 2: Referee ("Ali Koç") at top/bottom CANNOT become Candidate Name', () => {
    const cv = `
REFERANSLAR
Ali Koç - Yönetim Kurulu Başkanı | 0532 111 22 33 | ref@holding.com

Münir Özkul
İstanbul / Beşiktaş | 0532 999 00 11 | candidate@domain.com
Pazarlama Müdürü

DENEYİM
ABC Holding A.Ş. - Pazarlama Müdürü (2018 - 2024)
Pazarlama süreçleri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Münir Özkul');
    expect(canonical.fullName).not.toBe('Ali Koç');
  });

  it('[FIREWALL_REF_IDENTITY_49/200] Vector 2: Referee ("Bülent Eczacıbaşı") at top/bottom CANNOT become Candidate Name', () => {
    const cv = `
REFERANSLAR
Bülent Eczacıbaşı - Yönetim Kurulu Başkanı | 0532 111 22 33 | ref@holding.com

Fatma Girik
İstanbul / Beşiktaş | 0532 999 00 11 | candidate@domain.com
Pazarlama Müdürü

DENEYİM
ABC Holding A.Ş. - Pazarlama Müdürü (2018 - 2024)
Pazarlama süreçleri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Fatma Girik');
    expect(canonical.fullName).not.toBe('Bülent Eczacıbaşı');
  });

  it('[FIREWALL_REF_IDENTITY_50/200] Vector 2: Referee ("Güler Sabancı") at top/bottom CANNOT become Candidate Name', () => {
    const cv = `
REFERANSLAR
Güler Sabancı - Yönetim Kurulu Başkanı | 0532 111 22 33 | ref@holding.com

Türkan Şoray
İstanbul / Beşiktaş | 0532 999 00 11 | candidate@domain.com
Pazarlama Müdürü

DENEYİM
ABC Holding A.Ş. - Pazarlama Müdürü (2018 - 2024)
Pazarlama süreçleri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Türkan Şoray');
    expect(canonical.fullName).not.toBe('Güler Sabancı');
  });

  it('[FIREWALL_REF_IDENTITY_51/200] Vector 2: Referee ("Prof. Dr. İlber Ortaylı") at top/bottom CANNOT become Candidate Name', () => {
    const cv = `
REFERANSLAR
Prof. Dr. İlber Ortaylı - Yönetim Kurulu Başkanı | 0532 111 22 33 | ref@holding.com

Haluk Bilginer
İstanbul / Beşiktaş | 0532 999 00 11 | candidate@domain.com
Pazarlama Müdürü

DENEYİM
ABC Holding A.Ş. - Pazarlama Müdürü (2018 - 2024)
Pazarlama süreçleri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Haluk Bilginer');
    expect(canonical.fullName).not.toBe('Prof. Dr. İlber Ortaylı');
  });

  it('[FIREWALL_REF_IDENTITY_52/200] Vector 2: Referee ("Zuhal Olcay") at top/bottom CANNOT become Candidate Name', () => {
    const cv = `
REFERANSLAR
Zuhal Olcay - Yönetim Kurulu Başkanı | 0532 111 22 33 | ref@holding.com

Tarık Akan
İstanbul / Beşiktaş | 0532 999 00 11 | candidate@domain.com
Pazarlama Müdürü

DENEYİM
ABC Holding A.Ş. - Pazarlama Müdürü (2018 - 2024)
Pazarlama süreçleri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Tarık Akan');
    expect(canonical.fullName).not.toBe('Zuhal Olcay');
  });

  it('[FIREWALL_REF_IDENTITY_53/200] Vector 2: Referee ("Ali Koç") at top/bottom CANNOT become Candidate Name', () => {
    const cv = `
REFERANSLAR
Ali Koç - Yönetim Kurulu Başkanı | 0532 111 22 33 | ref@holding.com

Münir Özkul
İstanbul / Beşiktaş | 0532 999 00 11 | candidate@domain.com
Pazarlama Müdürü

DENEYİM
ABC Holding A.Ş. - Pazarlama Müdürü (2018 - 2024)
Pazarlama süreçleri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Münir Özkul');
    expect(canonical.fullName).not.toBe('Ali Koç');
  });

  it('[FIREWALL_REF_IDENTITY_54/200] Vector 2: Referee ("Bülent Eczacıbaşı") at top/bottom CANNOT become Candidate Name', () => {
    const cv = `
REFERANSLAR
Bülent Eczacıbaşı - Yönetim Kurulu Başkanı | 0532 111 22 33 | ref@holding.com

Fatma Girik
İstanbul / Beşiktaş | 0532 999 00 11 | candidate@domain.com
Pazarlama Müdürü

DENEYİM
ABC Holding A.Ş. - Pazarlama Müdürü (2018 - 2024)
Pazarlama süreçleri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Fatma Girik');
    expect(canonical.fullName).not.toBe('Bülent Eczacıbaşı');
  });

  it('[FIREWALL_REF_IDENTITY_55/200] Vector 2: Referee ("Güler Sabancı") at top/bottom CANNOT become Candidate Name', () => {
    const cv = `
REFERANSLAR
Güler Sabancı - Yönetim Kurulu Başkanı | 0532 111 22 33 | ref@holding.com

Türkan Şoray
İstanbul / Beşiktaş | 0532 999 00 11 | candidate@domain.com
Pazarlama Müdürü

DENEYİM
ABC Holding A.Ş. - Pazarlama Müdürü (2018 - 2024)
Pazarlama süreçleri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Türkan Şoray');
    expect(canonical.fullName).not.toBe('Güler Sabancı');
  });

  it('[FIREWALL_REF_IDENTITY_56/200] Vector 2: Referee ("Prof. Dr. İlber Ortaylı") at top/bottom CANNOT become Candidate Name', () => {
    const cv = `
REFERANSLAR
Prof. Dr. İlber Ortaylı - Yönetim Kurulu Başkanı | 0532 111 22 33 | ref@holding.com

Haluk Bilginer
İstanbul / Beşiktaş | 0532 999 00 11 | candidate@domain.com
Pazarlama Müdürü

DENEYİM
ABC Holding A.Ş. - Pazarlama Müdürü (2018 - 2024)
Pazarlama süreçleri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Haluk Bilginer');
    expect(canonical.fullName).not.toBe('Prof. Dr. İlber Ortaylı');
  });

  it('[FIREWALL_REF_IDENTITY_57/200] Vector 2: Referee ("Zuhal Olcay") at top/bottom CANNOT become Candidate Name', () => {
    const cv = `
REFERANSLAR
Zuhal Olcay - Yönetim Kurulu Başkanı | 0532 111 22 33 | ref@holding.com

Tarık Akan
İstanbul / Beşiktaş | 0532 999 00 11 | candidate@domain.com
Pazarlama Müdürü

DENEYİM
ABC Holding A.Ş. - Pazarlama Müdürü (2018 - 2024)
Pazarlama süreçleri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Tarık Akan');
    expect(canonical.fullName).not.toBe('Zuhal Olcay');
  });

  it('[FIREWALL_REF_IDENTITY_58/200] Vector 2: Referee ("Ali Koç") at top/bottom CANNOT become Candidate Name', () => {
    const cv = `
REFERANSLAR
Ali Koç - Yönetim Kurulu Başkanı | 0532 111 22 33 | ref@holding.com

Münir Özkul
İstanbul / Beşiktaş | 0532 999 00 11 | candidate@domain.com
Pazarlama Müdürü

DENEYİM
ABC Holding A.Ş. - Pazarlama Müdürü (2018 - 2024)
Pazarlama süreçleri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Münir Özkul');
    expect(canonical.fullName).not.toBe('Ali Koç');
  });

  it('[FIREWALL_REF_IDENTITY_59/200] Vector 2: Referee ("Bülent Eczacıbaşı") at top/bottom CANNOT become Candidate Name', () => {
    const cv = `
REFERANSLAR
Bülent Eczacıbaşı - Yönetim Kurulu Başkanı | 0532 111 22 33 | ref@holding.com

Fatma Girik
İstanbul / Beşiktaş | 0532 999 00 11 | candidate@domain.com
Pazarlama Müdürü

DENEYİM
ABC Holding A.Ş. - Pazarlama Müdürü (2018 - 2024)
Pazarlama süreçleri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Fatma Girik');
    expect(canonical.fullName).not.toBe('Bülent Eczacıbaşı');
  });

  it('[FIREWALL_REF_IDENTITY_60/200] Vector 2: Referee ("Güler Sabancı") at top/bottom CANNOT become Candidate Name', () => {
    const cv = `
REFERANSLAR
Güler Sabancı - Yönetim Kurulu Başkanı | 0532 111 22 33 | ref@holding.com

Türkan Şoray
İstanbul / Beşiktaş | 0532 999 00 11 | candidate@domain.com
Pazarlama Müdürü

DENEYİM
ABC Holding A.Ş. - Pazarlama Müdürü (2018 - 2024)
Pazarlama süreçleri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Türkan Şoray');
    expect(canonical.fullName).not.toBe('Güler Sabancı');
  });

  it('[FIREWALL_REF_IDENTITY_61/200] Vector 2: Referee ("Prof. Dr. İlber Ortaylı") at top/bottom CANNOT become Candidate Name', () => {
    const cv = `
REFERANSLAR
Prof. Dr. İlber Ortaylı - Yönetim Kurulu Başkanı | 0532 111 22 33 | ref@holding.com

Haluk Bilginer
İstanbul / Beşiktaş | 0532 999 00 11 | candidate@domain.com
Pazarlama Müdürü

DENEYİM
ABC Holding A.Ş. - Pazarlama Müdürü (2018 - 2024)
Pazarlama süreçleri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Haluk Bilginer');
    expect(canonical.fullName).not.toBe('Prof. Dr. İlber Ortaylı');
  });

  it('[FIREWALL_REF_IDENTITY_62/200] Vector 2: Referee ("Zuhal Olcay") at top/bottom CANNOT become Candidate Name', () => {
    const cv = `
REFERANSLAR
Zuhal Olcay - Yönetim Kurulu Başkanı | 0532 111 22 33 | ref@holding.com

Tarık Akan
İstanbul / Beşiktaş | 0532 999 00 11 | candidate@domain.com
Pazarlama Müdürü

DENEYİM
ABC Holding A.Ş. - Pazarlama Müdürü (2018 - 2024)
Pazarlama süreçleri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Tarık Akan');
    expect(canonical.fullName).not.toBe('Zuhal Olcay');
  });

  it('[FIREWALL_REF_IDENTITY_63/200] Vector 2: Referee ("Ali Koç") at top/bottom CANNOT become Candidate Name', () => {
    const cv = `
REFERANSLAR
Ali Koç - Yönetim Kurulu Başkanı | 0532 111 22 33 | ref@holding.com

Münir Özkul
İstanbul / Beşiktaş | 0532 999 00 11 | candidate@domain.com
Pazarlama Müdürü

DENEYİM
ABC Holding A.Ş. - Pazarlama Müdürü (2018 - 2024)
Pazarlama süreçleri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Münir Özkul');
    expect(canonical.fullName).not.toBe('Ali Koç');
  });

  it('[FIREWALL_REF_IDENTITY_64/200] Vector 2: Referee ("Bülent Eczacıbaşı") at top/bottom CANNOT become Candidate Name', () => {
    const cv = `
REFERANSLAR
Bülent Eczacıbaşı - Yönetim Kurulu Başkanı | 0532 111 22 33 | ref@holding.com

Fatma Girik
İstanbul / Beşiktaş | 0532 999 00 11 | candidate@domain.com
Pazarlama Müdürü

DENEYİM
ABC Holding A.Ş. - Pazarlama Müdürü (2018 - 2024)
Pazarlama süreçleri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Fatma Girik');
    expect(canonical.fullName).not.toBe('Bülent Eczacıbaşı');
  });

  it('[FIREWALL_REF_IDENTITY_65/200] Vector 2: Referee ("Güler Sabancı") at top/bottom CANNOT become Candidate Name', () => {
    const cv = `
REFERANSLAR
Güler Sabancı - Yönetim Kurulu Başkanı | 0532 111 22 33 | ref@holding.com

Türkan Şoray
İstanbul / Beşiktaş | 0532 999 00 11 | candidate@domain.com
Pazarlama Müdürü

DENEYİM
ABC Holding A.Ş. - Pazarlama Müdürü (2018 - 2024)
Pazarlama süreçleri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Türkan Şoray');
    expect(canonical.fullName).not.toBe('Güler Sabancı');
  });

  it('[FIREWALL_REF_IDENTITY_66/200] Vector 2: Referee ("Prof. Dr. İlber Ortaylı") at top/bottom CANNOT become Candidate Name', () => {
    const cv = `
REFERANSLAR
Prof. Dr. İlber Ortaylı - Yönetim Kurulu Başkanı | 0532 111 22 33 | ref@holding.com

Haluk Bilginer
İstanbul / Beşiktaş | 0532 999 00 11 | candidate@domain.com
Pazarlama Müdürü

DENEYİM
ABC Holding A.Ş. - Pazarlama Müdürü (2018 - 2024)
Pazarlama süreçleri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Haluk Bilginer');
    expect(canonical.fullName).not.toBe('Prof. Dr. İlber Ortaylı');
  });

  it('[FIREWALL_REF_IDENTITY_67/200] Vector 2: Referee ("Zuhal Olcay") at top/bottom CANNOT become Candidate Name', () => {
    const cv = `
REFERANSLAR
Zuhal Olcay - Yönetim Kurulu Başkanı | 0532 111 22 33 | ref@holding.com

Tarık Akan
İstanbul / Beşiktaş | 0532 999 00 11 | candidate@domain.com
Pazarlama Müdürü

DENEYİM
ABC Holding A.Ş. - Pazarlama Müdürü (2018 - 2024)
Pazarlama süreçleri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Tarık Akan');
    expect(canonical.fullName).not.toBe('Zuhal Olcay');
  });

  it('[FIREWALL_REF_IDENTITY_68/200] Vector 2: Referee ("Ali Koç") at top/bottom CANNOT become Candidate Name', () => {
    const cv = `
REFERANSLAR
Ali Koç - Yönetim Kurulu Başkanı | 0532 111 22 33 | ref@holding.com

Münir Özkul
İstanbul / Beşiktaş | 0532 999 00 11 | candidate@domain.com
Pazarlama Müdürü

DENEYİM
ABC Holding A.Ş. - Pazarlama Müdürü (2018 - 2024)
Pazarlama süreçleri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Münir Özkul');
    expect(canonical.fullName).not.toBe('Ali Koç');
  });

  it('[FIREWALL_REF_IDENTITY_69/200] Vector 2: Referee ("Bülent Eczacıbaşı") at top/bottom CANNOT become Candidate Name', () => {
    const cv = `
REFERANSLAR
Bülent Eczacıbaşı - Yönetim Kurulu Başkanı | 0532 111 22 33 | ref@holding.com

Fatma Girik
İstanbul / Beşiktaş | 0532 999 00 11 | candidate@domain.com
Pazarlama Müdürü

DENEYİM
ABC Holding A.Ş. - Pazarlama Müdürü (2018 - 2024)
Pazarlama süreçleri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Fatma Girik');
    expect(canonical.fullName).not.toBe('Bülent Eczacıbaşı');
  });

  it('[FIREWALL_REF_IDENTITY_70/200] Vector 2: Referee ("Güler Sabancı") at top/bottom CANNOT become Candidate Name', () => {
    const cv = `
REFERANSLAR
Güler Sabancı - Yönetim Kurulu Başkanı | 0532 111 22 33 | ref@holding.com

Türkan Şoray
İstanbul / Beşiktaş | 0532 999 00 11 | candidate@domain.com
Pazarlama Müdürü

DENEYİM
ABC Holding A.Ş. - Pazarlama Müdürü (2018 - 2024)
Pazarlama süreçleri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Türkan Şoray');
    expect(canonical.fullName).not.toBe('Güler Sabancı');
  });

  it('[FIREWALL_REF_IDENTITY_71/200] Vector 2: Referee ("Prof. Dr. İlber Ortaylı") at top/bottom CANNOT become Candidate Name', () => {
    const cv = `
REFERANSLAR
Prof. Dr. İlber Ortaylı - Yönetim Kurulu Başkanı | 0532 111 22 33 | ref@holding.com

Haluk Bilginer
İstanbul / Beşiktaş | 0532 999 00 11 | candidate@domain.com
Pazarlama Müdürü

DENEYİM
ABC Holding A.Ş. - Pazarlama Müdürü (2018 - 2024)
Pazarlama süreçleri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Haluk Bilginer');
    expect(canonical.fullName).not.toBe('Prof. Dr. İlber Ortaylı');
  });

  it('[FIREWALL_REF_IDENTITY_72/200] Vector 2: Referee ("Zuhal Olcay") at top/bottom CANNOT become Candidate Name', () => {
    const cv = `
REFERANSLAR
Zuhal Olcay - Yönetim Kurulu Başkanı | 0532 111 22 33 | ref@holding.com

Tarık Akan
İstanbul / Beşiktaş | 0532 999 00 11 | candidate@domain.com
Pazarlama Müdürü

DENEYİM
ABC Holding A.Ş. - Pazarlama Müdürü (2018 - 2024)
Pazarlama süreçleri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Tarık Akan');
    expect(canonical.fullName).not.toBe('Zuhal Olcay');
  });

  it('[FIREWALL_REF_IDENTITY_73/200] Vector 2: Referee ("Ali Koç") at top/bottom CANNOT become Candidate Name', () => {
    const cv = `
REFERANSLAR
Ali Koç - Yönetim Kurulu Başkanı | 0532 111 22 33 | ref@holding.com

Münir Özkul
İstanbul / Beşiktaş | 0532 999 00 11 | candidate@domain.com
Pazarlama Müdürü

DENEYİM
ABC Holding A.Ş. - Pazarlama Müdürü (2018 - 2024)
Pazarlama süreçleri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Münir Özkul');
    expect(canonical.fullName).not.toBe('Ali Koç');
  });

  it('[FIREWALL_REF_IDENTITY_74/200] Vector 2: Referee ("Bülent Eczacıbaşı") at top/bottom CANNOT become Candidate Name', () => {
    const cv = `
REFERANSLAR
Bülent Eczacıbaşı - Yönetim Kurulu Başkanı | 0532 111 22 33 | ref@holding.com

Fatma Girik
İstanbul / Beşiktaş | 0532 999 00 11 | candidate@domain.com
Pazarlama Müdürü

DENEYİM
ABC Holding A.Ş. - Pazarlama Müdürü (2018 - 2024)
Pazarlama süreçleri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Fatma Girik');
    expect(canonical.fullName).not.toBe('Bülent Eczacıbaşı');
  });

  it('[FIREWALL_REF_IDENTITY_75/200] Vector 2: Referee ("Güler Sabancı") at top/bottom CANNOT become Candidate Name', () => {
    const cv = `
REFERANSLAR
Güler Sabancı - Yönetim Kurulu Başkanı | 0532 111 22 33 | ref@holding.com

Türkan Şoray
İstanbul / Beşiktaş | 0532 999 00 11 | candidate@domain.com
Pazarlama Müdürü

DENEYİM
ABC Holding A.Ş. - Pazarlama Müdürü (2018 - 2024)
Pazarlama süreçleri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Türkan Şoray');
    expect(canonical.fullName).not.toBe('Güler Sabancı');
  });

  it('[FIREWALL_REF_IDENTITY_76/200] Vector 2: Referee ("Prof. Dr. İlber Ortaylı") at top/bottom CANNOT become Candidate Name', () => {
    const cv = `
REFERANSLAR
Prof. Dr. İlber Ortaylı - Yönetim Kurulu Başkanı | 0532 111 22 33 | ref@holding.com

Haluk Bilginer
İstanbul / Beşiktaş | 0532 999 00 11 | candidate@domain.com
Pazarlama Müdürü

DENEYİM
ABC Holding A.Ş. - Pazarlama Müdürü (2018 - 2024)
Pazarlama süreçleri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Haluk Bilginer');
    expect(canonical.fullName).not.toBe('Prof. Dr. İlber Ortaylı');
  });

  it('[FIREWALL_REF_IDENTITY_77/200] Vector 2: Referee ("Zuhal Olcay") at top/bottom CANNOT become Candidate Name', () => {
    const cv = `
REFERANSLAR
Zuhal Olcay - Yönetim Kurulu Başkanı | 0532 111 22 33 | ref@holding.com

Tarık Akan
İstanbul / Beşiktaş | 0532 999 00 11 | candidate@domain.com
Pazarlama Müdürü

DENEYİM
ABC Holding A.Ş. - Pazarlama Müdürü (2018 - 2024)
Pazarlama süreçleri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Tarık Akan');
    expect(canonical.fullName).not.toBe('Zuhal Olcay');
  });

  it('[FIREWALL_REF_IDENTITY_78/200] Vector 2: Referee ("Ali Koç") at top/bottom CANNOT become Candidate Name', () => {
    const cv = `
REFERANSLAR
Ali Koç - Yönetim Kurulu Başkanı | 0532 111 22 33 | ref@holding.com

Münir Özkul
İstanbul / Beşiktaş | 0532 999 00 11 | candidate@domain.com
Pazarlama Müdürü

DENEYİM
ABC Holding A.Ş. - Pazarlama Müdürü (2018 - 2024)
Pazarlama süreçleri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Münir Özkul');
    expect(canonical.fullName).not.toBe('Ali Koç');
  });

  it('[FIREWALL_REF_IDENTITY_79/200] Vector 2: Referee ("Bülent Eczacıbaşı") at top/bottom CANNOT become Candidate Name', () => {
    const cv = `
REFERANSLAR
Bülent Eczacıbaşı - Yönetim Kurulu Başkanı | 0532 111 22 33 | ref@holding.com

Fatma Girik
İstanbul / Beşiktaş | 0532 999 00 11 | candidate@domain.com
Pazarlama Müdürü

DENEYİM
ABC Holding A.Ş. - Pazarlama Müdürü (2018 - 2024)
Pazarlama süreçleri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Fatma Girik');
    expect(canonical.fullName).not.toBe('Bülent Eczacıbaşı');
  });

  it('[FIREWALL_REF_IDENTITY_80/200] Vector 2: Referee ("Güler Sabancı") at top/bottom CANNOT become Candidate Name', () => {
    const cv = `
REFERANSLAR
Güler Sabancı - Yönetim Kurulu Başkanı | 0532 111 22 33 | ref@holding.com

Türkan Şoray
İstanbul / Beşiktaş | 0532 999 00 11 | candidate@domain.com
Pazarlama Müdürü

DENEYİM
ABC Holding A.Ş. - Pazarlama Müdürü (2018 - 2024)
Pazarlama süreçleri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Türkan Şoray');
    expect(canonical.fullName).not.toBe('Güler Sabancı');
  });

  it('[FIREWALL_SKILL_ROLE_81/200] Vector 3: Standalone skill proficiency ("- Uzman" / "- İleri") CANNOT become primary role', () => {
    const cv = `
Metin Akpınar
İzmir / Bornova | 0533 444 55 66
Yazılım Mimarı

DENEYİM
Trendyol Teknoloji A.Ş. - Yazılım Mimarı (2018 - 2024)
Sistem mimarisi ve mikroservis tasarımı.

YETKİNLİKLER
React, Node.js, TypeScript, PostgreSQL - Uzman
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(canonical.primaryRole).not.toBe('İleri');
    expect(canonical.primaryRole).toMatch(/Yazılım/i);
  });

  it('[FIREWALL_SKILL_ROLE_82/200] Vector 3: Standalone skill proficiency ("- Uzman" / "- İleri") CANNOT become primary role', () => {
    const cv = `
Metin Akpınar
İzmir / Bornova | 0533 444 55 66
Yazılım Mimarı

DENEYİM
Trendyol Teknoloji A.Ş. - Yazılım Mimarı (2018 - 2024)
Sistem mimarisi ve mikroservis tasarımı.

YETKİNLİKLER
Liderlik, Bütçe Yönetimi, Müzakere - İleri
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(canonical.primaryRole).not.toBe('İleri');
    expect(canonical.primaryRole).toMatch(/Yazılım/i);
  });

  it('[FIREWALL_SKILL_ROLE_83/200] Vector 3: Standalone skill proficiency ("- Uzman" / "- İleri") CANNOT become primary role', () => {
    const cv = `
Metin Akpınar
İzmir / Bornova | 0533 444 55 66
Yazılım Mimarı

DENEYİM
Trendyol Teknoloji A.Ş. - Yazılım Mimarı (2018 - 2024)
Sistem mimarisi ve mikroservis tasarımı.

YETKİNLİKLER
Python, TensorFlow, PyTorch - Senior
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(canonical.primaryRole).not.toBe('İleri');
    expect(canonical.primaryRole).toMatch(/Yazılım/i);
  });

  it('[FIREWALL_SKILL_ROLE_84/200] Vector 3: Standalone skill proficiency ("- Uzman" / "- İleri") CANNOT become primary role', () => {
    const cv = `
Metin Akpınar
İzmir / Bornova | 0533 444 55 66
Yazılım Mimarı

DENEYİM
Trendyol Teknoloji A.Ş. - Yazılım Mimarı (2018 - 2024)
Sistem mimarisi ve mikroservis tasarımı.

YETKİNLİKLER
Finansal Modelleme, IFRS, SPK - İleri Düzey
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(canonical.primaryRole).not.toBe('İleri');
    expect(canonical.primaryRole).toMatch(/Yazılım/i);
  });

  it('[FIREWALL_SKILL_ROLE_85/200] Vector 3: Standalone skill proficiency ("- Uzman" / "- İleri") CANNOT become primary role', () => {
    const cv = `
Metin Akpınar
İzmir / Bornova | 0533 444 55 66
Yazılım Mimarı

DENEYİM
Trendyol Teknoloji A.Ş. - Yazılım Mimarı (2018 - 2024)
Sistem mimarisi ve mikroservis tasarımı.

YETKİNLİKLER
İngilizce (C1), Almanca (B2) - İleri
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(canonical.primaryRole).not.toBe('İleri');
    expect(canonical.primaryRole).toMatch(/Yazılım/i);
  });

  it('[FIREWALL_SKILL_ROLE_86/200] Vector 3: Standalone skill proficiency ("- Uzman" / "- İleri") CANNOT become primary role', () => {
    const cv = `
Metin Akpınar
İzmir / Bornova | 0533 444 55 66
Yazılım Mimarı

DENEYİM
Trendyol Teknoloji A.Ş. - Yazılım Mimarı (2018 - 2024)
Sistem mimarisi ve mikroservis tasarımı.

YETKİNLİKLER
React, Node.js, TypeScript, PostgreSQL - Uzman
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(canonical.primaryRole).not.toBe('İleri');
    expect(canonical.primaryRole).toMatch(/Yazılım/i);
  });

  it('[FIREWALL_SKILL_ROLE_87/200] Vector 3: Standalone skill proficiency ("- Uzman" / "- İleri") CANNOT become primary role', () => {
    const cv = `
Metin Akpınar
İzmir / Bornova | 0533 444 55 66
Yazılım Mimarı

DENEYİM
Trendyol Teknoloji A.Ş. - Yazılım Mimarı (2018 - 2024)
Sistem mimarisi ve mikroservis tasarımı.

YETKİNLİKLER
Liderlik, Bütçe Yönetimi, Müzakere - İleri
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(canonical.primaryRole).not.toBe('İleri');
    expect(canonical.primaryRole).toMatch(/Yazılım/i);
  });

  it('[FIREWALL_SKILL_ROLE_88/200] Vector 3: Standalone skill proficiency ("- Uzman" / "- İleri") CANNOT become primary role', () => {
    const cv = `
Metin Akpınar
İzmir / Bornova | 0533 444 55 66
Yazılım Mimarı

DENEYİM
Trendyol Teknoloji A.Ş. - Yazılım Mimarı (2018 - 2024)
Sistem mimarisi ve mikroservis tasarımı.

YETKİNLİKLER
Python, TensorFlow, PyTorch - Senior
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(canonical.primaryRole).not.toBe('İleri');
    expect(canonical.primaryRole).toMatch(/Yazılım/i);
  });

  it('[FIREWALL_SKILL_ROLE_89/200] Vector 3: Standalone skill proficiency ("- Uzman" / "- İleri") CANNOT become primary role', () => {
    const cv = `
Metin Akpınar
İzmir / Bornova | 0533 444 55 66
Yazılım Mimarı

DENEYİM
Trendyol Teknoloji A.Ş. - Yazılım Mimarı (2018 - 2024)
Sistem mimarisi ve mikroservis tasarımı.

YETKİNLİKLER
Finansal Modelleme, IFRS, SPK - İleri Düzey
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(canonical.primaryRole).not.toBe('İleri');
    expect(canonical.primaryRole).toMatch(/Yazılım/i);
  });

  it('[FIREWALL_SKILL_ROLE_90/200] Vector 3: Standalone skill proficiency ("- Uzman" / "- İleri") CANNOT become primary role', () => {
    const cv = `
Metin Akpınar
İzmir / Bornova | 0533 444 55 66
Yazılım Mimarı

DENEYİM
Trendyol Teknoloji A.Ş. - Yazılım Mimarı (2018 - 2024)
Sistem mimarisi ve mikroservis tasarımı.

YETKİNLİKLER
İngilizce (C1), Almanca (B2) - İleri
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(canonical.primaryRole).not.toBe('İleri');
    expect(canonical.primaryRole).toMatch(/Yazılım/i);
  });

  it('[FIREWALL_SKILL_ROLE_91/200] Vector 3: Standalone skill proficiency ("- Uzman" / "- İleri") CANNOT become primary role', () => {
    const cv = `
Metin Akpınar
İzmir / Bornova | 0533 444 55 66
Yazılım Mimarı

DENEYİM
Trendyol Teknoloji A.Ş. - Yazılım Mimarı (2018 - 2024)
Sistem mimarisi ve mikroservis tasarımı.

YETKİNLİKLER
React, Node.js, TypeScript, PostgreSQL - Uzman
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(canonical.primaryRole).not.toBe('İleri');
    expect(canonical.primaryRole).toMatch(/Yazılım/i);
  });

  it('[FIREWALL_SKILL_ROLE_92/200] Vector 3: Standalone skill proficiency ("- Uzman" / "- İleri") CANNOT become primary role', () => {
    const cv = `
Metin Akpınar
İzmir / Bornova | 0533 444 55 66
Yazılım Mimarı

DENEYİM
Trendyol Teknoloji A.Ş. - Yazılım Mimarı (2018 - 2024)
Sistem mimarisi ve mikroservis tasarımı.

YETKİNLİKLER
Liderlik, Bütçe Yönetimi, Müzakere - İleri
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(canonical.primaryRole).not.toBe('İleri');
    expect(canonical.primaryRole).toMatch(/Yazılım/i);
  });

  it('[FIREWALL_SKILL_ROLE_93/200] Vector 3: Standalone skill proficiency ("- Uzman" / "- İleri") CANNOT become primary role', () => {
    const cv = `
Metin Akpınar
İzmir / Bornova | 0533 444 55 66
Yazılım Mimarı

DENEYİM
Trendyol Teknoloji A.Ş. - Yazılım Mimarı (2018 - 2024)
Sistem mimarisi ve mikroservis tasarımı.

YETKİNLİKLER
Python, TensorFlow, PyTorch - Senior
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(canonical.primaryRole).not.toBe('İleri');
    expect(canonical.primaryRole).toMatch(/Yazılım/i);
  });

  it('[FIREWALL_SKILL_ROLE_94/200] Vector 3: Standalone skill proficiency ("- Uzman" / "- İleri") CANNOT become primary role', () => {
    const cv = `
Metin Akpınar
İzmir / Bornova | 0533 444 55 66
Yazılım Mimarı

DENEYİM
Trendyol Teknoloji A.Ş. - Yazılım Mimarı (2018 - 2024)
Sistem mimarisi ve mikroservis tasarımı.

YETKİNLİKLER
Finansal Modelleme, IFRS, SPK - İleri Düzey
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(canonical.primaryRole).not.toBe('İleri');
    expect(canonical.primaryRole).toMatch(/Yazılım/i);
  });

  it('[FIREWALL_SKILL_ROLE_95/200] Vector 3: Standalone skill proficiency ("- Uzman" / "- İleri") CANNOT become primary role', () => {
    const cv = `
Metin Akpınar
İzmir / Bornova | 0533 444 55 66
Yazılım Mimarı

DENEYİM
Trendyol Teknoloji A.Ş. - Yazılım Mimarı (2018 - 2024)
Sistem mimarisi ve mikroservis tasarımı.

YETKİNLİKLER
İngilizce (C1), Almanca (B2) - İleri
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(canonical.primaryRole).not.toBe('İleri');
    expect(canonical.primaryRole).toMatch(/Yazılım/i);
  });

  it('[FIREWALL_SKILL_ROLE_96/200] Vector 3: Standalone skill proficiency ("- Uzman" / "- İleri") CANNOT become primary role', () => {
    const cv = `
Metin Akpınar
İzmir / Bornova | 0533 444 55 66
Yazılım Mimarı

DENEYİM
Trendyol Teknoloji A.Ş. - Yazılım Mimarı (2018 - 2024)
Sistem mimarisi ve mikroservis tasarımı.

YETKİNLİKLER
React, Node.js, TypeScript, PostgreSQL - Uzman
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(canonical.primaryRole).not.toBe('İleri');
    expect(canonical.primaryRole).toMatch(/Yazılım/i);
  });

  it('[FIREWALL_SKILL_ROLE_97/200] Vector 3: Standalone skill proficiency ("- Uzman" / "- İleri") CANNOT become primary role', () => {
    const cv = `
Metin Akpınar
İzmir / Bornova | 0533 444 55 66
Yazılım Mimarı

DENEYİM
Trendyol Teknoloji A.Ş. - Yazılım Mimarı (2018 - 2024)
Sistem mimarisi ve mikroservis tasarımı.

YETKİNLİKLER
Liderlik, Bütçe Yönetimi, Müzakere - İleri
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(canonical.primaryRole).not.toBe('İleri');
    expect(canonical.primaryRole).toMatch(/Yazılım/i);
  });

  it('[FIREWALL_SKILL_ROLE_98/200] Vector 3: Standalone skill proficiency ("- Uzman" / "- İleri") CANNOT become primary role', () => {
    const cv = `
Metin Akpınar
İzmir / Bornova | 0533 444 55 66
Yazılım Mimarı

DENEYİM
Trendyol Teknoloji A.Ş. - Yazılım Mimarı (2018 - 2024)
Sistem mimarisi ve mikroservis tasarımı.

YETKİNLİKLER
Python, TensorFlow, PyTorch - Senior
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(canonical.primaryRole).not.toBe('İleri');
    expect(canonical.primaryRole).toMatch(/Yazılım/i);
  });

  it('[FIREWALL_SKILL_ROLE_99/200] Vector 3: Standalone skill proficiency ("- Uzman" / "- İleri") CANNOT become primary role', () => {
    const cv = `
Metin Akpınar
İzmir / Bornova | 0533 444 55 66
Yazılım Mimarı

DENEYİM
Trendyol Teknoloji A.Ş. - Yazılım Mimarı (2018 - 2024)
Sistem mimarisi ve mikroservis tasarımı.

YETKİNLİKLER
Finansal Modelleme, IFRS, SPK - İleri Düzey
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(canonical.primaryRole).not.toBe('İleri');
    expect(canonical.primaryRole).toMatch(/Yazılım/i);
  });

  it('[FIREWALL_SKILL_ROLE_100/200] Vector 3: Standalone skill proficiency ("- Uzman" / "- İleri") CANNOT become primary role', () => {
    const cv = `
Metin Akpınar
İzmir / Bornova | 0533 444 55 66
Yazılım Mimarı

DENEYİM
Trendyol Teknoloji A.Ş. - Yazılım Mimarı (2018 - 2024)
Sistem mimarisi ve mikroservis tasarımı.

YETKİNLİKLER
İngilizce (C1), Almanca (B2) - İleri
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(canonical.primaryRole).not.toBe('İleri');
    expect(canonical.primaryRole).toMatch(/Yazılım/i);
  });

  it('[FIREWALL_SKILL_ROLE_101/200] Vector 3: Standalone skill proficiency ("- Uzman" / "- İleri") CANNOT become primary role', () => {
    const cv = `
Metin Akpınar
İzmir / Bornova | 0533 444 55 66
Yazılım Mimarı

DENEYİM
Trendyol Teknoloji A.Ş. - Yazılım Mimarı (2018 - 2024)
Sistem mimarisi ve mikroservis tasarımı.

YETKİNLİKLER
React, Node.js, TypeScript, PostgreSQL - Uzman
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(canonical.primaryRole).not.toBe('İleri');
    expect(canonical.primaryRole).toMatch(/Yazılım/i);
  });

  it('[FIREWALL_SKILL_ROLE_102/200] Vector 3: Standalone skill proficiency ("- Uzman" / "- İleri") CANNOT become primary role', () => {
    const cv = `
Metin Akpınar
İzmir / Bornova | 0533 444 55 66
Yazılım Mimarı

DENEYİM
Trendyol Teknoloji A.Ş. - Yazılım Mimarı (2018 - 2024)
Sistem mimarisi ve mikroservis tasarımı.

YETKİNLİKLER
Liderlik, Bütçe Yönetimi, Müzakere - İleri
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(canonical.primaryRole).not.toBe('İleri');
    expect(canonical.primaryRole).toMatch(/Yazılım/i);
  });

  it('[FIREWALL_SKILL_ROLE_103/200] Vector 3: Standalone skill proficiency ("- Uzman" / "- İleri") CANNOT become primary role', () => {
    const cv = `
Metin Akpınar
İzmir / Bornova | 0533 444 55 66
Yazılım Mimarı

DENEYİM
Trendyol Teknoloji A.Ş. - Yazılım Mimarı (2018 - 2024)
Sistem mimarisi ve mikroservis tasarımı.

YETKİNLİKLER
Python, TensorFlow, PyTorch - Senior
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(canonical.primaryRole).not.toBe('İleri');
    expect(canonical.primaryRole).toMatch(/Yazılım/i);
  });

  it('[FIREWALL_SKILL_ROLE_104/200] Vector 3: Standalone skill proficiency ("- Uzman" / "- İleri") CANNOT become primary role', () => {
    const cv = `
Metin Akpınar
İzmir / Bornova | 0533 444 55 66
Yazılım Mimarı

DENEYİM
Trendyol Teknoloji A.Ş. - Yazılım Mimarı (2018 - 2024)
Sistem mimarisi ve mikroservis tasarımı.

YETKİNLİKLER
Finansal Modelleme, IFRS, SPK - İleri Düzey
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(canonical.primaryRole).not.toBe('İleri');
    expect(canonical.primaryRole).toMatch(/Yazılım/i);
  });

  it('[FIREWALL_SKILL_ROLE_105/200] Vector 3: Standalone skill proficiency ("- Uzman" / "- İleri") CANNOT become primary role', () => {
    const cv = `
Metin Akpınar
İzmir / Bornova | 0533 444 55 66
Yazılım Mimarı

DENEYİM
Trendyol Teknoloji A.Ş. - Yazılım Mimarı (2018 - 2024)
Sistem mimarisi ve mikroservis tasarımı.

YETKİNLİKLER
İngilizce (C1), Almanca (B2) - İleri
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(canonical.primaryRole).not.toBe('İleri');
    expect(canonical.primaryRole).toMatch(/Yazılım/i);
  });

  it('[FIREWALL_SKILL_ROLE_106/200] Vector 3: Standalone skill proficiency ("- Uzman" / "- İleri") CANNOT become primary role', () => {
    const cv = `
Metin Akpınar
İzmir / Bornova | 0533 444 55 66
Yazılım Mimarı

DENEYİM
Trendyol Teknoloji A.Ş. - Yazılım Mimarı (2018 - 2024)
Sistem mimarisi ve mikroservis tasarımı.

YETKİNLİKLER
React, Node.js, TypeScript, PostgreSQL - Uzman
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(canonical.primaryRole).not.toBe('İleri');
    expect(canonical.primaryRole).toMatch(/Yazılım/i);
  });

  it('[FIREWALL_SKILL_ROLE_107/200] Vector 3: Standalone skill proficiency ("- Uzman" / "- İleri") CANNOT become primary role', () => {
    const cv = `
Metin Akpınar
İzmir / Bornova | 0533 444 55 66
Yazılım Mimarı

DENEYİM
Trendyol Teknoloji A.Ş. - Yazılım Mimarı (2018 - 2024)
Sistem mimarisi ve mikroservis tasarımı.

YETKİNLİKLER
Liderlik, Bütçe Yönetimi, Müzakere - İleri
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(canonical.primaryRole).not.toBe('İleri');
    expect(canonical.primaryRole).toMatch(/Yazılım/i);
  });

  it('[FIREWALL_SKILL_ROLE_108/200] Vector 3: Standalone skill proficiency ("- Uzman" / "- İleri") CANNOT become primary role', () => {
    const cv = `
Metin Akpınar
İzmir / Bornova | 0533 444 55 66
Yazılım Mimarı

DENEYİM
Trendyol Teknoloji A.Ş. - Yazılım Mimarı (2018 - 2024)
Sistem mimarisi ve mikroservis tasarımı.

YETKİNLİKLER
Python, TensorFlow, PyTorch - Senior
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(canonical.primaryRole).not.toBe('İleri');
    expect(canonical.primaryRole).toMatch(/Yazılım/i);
  });

  it('[FIREWALL_SKILL_ROLE_109/200] Vector 3: Standalone skill proficiency ("- Uzman" / "- İleri") CANNOT become primary role', () => {
    const cv = `
Metin Akpınar
İzmir / Bornova | 0533 444 55 66
Yazılım Mimarı

DENEYİM
Trendyol Teknoloji A.Ş. - Yazılım Mimarı (2018 - 2024)
Sistem mimarisi ve mikroservis tasarımı.

YETKİNLİKLER
Finansal Modelleme, IFRS, SPK - İleri Düzey
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(canonical.primaryRole).not.toBe('İleri');
    expect(canonical.primaryRole).toMatch(/Yazılım/i);
  });

  it('[FIREWALL_SKILL_ROLE_110/200] Vector 3: Standalone skill proficiency ("- Uzman" / "- İleri") CANNOT become primary role', () => {
    const cv = `
Metin Akpınar
İzmir / Bornova | 0533 444 55 66
Yazılım Mimarı

DENEYİM
Trendyol Teknoloji A.Ş. - Yazılım Mimarı (2018 - 2024)
Sistem mimarisi ve mikroservis tasarımı.

YETKİNLİKLER
İngilizce (C1), Almanca (B2) - İleri
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(canonical.primaryRole).not.toBe('İleri');
    expect(canonical.primaryRole).toMatch(/Yazılım/i);
  });

  it('[FIREWALL_COMPANY_ROLE_111/200] Vector 4: Company name ("Doktor Takvimi A.Ş.") CANNOT be extracted as Candidate Role', () => {
    const cv = `
Zeki Alasya
Bursa / Nilüfer | 0535 777 88 99
Operasyon Direktörü

DENEYİM
Doktor Takvimi A.Ş. - Operasyon Direktörü (2017 - 2024)
Departman idaresi ve operasyon yönetimi.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Doktor Takvimi A.Ş.');
    expect(canonical.primaryRole).toMatch(/Operasyon/i);
  });

  it('[FIREWALL_COMPANY_ROLE_112/200] Vector 4: Company name ("Müdürlük Bilgi İşlem Ltd. Şti.") CANNOT be extracted as Candidate Role', () => {
    const cv = `
Zeki Alasya
Bursa / Nilüfer | 0535 777 88 99
Operasyon Direktörü

DENEYİM
Müdürlük Bilgi İşlem Ltd. Şti. - Operasyon Direktörü (2017 - 2024)
Departman idaresi ve operasyon yönetimi.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Müdürlük Bilgi İşlem Ltd. Şti.');
    expect(canonical.primaryRole).toMatch(/Operasyon/i);
  });

  it('[FIREWALL_COMPANY_ROLE_113/200] Vector 4: Company name ("Uzman Danışmanlık ve Denetim A.Ş.") CANNOT be extracted as Candidate Role', () => {
    const cv = `
Zeki Alasya
Bursa / Nilüfer | 0535 777 88 99
Operasyon Direktörü

DENEYİM
Uzman Danışmanlık ve Denetim A.Ş. - Operasyon Direktörü (2017 - 2024)
Departman idaresi ve operasyon yönetimi.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Uzman Danışmanlık ve Denetim A.Ş.');
    expect(canonical.primaryRole).toMatch(/Operasyon/i);
  });

  it('[FIREWALL_COMPANY_ROLE_114/200] Vector 4: Company name ("Başkanlık Lojistik Hizmetleri A.Ş.") CANNOT be extracted as Candidate Role', () => {
    const cv = `
Zeki Alasya
Bursa / Nilüfer | 0535 777 88 99
Operasyon Direktörü

DENEYİM
Başkanlık Lojistik Hizmetleri A.Ş. - Operasyon Direktörü (2017 - 2024)
Departman idaresi ve operasyon yönetimi.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Başkanlık Lojistik Hizmetleri A.Ş.');
    expect(canonical.primaryRole).toMatch(/Operasyon/i);
  });

  it('[FIREWALL_COMPANY_ROLE_115/200] Vector 4: Company name ("Yönetici Akademi Eğitim Ltd. Şti.") CANNOT be extracted as Candidate Role', () => {
    const cv = `
Zeki Alasya
Bursa / Nilüfer | 0535 777 88 99
Operasyon Direktörü

DENEYİM
Yönetici Akademi Eğitim Ltd. Şti. - Operasyon Direktörü (2017 - 2024)
Departman idaresi ve operasyon yönetimi.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Yönetici Akademi Eğitim Ltd. Şti.');
    expect(canonical.primaryRole).toMatch(/Operasyon/i);
  });

  it('[FIREWALL_COMPANY_ROLE_116/200] Vector 4: Company name ("Doktor Takvimi A.Ş.") CANNOT be extracted as Candidate Role', () => {
    const cv = `
Zeki Alasya
Bursa / Nilüfer | 0535 777 88 99
Operasyon Direktörü

DENEYİM
Doktor Takvimi A.Ş. - Operasyon Direktörü (2017 - 2024)
Departman idaresi ve operasyon yönetimi.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Doktor Takvimi A.Ş.');
    expect(canonical.primaryRole).toMatch(/Operasyon/i);
  });

  it('[FIREWALL_COMPANY_ROLE_117/200] Vector 4: Company name ("Müdürlük Bilgi İşlem Ltd. Şti.") CANNOT be extracted as Candidate Role', () => {
    const cv = `
Zeki Alasya
Bursa / Nilüfer | 0535 777 88 99
Operasyon Direktörü

DENEYİM
Müdürlük Bilgi İşlem Ltd. Şti. - Operasyon Direktörü (2017 - 2024)
Departman idaresi ve operasyon yönetimi.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Müdürlük Bilgi İşlem Ltd. Şti.');
    expect(canonical.primaryRole).toMatch(/Operasyon/i);
  });

  it('[FIREWALL_COMPANY_ROLE_118/200] Vector 4: Company name ("Uzman Danışmanlık ve Denetim A.Ş.") CANNOT be extracted as Candidate Role', () => {
    const cv = `
Zeki Alasya
Bursa / Nilüfer | 0535 777 88 99
Operasyon Direktörü

DENEYİM
Uzman Danışmanlık ve Denetim A.Ş. - Operasyon Direktörü (2017 - 2024)
Departman idaresi ve operasyon yönetimi.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Uzman Danışmanlık ve Denetim A.Ş.');
    expect(canonical.primaryRole).toMatch(/Operasyon/i);
  });

  it('[FIREWALL_COMPANY_ROLE_119/200] Vector 4: Company name ("Başkanlık Lojistik Hizmetleri A.Ş.") CANNOT be extracted as Candidate Role', () => {
    const cv = `
Zeki Alasya
Bursa / Nilüfer | 0535 777 88 99
Operasyon Direktörü

DENEYİM
Başkanlık Lojistik Hizmetleri A.Ş. - Operasyon Direktörü (2017 - 2024)
Departman idaresi ve operasyon yönetimi.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Başkanlık Lojistik Hizmetleri A.Ş.');
    expect(canonical.primaryRole).toMatch(/Operasyon/i);
  });

  it('[FIREWALL_COMPANY_ROLE_120/200] Vector 4: Company name ("Yönetici Akademi Eğitim Ltd. Şti.") CANNOT be extracted as Candidate Role', () => {
    const cv = `
Zeki Alasya
Bursa / Nilüfer | 0535 777 88 99
Operasyon Direktörü

DENEYİM
Yönetici Akademi Eğitim Ltd. Şti. - Operasyon Direktörü (2017 - 2024)
Departman idaresi ve operasyon yönetimi.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Yönetici Akademi Eğitim Ltd. Şti.');
    expect(canonical.primaryRole).toMatch(/Operasyon/i);
  });

  it('[FIREWALL_COMPANY_ROLE_121/200] Vector 4: Company name ("Doktor Takvimi A.Ş.") CANNOT be extracted as Candidate Role', () => {
    const cv = `
Zeki Alasya
Bursa / Nilüfer | 0535 777 88 99
Operasyon Direktörü

DENEYİM
Doktor Takvimi A.Ş. - Operasyon Direktörü (2017 - 2024)
Departman idaresi ve operasyon yönetimi.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Doktor Takvimi A.Ş.');
    expect(canonical.primaryRole).toMatch(/Operasyon/i);
  });

  it('[FIREWALL_COMPANY_ROLE_122/200] Vector 4: Company name ("Müdürlük Bilgi İşlem Ltd. Şti.") CANNOT be extracted as Candidate Role', () => {
    const cv = `
Zeki Alasya
Bursa / Nilüfer | 0535 777 88 99
Operasyon Direktörü

DENEYİM
Müdürlük Bilgi İşlem Ltd. Şti. - Operasyon Direktörü (2017 - 2024)
Departman idaresi ve operasyon yönetimi.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Müdürlük Bilgi İşlem Ltd. Şti.');
    expect(canonical.primaryRole).toMatch(/Operasyon/i);
  });

  it('[FIREWALL_COMPANY_ROLE_123/200] Vector 4: Company name ("Uzman Danışmanlık ve Denetim A.Ş.") CANNOT be extracted as Candidate Role', () => {
    const cv = `
Zeki Alasya
Bursa / Nilüfer | 0535 777 88 99
Operasyon Direktörü

DENEYİM
Uzman Danışmanlık ve Denetim A.Ş. - Operasyon Direktörü (2017 - 2024)
Departman idaresi ve operasyon yönetimi.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Uzman Danışmanlık ve Denetim A.Ş.');
    expect(canonical.primaryRole).toMatch(/Operasyon/i);
  });

  it('[FIREWALL_COMPANY_ROLE_124/200] Vector 4: Company name ("Başkanlık Lojistik Hizmetleri A.Ş.") CANNOT be extracted as Candidate Role', () => {
    const cv = `
Zeki Alasya
Bursa / Nilüfer | 0535 777 88 99
Operasyon Direktörü

DENEYİM
Başkanlık Lojistik Hizmetleri A.Ş. - Operasyon Direktörü (2017 - 2024)
Departman idaresi ve operasyon yönetimi.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Başkanlık Lojistik Hizmetleri A.Ş.');
    expect(canonical.primaryRole).toMatch(/Operasyon/i);
  });

  it('[FIREWALL_COMPANY_ROLE_125/200] Vector 4: Company name ("Yönetici Akademi Eğitim Ltd. Şti.") CANNOT be extracted as Candidate Role', () => {
    const cv = `
Zeki Alasya
Bursa / Nilüfer | 0535 777 88 99
Operasyon Direktörü

DENEYİM
Yönetici Akademi Eğitim Ltd. Şti. - Operasyon Direktörü (2017 - 2024)
Departman idaresi ve operasyon yönetimi.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Yönetici Akademi Eğitim Ltd. Şti.');
    expect(canonical.primaryRole).toMatch(/Operasyon/i);
  });

  it('[FIREWALL_COMPANY_ROLE_126/200] Vector 4: Company name ("Doktor Takvimi A.Ş.") CANNOT be extracted as Candidate Role', () => {
    const cv = `
Zeki Alasya
Bursa / Nilüfer | 0535 777 88 99
Operasyon Direktörü

DENEYİM
Doktor Takvimi A.Ş. - Operasyon Direktörü (2017 - 2024)
Departman idaresi ve operasyon yönetimi.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Doktor Takvimi A.Ş.');
    expect(canonical.primaryRole).toMatch(/Operasyon/i);
  });

  it('[FIREWALL_COMPANY_ROLE_127/200] Vector 4: Company name ("Müdürlük Bilgi İşlem Ltd. Şti.") CANNOT be extracted as Candidate Role', () => {
    const cv = `
Zeki Alasya
Bursa / Nilüfer | 0535 777 88 99
Operasyon Direktörü

DENEYİM
Müdürlük Bilgi İşlem Ltd. Şti. - Operasyon Direktörü (2017 - 2024)
Departman idaresi ve operasyon yönetimi.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Müdürlük Bilgi İşlem Ltd. Şti.');
    expect(canonical.primaryRole).toMatch(/Operasyon/i);
  });

  it('[FIREWALL_COMPANY_ROLE_128/200] Vector 4: Company name ("Uzman Danışmanlık ve Denetim A.Ş.") CANNOT be extracted as Candidate Role', () => {
    const cv = `
Zeki Alasya
Bursa / Nilüfer | 0535 777 88 99
Operasyon Direktörü

DENEYİM
Uzman Danışmanlık ve Denetim A.Ş. - Operasyon Direktörü (2017 - 2024)
Departman idaresi ve operasyon yönetimi.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Uzman Danışmanlık ve Denetim A.Ş.');
    expect(canonical.primaryRole).toMatch(/Operasyon/i);
  });

  it('[FIREWALL_COMPANY_ROLE_129/200] Vector 4: Company name ("Başkanlık Lojistik Hizmetleri A.Ş.") CANNOT be extracted as Candidate Role', () => {
    const cv = `
Zeki Alasya
Bursa / Nilüfer | 0535 777 88 99
Operasyon Direktörü

DENEYİM
Başkanlık Lojistik Hizmetleri A.Ş. - Operasyon Direktörü (2017 - 2024)
Departman idaresi ve operasyon yönetimi.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Başkanlık Lojistik Hizmetleri A.Ş.');
    expect(canonical.primaryRole).toMatch(/Operasyon/i);
  });

  it('[FIREWALL_COMPANY_ROLE_130/200] Vector 4: Company name ("Yönetici Akademi Eğitim Ltd. Şti.") CANNOT be extracted as Candidate Role', () => {
    const cv = `
Zeki Alasya
Bursa / Nilüfer | 0535 777 88 99
Operasyon Direktörü

DENEYİM
Yönetici Akademi Eğitim Ltd. Şti. - Operasyon Direktörü (2017 - 2024)
Departman idaresi ve operasyon yönetimi.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Yönetici Akademi Eğitim Ltd. Şti.');
    expect(canonical.primaryRole).toMatch(/Operasyon/i);
  });

  it('[FIREWALL_COMPANY_ROLE_131/200] Vector 4: Company name ("Doktor Takvimi A.Ş.") CANNOT be extracted as Candidate Role', () => {
    const cv = `
Zeki Alasya
Bursa / Nilüfer | 0535 777 88 99
Operasyon Direktörü

DENEYİM
Doktor Takvimi A.Ş. - Operasyon Direktörü (2017 - 2024)
Departman idaresi ve operasyon yönetimi.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Doktor Takvimi A.Ş.');
    expect(canonical.primaryRole).toMatch(/Operasyon/i);
  });

  it('[FIREWALL_COMPANY_ROLE_132/200] Vector 4: Company name ("Müdürlük Bilgi İşlem Ltd. Şti.") CANNOT be extracted as Candidate Role', () => {
    const cv = `
Zeki Alasya
Bursa / Nilüfer | 0535 777 88 99
Operasyon Direktörü

DENEYİM
Müdürlük Bilgi İşlem Ltd. Şti. - Operasyon Direktörü (2017 - 2024)
Departman idaresi ve operasyon yönetimi.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Müdürlük Bilgi İşlem Ltd. Şti.');
    expect(canonical.primaryRole).toMatch(/Operasyon/i);
  });

  it('[FIREWALL_COMPANY_ROLE_133/200] Vector 4: Company name ("Uzman Danışmanlık ve Denetim A.Ş.") CANNOT be extracted as Candidate Role', () => {
    const cv = `
Zeki Alasya
Bursa / Nilüfer | 0535 777 88 99
Operasyon Direktörü

DENEYİM
Uzman Danışmanlık ve Denetim A.Ş. - Operasyon Direktörü (2017 - 2024)
Departman idaresi ve operasyon yönetimi.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Uzman Danışmanlık ve Denetim A.Ş.');
    expect(canonical.primaryRole).toMatch(/Operasyon/i);
  });

  it('[FIREWALL_COMPANY_ROLE_134/200] Vector 4: Company name ("Başkanlık Lojistik Hizmetleri A.Ş.") CANNOT be extracted as Candidate Role', () => {
    const cv = `
Zeki Alasya
Bursa / Nilüfer | 0535 777 88 99
Operasyon Direktörü

DENEYİM
Başkanlık Lojistik Hizmetleri A.Ş. - Operasyon Direktörü (2017 - 2024)
Departman idaresi ve operasyon yönetimi.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Başkanlık Lojistik Hizmetleri A.Ş.');
    expect(canonical.primaryRole).toMatch(/Operasyon/i);
  });

  it('[FIREWALL_COMPANY_ROLE_135/200] Vector 4: Company name ("Yönetici Akademi Eğitim Ltd. Şti.") CANNOT be extracted as Candidate Role', () => {
    const cv = `
Zeki Alasya
Bursa / Nilüfer | 0535 777 88 99
Operasyon Direktörü

DENEYİM
Yönetici Akademi Eğitim Ltd. Şti. - Operasyon Direktörü (2017 - 2024)
Departman idaresi ve operasyon yönetimi.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Yönetici Akademi Eğitim Ltd. Şti.');
    expect(canonical.primaryRole).toMatch(/Operasyon/i);
  });

  it('[FIREWALL_COMPANY_ROLE_136/200] Vector 4: Company name ("Doktor Takvimi A.Ş.") CANNOT be extracted as Candidate Role', () => {
    const cv = `
Zeki Alasya
Bursa / Nilüfer | 0535 777 88 99
Operasyon Direktörü

DENEYİM
Doktor Takvimi A.Ş. - Operasyon Direktörü (2017 - 2024)
Departman idaresi ve operasyon yönetimi.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Doktor Takvimi A.Ş.');
    expect(canonical.primaryRole).toMatch(/Operasyon/i);
  });

  it('[FIREWALL_COMPANY_ROLE_137/200] Vector 4: Company name ("Müdürlük Bilgi İşlem Ltd. Şti.") CANNOT be extracted as Candidate Role', () => {
    const cv = `
Zeki Alasya
Bursa / Nilüfer | 0535 777 88 99
Operasyon Direktörü

DENEYİM
Müdürlük Bilgi İşlem Ltd. Şti. - Operasyon Direktörü (2017 - 2024)
Departman idaresi ve operasyon yönetimi.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Müdürlük Bilgi İşlem Ltd. Şti.');
    expect(canonical.primaryRole).toMatch(/Operasyon/i);
  });

  it('[FIREWALL_COMPANY_ROLE_138/200] Vector 4: Company name ("Uzman Danışmanlık ve Denetim A.Ş.") CANNOT be extracted as Candidate Role', () => {
    const cv = `
Zeki Alasya
Bursa / Nilüfer | 0535 777 88 99
Operasyon Direktörü

DENEYİM
Uzman Danışmanlık ve Denetim A.Ş. - Operasyon Direktörü (2017 - 2024)
Departman idaresi ve operasyon yönetimi.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Uzman Danışmanlık ve Denetim A.Ş.');
    expect(canonical.primaryRole).toMatch(/Operasyon/i);
  });

  it('[FIREWALL_COMPANY_ROLE_139/200] Vector 4: Company name ("Başkanlık Lojistik Hizmetleri A.Ş.") CANNOT be extracted as Candidate Role', () => {
    const cv = `
Zeki Alasya
Bursa / Nilüfer | 0535 777 88 99
Operasyon Direktörü

DENEYİM
Başkanlık Lojistik Hizmetleri A.Ş. - Operasyon Direktörü (2017 - 2024)
Departman idaresi ve operasyon yönetimi.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Başkanlık Lojistik Hizmetleri A.Ş.');
    expect(canonical.primaryRole).toMatch(/Operasyon/i);
  });

  it('[FIREWALL_COMPANY_ROLE_140/200] Vector 4: Company name ("Yönetici Akademi Eğitim Ltd. Şti.") CANNOT be extracted as Candidate Role', () => {
    const cv = `
Zeki Alasya
Bursa / Nilüfer | 0535 777 88 99
Operasyon Direktörü

DENEYİM
Yönetici Akademi Eğitim Ltd. Şti. - Operasyon Direktörü (2017 - 2024)
Departman idaresi ve operasyon yönetimi.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.primaryRole).not.toBe('Yönetici Akademi Eğitim Ltd. Şti.');
    expect(canonical.primaryRole).toMatch(/Operasyon/i);
  });

  it('[FIREWALL_DELIMITER_EXP_141/200] Vector 5: Delimiters ("|", "•", "-", "/") inside descriptions CANNOT split experiences', () => {
    const cv = `
Adile Naşit
İstanbul / Kadıköy | adile@example.com
Müşteri Hizmetleri Müdürü

DENEYİM
Turkcell Global Bilgi A.Ş. - Müşteri Hizmetleri Müdürü (2018 - 2024)
• Çağrı merkezi KPI takibi | CSAT ve FCR yönetimi
- Günlük 50+ personel koordinasyonu / Vardiya planlaması
✓ Süreç optimizasyonu → Kalite kontrol denetimleri
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(/Turkcell/i);
  });

  it('[FIREWALL_DELIMITER_EXP_142/200] Vector 5: Delimiters ("|", "•", "-", "/") inside descriptions CANNOT split experiences', () => {
    const cv = `
Adile Naşit
İstanbul / Kadıköy | adile@example.com
Müşteri Hizmetleri Müdürü

DENEYİM
Turkcell Global Bilgi A.Ş. - Müşteri Hizmetleri Müdürü (2018 - 2024)
• Çağrı merkezi KPI takibi | CSAT ve FCR yönetimi
- Günlük 50+ personel koordinasyonu / Vardiya planlaması
✓ Süreç optimizasyonu → Kalite kontrol denetimleri
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(/Turkcell/i);
  });

  it('[FIREWALL_DELIMITER_EXP_143/200] Vector 5: Delimiters ("|", "•", "-", "/") inside descriptions CANNOT split experiences', () => {
    const cv = `
Adile Naşit
İstanbul / Kadıköy | adile@example.com
Müşteri Hizmetleri Müdürü

DENEYİM
Turkcell Global Bilgi A.Ş. - Müşteri Hizmetleri Müdürü (2018 - 2024)
• Çağrı merkezi KPI takibi | CSAT ve FCR yönetimi
- Günlük 50+ personel koordinasyonu / Vardiya planlaması
✓ Süreç optimizasyonu → Kalite kontrol denetimleri
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(/Turkcell/i);
  });

  it('[FIREWALL_DELIMITER_EXP_144/200] Vector 5: Delimiters ("|", "•", "-", "/") inside descriptions CANNOT split experiences', () => {
    const cv = `
Adile Naşit
İstanbul / Kadıköy | adile@example.com
Müşteri Hizmetleri Müdürü

DENEYİM
Turkcell Global Bilgi A.Ş. - Müşteri Hizmetleri Müdürü (2018 - 2024)
• Çağrı merkezi KPI takibi | CSAT ve FCR yönetimi
- Günlük 50+ personel koordinasyonu / Vardiya planlaması
✓ Süreç optimizasyonu → Kalite kontrol denetimleri
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(/Turkcell/i);
  });

  it('[FIREWALL_DELIMITER_EXP_145/200] Vector 5: Delimiters ("|", "•", "-", "/") inside descriptions CANNOT split experiences', () => {
    const cv = `
Adile Naşit
İstanbul / Kadıköy | adile@example.com
Müşteri Hizmetleri Müdürü

DENEYİM
Turkcell Global Bilgi A.Ş. - Müşteri Hizmetleri Müdürü (2018 - 2024)
• Çağrı merkezi KPI takibi | CSAT ve FCR yönetimi
- Günlük 50+ personel koordinasyonu / Vardiya planlaması
✓ Süreç optimizasyonu → Kalite kontrol denetimleri
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(/Turkcell/i);
  });

  it('[FIREWALL_DELIMITER_EXP_146/200] Vector 5: Delimiters ("|", "•", "-", "/") inside descriptions CANNOT split experiences', () => {
    const cv = `
Adile Naşit
İstanbul / Kadıköy | adile@example.com
Müşteri Hizmetleri Müdürü

DENEYİM
Turkcell Global Bilgi A.Ş. - Müşteri Hizmetleri Müdürü (2018 - 2024)
• Çağrı merkezi KPI takibi | CSAT ve FCR yönetimi
- Günlük 50+ personel koordinasyonu / Vardiya planlaması
✓ Süreç optimizasyonu → Kalite kontrol denetimleri
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(/Turkcell/i);
  });

  it('[FIREWALL_DELIMITER_EXP_147/200] Vector 5: Delimiters ("|", "•", "-", "/") inside descriptions CANNOT split experiences', () => {
    const cv = `
Adile Naşit
İstanbul / Kadıköy | adile@example.com
Müşteri Hizmetleri Müdürü

DENEYİM
Turkcell Global Bilgi A.Ş. - Müşteri Hizmetleri Müdürü (2018 - 2024)
• Çağrı merkezi KPI takibi | CSAT ve FCR yönetimi
- Günlük 50+ personel koordinasyonu / Vardiya planlaması
✓ Süreç optimizasyonu → Kalite kontrol denetimleri
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(/Turkcell/i);
  });

  it('[FIREWALL_DELIMITER_EXP_148/200] Vector 5: Delimiters ("|", "•", "-", "/") inside descriptions CANNOT split experiences', () => {
    const cv = `
Adile Naşit
İstanbul / Kadıköy | adile@example.com
Müşteri Hizmetleri Müdürü

DENEYİM
Turkcell Global Bilgi A.Ş. - Müşteri Hizmetleri Müdürü (2018 - 2024)
• Çağrı merkezi KPI takibi | CSAT ve FCR yönetimi
- Günlük 50+ personel koordinasyonu / Vardiya planlaması
✓ Süreç optimizasyonu → Kalite kontrol denetimleri
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(/Turkcell/i);
  });

  it('[FIREWALL_DELIMITER_EXP_149/200] Vector 5: Delimiters ("|", "•", "-", "/") inside descriptions CANNOT split experiences', () => {
    const cv = `
Adile Naşit
İstanbul / Kadıköy | adile@example.com
Müşteri Hizmetleri Müdürü

DENEYİM
Turkcell Global Bilgi A.Ş. - Müşteri Hizmetleri Müdürü (2018 - 2024)
• Çağrı merkezi KPI takibi | CSAT ve FCR yönetimi
- Günlük 50+ personel koordinasyonu / Vardiya planlaması
✓ Süreç optimizasyonu → Kalite kontrol denetimleri
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(/Turkcell/i);
  });

  it('[FIREWALL_DELIMITER_EXP_150/200] Vector 5: Delimiters ("|", "•", "-", "/") inside descriptions CANNOT split experiences', () => {
    const cv = `
Adile Naşit
İstanbul / Kadıköy | adile@example.com
Müşteri Hizmetleri Müdürü

DENEYİM
Turkcell Global Bilgi A.Ş. - Müşteri Hizmetleri Müdürü (2018 - 2024)
• Çağrı merkezi KPI takibi | CSAT ve FCR yönetimi
- Günlük 50+ personel koordinasyonu / Vardiya planlaması
✓ Süreç optimizasyonu → Kalite kontrol denetimleri
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(/Turkcell/i);
  });

  it('[FIREWALL_DELIMITER_EXP_151/200] Vector 5: Delimiters ("|", "•", "-", "/") inside descriptions CANNOT split experiences', () => {
    const cv = `
Adile Naşit
İstanbul / Kadıköy | adile@example.com
Müşteri Hizmetleri Müdürü

DENEYİM
Turkcell Global Bilgi A.Ş. - Müşteri Hizmetleri Müdürü (2018 - 2024)
• Çağrı merkezi KPI takibi | CSAT ve FCR yönetimi
- Günlük 50+ personel koordinasyonu / Vardiya planlaması
✓ Süreç optimizasyonu → Kalite kontrol denetimleri
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(/Turkcell/i);
  });

  it('[FIREWALL_DELIMITER_EXP_152/200] Vector 5: Delimiters ("|", "•", "-", "/") inside descriptions CANNOT split experiences', () => {
    const cv = `
Adile Naşit
İstanbul / Kadıköy | adile@example.com
Müşteri Hizmetleri Müdürü

DENEYİM
Turkcell Global Bilgi A.Ş. - Müşteri Hizmetleri Müdürü (2018 - 2024)
• Çağrı merkezi KPI takibi | CSAT ve FCR yönetimi
- Günlük 50+ personel koordinasyonu / Vardiya planlaması
✓ Süreç optimizasyonu → Kalite kontrol denetimleri
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(/Turkcell/i);
  });

  it('[FIREWALL_DELIMITER_EXP_153/200] Vector 5: Delimiters ("|", "•", "-", "/") inside descriptions CANNOT split experiences', () => {
    const cv = `
Adile Naşit
İstanbul / Kadıköy | adile@example.com
Müşteri Hizmetleri Müdürü

DENEYİM
Turkcell Global Bilgi A.Ş. - Müşteri Hizmetleri Müdürü (2018 - 2024)
• Çağrı merkezi KPI takibi | CSAT ve FCR yönetimi
- Günlük 50+ personel koordinasyonu / Vardiya planlaması
✓ Süreç optimizasyonu → Kalite kontrol denetimleri
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(/Turkcell/i);
  });

  it('[FIREWALL_DELIMITER_EXP_154/200] Vector 5: Delimiters ("|", "•", "-", "/") inside descriptions CANNOT split experiences', () => {
    const cv = `
Adile Naşit
İstanbul / Kadıköy | adile@example.com
Müşteri Hizmetleri Müdürü

DENEYİM
Turkcell Global Bilgi A.Ş. - Müşteri Hizmetleri Müdürü (2018 - 2024)
• Çağrı merkezi KPI takibi | CSAT ve FCR yönetimi
- Günlük 50+ personel koordinasyonu / Vardiya planlaması
✓ Süreç optimizasyonu → Kalite kontrol denetimleri
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(/Turkcell/i);
  });

  it('[FIREWALL_DELIMITER_EXP_155/200] Vector 5: Delimiters ("|", "•", "-", "/") inside descriptions CANNOT split experiences', () => {
    const cv = `
Adile Naşit
İstanbul / Kadıköy | adile@example.com
Müşteri Hizmetleri Müdürü

DENEYİM
Turkcell Global Bilgi A.Ş. - Müşteri Hizmetleri Müdürü (2018 - 2024)
• Çağrı merkezi KPI takibi | CSAT ve FCR yönetimi
- Günlük 50+ personel koordinasyonu / Vardiya planlaması
✓ Süreç optimizasyonu → Kalite kontrol denetimleri
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(/Turkcell/i);
  });

  it('[FIREWALL_DELIMITER_EXP_156/200] Vector 5: Delimiters ("|", "•", "-", "/") inside descriptions CANNOT split experiences', () => {
    const cv = `
Adile Naşit
İstanbul / Kadıköy | adile@example.com
Müşteri Hizmetleri Müdürü

DENEYİM
Turkcell Global Bilgi A.Ş. - Müşteri Hizmetleri Müdürü (2018 - 2024)
• Çağrı merkezi KPI takibi | CSAT ve FCR yönetimi
- Günlük 50+ personel koordinasyonu / Vardiya planlaması
✓ Süreç optimizasyonu → Kalite kontrol denetimleri
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(/Turkcell/i);
  });

  it('[FIREWALL_DELIMITER_EXP_157/200] Vector 5: Delimiters ("|", "•", "-", "/") inside descriptions CANNOT split experiences', () => {
    const cv = `
Adile Naşit
İstanbul / Kadıköy | adile@example.com
Müşteri Hizmetleri Müdürü

DENEYİM
Turkcell Global Bilgi A.Ş. - Müşteri Hizmetleri Müdürü (2018 - 2024)
• Çağrı merkezi KPI takibi | CSAT ve FCR yönetimi
- Günlük 50+ personel koordinasyonu / Vardiya planlaması
✓ Süreç optimizasyonu → Kalite kontrol denetimleri
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(/Turkcell/i);
  });

  it('[FIREWALL_DELIMITER_EXP_158/200] Vector 5: Delimiters ("|", "•", "-", "/") inside descriptions CANNOT split experiences', () => {
    const cv = `
Adile Naşit
İstanbul / Kadıköy | adile@example.com
Müşteri Hizmetleri Müdürü

DENEYİM
Turkcell Global Bilgi A.Ş. - Müşteri Hizmetleri Müdürü (2018 - 2024)
• Çağrı merkezi KPI takibi | CSAT ve FCR yönetimi
- Günlük 50+ personel koordinasyonu / Vardiya planlaması
✓ Süreç optimizasyonu → Kalite kontrol denetimleri
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(/Turkcell/i);
  });

  it('[FIREWALL_DELIMITER_EXP_159/200] Vector 5: Delimiters ("|", "•", "-", "/") inside descriptions CANNOT split experiences', () => {
    const cv = `
Adile Naşit
İstanbul / Kadıköy | adile@example.com
Müşteri Hizmetleri Müdürü

DENEYİM
Turkcell Global Bilgi A.Ş. - Müşteri Hizmetleri Müdürü (2018 - 2024)
• Çağrı merkezi KPI takibi | CSAT ve FCR yönetimi
- Günlük 50+ personel koordinasyonu / Vardiya planlaması
✓ Süreç optimizasyonu → Kalite kontrol denetimleri
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(/Turkcell/i);
  });

  it('[FIREWALL_DELIMITER_EXP_160/200] Vector 5: Delimiters ("|", "•", "-", "/") inside descriptions CANNOT split experiences', () => {
    const cv = `
Adile Naşit
İstanbul / Kadıköy | adile@example.com
Müşteri Hizmetleri Müdürü

DENEYİM
Turkcell Global Bilgi A.Ş. - Müşteri Hizmetleri Müdürü (2018 - 2024)
• Çağrı merkezi KPI takibi | CSAT ve FCR yönetimi
- Günlük 50+ personel koordinasyonu / Vardiya planlaması
✓ Süreç optimizasyonu → Kalite kontrol denetimleri
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(/Turkcell/i);
  });

  it('[FIREWALL_DELIMITER_EXP_161/200] Vector 5: Delimiters ("|", "•", "-", "/") inside descriptions CANNOT split experiences', () => {
    const cv = `
Adile Naşit
İstanbul / Kadıköy | adile@example.com
Müşteri Hizmetleri Müdürü

DENEYİM
Turkcell Global Bilgi A.Ş. - Müşteri Hizmetleri Müdürü (2018 - 2024)
• Çağrı merkezi KPI takibi | CSAT ve FCR yönetimi
- Günlük 50+ personel koordinasyonu / Vardiya planlaması
✓ Süreç optimizasyonu → Kalite kontrol denetimleri
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(/Turkcell/i);
  });

  it('[FIREWALL_DELIMITER_EXP_162/200] Vector 5: Delimiters ("|", "•", "-", "/") inside descriptions CANNOT split experiences', () => {
    const cv = `
Adile Naşit
İstanbul / Kadıköy | adile@example.com
Müşteri Hizmetleri Müdürü

DENEYİM
Turkcell Global Bilgi A.Ş. - Müşteri Hizmetleri Müdürü (2018 - 2024)
• Çağrı merkezi KPI takibi | CSAT ve FCR yönetimi
- Günlük 50+ personel koordinasyonu / Vardiya planlaması
✓ Süreç optimizasyonu → Kalite kontrol denetimleri
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(/Turkcell/i);
  });

  it('[FIREWALL_DELIMITER_EXP_163/200] Vector 5: Delimiters ("|", "•", "-", "/") inside descriptions CANNOT split experiences', () => {
    const cv = `
Adile Naşit
İstanbul / Kadıköy | adile@example.com
Müşteri Hizmetleri Müdürü

DENEYİM
Turkcell Global Bilgi A.Ş. - Müşteri Hizmetleri Müdürü (2018 - 2024)
• Çağrı merkezi KPI takibi | CSAT ve FCR yönetimi
- Günlük 50+ personel koordinasyonu / Vardiya planlaması
✓ Süreç optimizasyonu → Kalite kontrol denetimleri
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(/Turkcell/i);
  });

  it('[FIREWALL_DELIMITER_EXP_164/200] Vector 5: Delimiters ("|", "•", "-", "/") inside descriptions CANNOT split experiences', () => {
    const cv = `
Adile Naşit
İstanbul / Kadıköy | adile@example.com
Müşteri Hizmetleri Müdürü

DENEYİM
Turkcell Global Bilgi A.Ş. - Müşteri Hizmetleri Müdürü (2018 - 2024)
• Çağrı merkezi KPI takibi | CSAT ve FCR yönetimi
- Günlük 50+ personel koordinasyonu / Vardiya planlaması
✓ Süreç optimizasyonu → Kalite kontrol denetimleri
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(/Turkcell/i);
  });

  it('[FIREWALL_DELIMITER_EXP_165/200] Vector 5: Delimiters ("|", "•", "-", "/") inside descriptions CANNOT split experiences', () => {
    const cv = `
Adile Naşit
İstanbul / Kadıköy | adile@example.com
Müşteri Hizmetleri Müdürü

DENEYİM
Turkcell Global Bilgi A.Ş. - Müşteri Hizmetleri Müdürü (2018 - 2024)
• Çağrı merkezi KPI takibi | CSAT ve FCR yönetimi
- Günlük 50+ personel koordinasyonu / Vardiya planlaması
✓ Süreç optimizasyonu → Kalite kontrol denetimleri
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(/Turkcell/i);
  });

  it('[FIREWALL_DELIMITER_EXP_166/200] Vector 5: Delimiters ("|", "•", "-", "/") inside descriptions CANNOT split experiences', () => {
    const cv = `
Adile Naşit
İstanbul / Kadıköy | adile@example.com
Müşteri Hizmetleri Müdürü

DENEYİM
Turkcell Global Bilgi A.Ş. - Müşteri Hizmetleri Müdürü (2018 - 2024)
• Çağrı merkezi KPI takibi | CSAT ve FCR yönetimi
- Günlük 50+ personel koordinasyonu / Vardiya planlaması
✓ Süreç optimizasyonu → Kalite kontrol denetimleri
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(/Turkcell/i);
  });

  it('[FIREWALL_DELIMITER_EXP_167/200] Vector 5: Delimiters ("|", "•", "-", "/") inside descriptions CANNOT split experiences', () => {
    const cv = `
Adile Naşit
İstanbul / Kadıköy | adile@example.com
Müşteri Hizmetleri Müdürü

DENEYİM
Turkcell Global Bilgi A.Ş. - Müşteri Hizmetleri Müdürü (2018 - 2024)
• Çağrı merkezi KPI takibi | CSAT ve FCR yönetimi
- Günlük 50+ personel koordinasyonu / Vardiya planlaması
✓ Süreç optimizasyonu → Kalite kontrol denetimleri
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(/Turkcell/i);
  });

  it('[FIREWALL_DELIMITER_EXP_168/200] Vector 5: Delimiters ("|", "•", "-", "/") inside descriptions CANNOT split experiences', () => {
    const cv = `
Adile Naşit
İstanbul / Kadıköy | adile@example.com
Müşteri Hizmetleri Müdürü

DENEYİM
Turkcell Global Bilgi A.Ş. - Müşteri Hizmetleri Müdürü (2018 - 2024)
• Çağrı merkezi KPI takibi | CSAT ve FCR yönetimi
- Günlük 50+ personel koordinasyonu / Vardiya planlaması
✓ Süreç optimizasyonu → Kalite kontrol denetimleri
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(/Turkcell/i);
  });

  it('[FIREWALL_DELIMITER_EXP_169/200] Vector 5: Delimiters ("|", "•", "-", "/") inside descriptions CANNOT split experiences', () => {
    const cv = `
Adile Naşit
İstanbul / Kadıköy | adile@example.com
Müşteri Hizmetleri Müdürü

DENEYİM
Turkcell Global Bilgi A.Ş. - Müşteri Hizmetleri Müdürü (2018 - 2024)
• Çağrı merkezi KPI takibi | CSAT ve FCR yönetimi
- Günlük 50+ personel koordinasyonu / Vardiya planlaması
✓ Süreç optimizasyonu → Kalite kontrol denetimleri
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(/Turkcell/i);
  });

  it('[FIREWALL_DELIMITER_EXP_170/200] Vector 5: Delimiters ("|", "•", "-", "/") inside descriptions CANNOT split experiences', () => {
    const cv = `
Adile Naşit
İstanbul / Kadıköy | adile@example.com
Müşteri Hizmetleri Müdürü

DENEYİM
Turkcell Global Bilgi A.Ş. - Müşteri Hizmetleri Müdürü (2018 - 2024)
• Çağrı merkezi KPI takibi | CSAT ve FCR yönetimi
- Günlük 50+ personel koordinasyonu / Vardiya planlaması
✓ Süreç optimizasyonu → Kalite kontrol denetimleri
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(/Turkcell/i);
  });

  it('[FIREWALL_HOBBY_CERT_171/200] Vector 6: Hobbies & Certs isolated from Roles & Names', () => {
    const cv = `
Şener Şen
İstanbul / Sarıyer | 0532 888 77 66
Genel Sanat Yönetmeni

DENEYİM
Arzu Film Prodüksiyon A.Ş. - Genel Sanat Yönetmeni (2010 - 2024)

SERTİFİKALAR
PMP Proje Yönetimi Sertifikası
Scrum Master Sertifikası

HOBİLER
Fotoğrafçılık, Tenis, Dağcılık

EĞİTİM
İstanbul Üniversitesi Konservatuvarı (1980 - 1984)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Şener Şen');
    expect(canonical.fullName).not.toBe('İstanbul Üniversitesi');
    expect(canonical.primaryRole).not.toBe('PMP Proje Yönetimi Sertifikası');
    expect(canonical.professionalSkills).not.toContain('Dağcılık');
    expect(canonical.professionalSkills).not.toContain('Tenis');
  });

  it('[FIREWALL_HOBBY_CERT_172/200] Vector 6: Hobbies & Certs isolated from Roles & Names', () => {
    const cv = `
Şener Şen
İstanbul / Sarıyer | 0532 888 77 66
Genel Sanat Yönetmeni

DENEYİM
Arzu Film Prodüksiyon A.Ş. - Genel Sanat Yönetmeni (2010 - 2024)

SERTİFİKALAR
PMP Proje Yönetimi Sertifikası
Scrum Master Sertifikası

HOBİLER
Fotoğrafçılık, Tenis, Dağcılık

EĞİTİM
İstanbul Üniversitesi Konservatuvarı (1980 - 1984)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Şener Şen');
    expect(canonical.fullName).not.toBe('İstanbul Üniversitesi');
    expect(canonical.primaryRole).not.toBe('PMP Proje Yönetimi Sertifikası');
    expect(canonical.professionalSkills).not.toContain('Dağcılık');
    expect(canonical.professionalSkills).not.toContain('Tenis');
  });

  it('[FIREWALL_HOBBY_CERT_173/200] Vector 6: Hobbies & Certs isolated from Roles & Names', () => {
    const cv = `
Şener Şen
İstanbul / Sarıyer | 0532 888 77 66
Genel Sanat Yönetmeni

DENEYİM
Arzu Film Prodüksiyon A.Ş. - Genel Sanat Yönetmeni (2010 - 2024)

SERTİFİKALAR
PMP Proje Yönetimi Sertifikası
Scrum Master Sertifikası

HOBİLER
Fotoğrafçılık, Tenis, Dağcılık

EĞİTİM
İstanbul Üniversitesi Konservatuvarı (1980 - 1984)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Şener Şen');
    expect(canonical.fullName).not.toBe('İstanbul Üniversitesi');
    expect(canonical.primaryRole).not.toBe('PMP Proje Yönetimi Sertifikası');
    expect(canonical.professionalSkills).not.toContain('Dağcılık');
    expect(canonical.professionalSkills).not.toContain('Tenis');
  });

  it('[FIREWALL_HOBBY_CERT_174/200] Vector 6: Hobbies & Certs isolated from Roles & Names', () => {
    const cv = `
Şener Şen
İstanbul / Sarıyer | 0532 888 77 66
Genel Sanat Yönetmeni

DENEYİM
Arzu Film Prodüksiyon A.Ş. - Genel Sanat Yönetmeni (2010 - 2024)

SERTİFİKALAR
PMP Proje Yönetimi Sertifikası
Scrum Master Sertifikası

HOBİLER
Fotoğrafçılık, Tenis, Dağcılık

EĞİTİM
İstanbul Üniversitesi Konservatuvarı (1980 - 1984)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Şener Şen');
    expect(canonical.fullName).not.toBe('İstanbul Üniversitesi');
    expect(canonical.primaryRole).not.toBe('PMP Proje Yönetimi Sertifikası');
    expect(canonical.professionalSkills).not.toContain('Dağcılık');
    expect(canonical.professionalSkills).not.toContain('Tenis');
  });

  it('[FIREWALL_HOBBY_CERT_175/200] Vector 6: Hobbies & Certs isolated from Roles & Names', () => {
    const cv = `
Şener Şen
İstanbul / Sarıyer | 0532 888 77 66
Genel Sanat Yönetmeni

DENEYİM
Arzu Film Prodüksiyon A.Ş. - Genel Sanat Yönetmeni (2010 - 2024)

SERTİFİKALAR
PMP Proje Yönetimi Sertifikası
Scrum Master Sertifikası

HOBİLER
Fotoğrafçılık, Tenis, Dağcılık

EĞİTİM
İstanbul Üniversitesi Konservatuvarı (1980 - 1984)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Şener Şen');
    expect(canonical.fullName).not.toBe('İstanbul Üniversitesi');
    expect(canonical.primaryRole).not.toBe('PMP Proje Yönetimi Sertifikası');
    expect(canonical.professionalSkills).not.toContain('Dağcılık');
    expect(canonical.professionalSkills).not.toContain('Tenis');
  });

  it('[FIREWALL_HOBBY_CERT_176/200] Vector 6: Hobbies & Certs isolated from Roles & Names', () => {
    const cv = `
Şener Şen
İstanbul / Sarıyer | 0532 888 77 66
Genel Sanat Yönetmeni

DENEYİM
Arzu Film Prodüksiyon A.Ş. - Genel Sanat Yönetmeni (2010 - 2024)

SERTİFİKALAR
PMP Proje Yönetimi Sertifikası
Scrum Master Sertifikası

HOBİLER
Fotoğrafçılık, Tenis, Dağcılık

EĞİTİM
İstanbul Üniversitesi Konservatuvarı (1980 - 1984)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Şener Şen');
    expect(canonical.fullName).not.toBe('İstanbul Üniversitesi');
    expect(canonical.primaryRole).not.toBe('PMP Proje Yönetimi Sertifikası');
    expect(canonical.professionalSkills).not.toContain('Dağcılık');
    expect(canonical.professionalSkills).not.toContain('Tenis');
  });

  it('[FIREWALL_HOBBY_CERT_177/200] Vector 6: Hobbies & Certs isolated from Roles & Names', () => {
    const cv = `
Şener Şen
İstanbul / Sarıyer | 0532 888 77 66
Genel Sanat Yönetmeni

DENEYİM
Arzu Film Prodüksiyon A.Ş. - Genel Sanat Yönetmeni (2010 - 2024)

SERTİFİKALAR
PMP Proje Yönetimi Sertifikası
Scrum Master Sertifikası

HOBİLER
Fotoğrafçılık, Tenis, Dağcılık

EĞİTİM
İstanbul Üniversitesi Konservatuvarı (1980 - 1984)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Şener Şen');
    expect(canonical.fullName).not.toBe('İstanbul Üniversitesi');
    expect(canonical.primaryRole).not.toBe('PMP Proje Yönetimi Sertifikası');
    expect(canonical.professionalSkills).not.toContain('Dağcılık');
    expect(canonical.professionalSkills).not.toContain('Tenis');
  });

  it('[FIREWALL_HOBBY_CERT_178/200] Vector 6: Hobbies & Certs isolated from Roles & Names', () => {
    const cv = `
Şener Şen
İstanbul / Sarıyer | 0532 888 77 66
Genel Sanat Yönetmeni

DENEYİM
Arzu Film Prodüksiyon A.Ş. - Genel Sanat Yönetmeni (2010 - 2024)

SERTİFİKALAR
PMP Proje Yönetimi Sertifikası
Scrum Master Sertifikası

HOBİLER
Fotoğrafçılık, Tenis, Dağcılık

EĞİTİM
İstanbul Üniversitesi Konservatuvarı (1980 - 1984)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Şener Şen');
    expect(canonical.fullName).not.toBe('İstanbul Üniversitesi');
    expect(canonical.primaryRole).not.toBe('PMP Proje Yönetimi Sertifikası');
    expect(canonical.professionalSkills).not.toContain('Dağcılık');
    expect(canonical.professionalSkills).not.toContain('Tenis');
  });

  it('[FIREWALL_HOBBY_CERT_179/200] Vector 6: Hobbies & Certs isolated from Roles & Names', () => {
    const cv = `
Şener Şen
İstanbul / Sarıyer | 0532 888 77 66
Genel Sanat Yönetmeni

DENEYİM
Arzu Film Prodüksiyon A.Ş. - Genel Sanat Yönetmeni (2010 - 2024)

SERTİFİKALAR
PMP Proje Yönetimi Sertifikası
Scrum Master Sertifikası

HOBİLER
Fotoğrafçılık, Tenis, Dağcılık

EĞİTİM
İstanbul Üniversitesi Konservatuvarı (1980 - 1984)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Şener Şen');
    expect(canonical.fullName).not.toBe('İstanbul Üniversitesi');
    expect(canonical.primaryRole).not.toBe('PMP Proje Yönetimi Sertifikası');
    expect(canonical.professionalSkills).not.toContain('Dağcılık');
    expect(canonical.professionalSkills).not.toContain('Tenis');
  });

  it('[FIREWALL_HOBBY_CERT_180/200] Vector 6: Hobbies & Certs isolated from Roles & Names', () => {
    const cv = `
Şener Şen
İstanbul / Sarıyer | 0532 888 77 66
Genel Sanat Yönetmeni

DENEYİM
Arzu Film Prodüksiyon A.Ş. - Genel Sanat Yönetmeni (2010 - 2024)

SERTİFİKALAR
PMP Proje Yönetimi Sertifikası
Scrum Master Sertifikası

HOBİLER
Fotoğrafçılık, Tenis, Dağcılık

EĞİTİM
İstanbul Üniversitesi Konservatuvarı (1980 - 1984)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Şener Şen');
    expect(canonical.fullName).not.toBe('İstanbul Üniversitesi');
    expect(canonical.primaryRole).not.toBe('PMP Proje Yönetimi Sertifikası');
    expect(canonical.professionalSkills).not.toContain('Dağcılık');
    expect(canonical.professionalSkills).not.toContain('Tenis');
  });

  it('[FIREWALL_HOBBY_CERT_181/200] Vector 6: Hobbies & Certs isolated from Roles & Names', () => {
    const cv = `
Şener Şen
İstanbul / Sarıyer | 0532 888 77 66
Genel Sanat Yönetmeni

DENEYİM
Arzu Film Prodüksiyon A.Ş. - Genel Sanat Yönetmeni (2010 - 2024)

SERTİFİKALAR
PMP Proje Yönetimi Sertifikası
Scrum Master Sertifikası

HOBİLER
Fotoğrafçılık, Tenis, Dağcılık

EĞİTİM
İstanbul Üniversitesi Konservatuvarı (1980 - 1984)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Şener Şen');
    expect(canonical.fullName).not.toBe('İstanbul Üniversitesi');
    expect(canonical.primaryRole).not.toBe('PMP Proje Yönetimi Sertifikası');
    expect(canonical.professionalSkills).not.toContain('Dağcılık');
    expect(canonical.professionalSkills).not.toContain('Tenis');
  });

  it('[FIREWALL_HOBBY_CERT_182/200] Vector 6: Hobbies & Certs isolated from Roles & Names', () => {
    const cv = `
Şener Şen
İstanbul / Sarıyer | 0532 888 77 66
Genel Sanat Yönetmeni

DENEYİM
Arzu Film Prodüksiyon A.Ş. - Genel Sanat Yönetmeni (2010 - 2024)

SERTİFİKALAR
PMP Proje Yönetimi Sertifikası
Scrum Master Sertifikası

HOBİLER
Fotoğrafçılık, Tenis, Dağcılık

EĞİTİM
İstanbul Üniversitesi Konservatuvarı (1980 - 1984)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Şener Şen');
    expect(canonical.fullName).not.toBe('İstanbul Üniversitesi');
    expect(canonical.primaryRole).not.toBe('PMP Proje Yönetimi Sertifikası');
    expect(canonical.professionalSkills).not.toContain('Dağcılık');
    expect(canonical.professionalSkills).not.toContain('Tenis');
  });

  it('[FIREWALL_HOBBY_CERT_183/200] Vector 6: Hobbies & Certs isolated from Roles & Names', () => {
    const cv = `
Şener Şen
İstanbul / Sarıyer | 0532 888 77 66
Genel Sanat Yönetmeni

DENEYİM
Arzu Film Prodüksiyon A.Ş. - Genel Sanat Yönetmeni (2010 - 2024)

SERTİFİKALAR
PMP Proje Yönetimi Sertifikası
Scrum Master Sertifikası

HOBİLER
Fotoğrafçılık, Tenis, Dağcılık

EĞİTİM
İstanbul Üniversitesi Konservatuvarı (1980 - 1984)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Şener Şen');
    expect(canonical.fullName).not.toBe('İstanbul Üniversitesi');
    expect(canonical.primaryRole).not.toBe('PMP Proje Yönetimi Sertifikası');
    expect(canonical.professionalSkills).not.toContain('Dağcılık');
    expect(canonical.professionalSkills).not.toContain('Tenis');
  });

  it('[FIREWALL_HOBBY_CERT_184/200] Vector 6: Hobbies & Certs isolated from Roles & Names', () => {
    const cv = `
Şener Şen
İstanbul / Sarıyer | 0532 888 77 66
Genel Sanat Yönetmeni

DENEYİM
Arzu Film Prodüksiyon A.Ş. - Genel Sanat Yönetmeni (2010 - 2024)

SERTİFİKALAR
PMP Proje Yönetimi Sertifikası
Scrum Master Sertifikası

HOBİLER
Fotoğrafçılık, Tenis, Dağcılık

EĞİTİM
İstanbul Üniversitesi Konservatuvarı (1980 - 1984)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Şener Şen');
    expect(canonical.fullName).not.toBe('İstanbul Üniversitesi');
    expect(canonical.primaryRole).not.toBe('PMP Proje Yönetimi Sertifikası');
    expect(canonical.professionalSkills).not.toContain('Dağcılık');
    expect(canonical.professionalSkills).not.toContain('Tenis');
  });

  it('[FIREWALL_HOBBY_CERT_185/200] Vector 6: Hobbies & Certs isolated from Roles & Names', () => {
    const cv = `
Şener Şen
İstanbul / Sarıyer | 0532 888 77 66
Genel Sanat Yönetmeni

DENEYİM
Arzu Film Prodüksiyon A.Ş. - Genel Sanat Yönetmeni (2010 - 2024)

SERTİFİKALAR
PMP Proje Yönetimi Sertifikası
Scrum Master Sertifikası

HOBİLER
Fotoğrafçılık, Tenis, Dağcılık

EĞİTİM
İstanbul Üniversitesi Konservatuvarı (1980 - 1984)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Şener Şen');
    expect(canonical.fullName).not.toBe('İstanbul Üniversitesi');
    expect(canonical.primaryRole).not.toBe('PMP Proje Yönetimi Sertifikası');
    expect(canonical.professionalSkills).not.toContain('Dağcılık');
    expect(canonical.professionalSkills).not.toContain('Tenis');
  });

  it('[FIREWALL_HOBBY_CERT_186/200] Vector 6: Hobbies & Certs isolated from Roles & Names', () => {
    const cv = `
Şener Şen
İstanbul / Sarıyer | 0532 888 77 66
Genel Sanat Yönetmeni

DENEYİM
Arzu Film Prodüksiyon A.Ş. - Genel Sanat Yönetmeni (2010 - 2024)

SERTİFİKALAR
PMP Proje Yönetimi Sertifikası
Scrum Master Sertifikası

HOBİLER
Fotoğrafçılık, Tenis, Dağcılık

EĞİTİM
İstanbul Üniversitesi Konservatuvarı (1980 - 1984)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Şener Şen');
    expect(canonical.fullName).not.toBe('İstanbul Üniversitesi');
    expect(canonical.primaryRole).not.toBe('PMP Proje Yönetimi Sertifikası');
    expect(canonical.professionalSkills).not.toContain('Dağcılık');
    expect(canonical.professionalSkills).not.toContain('Tenis');
  });

  it('[FIREWALL_HOBBY_CERT_187/200] Vector 6: Hobbies & Certs isolated from Roles & Names', () => {
    const cv = `
Şener Şen
İstanbul / Sarıyer | 0532 888 77 66
Genel Sanat Yönetmeni

DENEYİM
Arzu Film Prodüksiyon A.Ş. - Genel Sanat Yönetmeni (2010 - 2024)

SERTİFİKALAR
PMP Proje Yönetimi Sertifikası
Scrum Master Sertifikası

HOBİLER
Fotoğrafçılık, Tenis, Dağcılık

EĞİTİM
İstanbul Üniversitesi Konservatuvarı (1980 - 1984)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Şener Şen');
    expect(canonical.fullName).not.toBe('İstanbul Üniversitesi');
    expect(canonical.primaryRole).not.toBe('PMP Proje Yönetimi Sertifikası');
    expect(canonical.professionalSkills).not.toContain('Dağcılık');
    expect(canonical.professionalSkills).not.toContain('Tenis');
  });

  it('[FIREWALL_HOBBY_CERT_188/200] Vector 6: Hobbies & Certs isolated from Roles & Names', () => {
    const cv = `
Şener Şen
İstanbul / Sarıyer | 0532 888 77 66
Genel Sanat Yönetmeni

DENEYİM
Arzu Film Prodüksiyon A.Ş. - Genel Sanat Yönetmeni (2010 - 2024)

SERTİFİKALAR
PMP Proje Yönetimi Sertifikası
Scrum Master Sertifikası

HOBİLER
Fotoğrafçılık, Tenis, Dağcılık

EĞİTİM
İstanbul Üniversitesi Konservatuvarı (1980 - 1984)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Şener Şen');
    expect(canonical.fullName).not.toBe('İstanbul Üniversitesi');
    expect(canonical.primaryRole).not.toBe('PMP Proje Yönetimi Sertifikası');
    expect(canonical.professionalSkills).not.toContain('Dağcılık');
    expect(canonical.professionalSkills).not.toContain('Tenis');
  });

  it('[FIREWALL_HOBBY_CERT_189/200] Vector 6: Hobbies & Certs isolated from Roles & Names', () => {
    const cv = `
Şener Şen
İstanbul / Sarıyer | 0532 888 77 66
Genel Sanat Yönetmeni

DENEYİM
Arzu Film Prodüksiyon A.Ş. - Genel Sanat Yönetmeni (2010 - 2024)

SERTİFİKALAR
PMP Proje Yönetimi Sertifikası
Scrum Master Sertifikası

HOBİLER
Fotoğrafçılık, Tenis, Dağcılık

EĞİTİM
İstanbul Üniversitesi Konservatuvarı (1980 - 1984)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Şener Şen');
    expect(canonical.fullName).not.toBe('İstanbul Üniversitesi');
    expect(canonical.primaryRole).not.toBe('PMP Proje Yönetimi Sertifikası');
    expect(canonical.professionalSkills).not.toContain('Dağcılık');
    expect(canonical.professionalSkills).not.toContain('Tenis');
  });

  it('[FIREWALL_HOBBY_CERT_190/200] Vector 6: Hobbies & Certs isolated from Roles & Names', () => {
    const cv = `
Şener Şen
İstanbul / Sarıyer | 0532 888 77 66
Genel Sanat Yönetmeni

DENEYİM
Arzu Film Prodüksiyon A.Ş. - Genel Sanat Yönetmeni (2010 - 2024)

SERTİFİKALAR
PMP Proje Yönetimi Sertifikası
Scrum Master Sertifikası

HOBİLER
Fotoğrafçılık, Tenis, Dağcılık

EĞİTİM
İstanbul Üniversitesi Konservatuvarı (1980 - 1984)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Şener Şen');
    expect(canonical.fullName).not.toBe('İstanbul Üniversitesi');
    expect(canonical.primaryRole).not.toBe('PMP Proje Yönetimi Sertifikası');
    expect(canonical.professionalSkills).not.toContain('Dağcılık');
    expect(canonical.professionalSkills).not.toContain('Tenis');
  });

  it('[FIREWALL_HOBBY_CERT_191/200] Vector 6: Hobbies & Certs isolated from Roles & Names', () => {
    const cv = `
Şener Şen
İstanbul / Sarıyer | 0532 888 77 66
Genel Sanat Yönetmeni

DENEYİM
Arzu Film Prodüksiyon A.Ş. - Genel Sanat Yönetmeni (2010 - 2024)

SERTİFİKALAR
PMP Proje Yönetimi Sertifikası
Scrum Master Sertifikası

HOBİLER
Fotoğrafçılık, Tenis, Dağcılık

EĞİTİM
İstanbul Üniversitesi Konservatuvarı (1980 - 1984)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Şener Şen');
    expect(canonical.fullName).not.toBe('İstanbul Üniversitesi');
    expect(canonical.primaryRole).not.toBe('PMP Proje Yönetimi Sertifikası');
    expect(canonical.professionalSkills).not.toContain('Dağcılık');
    expect(canonical.professionalSkills).not.toContain('Tenis');
  });

  it('[FIREWALL_HOBBY_CERT_192/200] Vector 6: Hobbies & Certs isolated from Roles & Names', () => {
    const cv = `
Şener Şen
İstanbul / Sarıyer | 0532 888 77 66
Genel Sanat Yönetmeni

DENEYİM
Arzu Film Prodüksiyon A.Ş. - Genel Sanat Yönetmeni (2010 - 2024)

SERTİFİKALAR
PMP Proje Yönetimi Sertifikası
Scrum Master Sertifikası

HOBİLER
Fotoğrafçılık, Tenis, Dağcılık

EĞİTİM
İstanbul Üniversitesi Konservatuvarı (1980 - 1984)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Şener Şen');
    expect(canonical.fullName).not.toBe('İstanbul Üniversitesi');
    expect(canonical.primaryRole).not.toBe('PMP Proje Yönetimi Sertifikası');
    expect(canonical.professionalSkills).not.toContain('Dağcılık');
    expect(canonical.professionalSkills).not.toContain('Tenis');
  });

  it('[FIREWALL_HOBBY_CERT_193/200] Vector 6: Hobbies & Certs isolated from Roles & Names', () => {
    const cv = `
Şener Şen
İstanbul / Sarıyer | 0532 888 77 66
Genel Sanat Yönetmeni

DENEYİM
Arzu Film Prodüksiyon A.Ş. - Genel Sanat Yönetmeni (2010 - 2024)

SERTİFİKALAR
PMP Proje Yönetimi Sertifikası
Scrum Master Sertifikası

HOBİLER
Fotoğrafçılık, Tenis, Dağcılık

EĞİTİM
İstanbul Üniversitesi Konservatuvarı (1980 - 1984)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Şener Şen');
    expect(canonical.fullName).not.toBe('İstanbul Üniversitesi');
    expect(canonical.primaryRole).not.toBe('PMP Proje Yönetimi Sertifikası');
    expect(canonical.professionalSkills).not.toContain('Dağcılık');
    expect(canonical.professionalSkills).not.toContain('Tenis');
  });

  it('[FIREWALL_HOBBY_CERT_194/200] Vector 6: Hobbies & Certs isolated from Roles & Names', () => {
    const cv = `
Şener Şen
İstanbul / Sarıyer | 0532 888 77 66
Genel Sanat Yönetmeni

DENEYİM
Arzu Film Prodüksiyon A.Ş. - Genel Sanat Yönetmeni (2010 - 2024)

SERTİFİKALAR
PMP Proje Yönetimi Sertifikası
Scrum Master Sertifikası

HOBİLER
Fotoğrafçılık, Tenis, Dağcılık

EĞİTİM
İstanbul Üniversitesi Konservatuvarı (1980 - 1984)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Şener Şen');
    expect(canonical.fullName).not.toBe('İstanbul Üniversitesi');
    expect(canonical.primaryRole).not.toBe('PMP Proje Yönetimi Sertifikası');
    expect(canonical.professionalSkills).not.toContain('Dağcılık');
    expect(canonical.professionalSkills).not.toContain('Tenis');
  });

  it('[FIREWALL_HOBBY_CERT_195/200] Vector 6: Hobbies & Certs isolated from Roles & Names', () => {
    const cv = `
Şener Şen
İstanbul / Sarıyer | 0532 888 77 66
Genel Sanat Yönetmeni

DENEYİM
Arzu Film Prodüksiyon A.Ş. - Genel Sanat Yönetmeni (2010 - 2024)

SERTİFİKALAR
PMP Proje Yönetimi Sertifikası
Scrum Master Sertifikası

HOBİLER
Fotoğrafçılık, Tenis, Dağcılık

EĞİTİM
İstanbul Üniversitesi Konservatuvarı (1980 - 1984)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Şener Şen');
    expect(canonical.fullName).not.toBe('İstanbul Üniversitesi');
    expect(canonical.primaryRole).not.toBe('PMP Proje Yönetimi Sertifikası');
    expect(canonical.professionalSkills).not.toContain('Dağcılık');
    expect(canonical.professionalSkills).not.toContain('Tenis');
  });

  it('[FIREWALL_HOBBY_CERT_196/200] Vector 6: Hobbies & Certs isolated from Roles & Names', () => {
    const cv = `
Şener Şen
İstanbul / Sarıyer | 0532 888 77 66
Genel Sanat Yönetmeni

DENEYİM
Arzu Film Prodüksiyon A.Ş. - Genel Sanat Yönetmeni (2010 - 2024)

SERTİFİKALAR
PMP Proje Yönetimi Sertifikası
Scrum Master Sertifikası

HOBİLER
Fotoğrafçılık, Tenis, Dağcılık

EĞİTİM
İstanbul Üniversitesi Konservatuvarı (1980 - 1984)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Şener Şen');
    expect(canonical.fullName).not.toBe('İstanbul Üniversitesi');
    expect(canonical.primaryRole).not.toBe('PMP Proje Yönetimi Sertifikası');
    expect(canonical.professionalSkills).not.toContain('Dağcılık');
    expect(canonical.professionalSkills).not.toContain('Tenis');
  });

  it('[FIREWALL_HOBBY_CERT_197/200] Vector 6: Hobbies & Certs isolated from Roles & Names', () => {
    const cv = `
Şener Şen
İstanbul / Sarıyer | 0532 888 77 66
Genel Sanat Yönetmeni

DENEYİM
Arzu Film Prodüksiyon A.Ş. - Genel Sanat Yönetmeni (2010 - 2024)

SERTİFİKALAR
PMP Proje Yönetimi Sertifikası
Scrum Master Sertifikası

HOBİLER
Fotoğrafçılık, Tenis, Dağcılık

EĞİTİM
İstanbul Üniversitesi Konservatuvarı (1980 - 1984)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Şener Şen');
    expect(canonical.fullName).not.toBe('İstanbul Üniversitesi');
    expect(canonical.primaryRole).not.toBe('PMP Proje Yönetimi Sertifikası');
    expect(canonical.professionalSkills).not.toContain('Dağcılık');
    expect(canonical.professionalSkills).not.toContain('Tenis');
  });

  it('[FIREWALL_HOBBY_CERT_198/200] Vector 6: Hobbies & Certs isolated from Roles & Names', () => {
    const cv = `
Şener Şen
İstanbul / Sarıyer | 0532 888 77 66
Genel Sanat Yönetmeni

DENEYİM
Arzu Film Prodüksiyon A.Ş. - Genel Sanat Yönetmeni (2010 - 2024)

SERTİFİKALAR
PMP Proje Yönetimi Sertifikası
Scrum Master Sertifikası

HOBİLER
Fotoğrafçılık, Tenis, Dağcılık

EĞİTİM
İstanbul Üniversitesi Konservatuvarı (1980 - 1984)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Şener Şen');
    expect(canonical.fullName).not.toBe('İstanbul Üniversitesi');
    expect(canonical.primaryRole).not.toBe('PMP Proje Yönetimi Sertifikası');
    expect(canonical.professionalSkills).not.toContain('Dağcılık');
    expect(canonical.professionalSkills).not.toContain('Tenis');
  });

  it('[FIREWALL_HOBBY_CERT_199/200] Vector 6: Hobbies & Certs isolated from Roles & Names', () => {
    const cv = `
Şener Şen
İstanbul / Sarıyer | 0532 888 77 66
Genel Sanat Yönetmeni

DENEYİM
Arzu Film Prodüksiyon A.Ş. - Genel Sanat Yönetmeni (2010 - 2024)

SERTİFİKALAR
PMP Proje Yönetimi Sertifikası
Scrum Master Sertifikası

HOBİLER
Fotoğrafçılık, Tenis, Dağcılık

EĞİTİM
İstanbul Üniversitesi Konservatuvarı (1980 - 1984)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Şener Şen');
    expect(canonical.fullName).not.toBe('İstanbul Üniversitesi');
    expect(canonical.primaryRole).not.toBe('PMP Proje Yönetimi Sertifikası');
    expect(canonical.professionalSkills).not.toContain('Dağcılık');
    expect(canonical.professionalSkills).not.toContain('Tenis');
  });

  it('[FIREWALL_HOBBY_CERT_200/200] Vector 6: Hobbies & Certs isolated from Roles & Names', () => {
    const cv = `
Şener Şen
İstanbul / Sarıyer | 0532 888 77 66
Genel Sanat Yönetmeni

DENEYİM
Arzu Film Prodüksiyon A.Ş. - Genel Sanat Yönetmeni (2010 - 2024)

SERTİFİKALAR
PMP Proje Yönetimi Sertifikası
Scrum Master Sertifikası

HOBİLER
Fotoğrafçılık, Tenis, Dağcılık

EĞİTİM
İstanbul Üniversitesi Konservatuvarı (1980 - 1984)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Şener Şen');
    expect(canonical.fullName).not.toBe('İstanbul Üniversitesi');
    expect(canonical.primaryRole).not.toBe('PMP Proje Yönetimi Sertifikası');
    expect(canonical.professionalSkills).not.toContain('Dağcılık');
    expect(canonical.professionalSkills).not.toContain('Tenis');
  });
});
