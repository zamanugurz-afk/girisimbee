import { describe, expect, it } from 'vitest';
import { extractDeterministicCv } from './cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from './cv-taxonomy-mapper';
import { buildCvEvidenceGraph } from './cv-evidence-graph';

describe('CV Extraction Engine 9.0 — 100 Multi-Column & Spatial Reconstruction Suite', () => {
  it('[SPATIAL_1/100] Multi-Column Spatial Reconstruction: Zeynep Karaca (Kıdemli Frontend Mimarı)', () => {
    const cv = `
========================================
SOL SÜTUN (SIDEBAR)
========================================
Zeynep Karaca
İstanbul / Beşiktaş
0532 999 00 11 | cand@example.com

EĞİTİM
İstanbul Teknik Üniversitesi - Lisans (2012 - 2016)

YETKİNLİKLER
Strateji, Liderlik, Bütçe, Agile

========================================
SAĞ SÜTUN (ANA İÇERİK)
========================================
ÖZGEÇMİŞ ÖZETİ
Kıdemli Frontend Mimarı olarak 8 yıllık başarılı sektör tecrübesi.

İŞ DENEYİMİ
Trendyol Teknoloji A.Ş. - Kıdemli Frontend Mimarı (2018 - 2024)
Kurumsal projelerin uçtan uca yürütülmesi.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Karaca');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[SPATIAL_2/100] Multi-Column Spatial Reconstruction: Can Şimşek (Operasyonel Mükemmellik Direktörü)', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Can Şimşek               | Arçelik Sanayi A.Ş.                               |
| Şehir: Ankara / Çankaya         | Görev: Operasyonel Mükemmellik Direktörü                        |
| E-posta: contact@domain.com     | Dönem: 2019 - 2024                         |
| Telefon: 0533 222 33 44         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: ODTÜ - Lisans (2015)    | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Can Şimşek');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[SPATIAL_3/100] Multi-Column Spatial Reconstruction: Elif Soylu (Kurumsal Bankacılık Müdürü)', () => {
    const cv = `
********************************************************************************
Elif Soylu — Kurumsal Bankacılık Müdürü
İzmir / Bornova | 0535 444 55 66 | email@example.com
********************************************************************************

[SOL KOLON: EĞİTİM & BECERİLER]
Ege Üniversitesi - Mühendislik Fakültesi (2010 - 2014)
Yetkinlikler: Python, SQL, Analitik Düşünme, Liderlik

[SAĞ KOLON: İŞ DENEYİMİ]
İş Bankası A.Ş. - Kurumsal Bankacılık Müdürü (2017 - 2024)
Departman idaresi ve operasyonel verimlilik artışı.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Elif Soylu');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('İş', 'i'));
  });

  it('[SPATIAL_4/100] Multi-Column Spatial Reconstruction: Burak Özcan (E-Ticaret Operasyon Direktörü)', () => {
    const cv = `
[KOLON 1: KİMLİK]
Burak Özcan
Bursa / Nilüfer

[KOLON 2: DENEYİM]
Hepsiburada A.Ş. - E-Ticaret Operasyon Direktörü (2018 - 2024)
Tüm stratejik hedeflerin gerçekleştirilmesi.

[KOLON 3: EĞİTİM & YETKİNLİK]
Uludağ Üniversitesi (2011 - 2015)
Yetkinlikler: Bütçe, Ekip Yönetimi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Burak Özcan');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[SPATIAL_5/100] Multi-Column Spatial Reconstruction: Merve Gündoğan (Tedarik Zinciri ve Planlama Müdürü)', () => {
    const cv = `
========================================
SOL SÜTUN (SIDEBAR)
========================================
Merve Gündoğan
İstanbul / Beşiktaş
0532 999 00 11 | cand@example.com

EĞİTİM
İstanbul Teknik Üniversitesi - Lisans (2012 - 2016)

YETKİNLİKLER
Strateji, Liderlik, Bütçe, Agile

========================================
SAĞ SÜTUN (ANA İÇERİK)
========================================
ÖZGEÇMİŞ ÖZETİ
Tedarik Zinciri ve Planlama Müdürü olarak 8 yıllık başarılı sektör tecrübesi.

İŞ DENEYİMİ
Borusan Lojistik A.Ş. - Tedarik Zinciri ve Planlama Müdürü (2018 - 2024)
Kurumsal projelerin uçtan uca yürütülmesi.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Merve Gündoğan');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Borusan', 'i'));
  });

  it('[SPATIAL_6/100] Multi-Column Spatial Reconstruction: Oğuzhan Korkmaz (Kıdemli Frontend Mimarı)', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Oğuzhan Korkmaz               | Trendyol Teknoloji A.Ş.                               |
| Şehir: Ankara / Çankaya         | Görev: Kıdemli Frontend Mimarı                        |
| E-posta: contact@domain.com     | Dönem: 2019 - 2024                         |
| Telefon: 0533 222 33 44         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: ODTÜ - Lisans (2015)    | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Oğuzhan Korkmaz');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[SPATIAL_7/100] Multi-Column Spatial Reconstruction: Büşra Avcı (Operasyonel Mükemmellik Direktörü)', () => {
    const cv = `
********************************************************************************
Büşra Avcı — Operasyonel Mükemmellik Direktörü
İzmir / Bornova | 0535 444 55 66 | email@example.com
********************************************************************************

[SOL KOLON: EĞİTİM & BECERİLER]
Ege Üniversitesi - Mühendislik Fakültesi (2010 - 2014)
Yetkinlikler: Python, SQL, Analitik Düşünme, Liderlik

[SAĞ KOLON: İŞ DENEYİMİ]
Arçelik Sanayi A.Ş. - Operasyonel Mükemmellik Direktörü (2017 - 2024)
Departman idaresi ve operasyonel verimlilik artışı.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Büşra Avcı');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[SPATIAL_8/100] Multi-Column Spatial Reconstruction: Serkan Çakır (Kurumsal Bankacılık Müdürü)', () => {
    const cv = `
[KOLON 1: KİMLİK]
Serkan Çakır
Bursa / Nilüfer

[KOLON 2: DENEYİM]
İş Bankası A.Ş. - Kurumsal Bankacılık Müdürü (2018 - 2024)
Tüm stratejik hedeflerin gerçekleştirilmesi.

[KOLON 3: EĞİTİM & YETKİNLİK]
Uludağ Üniversitesi (2011 - 2015)
Yetkinlikler: Bütçe, Ekip Yönetimi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Serkan Çakır');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('İş', 'i'));
  });

  it('[SPATIAL_9/100] Multi-Column Spatial Reconstruction: Gamze Duran (E-Ticaret Operasyon Direktörü)', () => {
    const cv = `
========================================
SOL SÜTUN (SIDEBAR)
========================================
Gamze Duran
İstanbul / Beşiktaş
0532 999 00 11 | cand@example.com

EĞİTİM
İstanbul Teknik Üniversitesi - Lisans (2012 - 2016)

YETKİNLİKLER
Strateji, Liderlik, Bütçe, Agile

========================================
SAĞ SÜTUN (ANA İÇERİK)
========================================
ÖZGEÇMİŞ ÖZETİ
E-Ticaret Operasyon Direktörü olarak 8 yıllık başarılı sektör tecrübesi.

İŞ DENEYİMİ
Hepsiburada A.Ş. - E-Ticaret Operasyon Direktörü (2018 - 2024)
Kurumsal projelerin uçtan uca yürütülmesi.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Gamze Duran');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[SPATIAL_10/100] Multi-Column Spatial Reconstruction: Uğur Erdoğan (Tedarik Zinciri ve Planlama Müdürü)', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Uğur Erdoğan               | Borusan Lojistik A.Ş.                               |
| Şehir: Ankara / Çankaya         | Görev: Tedarik Zinciri ve Planlama Müdürü                        |
| E-posta: contact@domain.com     | Dönem: 2019 - 2024                         |
| Telefon: 0533 222 33 44         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: ODTÜ - Lisans (2015)    | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Uğur Erdoğan');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Borusan', 'i'));
  });

  it('[SPATIAL_11/100] Multi-Column Spatial Reconstruction: Seda Bozkurt (Kıdemli Frontend Mimarı)', () => {
    const cv = `
********************************************************************************
Seda Bozkurt — Kıdemli Frontend Mimarı
İzmir / Bornova | 0535 444 55 66 | email@example.com
********************************************************************************

[SOL KOLON: EĞİTİM & BECERİLER]
Ege Üniversitesi - Mühendislik Fakültesi (2010 - 2014)
Yetkinlikler: Python, SQL, Analitik Düşünme, Liderlik

[SAĞ KOLON: İŞ DENEYİMİ]
Trendyol Teknoloji A.Ş. - Kıdemli Frontend Mimarı (2017 - 2024)
Departman idaresi ve operasyonel verimlilik artışı.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Seda Bozkurt');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[SPATIAL_12/100] Multi-Column Spatial Reconstruction: Volkan Yavuz (Operasyonel Mükemmellik Direktörü)', () => {
    const cv = `
[KOLON 1: KİMLİK]
Volkan Yavuz
Bursa / Nilüfer

[KOLON 2: DENEYİM]
Arçelik Sanayi A.Ş. - Operasyonel Mükemmellik Direktörü (2018 - 2024)
Tüm stratejik hedeflerin gerçekleştirilmesi.

[KOLON 3: EĞİTİM & YETKİNLİK]
Uludağ Üniversitesi (2011 - 2015)
Yetkinlikler: Bütçe, Ekip Yönetimi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Volkan Yavuz');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[SPATIAL_13/100] Multi-Column Spatial Reconstruction: Ebru Turan (Kurumsal Bankacılık Müdürü)', () => {
    const cv = `
========================================
SOL SÜTUN (SIDEBAR)
========================================
Ebru Turan
İstanbul / Beşiktaş
0532 999 00 11 | cand@example.com

EĞİTİM
İstanbul Teknik Üniversitesi - Lisans (2012 - 2016)

YETKİNLİKLER
Strateji, Liderlik, Bütçe, Agile

========================================
SAĞ SÜTUN (ANA İÇERİK)
========================================
ÖZGEÇMİŞ ÖZETİ
Kurumsal Bankacılık Müdürü olarak 8 yıllık başarılı sektör tecrübesi.

İŞ DENEYİMİ
İş Bankası A.Ş. - Kurumsal Bankacılık Müdürü (2018 - 2024)
Kurumsal projelerin uçtan uca yürütülmesi.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ebru Turan');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('İş', 'i'));
  });

  it('[SPATIAL_14/100] Multi-Column Spatial Reconstruction: Tolga Güneş (E-Ticaret Operasyon Direktörü)', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Tolga Güneş               | Hepsiburada A.Ş.                               |
| Şehir: Ankara / Çankaya         | Görev: E-Ticaret Operasyon Direktörü                        |
| E-posta: contact@domain.com     | Dönem: 2019 - 2024                         |
| Telefon: 0533 222 33 44         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: ODTÜ - Lisans (2015)    | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Tolga Güneş');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[SPATIAL_15/100] Multi-Column Spatial Reconstruction: Tuğba Yurttaş (Tedarik Zinciri ve Planlama Müdürü)', () => {
    const cv = `
********************************************************************************
Tuğba Yurttaş — Tedarik Zinciri ve Planlama Müdürü
İzmir / Bornova | 0535 444 55 66 | email@example.com
********************************************************************************

[SOL KOLON: EĞİTİM & BECERİLER]
Ege Üniversitesi - Mühendislik Fakültesi (2010 - 2014)
Yetkinlikler: Python, SQL, Analitik Düşünme, Liderlik

[SAĞ KOLON: İŞ DENEYİMİ]
Borusan Lojistik A.Ş. - Tedarik Zinciri ve Planlama Müdürü (2017 - 2024)
Departman idaresi ve operasyonel verimlilik artışı.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Tuğba Yurttaş');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Borusan', 'i'));
  });

  it('[SPATIAL_16/100] Multi-Column Spatial Reconstruction: Alper Aksoy (Kıdemli Frontend Mimarı)', () => {
    const cv = `
[KOLON 1: KİMLİK]
Alper Aksoy
Bursa / Nilüfer

[KOLON 2: DENEYİM]
Trendyol Teknoloji A.Ş. - Kıdemli Frontend Mimarı (2018 - 2024)
Tüm stratejik hedeflerin gerçekleştirilmesi.

[KOLON 3: EĞİTİM & YETKİNLİK]
Uludağ Üniversitesi (2011 - 2015)
Yetkinlikler: Bütçe, Ekip Yönetimi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Alper Aksoy');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[SPATIAL_17/100] Multi-Column Spatial Reconstruction: Derya Ergin (Operasyonel Mükemmellik Direktörü)', () => {
    const cv = `
========================================
SOL SÜTUN (SIDEBAR)
========================================
Derya Ergin
İstanbul / Beşiktaş
0532 999 00 11 | cand@example.com

EĞİTİM
İstanbul Teknik Üniversitesi - Lisans (2012 - 2016)

YETKİNLİKLER
Strateji, Liderlik, Bütçe, Agile

========================================
SAĞ SÜTUN (ANA İÇERİK)
========================================
ÖZGEÇMİŞ ÖZETİ
Operasyonel Mükemmellik Direktörü olarak 8 yıllık başarılı sektör tecrübesi.

İŞ DENEYİMİ
Arçelik Sanayi A.Ş. - Operasyonel Mükemmellik Direktörü (2018 - 2024)
Kurumsal projelerin uçtan uca yürütülmesi.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Derya Ergin');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[SPATIAL_18/100] Multi-Column Spatial Reconstruction: Onur Güler (Kurumsal Bankacılık Müdürü)', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Onur Güler               | İş Bankası A.Ş.                               |
| Şehir: Ankara / Çankaya         | Görev: Kurumsal Bankacılık Müdürü                        |
| E-posta: contact@domain.com     | Dönem: 2019 - 2024                         |
| Telefon: 0533 222 33 44         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: ODTÜ - Lisans (2015)    | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Onur Güler');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('İş', 'i'));
  });

  it('[SPATIAL_19/100] Multi-Column Spatial Reconstruction: Selin Yaman (E-Ticaret Operasyon Direktörü)', () => {
    const cv = `
********************************************************************************
Selin Yaman — E-Ticaret Operasyon Direktörü
İzmir / Bornova | 0535 444 55 66 | email@example.com
********************************************************************************

[SOL KOLON: EĞİTİM & BECERİLER]
Ege Üniversitesi - Mühendislik Fakültesi (2010 - 2014)
Yetkinlikler: Python, SQL, Analitik Düşünme, Liderlik

[SAĞ KOLON: İŞ DENEYİMİ]
Hepsiburada A.Ş. - E-Ticaret Operasyon Direktörü (2017 - 2024)
Departman idaresi ve operasyonel verimlilik artışı.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Yaman');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[SPATIAL_20/100] Multi-Column Spatial Reconstruction: Gökhan Ünal (Tedarik Zinciri ve Planlama Müdürü)', () => {
    const cv = `
[KOLON 1: KİMLİK]
Gökhan Ünal
Bursa / Nilüfer

[KOLON 2: DENEYİM]
Borusan Lojistik A.Ş. - Tedarik Zinciri ve Planlama Müdürü (2018 - 2024)
Tüm stratejik hedeflerin gerçekleştirilmesi.

[KOLON 3: EĞİTİM & YETKİNLİK]
Uludağ Üniversitesi (2011 - 2015)
Yetkinlikler: Bütçe, Ekip Yönetimi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Gökhan Ünal');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Borusan', 'i'));
  });

  it('[SPATIAL_21/100] Multi-Column Spatial Reconstruction: Zeynep Şimşek (Kıdemli Frontend Mimarı)', () => {
    const cv = `
========================================
SOL SÜTUN (SIDEBAR)
========================================
Zeynep Şimşek
İstanbul / Beşiktaş
0532 999 00 11 | cand@example.com

EĞİTİM
İstanbul Teknik Üniversitesi - Lisans (2012 - 2016)

YETKİNLİKLER
Strateji, Liderlik, Bütçe, Agile

========================================
SAĞ SÜTUN (ANA İÇERİK)
========================================
ÖZGEÇMİŞ ÖZETİ
Kıdemli Frontend Mimarı olarak 8 yıllık başarılı sektör tecrübesi.

İŞ DENEYİMİ
Trendyol Teknoloji A.Ş. - Kıdemli Frontend Mimarı (2018 - 2024)
Kurumsal projelerin uçtan uca yürütülmesi.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Şimşek');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[SPATIAL_22/100] Multi-Column Spatial Reconstruction: Can Soylu (Operasyonel Mükemmellik Direktörü)', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Can Soylu               | Arçelik Sanayi A.Ş.                               |
| Şehir: Ankara / Çankaya         | Görev: Operasyonel Mükemmellik Direktörü                        |
| E-posta: contact@domain.com     | Dönem: 2019 - 2024                         |
| Telefon: 0533 222 33 44         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: ODTÜ - Lisans (2015)    | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Can Soylu');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[SPATIAL_23/100] Multi-Column Spatial Reconstruction: Elif Özcan (Kurumsal Bankacılık Müdürü)', () => {
    const cv = `
********************************************************************************
Elif Özcan — Kurumsal Bankacılık Müdürü
İzmir / Bornova | 0535 444 55 66 | email@example.com
********************************************************************************

[SOL KOLON: EĞİTİM & BECERİLER]
Ege Üniversitesi - Mühendislik Fakültesi (2010 - 2014)
Yetkinlikler: Python, SQL, Analitik Düşünme, Liderlik

[SAĞ KOLON: İŞ DENEYİMİ]
İş Bankası A.Ş. - Kurumsal Bankacılık Müdürü (2017 - 2024)
Departman idaresi ve operasyonel verimlilik artışı.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Elif Özcan');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('İş', 'i'));
  });

  it('[SPATIAL_24/100] Multi-Column Spatial Reconstruction: Burak Gündoğan (E-Ticaret Operasyon Direktörü)', () => {
    const cv = `
[KOLON 1: KİMLİK]
Burak Gündoğan
Bursa / Nilüfer

[KOLON 2: DENEYİM]
Hepsiburada A.Ş. - E-Ticaret Operasyon Direktörü (2018 - 2024)
Tüm stratejik hedeflerin gerçekleştirilmesi.

[KOLON 3: EĞİTİM & YETKİNLİK]
Uludağ Üniversitesi (2011 - 2015)
Yetkinlikler: Bütçe, Ekip Yönetimi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Burak Gündoğan');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[SPATIAL_25/100] Multi-Column Spatial Reconstruction: Merve Korkmaz (Tedarik Zinciri ve Planlama Müdürü)', () => {
    const cv = `
========================================
SOL SÜTUN (SIDEBAR)
========================================
Merve Korkmaz
İstanbul / Beşiktaş
0532 999 00 11 | cand@example.com

EĞİTİM
İstanbul Teknik Üniversitesi - Lisans (2012 - 2016)

YETKİNLİKLER
Strateji, Liderlik, Bütçe, Agile

========================================
SAĞ SÜTUN (ANA İÇERİK)
========================================
ÖZGEÇMİŞ ÖZETİ
Tedarik Zinciri ve Planlama Müdürü olarak 8 yıllık başarılı sektör tecrübesi.

İŞ DENEYİMİ
Borusan Lojistik A.Ş. - Tedarik Zinciri ve Planlama Müdürü (2018 - 2024)
Kurumsal projelerin uçtan uca yürütülmesi.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Merve Korkmaz');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Borusan', 'i'));
  });

  it('[SPATIAL_26/100] Multi-Column Spatial Reconstruction: Oğuzhan Avcı (Kıdemli Frontend Mimarı)', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Oğuzhan Avcı               | Trendyol Teknoloji A.Ş.                               |
| Şehir: Ankara / Çankaya         | Görev: Kıdemli Frontend Mimarı                        |
| E-posta: contact@domain.com     | Dönem: 2019 - 2024                         |
| Telefon: 0533 222 33 44         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: ODTÜ - Lisans (2015)    | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Oğuzhan Avcı');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[SPATIAL_27/100] Multi-Column Spatial Reconstruction: Büşra Çakır (Operasyonel Mükemmellik Direktörü)', () => {
    const cv = `
********************************************************************************
Büşra Çakır — Operasyonel Mükemmellik Direktörü
İzmir / Bornova | 0535 444 55 66 | email@example.com
********************************************************************************

[SOL KOLON: EĞİTİM & BECERİLER]
Ege Üniversitesi - Mühendislik Fakültesi (2010 - 2014)
Yetkinlikler: Python, SQL, Analitik Düşünme, Liderlik

[SAĞ KOLON: İŞ DENEYİMİ]
Arçelik Sanayi A.Ş. - Operasyonel Mükemmellik Direktörü (2017 - 2024)
Departman idaresi ve operasyonel verimlilik artışı.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Büşra Çakır');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[SPATIAL_28/100] Multi-Column Spatial Reconstruction: Serkan Duran (Kurumsal Bankacılık Müdürü)', () => {
    const cv = `
[KOLON 1: KİMLİK]
Serkan Duran
Bursa / Nilüfer

[KOLON 2: DENEYİM]
İş Bankası A.Ş. - Kurumsal Bankacılık Müdürü (2018 - 2024)
Tüm stratejik hedeflerin gerçekleştirilmesi.

[KOLON 3: EĞİTİM & YETKİNLİK]
Uludağ Üniversitesi (2011 - 2015)
Yetkinlikler: Bütçe, Ekip Yönetimi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Serkan Duran');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('İş', 'i'));
  });

  it('[SPATIAL_29/100] Multi-Column Spatial Reconstruction: Gamze Erdoğan (E-Ticaret Operasyon Direktörü)', () => {
    const cv = `
========================================
SOL SÜTUN (SIDEBAR)
========================================
Gamze Erdoğan
İstanbul / Beşiktaş
0532 999 00 11 | cand@example.com

EĞİTİM
İstanbul Teknik Üniversitesi - Lisans (2012 - 2016)

YETKİNLİKLER
Strateji, Liderlik, Bütçe, Agile

========================================
SAĞ SÜTUN (ANA İÇERİK)
========================================
ÖZGEÇMİŞ ÖZETİ
E-Ticaret Operasyon Direktörü olarak 8 yıllık başarılı sektör tecrübesi.

İŞ DENEYİMİ
Hepsiburada A.Ş. - E-Ticaret Operasyon Direktörü (2018 - 2024)
Kurumsal projelerin uçtan uca yürütülmesi.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Gamze Erdoğan');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[SPATIAL_30/100] Multi-Column Spatial Reconstruction: Uğur Bozkurt (Tedarik Zinciri ve Planlama Müdürü)', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Uğur Bozkurt               | Borusan Lojistik A.Ş.                               |
| Şehir: Ankara / Çankaya         | Görev: Tedarik Zinciri ve Planlama Müdürü                        |
| E-posta: contact@domain.com     | Dönem: 2019 - 2024                         |
| Telefon: 0533 222 33 44         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: ODTÜ - Lisans (2015)    | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Uğur Bozkurt');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Borusan', 'i'));
  });

  it('[SPATIAL_31/100] Multi-Column Spatial Reconstruction: Seda Yavuz (Kıdemli Frontend Mimarı)', () => {
    const cv = `
********************************************************************************
Seda Yavuz — Kıdemli Frontend Mimarı
İzmir / Bornova | 0535 444 55 66 | email@example.com
********************************************************************************

[SOL KOLON: EĞİTİM & BECERİLER]
Ege Üniversitesi - Mühendislik Fakültesi (2010 - 2014)
Yetkinlikler: Python, SQL, Analitik Düşünme, Liderlik

[SAĞ KOLON: İŞ DENEYİMİ]
Trendyol Teknoloji A.Ş. - Kıdemli Frontend Mimarı (2017 - 2024)
Departman idaresi ve operasyonel verimlilik artışı.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Seda Yavuz');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[SPATIAL_32/100] Multi-Column Spatial Reconstruction: Volkan Turan (Operasyonel Mükemmellik Direktörü)', () => {
    const cv = `
[KOLON 1: KİMLİK]
Volkan Turan
Bursa / Nilüfer

[KOLON 2: DENEYİM]
Arçelik Sanayi A.Ş. - Operasyonel Mükemmellik Direktörü (2018 - 2024)
Tüm stratejik hedeflerin gerçekleştirilmesi.

[KOLON 3: EĞİTİM & YETKİNLİK]
Uludağ Üniversitesi (2011 - 2015)
Yetkinlikler: Bütçe, Ekip Yönetimi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Volkan Turan');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[SPATIAL_33/100] Multi-Column Spatial Reconstruction: Ebru Güneş (Kurumsal Bankacılık Müdürü)', () => {
    const cv = `
========================================
SOL SÜTUN (SIDEBAR)
========================================
Ebru Güneş
İstanbul / Beşiktaş
0532 999 00 11 | cand@example.com

EĞİTİM
İstanbul Teknik Üniversitesi - Lisans (2012 - 2016)

YETKİNLİKLER
Strateji, Liderlik, Bütçe, Agile

========================================
SAĞ SÜTUN (ANA İÇERİK)
========================================
ÖZGEÇMİŞ ÖZETİ
Kurumsal Bankacılık Müdürü olarak 8 yıllık başarılı sektör tecrübesi.

İŞ DENEYİMİ
İş Bankası A.Ş. - Kurumsal Bankacılık Müdürü (2018 - 2024)
Kurumsal projelerin uçtan uca yürütülmesi.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ebru Güneş');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('İş', 'i'));
  });

  it('[SPATIAL_34/100] Multi-Column Spatial Reconstruction: Tolga Yurttaş (E-Ticaret Operasyon Direktörü)', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Tolga Yurttaş               | Hepsiburada A.Ş.                               |
| Şehir: Ankara / Çankaya         | Görev: E-Ticaret Operasyon Direktörü                        |
| E-posta: contact@domain.com     | Dönem: 2019 - 2024                         |
| Telefon: 0533 222 33 44         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: ODTÜ - Lisans (2015)    | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Tolga Yurttaş');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[SPATIAL_35/100] Multi-Column Spatial Reconstruction: Tuğba Aksoy (Tedarik Zinciri ve Planlama Müdürü)', () => {
    const cv = `
********************************************************************************
Tuğba Aksoy — Tedarik Zinciri ve Planlama Müdürü
İzmir / Bornova | 0535 444 55 66 | email@example.com
********************************************************************************

[SOL KOLON: EĞİTİM & BECERİLER]
Ege Üniversitesi - Mühendislik Fakültesi (2010 - 2014)
Yetkinlikler: Python, SQL, Analitik Düşünme, Liderlik

[SAĞ KOLON: İŞ DENEYİMİ]
Borusan Lojistik A.Ş. - Tedarik Zinciri ve Planlama Müdürü (2017 - 2024)
Departman idaresi ve operasyonel verimlilik artışı.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Tuğba Aksoy');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Borusan', 'i'));
  });

  it('[SPATIAL_36/100] Multi-Column Spatial Reconstruction: Alper Ergin (Kıdemli Frontend Mimarı)', () => {
    const cv = `
[KOLON 1: KİMLİK]
Alper Ergin
Bursa / Nilüfer

[KOLON 2: DENEYİM]
Trendyol Teknoloji A.Ş. - Kıdemli Frontend Mimarı (2018 - 2024)
Tüm stratejik hedeflerin gerçekleştirilmesi.

[KOLON 3: EĞİTİM & YETKİNLİK]
Uludağ Üniversitesi (2011 - 2015)
Yetkinlikler: Bütçe, Ekip Yönetimi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Alper Ergin');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[SPATIAL_37/100] Multi-Column Spatial Reconstruction: Derya Güler (Operasyonel Mükemmellik Direktörü)', () => {
    const cv = `
========================================
SOL SÜTUN (SIDEBAR)
========================================
Derya Güler
İstanbul / Beşiktaş
0532 999 00 11 | cand@example.com

EĞİTİM
İstanbul Teknik Üniversitesi - Lisans (2012 - 2016)

YETKİNLİKLER
Strateji, Liderlik, Bütçe, Agile

========================================
SAĞ SÜTUN (ANA İÇERİK)
========================================
ÖZGEÇMİŞ ÖZETİ
Operasyonel Mükemmellik Direktörü olarak 8 yıllık başarılı sektör tecrübesi.

İŞ DENEYİMİ
Arçelik Sanayi A.Ş. - Operasyonel Mükemmellik Direktörü (2018 - 2024)
Kurumsal projelerin uçtan uca yürütülmesi.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Derya Güler');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[SPATIAL_38/100] Multi-Column Spatial Reconstruction: Onur Yaman (Kurumsal Bankacılık Müdürü)', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Onur Yaman               | İş Bankası A.Ş.                               |
| Şehir: Ankara / Çankaya         | Görev: Kurumsal Bankacılık Müdürü                        |
| E-posta: contact@domain.com     | Dönem: 2019 - 2024                         |
| Telefon: 0533 222 33 44         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: ODTÜ - Lisans (2015)    | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Onur Yaman');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('İş', 'i'));
  });

  it('[SPATIAL_39/100] Multi-Column Spatial Reconstruction: Selin Ünal (E-Ticaret Operasyon Direktörü)', () => {
    const cv = `
********************************************************************************
Selin Ünal — E-Ticaret Operasyon Direktörü
İzmir / Bornova | 0535 444 55 66 | email@example.com
********************************************************************************

[SOL KOLON: EĞİTİM & BECERİLER]
Ege Üniversitesi - Mühendislik Fakültesi (2010 - 2014)
Yetkinlikler: Python, SQL, Analitik Düşünme, Liderlik

[SAĞ KOLON: İŞ DENEYİMİ]
Hepsiburada A.Ş. - E-Ticaret Operasyon Direktörü (2017 - 2024)
Departman idaresi ve operasyonel verimlilik artışı.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Ünal');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[SPATIAL_40/100] Multi-Column Spatial Reconstruction: Gökhan Karaca (Tedarik Zinciri ve Planlama Müdürü)', () => {
    const cv = `
[KOLON 1: KİMLİK]
Gökhan Karaca
Bursa / Nilüfer

[KOLON 2: DENEYİM]
Borusan Lojistik A.Ş. - Tedarik Zinciri ve Planlama Müdürü (2018 - 2024)
Tüm stratejik hedeflerin gerçekleştirilmesi.

[KOLON 3: EĞİTİM & YETKİNLİK]
Uludağ Üniversitesi (2011 - 2015)
Yetkinlikler: Bütçe, Ekip Yönetimi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Gökhan Karaca');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Borusan', 'i'));
  });

  it('[SPATIAL_41/100] Multi-Column Spatial Reconstruction: Zeynep Soylu (Kıdemli Frontend Mimarı)', () => {
    const cv = `
========================================
SOL SÜTUN (SIDEBAR)
========================================
Zeynep Soylu
İstanbul / Beşiktaş
0532 999 00 11 | cand@example.com

EĞİTİM
İstanbul Teknik Üniversitesi - Lisans (2012 - 2016)

YETKİNLİKLER
Strateji, Liderlik, Bütçe, Agile

========================================
SAĞ SÜTUN (ANA İÇERİK)
========================================
ÖZGEÇMİŞ ÖZETİ
Kıdemli Frontend Mimarı olarak 8 yıllık başarılı sektör tecrübesi.

İŞ DENEYİMİ
Trendyol Teknoloji A.Ş. - Kıdemli Frontend Mimarı (2018 - 2024)
Kurumsal projelerin uçtan uca yürütülmesi.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Soylu');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[SPATIAL_42/100] Multi-Column Spatial Reconstruction: Can Özcan (Operasyonel Mükemmellik Direktörü)', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Can Özcan               | Arçelik Sanayi A.Ş.                               |
| Şehir: Ankara / Çankaya         | Görev: Operasyonel Mükemmellik Direktörü                        |
| E-posta: contact@domain.com     | Dönem: 2019 - 2024                         |
| Telefon: 0533 222 33 44         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: ODTÜ - Lisans (2015)    | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Can Özcan');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[SPATIAL_43/100] Multi-Column Spatial Reconstruction: Elif Gündoğan (Kurumsal Bankacılık Müdürü)', () => {
    const cv = `
********************************************************************************
Elif Gündoğan — Kurumsal Bankacılık Müdürü
İzmir / Bornova | 0535 444 55 66 | email@example.com
********************************************************************************

[SOL KOLON: EĞİTİM & BECERİLER]
Ege Üniversitesi - Mühendislik Fakültesi (2010 - 2014)
Yetkinlikler: Python, SQL, Analitik Düşünme, Liderlik

[SAĞ KOLON: İŞ DENEYİMİ]
İş Bankası A.Ş. - Kurumsal Bankacılık Müdürü (2017 - 2024)
Departman idaresi ve operasyonel verimlilik artışı.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Elif Gündoğan');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('İş', 'i'));
  });

  it('[SPATIAL_44/100] Multi-Column Spatial Reconstruction: Burak Korkmaz (E-Ticaret Operasyon Direktörü)', () => {
    const cv = `
[KOLON 1: KİMLİK]
Burak Korkmaz
Bursa / Nilüfer

[KOLON 2: DENEYİM]
Hepsiburada A.Ş. - E-Ticaret Operasyon Direktörü (2018 - 2024)
Tüm stratejik hedeflerin gerçekleştirilmesi.

[KOLON 3: EĞİTİM & YETKİNLİK]
Uludağ Üniversitesi (2011 - 2015)
Yetkinlikler: Bütçe, Ekip Yönetimi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Burak Korkmaz');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[SPATIAL_45/100] Multi-Column Spatial Reconstruction: Merve Avcı (Tedarik Zinciri ve Planlama Müdürü)', () => {
    const cv = `
========================================
SOL SÜTUN (SIDEBAR)
========================================
Merve Avcı
İstanbul / Beşiktaş
0532 999 00 11 | cand@example.com

EĞİTİM
İstanbul Teknik Üniversitesi - Lisans (2012 - 2016)

YETKİNLİKLER
Strateji, Liderlik, Bütçe, Agile

========================================
SAĞ SÜTUN (ANA İÇERİK)
========================================
ÖZGEÇMİŞ ÖZETİ
Tedarik Zinciri ve Planlama Müdürü olarak 8 yıllık başarılı sektör tecrübesi.

İŞ DENEYİMİ
Borusan Lojistik A.Ş. - Tedarik Zinciri ve Planlama Müdürü (2018 - 2024)
Kurumsal projelerin uçtan uca yürütülmesi.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Merve Avcı');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Borusan', 'i'));
  });

  it('[SPATIAL_46/100] Multi-Column Spatial Reconstruction: Oğuzhan Çakır (Kıdemli Frontend Mimarı)', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Oğuzhan Çakır               | Trendyol Teknoloji A.Ş.                               |
| Şehir: Ankara / Çankaya         | Görev: Kıdemli Frontend Mimarı                        |
| E-posta: contact@domain.com     | Dönem: 2019 - 2024                         |
| Telefon: 0533 222 33 44         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: ODTÜ - Lisans (2015)    | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Oğuzhan Çakır');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[SPATIAL_47/100] Multi-Column Spatial Reconstruction: Büşra Duran (Operasyonel Mükemmellik Direktörü)', () => {
    const cv = `
********************************************************************************
Büşra Duran — Operasyonel Mükemmellik Direktörü
İzmir / Bornova | 0535 444 55 66 | email@example.com
********************************************************************************

[SOL KOLON: EĞİTİM & BECERİLER]
Ege Üniversitesi - Mühendislik Fakültesi (2010 - 2014)
Yetkinlikler: Python, SQL, Analitik Düşünme, Liderlik

[SAĞ KOLON: İŞ DENEYİMİ]
Arçelik Sanayi A.Ş. - Operasyonel Mükemmellik Direktörü (2017 - 2024)
Departman idaresi ve operasyonel verimlilik artışı.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Büşra Duran');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[SPATIAL_48/100] Multi-Column Spatial Reconstruction: Serkan Erdoğan (Kurumsal Bankacılık Müdürü)', () => {
    const cv = `
[KOLON 1: KİMLİK]
Serkan Erdoğan
Bursa / Nilüfer

[KOLON 2: DENEYİM]
İş Bankası A.Ş. - Kurumsal Bankacılık Müdürü (2018 - 2024)
Tüm stratejik hedeflerin gerçekleştirilmesi.

[KOLON 3: EĞİTİM & YETKİNLİK]
Uludağ Üniversitesi (2011 - 2015)
Yetkinlikler: Bütçe, Ekip Yönetimi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Serkan Erdoğan');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('İş', 'i'));
  });

  it('[SPATIAL_49/100] Multi-Column Spatial Reconstruction: Gamze Bozkurt (E-Ticaret Operasyon Direktörü)', () => {
    const cv = `
========================================
SOL SÜTUN (SIDEBAR)
========================================
Gamze Bozkurt
İstanbul / Beşiktaş
0532 999 00 11 | cand@example.com

EĞİTİM
İstanbul Teknik Üniversitesi - Lisans (2012 - 2016)

YETKİNLİKLER
Strateji, Liderlik, Bütçe, Agile

========================================
SAĞ SÜTUN (ANA İÇERİK)
========================================
ÖZGEÇMİŞ ÖZETİ
E-Ticaret Operasyon Direktörü olarak 8 yıllık başarılı sektör tecrübesi.

İŞ DENEYİMİ
Hepsiburada A.Ş. - E-Ticaret Operasyon Direktörü (2018 - 2024)
Kurumsal projelerin uçtan uca yürütülmesi.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Gamze Bozkurt');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[SPATIAL_50/100] Multi-Column Spatial Reconstruction: Uğur Yavuz (Tedarik Zinciri ve Planlama Müdürü)', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Uğur Yavuz               | Borusan Lojistik A.Ş.                               |
| Şehir: Ankara / Çankaya         | Görev: Tedarik Zinciri ve Planlama Müdürü                        |
| E-posta: contact@domain.com     | Dönem: 2019 - 2024                         |
| Telefon: 0533 222 33 44         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: ODTÜ - Lisans (2015)    | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Uğur Yavuz');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Borusan', 'i'));
  });

  it('[SPATIAL_51/100] Multi-Column Spatial Reconstruction: Seda Turan (Kıdemli Frontend Mimarı)', () => {
    const cv = `
********************************************************************************
Seda Turan — Kıdemli Frontend Mimarı
İzmir / Bornova | 0535 444 55 66 | email@example.com
********************************************************************************

[SOL KOLON: EĞİTİM & BECERİLER]
Ege Üniversitesi - Mühendislik Fakültesi (2010 - 2014)
Yetkinlikler: Python, SQL, Analitik Düşünme, Liderlik

[SAĞ KOLON: İŞ DENEYİMİ]
Trendyol Teknoloji A.Ş. - Kıdemli Frontend Mimarı (2017 - 2024)
Departman idaresi ve operasyonel verimlilik artışı.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Seda Turan');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[SPATIAL_52/100] Multi-Column Spatial Reconstruction: Volkan Güneş (Operasyonel Mükemmellik Direktörü)', () => {
    const cv = `
[KOLON 1: KİMLİK]
Volkan Güneş
Bursa / Nilüfer

[KOLON 2: DENEYİM]
Arçelik Sanayi A.Ş. - Operasyonel Mükemmellik Direktörü (2018 - 2024)
Tüm stratejik hedeflerin gerçekleştirilmesi.

[KOLON 3: EĞİTİM & YETKİNLİK]
Uludağ Üniversitesi (2011 - 2015)
Yetkinlikler: Bütçe, Ekip Yönetimi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Volkan Güneş');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[SPATIAL_53/100] Multi-Column Spatial Reconstruction: Ebru Yurttaş (Kurumsal Bankacılık Müdürü)', () => {
    const cv = `
========================================
SOL SÜTUN (SIDEBAR)
========================================
Ebru Yurttaş
İstanbul / Beşiktaş
0532 999 00 11 | cand@example.com

EĞİTİM
İstanbul Teknik Üniversitesi - Lisans (2012 - 2016)

YETKİNLİKLER
Strateji, Liderlik, Bütçe, Agile

========================================
SAĞ SÜTUN (ANA İÇERİK)
========================================
ÖZGEÇMİŞ ÖZETİ
Kurumsal Bankacılık Müdürü olarak 8 yıllık başarılı sektör tecrübesi.

İŞ DENEYİMİ
İş Bankası A.Ş. - Kurumsal Bankacılık Müdürü (2018 - 2024)
Kurumsal projelerin uçtan uca yürütülmesi.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ebru Yurttaş');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('İş', 'i'));
  });

  it('[SPATIAL_54/100] Multi-Column Spatial Reconstruction: Tolga Aksoy (E-Ticaret Operasyon Direktörü)', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Tolga Aksoy               | Hepsiburada A.Ş.                               |
| Şehir: Ankara / Çankaya         | Görev: E-Ticaret Operasyon Direktörü                        |
| E-posta: contact@domain.com     | Dönem: 2019 - 2024                         |
| Telefon: 0533 222 33 44         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: ODTÜ - Lisans (2015)    | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Tolga Aksoy');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[SPATIAL_55/100] Multi-Column Spatial Reconstruction: Tuğba Ergin (Tedarik Zinciri ve Planlama Müdürü)', () => {
    const cv = `
********************************************************************************
Tuğba Ergin — Tedarik Zinciri ve Planlama Müdürü
İzmir / Bornova | 0535 444 55 66 | email@example.com
********************************************************************************

[SOL KOLON: EĞİTİM & BECERİLER]
Ege Üniversitesi - Mühendislik Fakültesi (2010 - 2014)
Yetkinlikler: Python, SQL, Analitik Düşünme, Liderlik

[SAĞ KOLON: İŞ DENEYİMİ]
Borusan Lojistik A.Ş. - Tedarik Zinciri ve Planlama Müdürü (2017 - 2024)
Departman idaresi ve operasyonel verimlilik artışı.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Tuğba Ergin');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Borusan', 'i'));
  });

  it('[SPATIAL_56/100] Multi-Column Spatial Reconstruction: Alper Güler (Kıdemli Frontend Mimarı)', () => {
    const cv = `
[KOLON 1: KİMLİK]
Alper Güler
Bursa / Nilüfer

[KOLON 2: DENEYİM]
Trendyol Teknoloji A.Ş. - Kıdemli Frontend Mimarı (2018 - 2024)
Tüm stratejik hedeflerin gerçekleştirilmesi.

[KOLON 3: EĞİTİM & YETKİNLİK]
Uludağ Üniversitesi (2011 - 2015)
Yetkinlikler: Bütçe, Ekip Yönetimi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Alper Güler');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[SPATIAL_57/100] Multi-Column Spatial Reconstruction: Derya Yaman (Operasyonel Mükemmellik Direktörü)', () => {
    const cv = `
========================================
SOL SÜTUN (SIDEBAR)
========================================
Derya Yaman
İstanbul / Beşiktaş
0532 999 00 11 | cand@example.com

EĞİTİM
İstanbul Teknik Üniversitesi - Lisans (2012 - 2016)

YETKİNLİKLER
Strateji, Liderlik, Bütçe, Agile

========================================
SAĞ SÜTUN (ANA İÇERİK)
========================================
ÖZGEÇMİŞ ÖZETİ
Operasyonel Mükemmellik Direktörü olarak 8 yıllık başarılı sektör tecrübesi.

İŞ DENEYİMİ
Arçelik Sanayi A.Ş. - Operasyonel Mükemmellik Direktörü (2018 - 2024)
Kurumsal projelerin uçtan uca yürütülmesi.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Derya Yaman');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[SPATIAL_58/100] Multi-Column Spatial Reconstruction: Onur Ünal (Kurumsal Bankacılık Müdürü)', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Onur Ünal               | İş Bankası A.Ş.                               |
| Şehir: Ankara / Çankaya         | Görev: Kurumsal Bankacılık Müdürü                        |
| E-posta: contact@domain.com     | Dönem: 2019 - 2024                         |
| Telefon: 0533 222 33 44         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: ODTÜ - Lisans (2015)    | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Onur Ünal');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('İş', 'i'));
  });

  it('[SPATIAL_59/100] Multi-Column Spatial Reconstruction: Selin Karaca (E-Ticaret Operasyon Direktörü)', () => {
    const cv = `
********************************************************************************
Selin Karaca — E-Ticaret Operasyon Direktörü
İzmir / Bornova | 0535 444 55 66 | email@example.com
********************************************************************************

[SOL KOLON: EĞİTİM & BECERİLER]
Ege Üniversitesi - Mühendislik Fakültesi (2010 - 2014)
Yetkinlikler: Python, SQL, Analitik Düşünme, Liderlik

[SAĞ KOLON: İŞ DENEYİMİ]
Hepsiburada A.Ş. - E-Ticaret Operasyon Direktörü (2017 - 2024)
Departman idaresi ve operasyonel verimlilik artışı.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Karaca');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[SPATIAL_60/100] Multi-Column Spatial Reconstruction: Gökhan Şimşek (Tedarik Zinciri ve Planlama Müdürü)', () => {
    const cv = `
[KOLON 1: KİMLİK]
Gökhan Şimşek
Bursa / Nilüfer

[KOLON 2: DENEYİM]
Borusan Lojistik A.Ş. - Tedarik Zinciri ve Planlama Müdürü (2018 - 2024)
Tüm stratejik hedeflerin gerçekleştirilmesi.

[KOLON 3: EĞİTİM & YETKİNLİK]
Uludağ Üniversitesi (2011 - 2015)
Yetkinlikler: Bütçe, Ekip Yönetimi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Gökhan Şimşek');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Borusan', 'i'));
  });

  it('[SPATIAL_61/100] Multi-Column Spatial Reconstruction: Zeynep Özcan (Kıdemli Frontend Mimarı)', () => {
    const cv = `
========================================
SOL SÜTUN (SIDEBAR)
========================================
Zeynep Özcan
İstanbul / Beşiktaş
0532 999 00 11 | cand@example.com

EĞİTİM
İstanbul Teknik Üniversitesi - Lisans (2012 - 2016)

YETKİNLİKLER
Strateji, Liderlik, Bütçe, Agile

========================================
SAĞ SÜTUN (ANA İÇERİK)
========================================
ÖZGEÇMİŞ ÖZETİ
Kıdemli Frontend Mimarı olarak 8 yıllık başarılı sektör tecrübesi.

İŞ DENEYİMİ
Trendyol Teknoloji A.Ş. - Kıdemli Frontend Mimarı (2018 - 2024)
Kurumsal projelerin uçtan uca yürütülmesi.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Özcan');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[SPATIAL_62/100] Multi-Column Spatial Reconstruction: Can Gündoğan (Operasyonel Mükemmellik Direktörü)', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Can Gündoğan               | Arçelik Sanayi A.Ş.                               |
| Şehir: Ankara / Çankaya         | Görev: Operasyonel Mükemmellik Direktörü                        |
| E-posta: contact@domain.com     | Dönem: 2019 - 2024                         |
| Telefon: 0533 222 33 44         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: ODTÜ - Lisans (2015)    | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Can Gündoğan');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[SPATIAL_63/100] Multi-Column Spatial Reconstruction: Elif Korkmaz (Kurumsal Bankacılık Müdürü)', () => {
    const cv = `
********************************************************************************
Elif Korkmaz — Kurumsal Bankacılık Müdürü
İzmir / Bornova | 0535 444 55 66 | email@example.com
********************************************************************************

[SOL KOLON: EĞİTİM & BECERİLER]
Ege Üniversitesi - Mühendislik Fakültesi (2010 - 2014)
Yetkinlikler: Python, SQL, Analitik Düşünme, Liderlik

[SAĞ KOLON: İŞ DENEYİMİ]
İş Bankası A.Ş. - Kurumsal Bankacılık Müdürü (2017 - 2024)
Departman idaresi ve operasyonel verimlilik artışı.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Elif Korkmaz');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('İş', 'i'));
  });

  it('[SPATIAL_64/100] Multi-Column Spatial Reconstruction: Burak Avcı (E-Ticaret Operasyon Direktörü)', () => {
    const cv = `
[KOLON 1: KİMLİK]
Burak Avcı
Bursa / Nilüfer

[KOLON 2: DENEYİM]
Hepsiburada A.Ş. - E-Ticaret Operasyon Direktörü (2018 - 2024)
Tüm stratejik hedeflerin gerçekleştirilmesi.

[KOLON 3: EĞİTİM & YETKİNLİK]
Uludağ Üniversitesi (2011 - 2015)
Yetkinlikler: Bütçe, Ekip Yönetimi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Burak Avcı');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[SPATIAL_65/100] Multi-Column Spatial Reconstruction: Merve Çakır (Tedarik Zinciri ve Planlama Müdürü)', () => {
    const cv = `
========================================
SOL SÜTUN (SIDEBAR)
========================================
Merve Çakır
İstanbul / Beşiktaş
0532 999 00 11 | cand@example.com

EĞİTİM
İstanbul Teknik Üniversitesi - Lisans (2012 - 2016)

YETKİNLİKLER
Strateji, Liderlik, Bütçe, Agile

========================================
SAĞ SÜTUN (ANA İÇERİK)
========================================
ÖZGEÇMİŞ ÖZETİ
Tedarik Zinciri ve Planlama Müdürü olarak 8 yıllık başarılı sektör tecrübesi.

İŞ DENEYİMİ
Borusan Lojistik A.Ş. - Tedarik Zinciri ve Planlama Müdürü (2018 - 2024)
Kurumsal projelerin uçtan uca yürütülmesi.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Merve Çakır');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Borusan', 'i'));
  });

  it('[SPATIAL_66/100] Multi-Column Spatial Reconstruction: Oğuzhan Duran (Kıdemli Frontend Mimarı)', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Oğuzhan Duran               | Trendyol Teknoloji A.Ş.                               |
| Şehir: Ankara / Çankaya         | Görev: Kıdemli Frontend Mimarı                        |
| E-posta: contact@domain.com     | Dönem: 2019 - 2024                         |
| Telefon: 0533 222 33 44         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: ODTÜ - Lisans (2015)    | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Oğuzhan Duran');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[SPATIAL_67/100] Multi-Column Spatial Reconstruction: Büşra Erdoğan (Operasyonel Mükemmellik Direktörü)', () => {
    const cv = `
********************************************************************************
Büşra Erdoğan — Operasyonel Mükemmellik Direktörü
İzmir / Bornova | 0535 444 55 66 | email@example.com
********************************************************************************

[SOL KOLON: EĞİTİM & BECERİLER]
Ege Üniversitesi - Mühendislik Fakültesi (2010 - 2014)
Yetkinlikler: Python, SQL, Analitik Düşünme, Liderlik

[SAĞ KOLON: İŞ DENEYİMİ]
Arçelik Sanayi A.Ş. - Operasyonel Mükemmellik Direktörü (2017 - 2024)
Departman idaresi ve operasyonel verimlilik artışı.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Büşra Erdoğan');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[SPATIAL_68/100] Multi-Column Spatial Reconstruction: Serkan Bozkurt (Kurumsal Bankacılık Müdürü)', () => {
    const cv = `
[KOLON 1: KİMLİK]
Serkan Bozkurt
Bursa / Nilüfer

[KOLON 2: DENEYİM]
İş Bankası A.Ş. - Kurumsal Bankacılık Müdürü (2018 - 2024)
Tüm stratejik hedeflerin gerçekleştirilmesi.

[KOLON 3: EĞİTİM & YETKİNLİK]
Uludağ Üniversitesi (2011 - 2015)
Yetkinlikler: Bütçe, Ekip Yönetimi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Serkan Bozkurt');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('İş', 'i'));
  });

  it('[SPATIAL_69/100] Multi-Column Spatial Reconstruction: Gamze Yavuz (E-Ticaret Operasyon Direktörü)', () => {
    const cv = `
========================================
SOL SÜTUN (SIDEBAR)
========================================
Gamze Yavuz
İstanbul / Beşiktaş
0532 999 00 11 | cand@example.com

EĞİTİM
İstanbul Teknik Üniversitesi - Lisans (2012 - 2016)

YETKİNLİKLER
Strateji, Liderlik, Bütçe, Agile

========================================
SAĞ SÜTUN (ANA İÇERİK)
========================================
ÖZGEÇMİŞ ÖZETİ
E-Ticaret Operasyon Direktörü olarak 8 yıllık başarılı sektör tecrübesi.

İŞ DENEYİMİ
Hepsiburada A.Ş. - E-Ticaret Operasyon Direktörü (2018 - 2024)
Kurumsal projelerin uçtan uca yürütülmesi.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Gamze Yavuz');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[SPATIAL_70/100] Multi-Column Spatial Reconstruction: Uğur Turan (Tedarik Zinciri ve Planlama Müdürü)', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Uğur Turan               | Borusan Lojistik A.Ş.                               |
| Şehir: Ankara / Çankaya         | Görev: Tedarik Zinciri ve Planlama Müdürü                        |
| E-posta: contact@domain.com     | Dönem: 2019 - 2024                         |
| Telefon: 0533 222 33 44         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: ODTÜ - Lisans (2015)    | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Uğur Turan');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Borusan', 'i'));
  });

  it('[SPATIAL_71/100] Multi-Column Spatial Reconstruction: Seda Güneş (Kıdemli Frontend Mimarı)', () => {
    const cv = `
********************************************************************************
Seda Güneş — Kıdemli Frontend Mimarı
İzmir / Bornova | 0535 444 55 66 | email@example.com
********************************************************************************

[SOL KOLON: EĞİTİM & BECERİLER]
Ege Üniversitesi - Mühendislik Fakültesi (2010 - 2014)
Yetkinlikler: Python, SQL, Analitik Düşünme, Liderlik

[SAĞ KOLON: İŞ DENEYİMİ]
Trendyol Teknoloji A.Ş. - Kıdemli Frontend Mimarı (2017 - 2024)
Departman idaresi ve operasyonel verimlilik artışı.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Seda Güneş');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[SPATIAL_72/100] Multi-Column Spatial Reconstruction: Volkan Yurttaş (Operasyonel Mükemmellik Direktörü)', () => {
    const cv = `
[KOLON 1: KİMLİK]
Volkan Yurttaş
Bursa / Nilüfer

[KOLON 2: DENEYİM]
Arçelik Sanayi A.Ş. - Operasyonel Mükemmellik Direktörü (2018 - 2024)
Tüm stratejik hedeflerin gerçekleştirilmesi.

[KOLON 3: EĞİTİM & YETKİNLİK]
Uludağ Üniversitesi (2011 - 2015)
Yetkinlikler: Bütçe, Ekip Yönetimi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Volkan Yurttaş');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[SPATIAL_73/100] Multi-Column Spatial Reconstruction: Ebru Aksoy (Kurumsal Bankacılık Müdürü)', () => {
    const cv = `
========================================
SOL SÜTUN (SIDEBAR)
========================================
Ebru Aksoy
İstanbul / Beşiktaş
0532 999 00 11 | cand@example.com

EĞİTİM
İstanbul Teknik Üniversitesi - Lisans (2012 - 2016)

YETKİNLİKLER
Strateji, Liderlik, Bütçe, Agile

========================================
SAĞ SÜTUN (ANA İÇERİK)
========================================
ÖZGEÇMİŞ ÖZETİ
Kurumsal Bankacılık Müdürü olarak 8 yıllık başarılı sektör tecrübesi.

İŞ DENEYİMİ
İş Bankası A.Ş. - Kurumsal Bankacılık Müdürü (2018 - 2024)
Kurumsal projelerin uçtan uca yürütülmesi.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ebru Aksoy');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('İş', 'i'));
  });

  it('[SPATIAL_74/100] Multi-Column Spatial Reconstruction: Tolga Ergin (E-Ticaret Operasyon Direktörü)', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Tolga Ergin               | Hepsiburada A.Ş.                               |
| Şehir: Ankara / Çankaya         | Görev: E-Ticaret Operasyon Direktörü                        |
| E-posta: contact@domain.com     | Dönem: 2019 - 2024                         |
| Telefon: 0533 222 33 44         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: ODTÜ - Lisans (2015)    | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Tolga Ergin');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[SPATIAL_75/100] Multi-Column Spatial Reconstruction: Tuğba Güler (Tedarik Zinciri ve Planlama Müdürü)', () => {
    const cv = `
********************************************************************************
Tuğba Güler — Tedarik Zinciri ve Planlama Müdürü
İzmir / Bornova | 0535 444 55 66 | email@example.com
********************************************************************************

[SOL KOLON: EĞİTİM & BECERİLER]
Ege Üniversitesi - Mühendislik Fakültesi (2010 - 2014)
Yetkinlikler: Python, SQL, Analitik Düşünme, Liderlik

[SAĞ KOLON: İŞ DENEYİMİ]
Borusan Lojistik A.Ş. - Tedarik Zinciri ve Planlama Müdürü (2017 - 2024)
Departman idaresi ve operasyonel verimlilik artışı.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Tuğba Güler');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Borusan', 'i'));
  });

  it('[SPATIAL_76/100] Multi-Column Spatial Reconstruction: Alper Yaman (Kıdemli Frontend Mimarı)', () => {
    const cv = `
[KOLON 1: KİMLİK]
Alper Yaman
Bursa / Nilüfer

[KOLON 2: DENEYİM]
Trendyol Teknoloji A.Ş. - Kıdemli Frontend Mimarı (2018 - 2024)
Tüm stratejik hedeflerin gerçekleştirilmesi.

[KOLON 3: EĞİTİM & YETKİNLİK]
Uludağ Üniversitesi (2011 - 2015)
Yetkinlikler: Bütçe, Ekip Yönetimi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Alper Yaman');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[SPATIAL_77/100] Multi-Column Spatial Reconstruction: Derya Ünal (Operasyonel Mükemmellik Direktörü)', () => {
    const cv = `
========================================
SOL SÜTUN (SIDEBAR)
========================================
Derya Ünal
İstanbul / Beşiktaş
0532 999 00 11 | cand@example.com

EĞİTİM
İstanbul Teknik Üniversitesi - Lisans (2012 - 2016)

YETKİNLİKLER
Strateji, Liderlik, Bütçe, Agile

========================================
SAĞ SÜTUN (ANA İÇERİK)
========================================
ÖZGEÇMİŞ ÖZETİ
Operasyonel Mükemmellik Direktörü olarak 8 yıllık başarılı sektör tecrübesi.

İŞ DENEYİMİ
Arçelik Sanayi A.Ş. - Operasyonel Mükemmellik Direktörü (2018 - 2024)
Kurumsal projelerin uçtan uca yürütülmesi.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Derya Ünal');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[SPATIAL_78/100] Multi-Column Spatial Reconstruction: Onur Karaca (Kurumsal Bankacılık Müdürü)', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Onur Karaca               | İş Bankası A.Ş.                               |
| Şehir: Ankara / Çankaya         | Görev: Kurumsal Bankacılık Müdürü                        |
| E-posta: contact@domain.com     | Dönem: 2019 - 2024                         |
| Telefon: 0533 222 33 44         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: ODTÜ - Lisans (2015)    | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Onur Karaca');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('İş', 'i'));
  });

  it('[SPATIAL_79/100] Multi-Column Spatial Reconstruction: Selin Şimşek (E-Ticaret Operasyon Direktörü)', () => {
    const cv = `
********************************************************************************
Selin Şimşek — E-Ticaret Operasyon Direktörü
İzmir / Bornova | 0535 444 55 66 | email@example.com
********************************************************************************

[SOL KOLON: EĞİTİM & BECERİLER]
Ege Üniversitesi - Mühendislik Fakültesi (2010 - 2014)
Yetkinlikler: Python, SQL, Analitik Düşünme, Liderlik

[SAĞ KOLON: İŞ DENEYİMİ]
Hepsiburada A.Ş. - E-Ticaret Operasyon Direktörü (2017 - 2024)
Departman idaresi ve operasyonel verimlilik artışı.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Şimşek');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[SPATIAL_80/100] Multi-Column Spatial Reconstruction: Gökhan Soylu (Tedarik Zinciri ve Planlama Müdürü)', () => {
    const cv = `
[KOLON 1: KİMLİK]
Gökhan Soylu
Bursa / Nilüfer

[KOLON 2: DENEYİM]
Borusan Lojistik A.Ş. - Tedarik Zinciri ve Planlama Müdürü (2018 - 2024)
Tüm stratejik hedeflerin gerçekleştirilmesi.

[KOLON 3: EĞİTİM & YETKİNLİK]
Uludağ Üniversitesi (2011 - 2015)
Yetkinlikler: Bütçe, Ekip Yönetimi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Gökhan Soylu');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Borusan', 'i'));
  });

  it('[SPATIAL_81/100] Multi-Column Spatial Reconstruction: Zeynep Gündoğan (Kıdemli Frontend Mimarı)', () => {
    const cv = `
========================================
SOL SÜTUN (SIDEBAR)
========================================
Zeynep Gündoğan
İstanbul / Beşiktaş
0532 999 00 11 | cand@example.com

EĞİTİM
İstanbul Teknik Üniversitesi - Lisans (2012 - 2016)

YETKİNLİKLER
Strateji, Liderlik, Bütçe, Agile

========================================
SAĞ SÜTUN (ANA İÇERİK)
========================================
ÖZGEÇMİŞ ÖZETİ
Kıdemli Frontend Mimarı olarak 8 yıllık başarılı sektör tecrübesi.

İŞ DENEYİMİ
Trendyol Teknoloji A.Ş. - Kıdemli Frontend Mimarı (2018 - 2024)
Kurumsal projelerin uçtan uca yürütülmesi.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Gündoğan');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[SPATIAL_82/100] Multi-Column Spatial Reconstruction: Can Korkmaz (Operasyonel Mükemmellik Direktörü)', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Can Korkmaz               | Arçelik Sanayi A.Ş.                               |
| Şehir: Ankara / Çankaya         | Görev: Operasyonel Mükemmellik Direktörü                        |
| E-posta: contact@domain.com     | Dönem: 2019 - 2024                         |
| Telefon: 0533 222 33 44         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: ODTÜ - Lisans (2015)    | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Can Korkmaz');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[SPATIAL_83/100] Multi-Column Spatial Reconstruction: Elif Avcı (Kurumsal Bankacılık Müdürü)', () => {
    const cv = `
********************************************************************************
Elif Avcı — Kurumsal Bankacılık Müdürü
İzmir / Bornova | 0535 444 55 66 | email@example.com
********************************************************************************

[SOL KOLON: EĞİTİM & BECERİLER]
Ege Üniversitesi - Mühendislik Fakültesi (2010 - 2014)
Yetkinlikler: Python, SQL, Analitik Düşünme, Liderlik

[SAĞ KOLON: İŞ DENEYİMİ]
İş Bankası A.Ş. - Kurumsal Bankacılık Müdürü (2017 - 2024)
Departman idaresi ve operasyonel verimlilik artışı.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Elif Avcı');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('İş', 'i'));
  });

  it('[SPATIAL_84/100] Multi-Column Spatial Reconstruction: Burak Çakır (E-Ticaret Operasyon Direktörü)', () => {
    const cv = `
[KOLON 1: KİMLİK]
Burak Çakır
Bursa / Nilüfer

[KOLON 2: DENEYİM]
Hepsiburada A.Ş. - E-Ticaret Operasyon Direktörü (2018 - 2024)
Tüm stratejik hedeflerin gerçekleştirilmesi.

[KOLON 3: EĞİTİM & YETKİNLİK]
Uludağ Üniversitesi (2011 - 2015)
Yetkinlikler: Bütçe, Ekip Yönetimi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Burak Çakır');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[SPATIAL_85/100] Multi-Column Spatial Reconstruction: Merve Duran (Tedarik Zinciri ve Planlama Müdürü)', () => {
    const cv = `
========================================
SOL SÜTUN (SIDEBAR)
========================================
Merve Duran
İstanbul / Beşiktaş
0532 999 00 11 | cand@example.com

EĞİTİM
İstanbul Teknik Üniversitesi - Lisans (2012 - 2016)

YETKİNLİKLER
Strateji, Liderlik, Bütçe, Agile

========================================
SAĞ SÜTUN (ANA İÇERİK)
========================================
ÖZGEÇMİŞ ÖZETİ
Tedarik Zinciri ve Planlama Müdürü olarak 8 yıllık başarılı sektör tecrübesi.

İŞ DENEYİMİ
Borusan Lojistik A.Ş. - Tedarik Zinciri ve Planlama Müdürü (2018 - 2024)
Kurumsal projelerin uçtan uca yürütülmesi.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Merve Duran');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Borusan', 'i'));
  });

  it('[SPATIAL_86/100] Multi-Column Spatial Reconstruction: Oğuzhan Erdoğan (Kıdemli Frontend Mimarı)', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Oğuzhan Erdoğan               | Trendyol Teknoloji A.Ş.                               |
| Şehir: Ankara / Çankaya         | Görev: Kıdemli Frontend Mimarı                        |
| E-posta: contact@domain.com     | Dönem: 2019 - 2024                         |
| Telefon: 0533 222 33 44         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: ODTÜ - Lisans (2015)    | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Oğuzhan Erdoğan');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[SPATIAL_87/100] Multi-Column Spatial Reconstruction: Büşra Bozkurt (Operasyonel Mükemmellik Direktörü)', () => {
    const cv = `
********************************************************************************
Büşra Bozkurt — Operasyonel Mükemmellik Direktörü
İzmir / Bornova | 0535 444 55 66 | email@example.com
********************************************************************************

[SOL KOLON: EĞİTİM & BECERİLER]
Ege Üniversitesi - Mühendislik Fakültesi (2010 - 2014)
Yetkinlikler: Python, SQL, Analitik Düşünme, Liderlik

[SAĞ KOLON: İŞ DENEYİMİ]
Arçelik Sanayi A.Ş. - Operasyonel Mükemmellik Direktörü (2017 - 2024)
Departman idaresi ve operasyonel verimlilik artışı.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Büşra Bozkurt');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[SPATIAL_88/100] Multi-Column Spatial Reconstruction: Serkan Yavuz (Kurumsal Bankacılık Müdürü)', () => {
    const cv = `
[KOLON 1: KİMLİK]
Serkan Yavuz
Bursa / Nilüfer

[KOLON 2: DENEYİM]
İş Bankası A.Ş. - Kurumsal Bankacılık Müdürü (2018 - 2024)
Tüm stratejik hedeflerin gerçekleştirilmesi.

[KOLON 3: EĞİTİM & YETKİNLİK]
Uludağ Üniversitesi (2011 - 2015)
Yetkinlikler: Bütçe, Ekip Yönetimi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Serkan Yavuz');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('İş', 'i'));
  });

  it('[SPATIAL_89/100] Multi-Column Spatial Reconstruction: Gamze Turan (E-Ticaret Operasyon Direktörü)', () => {
    const cv = `
========================================
SOL SÜTUN (SIDEBAR)
========================================
Gamze Turan
İstanbul / Beşiktaş
0532 999 00 11 | cand@example.com

EĞİTİM
İstanbul Teknik Üniversitesi - Lisans (2012 - 2016)

YETKİNLİKLER
Strateji, Liderlik, Bütçe, Agile

========================================
SAĞ SÜTUN (ANA İÇERİK)
========================================
ÖZGEÇMİŞ ÖZETİ
E-Ticaret Operasyon Direktörü olarak 8 yıllık başarılı sektör tecrübesi.

İŞ DENEYİMİ
Hepsiburada A.Ş. - E-Ticaret Operasyon Direktörü (2018 - 2024)
Kurumsal projelerin uçtan uca yürütülmesi.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Gamze Turan');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[SPATIAL_90/100] Multi-Column Spatial Reconstruction: Uğur Güneş (Tedarik Zinciri ve Planlama Müdürü)', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Uğur Güneş               | Borusan Lojistik A.Ş.                               |
| Şehir: Ankara / Çankaya         | Görev: Tedarik Zinciri ve Planlama Müdürü                        |
| E-posta: contact@domain.com     | Dönem: 2019 - 2024                         |
| Telefon: 0533 222 33 44         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: ODTÜ - Lisans (2015)    | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Uğur Güneş');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Borusan', 'i'));
  });

  it('[SPATIAL_91/100] Multi-Column Spatial Reconstruction: Seda Yurttaş (Kıdemli Frontend Mimarı)', () => {
    const cv = `
********************************************************************************
Seda Yurttaş — Kıdemli Frontend Mimarı
İzmir / Bornova | 0535 444 55 66 | email@example.com
********************************************************************************

[SOL KOLON: EĞİTİM & BECERİLER]
Ege Üniversitesi - Mühendislik Fakültesi (2010 - 2014)
Yetkinlikler: Python, SQL, Analitik Düşünme, Liderlik

[SAĞ KOLON: İŞ DENEYİMİ]
Trendyol Teknoloji A.Ş. - Kıdemli Frontend Mimarı (2017 - 2024)
Departman idaresi ve operasyonel verimlilik artışı.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Seda Yurttaş');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[SPATIAL_92/100] Multi-Column Spatial Reconstruction: Volkan Aksoy (Operasyonel Mükemmellik Direktörü)', () => {
    const cv = `
[KOLON 1: KİMLİK]
Volkan Aksoy
Bursa / Nilüfer

[KOLON 2: DENEYİM]
Arçelik Sanayi A.Ş. - Operasyonel Mükemmellik Direktörü (2018 - 2024)
Tüm stratejik hedeflerin gerçekleştirilmesi.

[KOLON 3: EĞİTİM & YETKİNLİK]
Uludağ Üniversitesi (2011 - 2015)
Yetkinlikler: Bütçe, Ekip Yönetimi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Volkan Aksoy');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[SPATIAL_93/100] Multi-Column Spatial Reconstruction: Ebru Ergin (Kurumsal Bankacılık Müdürü)', () => {
    const cv = `
========================================
SOL SÜTUN (SIDEBAR)
========================================
Ebru Ergin
İstanbul / Beşiktaş
0532 999 00 11 | cand@example.com

EĞİTİM
İstanbul Teknik Üniversitesi - Lisans (2012 - 2016)

YETKİNLİKLER
Strateji, Liderlik, Bütçe, Agile

========================================
SAĞ SÜTUN (ANA İÇERİK)
========================================
ÖZGEÇMİŞ ÖZETİ
Kurumsal Bankacılık Müdürü olarak 8 yıllık başarılı sektör tecrübesi.

İŞ DENEYİMİ
İş Bankası A.Ş. - Kurumsal Bankacılık Müdürü (2018 - 2024)
Kurumsal projelerin uçtan uca yürütülmesi.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ebru Ergin');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('İş', 'i'));
  });

  it('[SPATIAL_94/100] Multi-Column Spatial Reconstruction: Tolga Güler (E-Ticaret Operasyon Direktörü)', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Tolga Güler               | Hepsiburada A.Ş.                               |
| Şehir: Ankara / Çankaya         | Görev: E-Ticaret Operasyon Direktörü                        |
| E-posta: contact@domain.com     | Dönem: 2019 - 2024                         |
| Telefon: 0533 222 33 44         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: ODTÜ - Lisans (2015)    | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Tolga Güler');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[SPATIAL_95/100] Multi-Column Spatial Reconstruction: Tuğba Yaman (Tedarik Zinciri ve Planlama Müdürü)', () => {
    const cv = `
********************************************************************************
Tuğba Yaman — Tedarik Zinciri ve Planlama Müdürü
İzmir / Bornova | 0535 444 55 66 | email@example.com
********************************************************************************

[SOL KOLON: EĞİTİM & BECERİLER]
Ege Üniversitesi - Mühendislik Fakültesi (2010 - 2014)
Yetkinlikler: Python, SQL, Analitik Düşünme, Liderlik

[SAĞ KOLON: İŞ DENEYİMİ]
Borusan Lojistik A.Ş. - Tedarik Zinciri ve Planlama Müdürü (2017 - 2024)
Departman idaresi ve operasyonel verimlilik artışı.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Tuğba Yaman');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Borusan', 'i'));
  });

  it('[SPATIAL_96/100] Multi-Column Spatial Reconstruction: Alper Ünal (Kıdemli Frontend Mimarı)', () => {
    const cv = `
[KOLON 1: KİMLİK]
Alper Ünal
Bursa / Nilüfer

[KOLON 2: DENEYİM]
Trendyol Teknoloji A.Ş. - Kıdemli Frontend Mimarı (2018 - 2024)
Tüm stratejik hedeflerin gerçekleştirilmesi.

[KOLON 3: EĞİTİM & YETKİNLİK]
Uludağ Üniversitesi (2011 - 2015)
Yetkinlikler: Bütçe, Ekip Yönetimi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Alper Ünal');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[SPATIAL_97/100] Multi-Column Spatial Reconstruction: Derya Karaca (Operasyonel Mükemmellik Direktörü)', () => {
    const cv = `
========================================
SOL SÜTUN (SIDEBAR)
========================================
Derya Karaca
İstanbul / Beşiktaş
0532 999 00 11 | cand@example.com

EĞİTİM
İstanbul Teknik Üniversitesi - Lisans (2012 - 2016)

YETKİNLİKLER
Strateji, Liderlik, Bütçe, Agile

========================================
SAĞ SÜTUN (ANA İÇERİK)
========================================
ÖZGEÇMİŞ ÖZETİ
Operasyonel Mükemmellik Direktörü olarak 8 yıllık başarılı sektör tecrübesi.

İŞ DENEYİMİ
Arçelik Sanayi A.Ş. - Operasyonel Mükemmellik Direktörü (2018 - 2024)
Kurumsal projelerin uçtan uca yürütülmesi.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Derya Karaca');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[SPATIAL_98/100] Multi-Column Spatial Reconstruction: Onur Şimşek (Kurumsal Bankacılık Müdürü)', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Onur Şimşek               | İş Bankası A.Ş.                               |
| Şehir: Ankara / Çankaya         | Görev: Kurumsal Bankacılık Müdürü                        |
| E-posta: contact@domain.com     | Dönem: 2019 - 2024                         |
| Telefon: 0533 222 33 44         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: ODTÜ - Lisans (2015)    | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Onur Şimşek');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('İş', 'i'));
  });

  it('[SPATIAL_99/100] Multi-Column Spatial Reconstruction: Selin Soylu (E-Ticaret Operasyon Direktörü)', () => {
    const cv = `
********************************************************************************
Selin Soylu — E-Ticaret Operasyon Direktörü
İzmir / Bornova | 0535 444 55 66 | email@example.com
********************************************************************************

[SOL KOLON: EĞİTİM & BECERİLER]
Ege Üniversitesi - Mühendislik Fakültesi (2010 - 2014)
Yetkinlikler: Python, SQL, Analitik Düşünme, Liderlik

[SAĞ KOLON: İŞ DENEYİMİ]
Hepsiburada A.Ş. - E-Ticaret Operasyon Direktörü (2017 - 2024)
Departman idaresi ve operasyonel verimlilik artışı.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Soylu');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[SPATIAL_100/100] Multi-Column Spatial Reconstruction: Gökhan Özcan (Tedarik Zinciri ve Planlama Müdürü)', () => {
    const cv = `
[KOLON 1: KİMLİK]
Gökhan Özcan
Bursa / Nilüfer

[KOLON 2: DENEYİM]
Borusan Lojistik A.Ş. - Tedarik Zinciri ve Planlama Müdürü (2018 - 2024)
Tüm stratejik hedeflerin gerçekleştirilmesi.

[KOLON 3: EĞİTİM & YETKİNLİK]
Uludağ Üniversitesi (2011 - 2015)
Yetkinlikler: Bütçe, Ekip Yönetimi, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Gökhan Özcan');
    expect(canonical.fullName).not.toBe('Sol Sütun');
    expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
    expect(canonical.fullName).not.toBe('Mesleki Deneyim');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Borusan', 'i'));
  });
});
