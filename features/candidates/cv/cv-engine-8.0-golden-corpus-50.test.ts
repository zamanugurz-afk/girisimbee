import { describe, expect, it } from 'vitest';
import {
  extractDeterministicCv,
  extractDeterministicExperiences,
  extractDeterministicEducation,
  extractDeterministicSkillsAndTools,
} from './cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from './cv-taxonomy-mapper';
import { buildCvEvidenceGraph } from './cv-evidence-graph';

describe('CV Extraction Engine 8.0 — 50 Golden Benchmark Corpus', () => {
  it('Golden Benchmark [#1/50]: Uğur Zaman with strict forbidden negative checks', () => {
    const cv = `
Uğur Zaman
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

EĞİTİM
Marmara Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

İŞ DENEYİMİ
IGS Türkiye - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
Departman yönetimi ve stratejik operasyonlar.

REFERANSLAR
Ali Vural - Genel Müdür
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Uğur Zaman');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Golden Benchmark [#2/50]: Gizem Saylan with strict forbidden negative checks', () => {
    const cv = `
Gizem Saylan
İstanbul / Maltepe
Bölge Satış Müdürü

EĞİTİM
Marmara Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

İŞ DENEYİMİ
Mey Diageo Sanayi A.Ş. - Bölge Satış Müdürü (2018 - 2024)
Departman yönetimi ve stratejik operasyonlar.

REFERANSLAR
Ali Vural - Genel Müdür
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Gizem Saylan');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Golden Benchmark [#3/50]: Burak Batıl with strict forbidden negative checks', () => {
    const cv = `
Burak Batıl
İstanbul / Maltepe
Kıdemli Yazılım Mühendisi

EĞİTİM
Marmara Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

İŞ DENEYİMİ
Getir Teknoloji A.Ş. - Kıdemli Yazılım Mühendisi (2018 - 2024)
Departman yönetimi ve stratejik operasyonlar.

REFERANSLAR
Ali Vural - Genel Müdür
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Burak Batıl');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Golden Benchmark [#4/50]: Meryem Ekşi with strict forbidden negative checks', () => {
    const cv = `
Meryem Ekşi
İstanbul / Maltepe
İnsan Kaynakları Direktörü

EĞİTİM
Marmara Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

İŞ DENEYİMİ
KPMG Danışmanlık A.Ş. - İnsan Kaynakları Direktörü (2018 - 2024)
Departman yönetimi ve stratejik operasyonlar.

REFERANSLAR
Ali Vural - Genel Müdür
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Meryem Ekşi');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Golden Benchmark [#5/50]: Ahmet Karaca with strict forbidden negative checks', () => {
    const cv = `
Ahmet Karaca
İstanbul / Maltepe
Mali İşler Müdürü

EĞİTİM
Marmara Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

İŞ DENEYİMİ
Akbank T.A.Ş. - Mali İşler Müdürü (2018 - 2024)
Departman yönetimi ve stratejik operasyonlar.

REFERANSLAR
Ali Vural - Genel Müdür
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ahmet Karaca');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Golden Benchmark [#6/50]: Selin Demirtaş with strict forbidden negative checks', () => {
    const cv = `
Selin Demirtaş
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

EĞİTİM
Marmara Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

İŞ DENEYİMİ
IGS Türkiye - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
Departman yönetimi ve stratejik operasyonlar.

REFERANSLAR
Ali Vural - Genel Müdür
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Demirtaş');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Golden Benchmark [#7/50]: Can Doğan with strict forbidden negative checks', () => {
    const cv = `
Can Doğan
İstanbul / Maltepe
Bölge Satış Müdürü

EĞİTİM
Marmara Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

İŞ DENEYİMİ
Mey Diageo Sanayi A.Ş. - Bölge Satış Müdürü (2018 - 2024)
Departman yönetimi ve stratejik operasyonlar.

REFERANSLAR
Ali Vural - Genel Müdür
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Can Doğan');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Golden Benchmark [#8/50]: Deniz Efe with strict forbidden negative checks', () => {
    const cv = `
Deniz Efe
İstanbul / Maltepe
Kıdemli Yazılım Mühendisi

EĞİTİM
Marmara Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

İŞ DENEYİMİ
Getir Teknoloji A.Ş. - Kıdemli Yazılım Mühendisi (2018 - 2024)
Departman yönetimi ve stratejik operasyonlar.

REFERANSLAR
Ali Vural - Genel Müdür
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Deniz Efe');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Golden Benchmark [#9/50]: Emre Fidan with strict forbidden negative checks', () => {
    const cv = `
Emre Fidan
İstanbul / Maltepe
İnsan Kaynakları Direktörü

EĞİTİM
Marmara Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

İŞ DENEYİMİ
KPMG Danışmanlık A.Ş. - İnsan Kaynakları Direktörü (2018 - 2024)
Departman yönetimi ve stratejik operasyonlar.

REFERANSLAR
Ali Vural - Genel Müdür
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Emre Fidan');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Golden Benchmark [#10/50]: Fulya Güner with strict forbidden negative checks', () => {
    const cv = `
Fulya Güner
İstanbul / Maltepe
Mali İşler Müdürü

EĞİTİM
Marmara Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

İŞ DENEYİMİ
Akbank T.A.Ş. - Mali İşler Müdürü (2018 - 2024)
Departman yönetimi ve stratejik operasyonlar.

REFERANSLAR
Ali Vural - Genel Müdür
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Fulya Güner');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Golden Benchmark [#11/50]: Gökhan Hakan with strict forbidden negative checks', () => {
    const cv = `
Gökhan Hakan
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

EĞİTİM
Marmara Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

İŞ DENEYİMİ
IGS Türkiye - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
Departman yönetimi ve stratejik operasyonlar.

REFERANSLAR
Ali Vural - Genel Müdür
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Gökhan Hakan');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Golden Benchmark [#12/50]: Hande Işık with strict forbidden negative checks', () => {
    const cv = `
Hande Işık
İstanbul / Maltepe
Bölge Satış Müdürü

EĞİTİM
Marmara Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

İŞ DENEYİMİ
Mey Diageo Sanayi A.Ş. - Bölge Satış Müdürü (2018 - 2024)
Departman yönetimi ve stratejik operasyonlar.

REFERANSLAR
Ali Vural - Genel Müdür
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hande Işık');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Golden Benchmark [#13/50]: İpek Jale with strict forbidden negative checks', () => {
    const cv = `
İpek Jale
İstanbul / Maltepe
Kıdemli Yazılım Mühendisi

EĞİTİM
Marmara Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

İŞ DENEYİMİ
Getir Teknoloji A.Ş. - Kıdemli Yazılım Mühendisi (2018 - 2024)
Departman yönetimi ve stratejik operasyonlar.

REFERANSLAR
Ali Vural - Genel Müdür
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('İpek Jale');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Golden Benchmark [#14/50]: Kaan Kılıç with strict forbidden negative checks', () => {
    const cv = `
Kaan Kılıç
İstanbul / Maltepe
İnsan Kaynakları Direktörü

EĞİTİM
Marmara Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

İŞ DENEYİMİ
KPMG Danışmanlık A.Ş. - İnsan Kaynakları Direktörü (2018 - 2024)
Departman yönetimi ve stratejik operasyonlar.

REFERANSLAR
Ali Vural - Genel Müdür
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kaan Kılıç');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Golden Benchmark [#15/50]: Lale Mutlu with strict forbidden negative checks', () => {
    const cv = `
Lale Mutlu
İstanbul / Maltepe
Mali İşler Müdürü

EĞİTİM
Marmara Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

İŞ DENEYİMİ
Akbank T.A.Ş. - Mali İşler Müdürü (2018 - 2024)
Departman yönetimi ve stratejik operasyonlar.

REFERANSLAR
Ali Vural - Genel Müdür
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Lale Mutlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Golden Benchmark [#16/50]: Murat Nalbant with strict forbidden negative checks', () => {
    const cv = `
Murat Nalbant
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

EĞİTİM
Marmara Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

İŞ DENEYİMİ
IGS Türkiye - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
Departman yönetimi ve stratejik operasyonlar.

REFERANSLAR
Ali Vural - Genel Müdür
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Murat Nalbant');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Golden Benchmark [#17/50]: Nihal Oğuz with strict forbidden negative checks', () => {
    const cv = `
Nihal Oğuz
İstanbul / Maltepe
Bölge Satış Müdürü

EĞİTİM
Marmara Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

İŞ DENEYİMİ
Mey Diageo Sanayi A.Ş. - Bölge Satış Müdürü (2018 - 2024)
Departman yönetimi ve stratejik operasyonlar.

REFERANSLAR
Ali Vural - Genel Müdür
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Nihal Oğuz');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Golden Benchmark [#18/50]: Onur Öztürk with strict forbidden negative checks', () => {
    const cv = `
Onur Öztürk
İstanbul / Maltepe
Kıdemli Yazılım Mühendisi

EĞİTİM
Marmara Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

İŞ DENEYİMİ
Getir Teknoloji A.Ş. - Kıdemli Yazılım Mühendisi (2018 - 2024)
Departman yönetimi ve stratejik operasyonlar.

REFERANSLAR
Ali Vural - Genel Müdür
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Onur Öztürk');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Golden Benchmark [#19/50]: Pelin Polat with strict forbidden negative checks', () => {
    const cv = `
Pelin Polat
İstanbul / Maltepe
İnsan Kaynakları Direktörü

EĞİTİM
Marmara Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

İŞ DENEYİMİ
KPMG Danışmanlık A.Ş. - İnsan Kaynakları Direktörü (2018 - 2024)
Departman yönetimi ve stratejik operasyonlar.

REFERANSLAR
Ali Vural - Genel Müdür
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Pelin Polat');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Golden Benchmark [#20/50]: Rıza Sarı with strict forbidden negative checks', () => {
    const cv = `
Rıza Sarı
İstanbul / Maltepe
Mali İşler Müdürü

EĞİTİM
Marmara Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

İŞ DENEYİMİ
Akbank T.A.Ş. - Mali İşler Müdürü (2018 - 2024)
Departman yönetimi ve stratejik operasyonlar.

REFERANSLAR
Ali Vural - Genel Müdür
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Rıza Sarı');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Golden Benchmark [#21/50]: Seda Tan with strict forbidden negative checks', () => {
    const cv = `
Seda Tan
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

EĞİTİM
Marmara Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

İŞ DENEYİMİ
IGS Türkiye - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
Departman yönetimi ve stratejik operasyonlar.

REFERANSLAR
Ali Vural - Genel Müdür
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Seda Tan');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Golden Benchmark [#22/50]: Tolga Uçar with strict forbidden negative checks', () => {
    const cv = `
Tolga Uçar
İstanbul / Maltepe
Bölge Satış Müdürü

EĞİTİM
Marmara Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

İŞ DENEYİMİ
Mey Diageo Sanayi A.Ş. - Bölge Satış Müdürü (2018 - 2024)
Departman yönetimi ve stratejik operasyonlar.

REFERANSLAR
Ali Vural - Genel Müdür
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Tolga Uçar');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Golden Benchmark [#23/50]: Umut Vural with strict forbidden negative checks', () => {
    const cv = `
Umut Vural
İstanbul / Maltepe
Kıdemli Yazılım Mühendisi

EĞİTİM
Marmara Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

İŞ DENEYİMİ
Getir Teknoloji A.Ş. - Kıdemli Yazılım Mühendisi (2018 - 2024)
Departman yönetimi ve stratejik operasyonlar.

REFERANSLAR
Ali Vural - Genel Müdür
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Umut Vural');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Golden Benchmark [#24/50]: Volkan Yıldız with strict forbidden negative checks', () => {
    const cv = `
Volkan Yıldız
İstanbul / Maltepe
İnsan Kaynakları Direktörü

EĞİTİM
Marmara Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

İŞ DENEYİMİ
KPMG Danışmanlık A.Ş. - İnsan Kaynakları Direktörü (2018 - 2024)
Departman yönetimi ve stratejik operasyonlar.

REFERANSLAR
Ali Vural - Genel Müdür
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Volkan Yıldız');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Golden Benchmark [#25/50]: Banu Tekin with strict forbidden negative checks', () => {
    const cv = `
Banu Tekin
İstanbul / Maltepe
Mali İşler Müdürü

EĞİTİM
Marmara Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

İŞ DENEYİMİ
Akbank T.A.Ş. - Mali İşler Müdürü (2018 - 2024)
Departman yönetimi ve stratejik operasyonlar.

REFERANSLAR
Ali Vural - Genel Müdür
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Banu Tekin');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Golden Benchmark [#26/50]: Kemal Aksoy with strict forbidden negative checks', () => {
    const cv = `
Kemal Aksoy
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

EĞİTİM
Marmara Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

İŞ DENEYİMİ
IGS Türkiye - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
Departman yönetimi ve stratejik operasyonlar.

REFERANSLAR
Ali Vural - Genel Müdür
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Aksoy');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Golden Benchmark [#27/50]: Zeynep Kaya with strict forbidden negative checks', () => {
    const cv = `
Zeynep Kaya
İstanbul / Maltepe
Bölge Satış Müdürü

EĞİTİM
Marmara Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

İŞ DENEYİMİ
Mey Diageo Sanayi A.Ş. - Bölge Satış Müdürü (2018 - 2024)
Departman yönetimi ve stratejik operasyonlar.

REFERANSLAR
Ali Vural - Genel Müdür
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Kaya');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Golden Benchmark [#28/50]: Murat Erdem with strict forbidden negative checks', () => {
    const cv = `
Murat Erdem
İstanbul / Maltepe
Kıdemli Yazılım Mühendisi

EĞİTİM
Marmara Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

İŞ DENEYİMİ
Getir Teknoloji A.Ş. - Kıdemli Yazılım Mühendisi (2018 - 2024)
Departman yönetimi ve stratejik operasyonlar.

REFERANSLAR
Ali Vural - Genel Müdür
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Murat Erdem');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Golden Benchmark [#29/50]: Gamze Şen with strict forbidden negative checks', () => {
    const cv = `
Gamze Şen
İstanbul / Maltepe
İnsan Kaynakları Direktörü

EĞİTİM
Marmara Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

İŞ DENEYİMİ
KPMG Danışmanlık A.Ş. - İnsan Kaynakları Direktörü (2018 - 2024)
Departman yönetimi ve stratejik operasyonlar.

REFERANSLAR
Ali Vural - Genel Müdür
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Gamze Şen');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Golden Benchmark [#30/50]: Ozan Barış with strict forbidden negative checks', () => {
    const cv = `
Ozan Barış
İstanbul / Maltepe
Mali İşler Müdürü

EĞİTİM
Marmara Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

İŞ DENEYİMİ
Akbank T.A.Ş. - Mali İşler Müdürü (2018 - 2024)
Departman yönetimi ve stratejik operasyonlar.

REFERANSLAR
Ali Vural - Genel Müdür
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ozan Barış');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Golden Benchmark [#31/50]: Turgut Yücel with strict forbidden negative checks', () => {
    const cv = `
Turgut Yücel
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

EĞİTİM
Marmara Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

İŞ DENEYİMİ
IGS Türkiye - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
Departman yönetimi ve stratejik operasyonlar.

REFERANSLAR
Ali Vural - Genel Müdür
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Turgut Yücel');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Golden Benchmark [#32/50]: Sinan Kılıç with strict forbidden negative checks', () => {
    const cv = `
Sinan Kılıç
İstanbul / Maltepe
Bölge Satış Müdürü

EĞİTİM
Marmara Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

İŞ DENEYİMİ
Mey Diageo Sanayi A.Ş. - Bölge Satış Müdürü (2018 - 2024)
Departman yönetimi ve stratejik operasyonlar.

REFERANSLAR
Ali Vural - Genel Müdür
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Sinan Kılıç');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Golden Benchmark [#33/50]: Ceyda Uslu with strict forbidden negative checks', () => {
    const cv = `
Ceyda Uslu
İstanbul / Maltepe
Kıdemli Yazılım Mühendisi

EĞİTİM
Marmara Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

İŞ DENEYİMİ
Getir Teknoloji A.Ş. - Kıdemli Yazılım Mühendisi (2018 - 2024)
Departman yönetimi ve stratejik operasyonlar.

REFERANSLAR
Ali Vural - Genel Müdür
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ceyda Uslu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Golden Benchmark [#34/50]: Bülent Güneş with strict forbidden negative checks', () => {
    const cv = `
Bülent Güneş
İstanbul / Maltepe
İnsan Kaynakları Direktörü

EĞİTİM
Marmara Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

İŞ DENEYİMİ
KPMG Danışmanlık A.Ş. - İnsan Kaynakları Direktörü (2018 - 2024)
Departman yönetimi ve stratejik operasyonlar.

REFERANSLAR
Ali Vural - Genel Müdür
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Bülent Güneş');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Golden Benchmark [#35/50]: Elena Petrova with strict forbidden negative checks', () => {
    const cv = `
Elena Petrova
İstanbul / Maltepe
Mali İşler Müdürü

EĞİTİM
Marmara Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

İŞ DENEYİMİ
Akbank T.A.Ş. - Mali İşler Müdürü (2018 - 2024)
Departman yönetimi ve stratejik operasyonlar.

REFERANSLAR
Ali Vural - Genel Müdür
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Elena Petrova');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Golden Benchmark [#36/50]: Alişan Demir with strict forbidden negative checks', () => {
    const cv = `
Alişan Demir
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

EĞİTİM
Marmara Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

İŞ DENEYİMİ
IGS Türkiye - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
Departman yönetimi ve stratejik operasyonlar.

REFERANSLAR
Ali Vural - Genel Müdür
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Alişan Demir');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Golden Benchmark [#37/50]: İsmail Şen with strict forbidden negative checks', () => {
    const cv = `
İsmail Şen
İstanbul / Maltepe
Bölge Satış Müdürü

EĞİTİM
Marmara Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

İŞ DENEYİMİ
Mey Diageo Sanayi A.Ş. - Bölge Satış Müdürü (2018 - 2024)
Departman yönetimi ve stratejik operasyonlar.

REFERANSLAR
Ali Vural - Genel Müdür
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('İsmail Şen');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Golden Benchmark [#38/50]: Kaan Demir with strict forbidden negative checks', () => {
    const cv = `
Kaan Demir
İstanbul / Maltepe
Kıdemli Yazılım Mühendisi

EĞİTİM
Marmara Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

İŞ DENEYİMİ
Getir Teknoloji A.Ş. - Kıdemli Yazılım Mühendisi (2018 - 2024)
Departman yönetimi ve stratejik operasyonlar.

REFERANSLAR
Ali Vural - Genel Müdür
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kaan Demir');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Golden Benchmark [#39/50]: Nalan Tuncer with strict forbidden negative checks', () => {
    const cv = `
Nalan Tuncer
İstanbul / Maltepe
İnsan Kaynakları Direktörü

EĞİTİM
Marmara Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

İŞ DENEYİMİ
KPMG Danışmanlık A.Ş. - İnsan Kaynakları Direktörü (2018 - 2024)
Departman yönetimi ve stratejik operasyonlar.

REFERANSLAR
Ali Vural - Genel Müdür
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Nalan Tuncer');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Golden Benchmark [#40/50]: Fikret Orman with strict forbidden negative checks', () => {
    const cv = `
Fikret Orman
İstanbul / Maltepe
Mali İşler Müdürü

EĞİTİM
Marmara Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

İŞ DENEYİMİ
Akbank T.A.Ş. - Mali İşler Müdürü (2018 - 2024)
Departman yönetimi ve stratejik operasyonlar.

REFERANSLAR
Ali Vural - Genel Müdür
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Fikret Orman');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Golden Benchmark [#41/50]: Dursun Ali with strict forbidden negative checks', () => {
    const cv = `
Dursun Ali
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

EĞİTİM
Marmara Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

İŞ DENEYİMİ
IGS Türkiye - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
Departman yönetimi ve stratejik operasyonlar.

REFERANSLAR
Ali Vural - Genel Müdür
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Dursun Ali');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Golden Benchmark [#42/50]: Ece Uslu with strict forbidden negative checks', () => {
    const cv = `
Ece Uslu
İstanbul / Maltepe
Bölge Satış Müdürü

EĞİTİM
Marmara Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

İŞ DENEYİMİ
Mey Diageo Sanayi A.Ş. - Bölge Satış Müdürü (2018 - 2024)
Departman yönetimi ve stratejik operasyonlar.

REFERANSLAR
Ali Vural - Genel Müdür
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ece Uslu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Golden Benchmark [#43/50]: Gülriz Sururi with strict forbidden negative checks', () => {
    const cv = `
Gülriz Sururi
İstanbul / Maltepe
Kıdemli Yazılım Mühendisi

EĞİTİM
Marmara Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

İŞ DENEYİMİ
Getir Teknoloji A.Ş. - Kıdemli Yazılım Mühendisi (2018 - 2024)
Departman yönetimi ve stratejik operasyonlar.

REFERANSLAR
Ali Vural - Genel Müdür
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Gülriz Sururi');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Golden Benchmark [#44/50]: Ramazan Soydan with strict forbidden negative checks', () => {
    const cv = `
Ramazan Soydan
İstanbul / Maltepe
İnsan Kaynakları Direktörü

EĞİTİM
Marmara Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

İŞ DENEYİMİ
KPMG Danışmanlık A.Ş. - İnsan Kaynakları Direktörü (2018 - 2024)
Departman yönetimi ve stratejik operasyonlar.

REFERANSLAR
Ali Vural - Genel Müdür
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ramazan Soydan');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Golden Benchmark [#45/50]: Berrin Yılmaz with strict forbidden negative checks', () => {
    const cv = `
Berrin Yılmaz
İstanbul / Maltepe
Mali İşler Müdürü

EĞİTİM
Marmara Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

İŞ DENEYİMİ
Akbank T.A.Ş. - Mali İşler Müdürü (2018 - 2024)
Departman yönetimi ve stratejik operasyonlar.

REFERANSLAR
Ali Vural - Genel Müdür
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Berrin Yılmaz');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Golden Benchmark [#46/50]: Ufuk Aydın with strict forbidden negative checks', () => {
    const cv = `
Ufuk Aydın
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

EĞİTİM
Marmara Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

İŞ DENEYİMİ
IGS Türkiye - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
Departman yönetimi ve stratejik operasyonlar.

REFERANSLAR
Ali Vural - Genel Müdür
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ufuk Aydın');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Golden Benchmark [#47/50]: Hilal Ak with strict forbidden negative checks', () => {
    const cv = `
Hilal Ak
İstanbul / Maltepe
Bölge Satış Müdürü

EĞİTİM
Marmara Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

İŞ DENEYİMİ
Mey Diageo Sanayi A.Ş. - Bölge Satış Müdürü (2018 - 2024)
Departman yönetimi ve stratejik operasyonlar.

REFERANSLAR
Ali Vural - Genel Müdür
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hilal Ak');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Golden Benchmark [#48/50]: Vecihi Hürkuş with strict forbidden negative checks', () => {
    const cv = `
Vecihi Hürkuş
İstanbul / Maltepe
Kıdemli Yazılım Mühendisi

EĞİTİM
Marmara Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

İŞ DENEYİMİ
Getir Teknoloji A.Ş. - Kıdemli Yazılım Mühendisi (2018 - 2024)
Departman yönetimi ve stratejik operasyonlar.

REFERANSLAR
Ali Vural - Genel Müdür
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Vecihi Hürkuş');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Golden Benchmark [#49/50]: Mehmet Akif with strict forbidden negative checks', () => {
    const cv = `
Mehmet Akif
İstanbul / Maltepe
İnsan Kaynakları Direktörü

EĞİTİM
Marmara Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

İŞ DENEYİMİ
KPMG Danışmanlık A.Ş. - İnsan Kaynakları Direktörü (2018 - 2024)
Departman yönetimi ve stratejik operasyonlar.

REFERANSLAR
Ali Vural - Genel Müdür
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Mehmet Akif');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Golden Benchmark [#50/50]: Halide Edip with strict forbidden negative checks', () => {
    const cv = `
Halide Edip
İstanbul / Maltepe
Mali İşler Müdürü

EĞİTİM
Marmara Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

İŞ DENEYİMİ
Akbank T.A.Ş. - Mali İşler Müdürü (2018 - 2024)
Departman yönetimi ve stratejik operasyonlar.

REFERANSLAR
Ali Vural - Genel Müdür
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Halide Edip');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });
});
