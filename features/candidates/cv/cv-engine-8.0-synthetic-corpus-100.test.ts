import { describe, expect, it } from 'vitest';
import {
  extractDeterministicCv,
  extractDeterministicExperiences,
  extractDeterministicEducation,
  extractDeterministicSkillsAndTools,
} from './cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from './cv-taxonomy-mapper';
import { buildCvEvidenceGraph } from './cv-evidence-graph';

describe('CV Extraction Engine 8.0 — 100 Synthetic Real-World CV Corpus', () => {
  it('Synthetic Corpus [#1/100]: Realistic CV for Ahmet Yılmaz (Full Stack Developer)', () => {
    const cv = `
Ahmet Yılmaz
İstanbul / Kadıköy | 0532 999 11 00
Full Stack Developer

PROFESYONEL ÖZET
Bilişim / Yazılım alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Trendyol Teknoloji A.Ş. - Full Stack Developer (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ahmet Yılmaz');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#2/100]: Realistic CV for Burak Kaya (Bölge Satış Müdürü)', () => {
    const cv = `
Burak Kaya
İstanbul / Kadıköy | 0532 999 11 01
Bölge Satış Müdürü

PROFESYONEL ÖZET
Hızlı Tüketim / FMCG alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Unilever Sanayi A.Ş. - Bölge Satış Müdürü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Burak Kaya');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#3/100]: Realistic CV for Can Demir (Mali İşler Direktörü)', () => {
    const cv = `
Can Demir
İstanbul / Kadıköy | 0532 999 11 02
Mali İşler Direktörü

PROFESYONEL ÖZET
Finans / Bankacılık alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Garanti Bankası A.Ş. - Mali İşler Direktörü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Can Demir');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#4/100]: Realistic CV for Deniz Çelik (Çağrı Merkezi Takım Lideri)', () => {
    const cv = `
Deniz Çelik
İstanbul / Kadıköy | 0532 999 11 03
Çağrı Merkezi Takım Lideri

PROFESYONEL ÖZET
Çağrı merkezi alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Turkcell Hizmetleri A.Ş. - Çağrı Merkezi Takım Lideri (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Deniz Çelik');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#5/100]: Realistic CV for Emre Şahin (Tedarik Zinciri Uzmanı)', () => {
    const cv = `
Emre Şahin
İstanbul / Kadıköy | 0532 999 11 04
Tedarik Zinciri Uzmanı

PROFESYONEL ÖZET
Lojistik / Depolama alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Ekol Taşımacılık A.Ş. - Tedarik Zinciri Uzmanı (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Emre Şahin');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#6/100]: Realistic CV for Fulya Yıldız (İnsan Kaynakları Müdürü)', () => {
    const cv = `
Fulya Yıldız
İstanbul / Kadıköy | 0532 999 11 05
İnsan Kaynakları Müdürü

PROFESYONEL ÖZET
Danışmanlık / İK alanında 10+ yıl deneyimli profesyonel.

DENEYİM
PwC Danışmanlık A.Ş. - İnsan Kaynakları Müdürü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Fulya Yıldız');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#7/100]: Realistic CV for Gamze Yıldırım (İnşaat Proje Müdürü)', () => {
    const cv = `
Gamze Yıldırım
İstanbul / Kadıköy | 0532 999 11 06
İnşaat Proje Müdürü

PROFESYONEL ÖZET
İnşaat / Gayrimenkul alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Enka Yapı Sanayi A.Ş. - İnşaat Proje Müdürü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Gamze Yıldırım');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#8/100]: Realistic CV for Hakan Öztürk (Pazarlama İletişimi Uzmanı)', () => {
    const cv = `
Hakan Öztürk
İstanbul / Kadıköy | 0532 999 11 07
Pazarlama İletişimi Uzmanı

PROFESYONEL ÖZET
Pazarlama / Reklam alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Pazarlama İletişimi Uzmanı (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hakan Öztürk');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#9/100]: Realistic CV for İpek Aydın (Üretim ve Kalite Müdürü)', () => {
    const cv = `
İpek Aydın
İstanbul / Kadıköy | 0532 999 11 08
Üretim ve Kalite Müdürü

PROFESYONEL ÖZET
Üretim / Endüstriyel alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Arçelik Sanayi A.Ş. - Üretim ve Kalite Müdürü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('İpek Aydın');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#10/100]: Realistic CV for Kaan Özdemir (Otel Operasyon Müdürü)', () => {
    const cv = `
Kaan Özdemir
İstanbul / Kadıköy | 0532 999 11 09
Otel Operasyon Müdürü

PROFESYONEL ÖZET
Turizm / Otelcilik alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Divan Turizm İşletmeleri A.Ş. - Otel Operasyon Müdürü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kaan Özdemir');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#11/100]: Realistic CV for Lale Arslan (Full Stack Developer)', () => {
    const cv = `
Lale Arslan
İstanbul / Kadıköy | 0532 999 11 10
Full Stack Developer

PROFESYONEL ÖZET
Bilişim / Yazılım alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Trendyol Teknoloji A.Ş. - Full Stack Developer (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Lale Arslan');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#12/100]: Realistic CV for Mert Doğan (Bölge Satış Müdürü)', () => {
    const cv = `
Mert Doğan
İstanbul / Kadıköy | 0532 999 11 11
Bölge Satış Müdürü

PROFESYONEL ÖZET
Hızlı Tüketim / FMCG alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Unilever Sanayi A.Ş. - Bölge Satış Müdürü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Mert Doğan');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#13/100]: Realistic CV for Nilgün Kılıç (Mali İşler Direktörü)', () => {
    const cv = `
Nilgün Kılıç
İstanbul / Kadıköy | 0532 999 11 12
Mali İşler Direktörü

PROFESYONEL ÖZET
Finans / Bankacılık alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Garanti Bankası A.Ş. - Mali İşler Direktörü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Nilgün Kılıç');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#14/100]: Realistic CV for Ozan Aslan (Çağrı Merkezi Takım Lideri)', () => {
    const cv = `
Ozan Aslan
İstanbul / Kadıköy | 0532 999 11 13
Çağrı Merkezi Takım Lideri

PROFESYONEL ÖZET
Çağrı merkezi alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Turkcell Hizmetleri A.Ş. - Çağrı Merkezi Takım Lideri (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ozan Aslan');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#15/100]: Realistic CV for Pelin Çetin (Tedarik Zinciri Uzmanı)', () => {
    const cv = `
Pelin Çetin
İstanbul / Kadıköy | 0532 999 11 14
Tedarik Zinciri Uzmanı

PROFESYONEL ÖZET
Lojistik / Depolama alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Ekol Taşımacılık A.Ş. - Tedarik Zinciri Uzmanı (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Pelin Çetin');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#16/100]: Realistic CV for Rıza Kara (İnsan Kaynakları Müdürü)', () => {
    const cv = `
Rıza Kara
İstanbul / Kadıköy | 0532 999 11 15
İnsan Kaynakları Müdürü

PROFESYONEL ÖZET
Danışmanlık / İK alanında 10+ yıl deneyimli profesyonel.

DENEYİM
PwC Danışmanlık A.Ş. - İnsan Kaynakları Müdürü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Rıza Kara');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#17/100]: Realistic CV for Seda Koç (İnşaat Proje Müdürü)', () => {
    const cv = `
Seda Koç
İstanbul / Kadıköy | 0532 999 11 16
İnşaat Proje Müdürü

PROFESYONEL ÖZET
İnşaat / Gayrimenkul alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Enka Yapı Sanayi A.Ş. - İnşaat Proje Müdürü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Seda Koç');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#18/100]: Realistic CV for Tolga Kurt (Pazarlama İletişimi Uzmanı)', () => {
    const cv = `
Tolga Kurt
İstanbul / Kadıköy | 0532 999 11 17
Pazarlama İletişimi Uzmanı

PROFESYONEL ÖZET
Pazarlama / Reklam alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Pazarlama İletişimi Uzmanı (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Tolga Kurt');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#19/100]: Realistic CV for Umut Özkan (Üretim ve Kalite Müdürü)', () => {
    const cv = `
Umut Özkan
İstanbul / Kadıköy | 0532 999 11 18
Üretim ve Kalite Müdürü

PROFESYONEL ÖZET
Üretim / Endüstriyel alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Arçelik Sanayi A.Ş. - Üretim ve Kalite Müdürü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Umut Özkan');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#20/100]: Realistic CV for Volkan Şimşek (Otel Operasyon Müdürü)', () => {
    const cv = `
Volkan Şimşek
İstanbul / Kadıköy | 0532 999 11 19
Otel Operasyon Müdürü

PROFESYONEL ÖZET
Turizm / Otelcilik alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Divan Turizm İşletmeleri A.Ş. - Otel Operasyon Müdürü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Volkan Şimşek');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#21/100]: Realistic CV for Ali Polat (Full Stack Developer)', () => {
    const cv = `
Ali Polat
İstanbul / Kadıköy | 0532 999 11 20
Full Stack Developer

PROFESYONEL ÖZET
Bilişim / Yazılım alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Trendyol Teknoloji A.Ş. - Full Stack Developer (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ali Polat');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#22/100]: Realistic CV for Banu Özcan (Bölge Satış Müdürü)', () => {
    const cv = `
Banu Özcan
İstanbul / Kadıköy | 0532 999 11 21
Bölge Satış Müdürü

PROFESYONEL ÖZET
Hızlı Tüketim / FMCG alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Unilever Sanayi A.Ş. - Bölge Satış Müdürü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Banu Özcan');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#23/100]: Realistic CV for Cem Korkmaz (Mali İşler Direktörü)', () => {
    const cv = `
Cem Korkmaz
İstanbul / Kadıköy | 0532 999 11 22
Mali İşler Direktörü

PROFESYONEL ÖZET
Finans / Bankacılık alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Garanti Bankası A.Ş. - Mali İşler Direktörü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Cem Korkmaz');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#24/100]: Realistic CV for Duygu Çakır (Çağrı Merkezi Takım Lideri)', () => {
    const cv = `
Duygu Çakır
İstanbul / Kadıköy | 0532 999 11 23
Çağrı Merkezi Takım Lideri

PROFESYONEL ÖZET
Çağrı merkezi alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Turkcell Hizmetleri A.Ş. - Çağrı Merkezi Takım Lideri (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Duygu Çakır');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#25/100]: Realistic CV for Ece Erdoğan (Tedarik Zinciri Uzmanı)', () => {
    const cv = `
Ece Erdoğan
İstanbul / Kadıköy | 0532 999 11 24
Tedarik Zinciri Uzmanı

PROFESYONEL ÖZET
Lojistik / Depolama alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Ekol Taşımacılık A.Ş. - Tedarik Zinciri Uzmanı (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ece Erdoğan');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#26/100]: Realistic CV for Fatih Yavuz (İnsan Kaynakları Müdürü)', () => {
    const cv = `
Fatih Yavuz
İstanbul / Kadıköy | 0532 999 11 25
İnsan Kaynakları Müdürü

PROFESYONEL ÖZET
Danışmanlık / İK alanında 10+ yıl deneyimli profesyonel.

DENEYİM
PwC Danışmanlık A.Ş. - İnsan Kaynakları Müdürü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Fatih Yavuz');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#27/100]: Realistic CV for Gizem Güneş (İnşaat Proje Müdürü)', () => {
    const cv = `
Gizem Güneş
İstanbul / Kadıköy | 0532 999 11 26
İnşaat Proje Müdürü

PROFESYONEL ÖZET
İnşaat / Gayrimenkul alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Enka Yapı Sanayi A.Ş. - İnşaat Proje Müdürü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Gizem Güneş');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#28/100]: Realistic CV for Hande Aksoy (Pazarlama İletişimi Uzmanı)', () => {
    const cv = `
Hande Aksoy
İstanbul / Kadıköy | 0532 999 11 27
Pazarlama İletişimi Uzmanı

PROFESYONEL ÖZET
Pazarlama / Reklam alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Pazarlama İletişimi Uzmanı (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hande Aksoy');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#29/100]: Realistic CV for Işıl Güler (Üretim ve Kalite Müdürü)', () => {
    const cv = `
Işıl Güler
İstanbul / Kadıköy | 0532 999 11 28
Üretim ve Kalite Müdürü

PROFESYONEL ÖZET
Üretim / Endüstriyel alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Arçelik Sanayi A.Ş. - Üretim ve Kalite Müdürü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Işıl Güler');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#30/100]: Realistic CV for Kemal Ünal (Otel Operasyon Müdürü)', () => {
    const cv = `
Kemal Ünal
İstanbul / Kadıköy | 0532 999 11 29
Otel Operasyon Müdürü

PROFESYONEL ÖZET
Turizm / Otelcilik alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Divan Turizm İşletmeleri A.Ş. - Otel Operasyon Müdürü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Ünal');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#31/100]: Realistic CV for Melis Taş (Full Stack Developer)', () => {
    const cv = `
Melis Taş
İstanbul / Kadıköy | 0532 999 11 30
Full Stack Developer

PROFESYONEL ÖZET
Bilişim / Yazılım alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Trendyol Teknoloji A.Ş. - Full Stack Developer (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Melis Taş');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#32/100]: Realistic CV for Nihan Başaran (Bölge Satış Müdürü)', () => {
    const cv = `
Nihan Başaran
İstanbul / Kadıköy | 0532 999 11 31
Bölge Satış Müdürü

PROFESYONEL ÖZET
Hızlı Tüketim / FMCG alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Unilever Sanayi A.Ş. - Bölge Satış Müdürü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Nihan Başaran');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#33/100]: Realistic CV for Onur Erkul (Mali İşler Direktörü)', () => {
    const cv = `
Onur Erkul
İstanbul / Kadıköy | 0532 999 11 32
Mali İşler Direktörü

PROFESYONEL ÖZET
Finans / Bankacılık alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Garanti Bankası A.Ş. - Mali İşler Direktörü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Onur Erkul');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#34/100]: Realistic CV for Pınar Akalın (Çağrı Merkezi Takım Lideri)', () => {
    const cv = `
Pınar Akalın
İstanbul / Kadıköy | 0532 999 11 33
Çağrı Merkezi Takım Lideri

PROFESYONEL ÖZET
Çağrı merkezi alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Turkcell Hizmetleri A.Ş. - Çağrı Merkezi Takım Lideri (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Pınar Akalın');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#35/100]: Realistic CV for Recep Sezgin (Tedarik Zinciri Uzmanı)', () => {
    const cv = `
Recep Sezgin
İstanbul / Kadıköy | 0532 999 11 34
Tedarik Zinciri Uzmanı

PROFESYONEL ÖZET
Lojistik / Depolama alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Ekol Taşımacılık A.Ş. - Tedarik Zinciri Uzmanı (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Recep Sezgin');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#36/100]: Realistic CV for Sinem Yalçın (İnsan Kaynakları Müdürü)', () => {
    const cv = `
Sinem Yalçın
İstanbul / Kadıköy | 0532 999 11 35
İnsan Kaynakları Müdürü

PROFESYONEL ÖZET
Danışmanlık / İK alanında 10+ yıl deneyimli profesyonel.

DENEYİM
PwC Danışmanlık A.Ş. - İnsan Kaynakları Müdürü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Sinem Yalçın');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#37/100]: Realistic CV for Tuğba Tekin (İnşaat Proje Müdürü)', () => {
    const cv = `
Tuğba Tekin
İstanbul / Kadıköy | 0532 999 11 36
İnşaat Proje Müdürü

PROFESYONEL ÖZET
İnşaat / Gayrimenkul alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Enka Yapı Sanayi A.Ş. - İnşaat Proje Müdürü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Tuğba Tekin');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#38/100]: Realistic CV for Uğur Koçak (Pazarlama İletişimi Uzmanı)', () => {
    const cv = `
Uğur Koçak
İstanbul / Kadıköy | 0532 999 11 37
Pazarlama İletişimi Uzmanı

PROFESYONEL ÖZET
Pazarlama / Reklam alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Pazarlama İletişimi Uzmanı (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Uğur Koçak');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#39/100]: Realistic CV for Vildan Aydın (Üretim ve Kalite Müdürü)', () => {
    const cv = `
Vildan Aydın
İstanbul / Kadıköy | 0532 999 11 38
Üretim ve Kalite Müdürü

PROFESYONEL ÖZET
Üretim / Endüstriyel alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Arçelik Sanayi A.Ş. - Üretim ve Kalite Müdürü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Vildan Aydın');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#40/100]: Realistic CV for Yasin Sarı (Otel Operasyon Müdürü)', () => {
    const cv = `
Yasin Sarı
İstanbul / Kadıköy | 0532 999 11 39
Otel Operasyon Müdürü

PROFESYONEL ÖZET
Turizm / Otelcilik alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Divan Turizm İşletmeleri A.Ş. - Otel Operasyon Müdürü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Yasin Sarı');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#41/100]: Realistic CV for Aslı Tan (Full Stack Developer)', () => {
    const cv = `
Aslı Tan
İstanbul / Kadıköy | 0532 999 11 40
Full Stack Developer

PROFESYONEL ÖZET
Bilişim / Yazılım alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Trendyol Teknoloji A.Ş. - Full Stack Developer (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Aslı Tan');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#42/100]: Realistic CV for Berk Uçar (Bölge Satış Müdürü)', () => {
    const cv = `
Berk Uçar
İstanbul / Kadıköy | 0532 999 11 41
Bölge Satış Müdürü

PROFESYONEL ÖZET
Hızlı Tüketim / FMCG alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Unilever Sanayi A.Ş. - Bölge Satış Müdürü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Berk Uçar');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#43/100]: Realistic CV for Ceyda Vural (Mali İşler Direktörü)', () => {
    const cv = `
Ceyda Vural
İstanbul / Kadıköy | 0532 999 11 42
Mali İşler Direktörü

PROFESYONEL ÖZET
Finans / Bankacılık alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Garanti Bankası A.Ş. - Mali İşler Direktörü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ceyda Vural');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#44/100]: Realistic CV for Doğan Bulut (Çağrı Merkezi Takım Lideri)', () => {
    const cv = `
Doğan Bulut
İstanbul / Kadıköy | 0532 999 11 43
Çağrı Merkezi Takım Lideri

PROFESYONEL ÖZET
Çağrı merkezi alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Turkcell Hizmetleri A.Ş. - Çağrı Merkezi Takım Lideri (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Doğan Bulut');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#45/100]: Realistic CV for Elif Keskin (Tedarik Zinciri Uzmanı)', () => {
    const cv = `
Elif Keskin
İstanbul / Kadıköy | 0532 999 11 44
Tedarik Zinciri Uzmanı

PROFESYONEL ÖZET
Lojistik / Depolama alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Ekol Taşımacılık A.Ş. - Tedarik Zinciri Uzmanı (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Elif Keskin');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#46/100]: Realistic CV for Ferhat Yüksel (İnsan Kaynakları Müdürü)', () => {
    const cv = `
Ferhat Yüksel
İstanbul / Kadıköy | 0532 999 11 45
İnsan Kaynakları Müdürü

PROFESYONEL ÖZET
Danışmanlık / İK alanında 10+ yıl deneyimli profesyonel.

DENEYİM
PwC Danışmanlık A.Ş. - İnsan Kaynakları Müdürü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ferhat Yüksel');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#47/100]: Realistic CV for Gülşah Karaca (İnşaat Proje Müdürü)', () => {
    const cv = `
Gülşah Karaca
İstanbul / Kadıköy | 0532 999 11 46
İnşaat Proje Müdürü

PROFESYONEL ÖZET
İnşaat / Gayrimenkul alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Enka Yapı Sanayi A.Ş. - İnşaat Proje Müdürü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Gülşah Karaca');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#48/100]: Realistic CV for Harun Soylu (Pazarlama İletişimi Uzmanı)', () => {
    const cv = `
Harun Soylu
İstanbul / Kadıköy | 0532 999 11 47
Pazarlama İletişimi Uzmanı

PROFESYONEL ÖZET
Pazarlama / Reklam alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Pazarlama İletişimi Uzmanı (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Harun Soylu');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#49/100]: Realistic CV for İlker Gündoğan (Üretim ve Kalite Müdürü)', () => {
    const cv = `
İlker Gündoğan
İstanbul / Kadıköy | 0532 999 11 48
Üretim ve Kalite Müdürü

PROFESYONEL ÖZET
Üretim / Endüstriyel alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Arçelik Sanayi A.Ş. - Üretim ve Kalite Müdürü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('İlker Gündoğan');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#50/100]: Realistic CV for Koray Avcı (Otel Operasyon Müdürü)', () => {
    const cv = `
Koray Avcı
İstanbul / Kadıköy | 0532 999 11 49
Otel Operasyon Müdürü

PROFESYONEL ÖZET
Turizm / Otelcilik alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Divan Turizm İşletmeleri A.Ş. - Otel Operasyon Müdürü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Koray Avcı');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#51/100]: Realistic CV for Mine Duran (Full Stack Developer)', () => {
    const cv = `
Mine Duran
İstanbul / Kadıköy | 0532 999 11 50
Full Stack Developer

PROFESYONEL ÖZET
Bilişim / Yazılım alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Trendyol Teknoloji A.Ş. - Full Stack Developer (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Mine Duran');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#52/100]: Realistic CV for Nur Bozkurt (Bölge Satış Müdürü)', () => {
    const cv = `
Nur Bozkurt
İstanbul / Kadıköy | 0532 999 11 51
Bölge Satış Müdürü

PROFESYONEL ÖZET
Hızlı Tüketim / FMCG alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Unilever Sanayi A.Ş. - Bölge Satış Müdürü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Nur Bozkurt');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#53/100]: Realistic CV for Okan Turan (Mali İşler Direktörü)', () => {
    const cv = `
Okan Turan
İstanbul / Kadıköy | 0532 999 11 52
Mali İşler Direktörü

PROFESYONEL ÖZET
Finans / Bankacılık alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Garanti Bankası A.Ş. - Mali İşler Direktörü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Okan Turan');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#54/100]: Realistic CV for Rabia Yurttaş (Çağrı Merkezi Takım Lideri)', () => {
    const cv = `
Rabia Yurttaş
İstanbul / Kadıköy | 0532 999 11 53
Çağrı Merkezi Takım Lideri

PROFESYONEL ÖZET
Çağrı merkezi alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Turkcell Hizmetleri A.Ş. - Çağrı Merkezi Takım Lideri (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Rabia Yurttaş');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#55/100]: Realistic CV for Serkan Ergin (Tedarik Zinciri Uzmanı)', () => {
    const cv = `
Serkan Ergin
İstanbul / Kadıköy | 0532 999 11 54
Tedarik Zinciri Uzmanı

PROFESYONEL ÖZET
Lojistik / Depolama alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Ekol Taşımacılık A.Ş. - Tedarik Zinciri Uzmanı (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Serkan Ergin');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#56/100]: Realistic CV for Taner Yaman (İnsan Kaynakları Müdürü)', () => {
    const cv = `
Taner Yaman
İstanbul / Kadıköy | 0532 999 11 55
İnsan Kaynakları Müdürü

PROFESYONEL ÖZET
Danışmanlık / İK alanında 10+ yıl deneyimli profesyonel.

DENEYİM
PwC Danışmanlık A.Ş. - İnsan Kaynakları Müdürü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Taner Yaman');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#57/100]: Realistic CV for Ümit Duman (İnşaat Proje Müdürü)', () => {
    const cv = `
Ümit Duman
İstanbul / Kadıköy | 0532 999 11 56
İnşaat Proje Müdürü

PROFESYONEL ÖZET
İnşaat / Gayrimenkul alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Enka Yapı Sanayi A.Ş. - İnşaat Proje Müdürü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ümit Duman');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#58/100]: Realistic CV for Yağmur Göktaş (Pazarlama İletişimi Uzmanı)', () => {
    const cv = `
Yağmur Göktaş
İstanbul / Kadıköy | 0532 999 11 57
Pazarlama İletişimi Uzmanı

PROFESYONEL ÖZET
Pazarlama / Reklam alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Pazarlama İletişimi Uzmanı (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Yağmur Göktaş');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#59/100]: Realistic CV for Zafer Peker (Üretim ve Kalite Müdürü)', () => {
    const cv = `
Zafer Peker
İstanbul / Kadıköy | 0532 999 11 58
Üretim ve Kalite Müdürü

PROFESYONEL ÖZET
Üretim / Endüstriyel alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Arçelik Sanayi A.Ş. - Üretim ve Kalite Müdürü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zafer Peker');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#60/100]: Realistic CV for Aylin Sancak (Otel Operasyon Müdürü)', () => {
    const cv = `
Aylin Sancak
İstanbul / Kadıköy | 0532 999 11 59
Otel Operasyon Müdürü

PROFESYONEL ÖZET
Turizm / Otelcilik alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Divan Turizm İşletmeleri A.Ş. - Otel Operasyon Müdürü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Aylin Sancak');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#61/100]: Realistic CV for Barış Şentürk (Full Stack Developer)', () => {
    const cv = `
Barış Şentürk
İstanbul / Kadıköy | 0532 999 11 60
Full Stack Developer

PROFESYONEL ÖZET
Bilişim / Yazılım alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Trendyol Teknoloji A.Ş. - Full Stack Developer (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Barış Şentürk');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#62/100]: Realistic CV for Ceren Kandemir (Bölge Satış Müdürü)', () => {
    const cv = `
Ceren Kandemir
İstanbul / Kadıköy | 0532 999 11 61
Bölge Satış Müdürü

PROFESYONEL ÖZET
Hızlı Tüketim / FMCG alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Unilever Sanayi A.Ş. - Bölge Satış Müdürü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ceren Kandemir');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#63/100]: Realistic CV for Derya Gültekin (Mali İşler Direktörü)', () => {
    const cv = `
Derya Gültekin
İstanbul / Kadıköy | 0532 999 11 62
Mali İşler Direktörü

PROFESYONEL ÖZET
Finans / Bankacılık alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Garanti Bankası A.Ş. - Mali İşler Direktörü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Derya Gültekin');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#64/100]: Realistic CV for Erdem Aktaş (Çağrı Merkezi Takım Lideri)', () => {
    const cv = `
Erdem Aktaş
İstanbul / Kadıköy | 0532 999 11 63
Çağrı Merkezi Takım Lideri

PROFESYONEL ÖZET
Çağrı merkezi alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Turkcell Hizmetleri A.Ş. - Çağrı Merkezi Takım Lideri (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Erdem Aktaş');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#65/100]: Realistic CV for Funda Erten (Tedarik Zinciri Uzmanı)', () => {
    const cv = `
Funda Erten
İstanbul / Kadıköy | 0532 999 11 64
Tedarik Zinciri Uzmanı

PROFESYONEL ÖZET
Lojistik / Depolama alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Ekol Taşımacılık A.Ş. - Tedarik Zinciri Uzmanı (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Funda Erten');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#66/100]: Realistic CV for Gökhan Ulu (İnsan Kaynakları Müdürü)', () => {
    const cv = `
Gökhan Ulu
İstanbul / Kadıköy | 0532 999 11 65
İnsan Kaynakları Müdürü

PROFESYONEL ÖZET
Danışmanlık / İK alanında 10+ yıl deneyimli profesyonel.

DENEYİM
PwC Danışmanlık A.Ş. - İnsan Kaynakları Müdürü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Gökhan Ulu');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#67/100]: Realistic CV for Hazal Albayrak (İnşaat Proje Müdürü)', () => {
    const cv = `
Hazal Albayrak
İstanbul / Kadıköy | 0532 999 11 66
İnşaat Proje Müdürü

PROFESYONEL ÖZET
İnşaat / Gayrimenkul alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Enka Yapı Sanayi A.Ş. - İnşaat Proje Müdürü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hazal Albayrak');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#68/100]: Realistic CV for İrem Gül (Pazarlama İletişimi Uzmanı)', () => {
    const cv = `
İrem Gül
İstanbul / Kadıköy | 0532 999 11 67
Pazarlama İletişimi Uzmanı

PROFESYONEL ÖZET
Pazarlama / Reklam alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Pazarlama İletişimi Uzmanı (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('İrem Gül');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#69/100]: Realistic CV for Levent Bayram (Üretim ve Kalite Müdürü)', () => {
    const cv = `
Levent Bayram
İstanbul / Kadıköy | 0532 999 11 68
Üretim ve Kalite Müdürü

PROFESYONEL ÖZET
Üretim / Endüstriyel alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Arçelik Sanayi A.Ş. - Üretim ve Kalite Müdürü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Levent Bayram');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#70/100]: Realistic CV for Murat Ateş (Otel Operasyon Müdürü)', () => {
    const cv = `
Murat Ateş
İstanbul / Kadıköy | 0532 999 11 69
Otel Operasyon Müdürü

PROFESYONEL ÖZET
Turizm / Otelcilik alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Divan Turizm İşletmeleri A.Ş. - Otel Operasyon Müdürü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Murat Ateş');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#71/100]: Realistic CV for Nazlı Yalın (Full Stack Developer)', () => {
    const cv = `
Nazlı Yalın
İstanbul / Kadıköy | 0532 999 11 70
Full Stack Developer

PROFESYONEL ÖZET
Bilişim / Yazılım alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Trendyol Teknoloji A.Ş. - Full Stack Developer (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Nazlı Yalın');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#72/100]: Realistic CV for Orhan Efe (Bölge Satış Müdürü)', () => {
    const cv = `
Orhan Efe
İstanbul / Kadıköy | 0532 999 11 71
Bölge Satış Müdürü

PROFESYONEL ÖZET
Hızlı Tüketim / FMCG alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Unilever Sanayi A.Ş. - Bölge Satış Müdürü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Orhan Efe');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#73/100]: Realistic CV for Rüya Fidan (Mali İşler Direktörü)', () => {
    const cv = `
Rüya Fidan
İstanbul / Kadıköy | 0532 999 11 72
Mali İşler Direktörü

PROFESYONEL ÖZET
Finans / Bankacılık alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Garanti Bankası A.Ş. - Mali İşler Direktörü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Rüya Fidan');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#74/100]: Realistic CV for Selin Güner (Çağrı Merkezi Takım Lideri)', () => {
    const cv = `
Selin Güner
İstanbul / Kadıköy | 0532 999 11 73
Çağrı Merkezi Takım Lideri

PROFESYONEL ÖZET
Çağrı merkezi alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Turkcell Hizmetleri A.Ş. - Çağrı Merkezi Takım Lideri (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Güner');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#75/100]: Realistic CV for Tarık Hakan (Tedarik Zinciri Uzmanı)', () => {
    const cv = `
Tarık Hakan
İstanbul / Kadıköy | 0532 999 11 74
Tedarik Zinciri Uzmanı

PROFESYONEL ÖZET
Lojistik / Depolama alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Ekol Taşımacılık A.Ş. - Tedarik Zinciri Uzmanı (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Tarık Hakan');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#76/100]: Realistic CV for Ufuk Işık (İnsan Kaynakları Müdürü)', () => {
    const cv = `
Ufuk Işık
İstanbul / Kadıköy | 0532 999 11 75
İnsan Kaynakları Müdürü

PROFESYONEL ÖZET
Danışmanlık / İK alanında 10+ yıl deneyimli profesyonel.

DENEYİM
PwC Danışmanlık A.Ş. - İnsan Kaynakları Müdürü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ufuk Işık');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#77/100]: Realistic CV for Vedat Jale (İnşaat Proje Müdürü)', () => {
    const cv = `
Vedat Jale
İstanbul / Kadıköy | 0532 999 11 76
İnşaat Proje Müdürü

PROFESYONEL ÖZET
İnşaat / Gayrimenkul alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Enka Yapı Sanayi A.Ş. - İnşaat Proje Müdürü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Vedat Jale');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#78/100]: Realistic CV for Yeliz Mutlu (Pazarlama İletişimi Uzmanı)', () => {
    const cv = `
Yeliz Mutlu
İstanbul / Kadıköy | 0532 999 11 77
Pazarlama İletişimi Uzmanı

PROFESYONEL ÖZET
Pazarlama / Reklam alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Pazarlama İletişimi Uzmanı (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Yeliz Mutlu');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#79/100]: Realistic CV for Zehra Nalbant (Üretim ve Kalite Müdürü)', () => {
    const cv = `
Zehra Nalbant
İstanbul / Kadıköy | 0532 999 11 78
Üretim ve Kalite Müdürü

PROFESYONEL ÖZET
Üretim / Endüstriyel alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Arçelik Sanayi A.Ş. - Üretim ve Kalite Müdürü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zehra Nalbant');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#80/100]: Realistic CV for Ayşe Oğuz (Otel Operasyon Müdürü)', () => {
    const cv = `
Ayşe Oğuz
İstanbul / Kadıköy | 0532 999 11 79
Otel Operasyon Müdürü

PROFESYONEL ÖZET
Turizm / Otelcilik alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Divan Turizm İşletmeleri A.Ş. - Otel Operasyon Müdürü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ayşe Oğuz');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#81/100]: Realistic CV for Bülent Soydan (Full Stack Developer)', () => {
    const cv = `
Bülent Soydan
İstanbul / Kadıköy | 0532 999 11 80
Full Stack Developer

PROFESYONEL ÖZET
Bilişim / Yazılım alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Trendyol Teknoloji A.Ş. - Full Stack Developer (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Bülent Soydan');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#82/100]: Realistic CV for Cihan Sururi (Bölge Satış Müdürü)', () => {
    const cv = `
Cihan Sururi
İstanbul / Kadıköy | 0532 999 11 81
Bölge Satış Müdürü

PROFESYONEL ÖZET
Hızlı Tüketim / FMCG alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Unilever Sanayi A.Ş. - Bölge Satış Müdürü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Cihan Sururi');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#83/100]: Realistic CV for Damla Orman (Mali İşler Direktörü)', () => {
    const cv = `
Damla Orman
İstanbul / Kadıköy | 0532 999 11 82
Mali İşler Direktörü

PROFESYONEL ÖZET
Finans / Bankacılık alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Garanti Bankası A.Ş. - Mali İşler Direktörü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Damla Orman');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#84/100]: Realistic CV for Ebru Uslu (Çağrı Merkezi Takım Lideri)', () => {
    const cv = `
Ebru Uslu
İstanbul / Kadıköy | 0532 999 11 83
Çağrı Merkezi Takım Lideri

PROFESYONEL ÖZET
Çağrı merkezi alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Turkcell Hizmetleri A.Ş. - Çağrı Merkezi Takım Lideri (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ebru Uslu');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#85/100]: Realistic CV for Fikret Kurtoğlu (Tedarik Zinciri Uzmanı)', () => {
    const cv = `
Fikret Kurtoğlu
İstanbul / Kadıköy | 0532 999 11 84
Tedarik Zinciri Uzmanı

PROFESYONEL ÖZET
Lojistik / Depolama alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Ekol Taşımacılık A.Ş. - Tedarik Zinciri Uzmanı (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Fikret Kurtoğlu');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#86/100]: Realistic CV for Güneş Demirtaş (İnsan Kaynakları Müdürü)', () => {
    const cv = `
Güneş Demirtaş
İstanbul / Kadıköy | 0532 999 11 85
İnsan Kaynakları Müdürü

PROFESYONEL ÖZET
Danışmanlık / İK alanında 10+ yıl deneyimli profesyonel.

DENEYİM
PwC Danışmanlık A.Ş. - İnsan Kaynakları Müdürü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Güneş Demirtaş');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#87/100]: Realistic CV for Hülya Çelebi (İnşaat Proje Müdürü)', () => {
    const cv = `
Hülya Çelebi
İstanbul / Kadıköy | 0532 999 11 86
İnşaat Proje Müdürü

PROFESYONEL ÖZET
İnşaat / Gayrimenkul alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Enka Yapı Sanayi A.Ş. - İnşaat Proje Müdürü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hülya Çelebi');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#88/100]: Realistic CV for İsmail Baştürk (Pazarlama İletişimi Uzmanı)', () => {
    const cv = `
İsmail Baştürk
İstanbul / Kadıköy | 0532 999 11 87
Pazarlama İletişimi Uzmanı

PROFESYONEL ÖZET
Pazarlama / Reklam alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Pazarlama İletişimi Uzmanı (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('İsmail Baştürk');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#89/100]: Realistic CV for Mahmut Özbek (Üretim ve Kalite Müdürü)', () => {
    const cv = `
Mahmut Özbek
İstanbul / Kadıköy | 0532 999 11 88
Üretim ve Kalite Müdürü

PROFESYONEL ÖZET
Üretim / Endüstriyel alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Arçelik Sanayi A.Ş. - Üretim ve Kalite Müdürü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Mahmut Özbek');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#90/100]: Realistic CV for Mustafa Kocaman (Otel Operasyon Müdürü)', () => {
    const cv = `
Mustafa Kocaman
İstanbul / Kadıköy | 0532 999 11 89
Otel Operasyon Müdürü

PROFESYONEL ÖZET
Turizm / Otelcilik alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Divan Turizm İşletmeleri A.Ş. - Otel Operasyon Müdürü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Mustafa Kocaman');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#91/100]: Realistic CV for Nalan Ertekin (Full Stack Developer)', () => {
    const cv = `
Nalan Ertekin
İstanbul / Kadıköy | 0532 999 11 90
Full Stack Developer

PROFESYONEL ÖZET
Bilişim / Yazılım alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Trendyol Teknoloji A.Ş. - Full Stack Developer (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Nalan Ertekin');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#92/100]: Realistic CV for Ömer Akpınar (Bölge Satış Müdürü)', () => {
    const cv = `
Ömer Akpınar
İstanbul / Kadıköy | 0532 999 11 91
Bölge Satış Müdürü

PROFESYONEL ÖZET
Hızlı Tüketim / FMCG alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Unilever Sanayi A.Ş. - Bölge Satış Müdürü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ömer Akpınar');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#93/100]: Realistic CV for Ramazan Batıl (Mali İşler Direktörü)', () => {
    const cv = `
Ramazan Batıl
İstanbul / Kadıköy | 0532 999 11 92
Mali İşler Direktörü

PROFESYONEL ÖZET
Finans / Bankacılık alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Garanti Bankası A.Ş. - Mali İşler Direktörü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ramazan Batıl');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#94/100]: Realistic CV for Sevim Saylan (Çağrı Merkezi Takım Lideri)', () => {
    const cv = `
Sevim Saylan
İstanbul / Kadıköy | 0532 999 11 93
Çağrı Merkezi Takım Lideri

PROFESYONEL ÖZET
Çağrı merkezi alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Turkcell Hizmetleri A.Ş. - Çağrı Merkezi Takım Lideri (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Sevim Saylan');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#95/100]: Realistic CV for Tayfun Ekşi (Tedarik Zinciri Uzmanı)', () => {
    const cv = `
Tayfun Ekşi
İstanbul / Kadıköy | 0532 999 11 94
Tedarik Zinciri Uzmanı

PROFESYONEL ÖZET
Lojistik / Depolama alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Ekol Taşımacılık A.Ş. - Tedarik Zinciri Uzmanı (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Tayfun Ekşi');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#96/100]: Realistic CV for Ulvi Zaman (İnsan Kaynakları Müdürü)', () => {
    const cv = `
Ulvi Zaman
İstanbul / Kadıköy | 0532 999 11 95
İnsan Kaynakları Müdürü

PROFESYONEL ÖZET
Danışmanlık / İK alanında 10+ yıl deneyimli profesyonel.

DENEYİM
PwC Danışmanlık A.Ş. - İnsan Kaynakları Müdürü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ulvi Zaman');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#97/100]: Realistic CV for Volkan Hürkuş (İnşaat Proje Müdürü)', () => {
    const cv = `
Volkan Hürkuş
İstanbul / Kadıköy | 0532 999 11 96
İnşaat Proje Müdürü

PROFESYONEL ÖZET
İnşaat / Gayrimenkul alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Enka Yapı Sanayi A.Ş. - İnşaat Proje Müdürü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Volkan Hürkuş');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#98/100]: Realistic CV for Yonca Turan (Pazarlama İletişimi Uzmanı)', () => {
    const cv = `
Yonca Turan
İstanbul / Kadıköy | 0532 999 11 97
Pazarlama İletişimi Uzmanı

PROFESYONEL ÖZET
Pazarlama / Reklam alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Pazarlama İletişimi Uzmanı (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Yonca Turan');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#99/100]: Realistic CV for Zeynep Gürbüz (Üretim ve Kalite Müdürü)', () => {
    const cv = `
Zeynep Gürbüz
İstanbul / Kadıköy | 0532 999 11 98
Üretim ve Kalite Müdürü

PROFESYONEL ÖZET
Üretim / Endüstriyel alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Arçelik Sanayi A.Ş. - Üretim ve Kalite Müdürü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Gürbüz');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });

  it('Synthetic Corpus [#100/100]: Realistic CV for Bora Alkan (Otel Operasyon Müdürü)', () => {
    const cv = `
Bora Alkan
İstanbul / Kadıköy | 0532 999 11 99
Otel Operasyon Müdürü

PROFESYONEL ÖZET
Turizm / Otelcilik alanında 10+ yıl deneyimli profesyonel.

DENEYİM
Divan Turizm İşletmeleri A.Ş. - Otel Operasyon Müdürü (2018 - 2024)
Departman yönetimi, süreç optimizasyonu ve bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Planlama, Ekip Yönetimi, KPI Takibi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Bora Alkan');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(4);
  });
});
