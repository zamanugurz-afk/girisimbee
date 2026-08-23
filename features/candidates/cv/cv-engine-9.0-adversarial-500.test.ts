import { describe, expect, it } from 'vitest';
import { extractDeterministicCv } from './cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from './cv-taxonomy-mapper';
import { buildCvEvidenceGraph, enforceEvidenceGraphFirewall } from './cv-evidence-graph';

describe('CV Extraction Engine 9.0 — 500 Universal Adversarial Production Scenarios Suite', () => {
  it('[ADVERSARIAL_1/500] Extract Uğur Zaman (Çağrı Merkezi Operasyon Müdürü) with format type 0', () => {
    const cv = `
Uğur Zaman
İstanbul / Kadıköy | 0532 999 00 11 | candidate@domain.com
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone Müşteri Hizmetleri A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Uğur Zaman');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Vodafone', 'i'));
  });

  it('[ADVERSARIAL_2/500] Extract Burak Özdemir (Kıdemli Backend Geliştirici) with format type 1', () => {
    const cv = `
********************************************************************************
Burak Özdemir — Kıdemli Backend Geliştirici
Ankara / Çankaya | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Trendyol Teknoloji A.Ş.
Kıdemli Backend Geliştirici (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
ODTÜ - Bilgisayar Mühendisliği (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Burak Özdemir');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[ADVERSARIAL_3/500] Extract Kemal Sunal (Kurumsal Finans Direktörü) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Kemal Sunal
İstanbul / Beşiktaş
Kurumsal Finans Direktörü

İŞ TECRÜBELERİ
Garanti BBVA A.Ş. (2017 - 2024)
Kurumsal Finans Direktörü
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Boğaziçi Üniversitesi - İşletme (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Kemal Sunal');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Garanti', 'i'));
  });

  it('[ADVERSARIAL_4/500] Extract Fatma Girik (Tedarik Zinciri Müdürü) with format type 3', () => {
    const cv = `
Fatma Girik
İzmir / Bornova | contact@example.com
Tedarik Zinciri Müdürü

WORK EXPERIENCE
Ekol Lojistik A.Ş. - Tedarik Zinciri Müdürü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Dokuz Eylül Üniversitesi - Endüstri Mühendisliği (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Fatma Girik');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İzmir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Ekol', 'i'));
  });

  it('[ADVERSARIAL_5/500] Extract Haluk Bilginer (İnsan Kaynakları Direktörü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Haluk Bilginer               | Koç Holding A.Ş.                               |
| Şehir: İstanbul / Üsküdar | Görev: İnsan Kaynakları Direktörü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: Marmara Üniversitesi - İktisadi ve İdari Bilimler (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Haluk Bilginer');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Koç', 'i'));
  });

  it('[ADVERSARIAL_6/500] Extract Zuhal Olcay (Dijital Pazarlama Müdürü) with format type 0', () => {
    const cv = `
Zuhal Olcay
İstanbul / Şişli | 0532 999 00 11 | candidate@domain.com
Dijital Pazarlama Müdürü

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Dijital Pazarlama Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
Galatasaray Üniversitesi - İletişim Fakültesi (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Zuhal Olcay');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[ADVERSARIAL_7/500] Extract Tarık Akan (Saha Satış Yöneticisi) with format type 1', () => {
    const cv = `
********************************************************************************
Tarık Akan — Saha Satış Yöneticisi
Eskişehir / Tepebaşı | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Migros Ticaret A.Ş.
Saha Satış Yöneticisi (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
Anadolu Üniversitesi - İktisat (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Tarık Akan');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Eskişehir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Migros', 'i'));
  });

  it('[ADVERSARIAL_8/500] Extract Münir Özkul (Operasyonel Mükemmellik Lideri) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Münir Özkul
Kocaeli / Gebze
Operasyonel Mükemmellik Lideri

İŞ TECRÜBELERİ
Arçelik Sanayi A.Ş. (2017 - 2024)
Operasyonel Mükemmellik Lideri
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Yıldız Teknik Üniversitesi - Makine Mühendisliği (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Münir Özkul');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Kocaeli');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[ADVERSARIAL_9/500] Extract Şener Şen (Siber Güvenlik Direktörü) with format type 3', () => {
    const cv = `
Şener Şen
Ankara / Yenimahalle | contact@example.com
Siber Güvenlik Direktörü

WORK EXPERIENCE
STM Savunma Teknolojileri A.Ş. - Siber Güvenlik Direktörü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Bilkent Üniversitesi - Elektrik Elektronik (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Şener Şen');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('STM', 'i'));
  });

  it('[ADVERSARIAL_10/500] Extract Adile Naşit (Kurumsal İletişim Müdürü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Adile Naşit               | Doğan Holding A.Ş.                               |
| Şehir: İstanbul / Beyoğlu | Görev: Kurumsal İletişim Müdürü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: İstanbul Üniversitesi - İletişim (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Adile Naşit');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Doğan', 'i'));
  });

  it('[ADVERSARIAL_11/500] Extract Ceren Şentürk (Çağrı Merkezi Operasyon Müdürü) with format type 0', () => {
    const cv = `
Ceren Şentürk
İstanbul / Kadıköy | 0532 999 00 11 | candidate@domain.com
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone Müşteri Hizmetleri A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Ceren Şentürk');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Vodafone', 'i'));
  });

  it('[ADVERSARIAL_12/500] Extract Mert Yalçın (Kıdemli Backend Geliştirici) with format type 1', () => {
    const cv = `
********************************************************************************
Mert Yalçın — Kıdemli Backend Geliştirici
Ankara / Çankaya | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Trendyol Teknoloji A.Ş.
Kıdemli Backend Geliştirici (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
ODTÜ - Bilgisayar Mühendisliği (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mert Yalçın');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[ADVERSARIAL_13/500] Extract Emre Kaya (Kurumsal Finans Direktörü) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Emre Kaya
İstanbul / Beşiktaş
Kurumsal Finans Direktörü

İŞ TECRÜBELERİ
Garanti BBVA A.Ş. (2017 - 2024)
Kurumsal Finans Direktörü
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Boğaziçi Üniversitesi - İşletme (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Emre Kaya');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Garanti', 'i'));
  });

  it('[ADVERSARIAL_14/500] Extract Ayşe Yılmaz (Tedarik Zinciri Müdürü) with format type 3', () => {
    const cv = `
Ayşe Yılmaz
İzmir / Bornova | contact@example.com
Tedarik Zinciri Müdürü

WORK EXPERIENCE
Ekol Lojistik A.Ş. - Tedarik Zinciri Müdürü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Dokuz Eylül Üniversitesi - Endüstri Mühendisliği (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Ayşe Yılmaz');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İzmir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Ekol', 'i'));
  });

  it('[ADVERSARIAL_15/500] Extract Mehmet Demir (İnsan Kaynakları Direktörü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Mehmet Demir               | Koç Holding A.Ş.                               |
| Şehir: İstanbul / Üsküdar | Görev: İnsan Kaynakları Direktörü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: Marmara Üniversitesi - İktisadi ve İdari Bilimler (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mehmet Demir');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Koç', 'i'));
  });

  it('[ADVERSARIAL_16/500] Extract Mustafa Çelik (Dijital Pazarlama Müdürü) with format type 0', () => {
    const cv = `
Mustafa Çelik
İstanbul / Şişli | 0532 999 00 11 | candidate@domain.com
Dijital Pazarlama Müdürü

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Dijital Pazarlama Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
Galatasaray Üniversitesi - İletişim Fakültesi (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mustafa Çelik');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[ADVERSARIAL_17/500] Extract Elif Soylu (Saha Satış Yöneticisi) with format type 1', () => {
    const cv = `
********************************************************************************
Elif Soylu — Saha Satış Yöneticisi
Eskişehir / Tepebaşı | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Migros Ticaret A.Ş.
Saha Satış Yöneticisi (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
Anadolu Üniversitesi - İktisat (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Elif Soylu');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Eskişehir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Migros', 'i'));
  });

  it('[ADVERSARIAL_18/500] Extract Can Şimşek (Operasyonel Mükemmellik Lideri) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Can Şimşek
Kocaeli / Gebze
Operasyonel Mükemmellik Lideri

İŞ TECRÜBELERİ
Arçelik Sanayi A.Ş. (2017 - 2024)
Operasyonel Mükemmellik Lideri
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Yıldız Teknik Üniversitesi - Makine Mühendisliği (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Can Şimşek');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Kocaeli');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[ADVERSARIAL_19/500] Extract Zeynep Karaca (Siber Güvenlik Direktörü) with format type 3', () => {
    const cv = `
Zeynep Karaca
Ankara / Yenimahalle | contact@example.com
Siber Güvenlik Direktörü

WORK EXPERIENCE
STM Savunma Teknolojileri A.Ş. - Siber Güvenlik Direktörü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Bilkent Üniversitesi - Elektrik Elektronik (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Zeynep Karaca');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('STM', 'i'));
  });

  it('[ADVERSARIAL_20/500] Extract Oğuzhan Korkmaz (Kurumsal İletişim Müdürü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Oğuzhan Korkmaz               | Doğan Holding A.Ş.                               |
| Şehir: İstanbul / Beyoğlu | Görev: Kurumsal İletişim Müdürü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: İstanbul Üniversitesi - İletişim (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Oğuzhan Korkmaz');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Doğan', 'i'));
  });

  it('[ADVERSARIAL_21/500] Extract Uğur Özdemir (Çağrı Merkezi Operasyon Müdürü) with format type 0', () => {
    const cv = `
Uğur Özdemir
İstanbul / Kadıköy | 0532 999 00 11 | candidate@domain.com
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone Müşteri Hizmetleri A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Uğur Özdemir');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Vodafone', 'i'));
  });

  it('[ADVERSARIAL_22/500] Extract Burak Sunal (Kıdemli Backend Geliştirici) with format type 1', () => {
    const cv = `
********************************************************************************
Burak Sunal — Kıdemli Backend Geliştirici
Ankara / Çankaya | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Trendyol Teknoloji A.Ş.
Kıdemli Backend Geliştirici (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
ODTÜ - Bilgisayar Mühendisliği (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Burak Sunal');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[ADVERSARIAL_23/500] Extract Kemal Girik (Kurumsal Finans Direktörü) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Kemal Girik
İstanbul / Beşiktaş
Kurumsal Finans Direktörü

İŞ TECRÜBELERİ
Garanti BBVA A.Ş. (2017 - 2024)
Kurumsal Finans Direktörü
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Boğaziçi Üniversitesi - İşletme (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Kemal Girik');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Garanti', 'i'));
  });

  it('[ADVERSARIAL_24/500] Extract Fatma Bilginer (Tedarik Zinciri Müdürü) with format type 3', () => {
    const cv = `
Fatma Bilginer
İzmir / Bornova | contact@example.com
Tedarik Zinciri Müdürü

WORK EXPERIENCE
Ekol Lojistik A.Ş. - Tedarik Zinciri Müdürü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Dokuz Eylül Üniversitesi - Endüstri Mühendisliği (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Fatma Bilginer');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İzmir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Ekol', 'i'));
  });

  it('[ADVERSARIAL_25/500] Extract Haluk Olcay (İnsan Kaynakları Direktörü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Haluk Olcay               | Koç Holding A.Ş.                               |
| Şehir: İstanbul / Üsküdar | Görev: İnsan Kaynakları Direktörü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: Marmara Üniversitesi - İktisadi ve İdari Bilimler (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Haluk Olcay');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Koç', 'i'));
  });

  it('[ADVERSARIAL_26/500] Extract Zuhal Akan (Dijital Pazarlama Müdürü) with format type 0', () => {
    const cv = `
Zuhal Akan
İstanbul / Şişli | 0532 999 00 11 | candidate@domain.com
Dijital Pazarlama Müdürü

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Dijital Pazarlama Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
Galatasaray Üniversitesi - İletişim Fakültesi (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Zuhal Akan');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[ADVERSARIAL_27/500] Extract Tarık Özkul (Saha Satış Yöneticisi) with format type 1', () => {
    const cv = `
********************************************************************************
Tarık Özkul — Saha Satış Yöneticisi
Eskişehir / Tepebaşı | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Migros Ticaret A.Ş.
Saha Satış Yöneticisi (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
Anadolu Üniversitesi - İktisat (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Tarık Özkul');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Eskişehir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Migros', 'i'));
  });

  it('[ADVERSARIAL_28/500] Extract Münir Şen (Operasyonel Mükemmellik Lideri) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Münir Şen
Kocaeli / Gebze
Operasyonel Mükemmellik Lideri

İŞ TECRÜBELERİ
Arçelik Sanayi A.Ş. (2017 - 2024)
Operasyonel Mükemmellik Lideri
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Yıldız Teknik Üniversitesi - Makine Mühendisliği (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Münir Şen');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Kocaeli');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[ADVERSARIAL_29/500] Extract Şener Naşit (Siber Güvenlik Direktörü) with format type 3', () => {
    const cv = `
Şener Naşit
Ankara / Yenimahalle | contact@example.com
Siber Güvenlik Direktörü

WORK EXPERIENCE
STM Savunma Teknolojileri A.Ş. - Siber Güvenlik Direktörü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Bilkent Üniversitesi - Elektrik Elektronik (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Şener Naşit');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('STM', 'i'));
  });

  it('[ADVERSARIAL_30/500] Extract Adile Şentürk (Kurumsal İletişim Müdürü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Adile Şentürk               | Doğan Holding A.Ş.                               |
| Şehir: İstanbul / Beyoğlu | Görev: Kurumsal İletişim Müdürü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: İstanbul Üniversitesi - İletişim (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Adile Şentürk');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Doğan', 'i'));
  });

  it('[ADVERSARIAL_31/500] Extract Ceren Yalçın (Çağrı Merkezi Operasyon Müdürü) with format type 0', () => {
    const cv = `
Ceren Yalçın
İstanbul / Kadıköy | 0532 999 00 11 | candidate@domain.com
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone Müşteri Hizmetleri A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Ceren Yalçın');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Vodafone', 'i'));
  });

  it('[ADVERSARIAL_32/500] Extract Mert Kaya (Kıdemli Backend Geliştirici) with format type 1', () => {
    const cv = `
********************************************************************************
Mert Kaya — Kıdemli Backend Geliştirici
Ankara / Çankaya | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Trendyol Teknoloji A.Ş.
Kıdemli Backend Geliştirici (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
ODTÜ - Bilgisayar Mühendisliği (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mert Kaya');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[ADVERSARIAL_33/500] Extract Emre Yılmaz (Kurumsal Finans Direktörü) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Emre Yılmaz
İstanbul / Beşiktaş
Kurumsal Finans Direktörü

İŞ TECRÜBELERİ
Garanti BBVA A.Ş. (2017 - 2024)
Kurumsal Finans Direktörü
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Boğaziçi Üniversitesi - İşletme (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Emre Yılmaz');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Garanti', 'i'));
  });

  it('[ADVERSARIAL_34/500] Extract Ayşe Demir (Tedarik Zinciri Müdürü) with format type 3', () => {
    const cv = `
Ayşe Demir
İzmir / Bornova | contact@example.com
Tedarik Zinciri Müdürü

WORK EXPERIENCE
Ekol Lojistik A.Ş. - Tedarik Zinciri Müdürü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Dokuz Eylül Üniversitesi - Endüstri Mühendisliği (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Ayşe Demir');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İzmir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Ekol', 'i'));
  });

  it('[ADVERSARIAL_35/500] Extract Mehmet Çelik (İnsan Kaynakları Direktörü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Mehmet Çelik               | Koç Holding A.Ş.                               |
| Şehir: İstanbul / Üsküdar | Görev: İnsan Kaynakları Direktörü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: Marmara Üniversitesi - İktisadi ve İdari Bilimler (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mehmet Çelik');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Koç', 'i'));
  });

  it('[ADVERSARIAL_36/500] Extract Mustafa Soylu (Dijital Pazarlama Müdürü) with format type 0', () => {
    const cv = `
Mustafa Soylu
İstanbul / Şişli | 0532 999 00 11 | candidate@domain.com
Dijital Pazarlama Müdürü

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Dijital Pazarlama Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
Galatasaray Üniversitesi - İletişim Fakültesi (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mustafa Soylu');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[ADVERSARIAL_37/500] Extract Elif Şimşek (Saha Satış Yöneticisi) with format type 1', () => {
    const cv = `
********************************************************************************
Elif Şimşek — Saha Satış Yöneticisi
Eskişehir / Tepebaşı | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Migros Ticaret A.Ş.
Saha Satış Yöneticisi (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
Anadolu Üniversitesi - İktisat (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Elif Şimşek');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Eskişehir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Migros', 'i'));
  });

  it('[ADVERSARIAL_38/500] Extract Can Karaca (Operasyonel Mükemmellik Lideri) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Can Karaca
Kocaeli / Gebze
Operasyonel Mükemmellik Lideri

İŞ TECRÜBELERİ
Arçelik Sanayi A.Ş. (2017 - 2024)
Operasyonel Mükemmellik Lideri
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Yıldız Teknik Üniversitesi - Makine Mühendisliği (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Can Karaca');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Kocaeli');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[ADVERSARIAL_39/500] Extract Zeynep Korkmaz (Siber Güvenlik Direktörü) with format type 3', () => {
    const cv = `
Zeynep Korkmaz
Ankara / Yenimahalle | contact@example.com
Siber Güvenlik Direktörü

WORK EXPERIENCE
STM Savunma Teknolojileri A.Ş. - Siber Güvenlik Direktörü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Bilkent Üniversitesi - Elektrik Elektronik (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Zeynep Korkmaz');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('STM', 'i'));
  });

  it('[ADVERSARIAL_40/500] Extract Oğuzhan Zaman (Kurumsal İletişim Müdürü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Oğuzhan Zaman               | Doğan Holding A.Ş.                               |
| Şehir: İstanbul / Beyoğlu | Görev: Kurumsal İletişim Müdürü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: İstanbul Üniversitesi - İletişim (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Oğuzhan Zaman');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Doğan', 'i'));
  });

  it('[ADVERSARIAL_41/500] Extract Uğur Sunal (Çağrı Merkezi Operasyon Müdürü) with format type 0', () => {
    const cv = `
Uğur Sunal
İstanbul / Kadıköy | 0532 999 00 11 | candidate@domain.com
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone Müşteri Hizmetleri A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Uğur Sunal');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Vodafone', 'i'));
  });

  it('[ADVERSARIAL_42/500] Extract Burak Girik (Kıdemli Backend Geliştirici) with format type 1', () => {
    const cv = `
********************************************************************************
Burak Girik — Kıdemli Backend Geliştirici
Ankara / Çankaya | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Trendyol Teknoloji A.Ş.
Kıdemli Backend Geliştirici (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
ODTÜ - Bilgisayar Mühendisliği (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Burak Girik');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[ADVERSARIAL_43/500] Extract Kemal Bilginer (Kurumsal Finans Direktörü) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Kemal Bilginer
İstanbul / Beşiktaş
Kurumsal Finans Direktörü

İŞ TECRÜBELERİ
Garanti BBVA A.Ş. (2017 - 2024)
Kurumsal Finans Direktörü
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Boğaziçi Üniversitesi - İşletme (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Kemal Bilginer');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Garanti', 'i'));
  });

  it('[ADVERSARIAL_44/500] Extract Fatma Olcay (Tedarik Zinciri Müdürü) with format type 3', () => {
    const cv = `
Fatma Olcay
İzmir / Bornova | contact@example.com
Tedarik Zinciri Müdürü

WORK EXPERIENCE
Ekol Lojistik A.Ş. - Tedarik Zinciri Müdürü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Dokuz Eylül Üniversitesi - Endüstri Mühendisliği (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Fatma Olcay');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İzmir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Ekol', 'i'));
  });

  it('[ADVERSARIAL_45/500] Extract Haluk Akan (İnsan Kaynakları Direktörü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Haluk Akan               | Koç Holding A.Ş.                               |
| Şehir: İstanbul / Üsküdar | Görev: İnsan Kaynakları Direktörü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: Marmara Üniversitesi - İktisadi ve İdari Bilimler (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Haluk Akan');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Koç', 'i'));
  });

  it('[ADVERSARIAL_46/500] Extract Zuhal Özkul (Dijital Pazarlama Müdürü) with format type 0', () => {
    const cv = `
Zuhal Özkul
İstanbul / Şişli | 0532 999 00 11 | candidate@domain.com
Dijital Pazarlama Müdürü

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Dijital Pazarlama Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
Galatasaray Üniversitesi - İletişim Fakültesi (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Zuhal Özkul');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[ADVERSARIAL_47/500] Extract Tarık Şen (Saha Satış Yöneticisi) with format type 1', () => {
    const cv = `
********************************************************************************
Tarık Şen — Saha Satış Yöneticisi
Eskişehir / Tepebaşı | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Migros Ticaret A.Ş.
Saha Satış Yöneticisi (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
Anadolu Üniversitesi - İktisat (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Tarık Şen');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Eskişehir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Migros', 'i'));
  });

  it('[ADVERSARIAL_48/500] Extract Münir Naşit (Operasyonel Mükemmellik Lideri) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Münir Naşit
Kocaeli / Gebze
Operasyonel Mükemmellik Lideri

İŞ TECRÜBELERİ
Arçelik Sanayi A.Ş. (2017 - 2024)
Operasyonel Mükemmellik Lideri
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Yıldız Teknik Üniversitesi - Makine Mühendisliği (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Münir Naşit');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Kocaeli');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[ADVERSARIAL_49/500] Extract Şener Şentürk (Siber Güvenlik Direktörü) with format type 3', () => {
    const cv = `
Şener Şentürk
Ankara / Yenimahalle | contact@example.com
Siber Güvenlik Direktörü

WORK EXPERIENCE
STM Savunma Teknolojileri A.Ş. - Siber Güvenlik Direktörü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Bilkent Üniversitesi - Elektrik Elektronik (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Şener Şentürk');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('STM', 'i'));
  });

  it('[ADVERSARIAL_50/500] Extract Adile Yalçın (Kurumsal İletişim Müdürü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Adile Yalçın               | Doğan Holding A.Ş.                               |
| Şehir: İstanbul / Beyoğlu | Görev: Kurumsal İletişim Müdürü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: İstanbul Üniversitesi - İletişim (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Adile Yalçın');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Doğan', 'i'));
  });

  it('[ADVERSARIAL_51/500] Extract Ceren Kaya (Çağrı Merkezi Operasyon Müdürü) with format type 0', () => {
    const cv = `
Ceren Kaya
İstanbul / Kadıköy | 0532 999 00 11 | candidate@domain.com
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone Müşteri Hizmetleri A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Ceren Kaya');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Vodafone', 'i'));
  });

  it('[ADVERSARIAL_52/500] Extract Mert Yılmaz (Kıdemli Backend Geliştirici) with format type 1', () => {
    const cv = `
********************************************************************************
Mert Yılmaz — Kıdemli Backend Geliştirici
Ankara / Çankaya | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Trendyol Teknoloji A.Ş.
Kıdemli Backend Geliştirici (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
ODTÜ - Bilgisayar Mühendisliği (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mert Yılmaz');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[ADVERSARIAL_53/500] Extract Emre Demir (Kurumsal Finans Direktörü) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Emre Demir
İstanbul / Beşiktaş
Kurumsal Finans Direktörü

İŞ TECRÜBELERİ
Garanti BBVA A.Ş. (2017 - 2024)
Kurumsal Finans Direktörü
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Boğaziçi Üniversitesi - İşletme (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Emre Demir');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Garanti', 'i'));
  });

  it('[ADVERSARIAL_54/500] Extract Ayşe Çelik (Tedarik Zinciri Müdürü) with format type 3', () => {
    const cv = `
Ayşe Çelik
İzmir / Bornova | contact@example.com
Tedarik Zinciri Müdürü

WORK EXPERIENCE
Ekol Lojistik A.Ş. - Tedarik Zinciri Müdürü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Dokuz Eylül Üniversitesi - Endüstri Mühendisliği (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Ayşe Çelik');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İzmir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Ekol', 'i'));
  });

  it('[ADVERSARIAL_55/500] Extract Mehmet Soylu (İnsan Kaynakları Direktörü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Mehmet Soylu               | Koç Holding A.Ş.                               |
| Şehir: İstanbul / Üsküdar | Görev: İnsan Kaynakları Direktörü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: Marmara Üniversitesi - İktisadi ve İdari Bilimler (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mehmet Soylu');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Koç', 'i'));
  });

  it('[ADVERSARIAL_56/500] Extract Mustafa Şimşek (Dijital Pazarlama Müdürü) with format type 0', () => {
    const cv = `
Mustafa Şimşek
İstanbul / Şişli | 0532 999 00 11 | candidate@domain.com
Dijital Pazarlama Müdürü

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Dijital Pazarlama Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
Galatasaray Üniversitesi - İletişim Fakültesi (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mustafa Şimşek');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[ADVERSARIAL_57/500] Extract Elif Karaca (Saha Satış Yöneticisi) with format type 1', () => {
    const cv = `
********************************************************************************
Elif Karaca — Saha Satış Yöneticisi
Eskişehir / Tepebaşı | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Migros Ticaret A.Ş.
Saha Satış Yöneticisi (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
Anadolu Üniversitesi - İktisat (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Elif Karaca');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Eskişehir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Migros', 'i'));
  });

  it('[ADVERSARIAL_58/500] Extract Can Korkmaz (Operasyonel Mükemmellik Lideri) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Can Korkmaz
Kocaeli / Gebze
Operasyonel Mükemmellik Lideri

İŞ TECRÜBELERİ
Arçelik Sanayi A.Ş. (2017 - 2024)
Operasyonel Mükemmellik Lideri
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Yıldız Teknik Üniversitesi - Makine Mühendisliği (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Can Korkmaz');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Kocaeli');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[ADVERSARIAL_59/500] Extract Zeynep Zaman (Siber Güvenlik Direktörü) with format type 3', () => {
    const cv = `
Zeynep Zaman
Ankara / Yenimahalle | contact@example.com
Siber Güvenlik Direktörü

WORK EXPERIENCE
STM Savunma Teknolojileri A.Ş. - Siber Güvenlik Direktörü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Bilkent Üniversitesi - Elektrik Elektronik (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Zeynep Zaman');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('STM', 'i'));
  });

  it('[ADVERSARIAL_60/500] Extract Oğuzhan Özdemir (Kurumsal İletişim Müdürü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Oğuzhan Özdemir               | Doğan Holding A.Ş.                               |
| Şehir: İstanbul / Beyoğlu | Görev: Kurumsal İletişim Müdürü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: İstanbul Üniversitesi - İletişim (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Oğuzhan Özdemir');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Doğan', 'i'));
  });

  it('[ADVERSARIAL_61/500] Extract Uğur Girik (Çağrı Merkezi Operasyon Müdürü) with format type 0', () => {
    const cv = `
Uğur Girik
İstanbul / Kadıköy | 0532 999 00 11 | candidate@domain.com
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone Müşteri Hizmetleri A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Uğur Girik');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Vodafone', 'i'));
  });

  it('[ADVERSARIAL_62/500] Extract Burak Bilginer (Kıdemli Backend Geliştirici) with format type 1', () => {
    const cv = `
********************************************************************************
Burak Bilginer — Kıdemli Backend Geliştirici
Ankara / Çankaya | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Trendyol Teknoloji A.Ş.
Kıdemli Backend Geliştirici (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
ODTÜ - Bilgisayar Mühendisliği (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Burak Bilginer');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[ADVERSARIAL_63/500] Extract Kemal Olcay (Kurumsal Finans Direktörü) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Kemal Olcay
İstanbul / Beşiktaş
Kurumsal Finans Direktörü

İŞ TECRÜBELERİ
Garanti BBVA A.Ş. (2017 - 2024)
Kurumsal Finans Direktörü
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Boğaziçi Üniversitesi - İşletme (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Kemal Olcay');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Garanti', 'i'));
  });

  it('[ADVERSARIAL_64/500] Extract Fatma Akan (Tedarik Zinciri Müdürü) with format type 3', () => {
    const cv = `
Fatma Akan
İzmir / Bornova | contact@example.com
Tedarik Zinciri Müdürü

WORK EXPERIENCE
Ekol Lojistik A.Ş. - Tedarik Zinciri Müdürü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Dokuz Eylül Üniversitesi - Endüstri Mühendisliği (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Fatma Akan');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İzmir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Ekol', 'i'));
  });

  it('[ADVERSARIAL_65/500] Extract Haluk Özkul (İnsan Kaynakları Direktörü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Haluk Özkul               | Koç Holding A.Ş.                               |
| Şehir: İstanbul / Üsküdar | Görev: İnsan Kaynakları Direktörü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: Marmara Üniversitesi - İktisadi ve İdari Bilimler (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Haluk Özkul');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Koç', 'i'));
  });

  it('[ADVERSARIAL_66/500] Extract Zuhal Şen (Dijital Pazarlama Müdürü) with format type 0', () => {
    const cv = `
Zuhal Şen
İstanbul / Şişli | 0532 999 00 11 | candidate@domain.com
Dijital Pazarlama Müdürü

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Dijital Pazarlama Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
Galatasaray Üniversitesi - İletişim Fakültesi (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Zuhal Şen');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[ADVERSARIAL_67/500] Extract Tarık Naşit (Saha Satış Yöneticisi) with format type 1', () => {
    const cv = `
********************************************************************************
Tarık Naşit — Saha Satış Yöneticisi
Eskişehir / Tepebaşı | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Migros Ticaret A.Ş.
Saha Satış Yöneticisi (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
Anadolu Üniversitesi - İktisat (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Tarık Naşit');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Eskişehir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Migros', 'i'));
  });

  it('[ADVERSARIAL_68/500] Extract Münir Şentürk (Operasyonel Mükemmellik Lideri) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Münir Şentürk
Kocaeli / Gebze
Operasyonel Mükemmellik Lideri

İŞ TECRÜBELERİ
Arçelik Sanayi A.Ş. (2017 - 2024)
Operasyonel Mükemmellik Lideri
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Yıldız Teknik Üniversitesi - Makine Mühendisliği (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Münir Şentürk');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Kocaeli');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[ADVERSARIAL_69/500] Extract Şener Yalçın (Siber Güvenlik Direktörü) with format type 3', () => {
    const cv = `
Şener Yalçın
Ankara / Yenimahalle | contact@example.com
Siber Güvenlik Direktörü

WORK EXPERIENCE
STM Savunma Teknolojileri A.Ş. - Siber Güvenlik Direktörü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Bilkent Üniversitesi - Elektrik Elektronik (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Şener Yalçın');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('STM', 'i'));
  });

  it('[ADVERSARIAL_70/500] Extract Adile Kaya (Kurumsal İletişim Müdürü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Adile Kaya               | Doğan Holding A.Ş.                               |
| Şehir: İstanbul / Beyoğlu | Görev: Kurumsal İletişim Müdürü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: İstanbul Üniversitesi - İletişim (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Adile Kaya');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Doğan', 'i'));
  });

  it('[ADVERSARIAL_71/500] Extract Ceren Yılmaz (Çağrı Merkezi Operasyon Müdürü) with format type 0', () => {
    const cv = `
Ceren Yılmaz
İstanbul / Kadıköy | 0532 999 00 11 | candidate@domain.com
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone Müşteri Hizmetleri A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Ceren Yılmaz');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Vodafone', 'i'));
  });

  it('[ADVERSARIAL_72/500] Extract Mert Demir (Kıdemli Backend Geliştirici) with format type 1', () => {
    const cv = `
********************************************************************************
Mert Demir — Kıdemli Backend Geliştirici
Ankara / Çankaya | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Trendyol Teknoloji A.Ş.
Kıdemli Backend Geliştirici (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
ODTÜ - Bilgisayar Mühendisliği (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mert Demir');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[ADVERSARIAL_73/500] Extract Emre Çelik (Kurumsal Finans Direktörü) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Emre Çelik
İstanbul / Beşiktaş
Kurumsal Finans Direktörü

İŞ TECRÜBELERİ
Garanti BBVA A.Ş. (2017 - 2024)
Kurumsal Finans Direktörü
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Boğaziçi Üniversitesi - İşletme (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Emre Çelik');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Garanti', 'i'));
  });

  it('[ADVERSARIAL_74/500] Extract Ayşe Soylu (Tedarik Zinciri Müdürü) with format type 3', () => {
    const cv = `
Ayşe Soylu
İzmir / Bornova | contact@example.com
Tedarik Zinciri Müdürü

WORK EXPERIENCE
Ekol Lojistik A.Ş. - Tedarik Zinciri Müdürü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Dokuz Eylül Üniversitesi - Endüstri Mühendisliği (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Ayşe Soylu');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İzmir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Ekol', 'i'));
  });

  it('[ADVERSARIAL_75/500] Extract Mehmet Şimşek (İnsan Kaynakları Direktörü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Mehmet Şimşek               | Koç Holding A.Ş.                               |
| Şehir: İstanbul / Üsküdar | Görev: İnsan Kaynakları Direktörü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: Marmara Üniversitesi - İktisadi ve İdari Bilimler (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mehmet Şimşek');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Koç', 'i'));
  });

  it('[ADVERSARIAL_76/500] Extract Mustafa Karaca (Dijital Pazarlama Müdürü) with format type 0', () => {
    const cv = `
Mustafa Karaca
İstanbul / Şişli | 0532 999 00 11 | candidate@domain.com
Dijital Pazarlama Müdürü

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Dijital Pazarlama Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
Galatasaray Üniversitesi - İletişim Fakültesi (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mustafa Karaca');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[ADVERSARIAL_77/500] Extract Elif Korkmaz (Saha Satış Yöneticisi) with format type 1', () => {
    const cv = `
********************************************************************************
Elif Korkmaz — Saha Satış Yöneticisi
Eskişehir / Tepebaşı | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Migros Ticaret A.Ş.
Saha Satış Yöneticisi (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
Anadolu Üniversitesi - İktisat (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Elif Korkmaz');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Eskişehir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Migros', 'i'));
  });

  it('[ADVERSARIAL_78/500] Extract Can Zaman (Operasyonel Mükemmellik Lideri) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Can Zaman
Kocaeli / Gebze
Operasyonel Mükemmellik Lideri

İŞ TECRÜBELERİ
Arçelik Sanayi A.Ş. (2017 - 2024)
Operasyonel Mükemmellik Lideri
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Yıldız Teknik Üniversitesi - Makine Mühendisliği (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Can Zaman');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Kocaeli');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[ADVERSARIAL_79/500] Extract Zeynep Özdemir (Siber Güvenlik Direktörü) with format type 3', () => {
    const cv = `
Zeynep Özdemir
Ankara / Yenimahalle | contact@example.com
Siber Güvenlik Direktörü

WORK EXPERIENCE
STM Savunma Teknolojileri A.Ş. - Siber Güvenlik Direktörü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Bilkent Üniversitesi - Elektrik Elektronik (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Zeynep Özdemir');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('STM', 'i'));
  });

  it('[ADVERSARIAL_80/500] Extract Oğuzhan Sunal (Kurumsal İletişim Müdürü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Oğuzhan Sunal               | Doğan Holding A.Ş.                               |
| Şehir: İstanbul / Beyoğlu | Görev: Kurumsal İletişim Müdürü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: İstanbul Üniversitesi - İletişim (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Oğuzhan Sunal');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Doğan', 'i'));
  });

  it('[ADVERSARIAL_81/500] Extract Uğur Bilginer (Çağrı Merkezi Operasyon Müdürü) with format type 0', () => {
    const cv = `
Uğur Bilginer
İstanbul / Kadıköy | 0532 999 00 11 | candidate@domain.com
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone Müşteri Hizmetleri A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Uğur Bilginer');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Vodafone', 'i'));
  });

  it('[ADVERSARIAL_82/500] Extract Burak Olcay (Kıdemli Backend Geliştirici) with format type 1', () => {
    const cv = `
********************************************************************************
Burak Olcay — Kıdemli Backend Geliştirici
Ankara / Çankaya | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Trendyol Teknoloji A.Ş.
Kıdemli Backend Geliştirici (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
ODTÜ - Bilgisayar Mühendisliği (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Burak Olcay');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[ADVERSARIAL_83/500] Extract Kemal Akan (Kurumsal Finans Direktörü) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Kemal Akan
İstanbul / Beşiktaş
Kurumsal Finans Direktörü

İŞ TECRÜBELERİ
Garanti BBVA A.Ş. (2017 - 2024)
Kurumsal Finans Direktörü
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Boğaziçi Üniversitesi - İşletme (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Kemal Akan');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Garanti', 'i'));
  });

  it('[ADVERSARIAL_84/500] Extract Fatma Özkul (Tedarik Zinciri Müdürü) with format type 3', () => {
    const cv = `
Fatma Özkul
İzmir / Bornova | contact@example.com
Tedarik Zinciri Müdürü

WORK EXPERIENCE
Ekol Lojistik A.Ş. - Tedarik Zinciri Müdürü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Dokuz Eylül Üniversitesi - Endüstri Mühendisliği (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Fatma Özkul');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İzmir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Ekol', 'i'));
  });

  it('[ADVERSARIAL_85/500] Extract Haluk Şen (İnsan Kaynakları Direktörü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Haluk Şen               | Koç Holding A.Ş.                               |
| Şehir: İstanbul / Üsküdar | Görev: İnsan Kaynakları Direktörü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: Marmara Üniversitesi - İktisadi ve İdari Bilimler (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Haluk Şen');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Koç', 'i'));
  });

  it('[ADVERSARIAL_86/500] Extract Zuhal Naşit (Dijital Pazarlama Müdürü) with format type 0', () => {
    const cv = `
Zuhal Naşit
İstanbul / Şişli | 0532 999 00 11 | candidate@domain.com
Dijital Pazarlama Müdürü

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Dijital Pazarlama Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
Galatasaray Üniversitesi - İletişim Fakültesi (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Zuhal Naşit');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[ADVERSARIAL_87/500] Extract Tarık Şentürk (Saha Satış Yöneticisi) with format type 1', () => {
    const cv = `
********************************************************************************
Tarık Şentürk — Saha Satış Yöneticisi
Eskişehir / Tepebaşı | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Migros Ticaret A.Ş.
Saha Satış Yöneticisi (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
Anadolu Üniversitesi - İktisat (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Tarık Şentürk');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Eskişehir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Migros', 'i'));
  });

  it('[ADVERSARIAL_88/500] Extract Münir Yalçın (Operasyonel Mükemmellik Lideri) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Münir Yalçın
Kocaeli / Gebze
Operasyonel Mükemmellik Lideri

İŞ TECRÜBELERİ
Arçelik Sanayi A.Ş. (2017 - 2024)
Operasyonel Mükemmellik Lideri
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Yıldız Teknik Üniversitesi - Makine Mühendisliği (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Münir Yalçın');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Kocaeli');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[ADVERSARIAL_89/500] Extract Şener Kaya (Siber Güvenlik Direktörü) with format type 3', () => {
    const cv = `
Şener Kaya
Ankara / Yenimahalle | contact@example.com
Siber Güvenlik Direktörü

WORK EXPERIENCE
STM Savunma Teknolojileri A.Ş. - Siber Güvenlik Direktörü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Bilkent Üniversitesi - Elektrik Elektronik (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Şener Kaya');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('STM', 'i'));
  });

  it('[ADVERSARIAL_90/500] Extract Adile Yılmaz (Kurumsal İletişim Müdürü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Adile Yılmaz               | Doğan Holding A.Ş.                               |
| Şehir: İstanbul / Beyoğlu | Görev: Kurumsal İletişim Müdürü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: İstanbul Üniversitesi - İletişim (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Adile Yılmaz');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Doğan', 'i'));
  });

  it('[ADVERSARIAL_91/500] Extract Ceren Demir (Çağrı Merkezi Operasyon Müdürü) with format type 0', () => {
    const cv = `
Ceren Demir
İstanbul / Kadıköy | 0532 999 00 11 | candidate@domain.com
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone Müşteri Hizmetleri A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Ceren Demir');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Vodafone', 'i'));
  });

  it('[ADVERSARIAL_92/500] Extract Mert Çelik (Kıdemli Backend Geliştirici) with format type 1', () => {
    const cv = `
********************************************************************************
Mert Çelik — Kıdemli Backend Geliştirici
Ankara / Çankaya | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Trendyol Teknoloji A.Ş.
Kıdemli Backend Geliştirici (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
ODTÜ - Bilgisayar Mühendisliği (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mert Çelik');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[ADVERSARIAL_93/500] Extract Emre Soylu (Kurumsal Finans Direktörü) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Emre Soylu
İstanbul / Beşiktaş
Kurumsal Finans Direktörü

İŞ TECRÜBELERİ
Garanti BBVA A.Ş. (2017 - 2024)
Kurumsal Finans Direktörü
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Boğaziçi Üniversitesi - İşletme (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Emre Soylu');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Garanti', 'i'));
  });

  it('[ADVERSARIAL_94/500] Extract Ayşe Şimşek (Tedarik Zinciri Müdürü) with format type 3', () => {
    const cv = `
Ayşe Şimşek
İzmir / Bornova | contact@example.com
Tedarik Zinciri Müdürü

WORK EXPERIENCE
Ekol Lojistik A.Ş. - Tedarik Zinciri Müdürü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Dokuz Eylül Üniversitesi - Endüstri Mühendisliği (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Ayşe Şimşek');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İzmir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Ekol', 'i'));
  });

  it('[ADVERSARIAL_95/500] Extract Mehmet Karaca (İnsan Kaynakları Direktörü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Mehmet Karaca               | Koç Holding A.Ş.                               |
| Şehir: İstanbul / Üsküdar | Görev: İnsan Kaynakları Direktörü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: Marmara Üniversitesi - İktisadi ve İdari Bilimler (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mehmet Karaca');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Koç', 'i'));
  });

  it('[ADVERSARIAL_96/500] Extract Mustafa Korkmaz (Dijital Pazarlama Müdürü) with format type 0', () => {
    const cv = `
Mustafa Korkmaz
İstanbul / Şişli | 0532 999 00 11 | candidate@domain.com
Dijital Pazarlama Müdürü

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Dijital Pazarlama Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
Galatasaray Üniversitesi - İletişim Fakültesi (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mustafa Korkmaz');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[ADVERSARIAL_97/500] Extract Elif Zaman (Saha Satış Yöneticisi) with format type 1', () => {
    const cv = `
********************************************************************************
Elif Zaman — Saha Satış Yöneticisi
Eskişehir / Tepebaşı | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Migros Ticaret A.Ş.
Saha Satış Yöneticisi (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
Anadolu Üniversitesi - İktisat (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Elif Zaman');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Eskişehir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Migros', 'i'));
  });

  it('[ADVERSARIAL_98/500] Extract Can Özdemir (Operasyonel Mükemmellik Lideri) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Can Özdemir
Kocaeli / Gebze
Operasyonel Mükemmellik Lideri

İŞ TECRÜBELERİ
Arçelik Sanayi A.Ş. (2017 - 2024)
Operasyonel Mükemmellik Lideri
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Yıldız Teknik Üniversitesi - Makine Mühendisliği (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Can Özdemir');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Kocaeli');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[ADVERSARIAL_99/500] Extract Zeynep Sunal (Siber Güvenlik Direktörü) with format type 3', () => {
    const cv = `
Zeynep Sunal
Ankara / Yenimahalle | contact@example.com
Siber Güvenlik Direktörü

WORK EXPERIENCE
STM Savunma Teknolojileri A.Ş. - Siber Güvenlik Direktörü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Bilkent Üniversitesi - Elektrik Elektronik (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Zeynep Sunal');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('STM', 'i'));
  });

  it('[ADVERSARIAL_100/500] Extract Oğuzhan Girik (Kurumsal İletişim Müdürü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Oğuzhan Girik               | Doğan Holding A.Ş.                               |
| Şehir: İstanbul / Beyoğlu | Görev: Kurumsal İletişim Müdürü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: İstanbul Üniversitesi - İletişim (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Oğuzhan Girik');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Doğan', 'i'));
  });

  it('[ADVERSARIAL_101/500] Extract Uğur Olcay (Çağrı Merkezi Operasyon Müdürü) with format type 0', () => {
    const cv = `
Uğur Olcay
İstanbul / Kadıköy | 0532 999 00 11 | candidate@domain.com
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone Müşteri Hizmetleri A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Uğur Olcay');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Vodafone', 'i'));
  });

  it('[ADVERSARIAL_102/500] Extract Burak Akan (Kıdemli Backend Geliştirici) with format type 1', () => {
    const cv = `
********************************************************************************
Burak Akan — Kıdemli Backend Geliştirici
Ankara / Çankaya | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Trendyol Teknoloji A.Ş.
Kıdemli Backend Geliştirici (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
ODTÜ - Bilgisayar Mühendisliği (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Burak Akan');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[ADVERSARIAL_103/500] Extract Kemal Özkul (Kurumsal Finans Direktörü) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Kemal Özkul
İstanbul / Beşiktaş
Kurumsal Finans Direktörü

İŞ TECRÜBELERİ
Garanti BBVA A.Ş. (2017 - 2024)
Kurumsal Finans Direktörü
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Boğaziçi Üniversitesi - İşletme (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Kemal Özkul');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Garanti', 'i'));
  });

  it('[ADVERSARIAL_104/500] Extract Fatma Şen (Tedarik Zinciri Müdürü) with format type 3', () => {
    const cv = `
Fatma Şen
İzmir / Bornova | contact@example.com
Tedarik Zinciri Müdürü

WORK EXPERIENCE
Ekol Lojistik A.Ş. - Tedarik Zinciri Müdürü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Dokuz Eylül Üniversitesi - Endüstri Mühendisliği (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Fatma Şen');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İzmir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Ekol', 'i'));
  });

  it('[ADVERSARIAL_105/500] Extract Haluk Naşit (İnsan Kaynakları Direktörü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Haluk Naşit               | Koç Holding A.Ş.                               |
| Şehir: İstanbul / Üsküdar | Görev: İnsan Kaynakları Direktörü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: Marmara Üniversitesi - İktisadi ve İdari Bilimler (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Haluk Naşit');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Koç', 'i'));
  });

  it('[ADVERSARIAL_106/500] Extract Zuhal Şentürk (Dijital Pazarlama Müdürü) with format type 0', () => {
    const cv = `
Zuhal Şentürk
İstanbul / Şişli | 0532 999 00 11 | candidate@domain.com
Dijital Pazarlama Müdürü

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Dijital Pazarlama Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
Galatasaray Üniversitesi - İletişim Fakültesi (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Zuhal Şentürk');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[ADVERSARIAL_107/500] Extract Tarık Yalçın (Saha Satış Yöneticisi) with format type 1', () => {
    const cv = `
********************************************************************************
Tarık Yalçın — Saha Satış Yöneticisi
Eskişehir / Tepebaşı | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Migros Ticaret A.Ş.
Saha Satış Yöneticisi (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
Anadolu Üniversitesi - İktisat (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Tarık Yalçın');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Eskişehir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Migros', 'i'));
  });

  it('[ADVERSARIAL_108/500] Extract Münir Kaya (Operasyonel Mükemmellik Lideri) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Münir Kaya
Kocaeli / Gebze
Operasyonel Mükemmellik Lideri

İŞ TECRÜBELERİ
Arçelik Sanayi A.Ş. (2017 - 2024)
Operasyonel Mükemmellik Lideri
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Yıldız Teknik Üniversitesi - Makine Mühendisliği (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Münir Kaya');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Kocaeli');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[ADVERSARIAL_109/500] Extract Şener Yılmaz (Siber Güvenlik Direktörü) with format type 3', () => {
    const cv = `
Şener Yılmaz
Ankara / Yenimahalle | contact@example.com
Siber Güvenlik Direktörü

WORK EXPERIENCE
STM Savunma Teknolojileri A.Ş. - Siber Güvenlik Direktörü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Bilkent Üniversitesi - Elektrik Elektronik (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Şener Yılmaz');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('STM', 'i'));
  });

  it('[ADVERSARIAL_110/500] Extract Adile Demir (Kurumsal İletişim Müdürü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Adile Demir               | Doğan Holding A.Ş.                               |
| Şehir: İstanbul / Beyoğlu | Görev: Kurumsal İletişim Müdürü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: İstanbul Üniversitesi - İletişim (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Adile Demir');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Doğan', 'i'));
  });

  it('[ADVERSARIAL_111/500] Extract Ceren Çelik (Çağrı Merkezi Operasyon Müdürü) with format type 0', () => {
    const cv = `
Ceren Çelik
İstanbul / Kadıköy | 0532 999 00 11 | candidate@domain.com
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone Müşteri Hizmetleri A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Ceren Çelik');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Vodafone', 'i'));
  });

  it('[ADVERSARIAL_112/500] Extract Mert Soylu (Kıdemli Backend Geliştirici) with format type 1', () => {
    const cv = `
********************************************************************************
Mert Soylu — Kıdemli Backend Geliştirici
Ankara / Çankaya | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Trendyol Teknoloji A.Ş.
Kıdemli Backend Geliştirici (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
ODTÜ - Bilgisayar Mühendisliği (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mert Soylu');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[ADVERSARIAL_113/500] Extract Emre Şimşek (Kurumsal Finans Direktörü) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Emre Şimşek
İstanbul / Beşiktaş
Kurumsal Finans Direktörü

İŞ TECRÜBELERİ
Garanti BBVA A.Ş. (2017 - 2024)
Kurumsal Finans Direktörü
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Boğaziçi Üniversitesi - İşletme (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Emre Şimşek');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Garanti', 'i'));
  });

  it('[ADVERSARIAL_114/500] Extract Ayşe Karaca (Tedarik Zinciri Müdürü) with format type 3', () => {
    const cv = `
Ayşe Karaca
İzmir / Bornova | contact@example.com
Tedarik Zinciri Müdürü

WORK EXPERIENCE
Ekol Lojistik A.Ş. - Tedarik Zinciri Müdürü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Dokuz Eylül Üniversitesi - Endüstri Mühendisliği (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Ayşe Karaca');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İzmir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Ekol', 'i'));
  });

  it('[ADVERSARIAL_115/500] Extract Mehmet Korkmaz (İnsan Kaynakları Direktörü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Mehmet Korkmaz               | Koç Holding A.Ş.                               |
| Şehir: İstanbul / Üsküdar | Görev: İnsan Kaynakları Direktörü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: Marmara Üniversitesi - İktisadi ve İdari Bilimler (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mehmet Korkmaz');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Koç', 'i'));
  });

  it('[ADVERSARIAL_116/500] Extract Mustafa Zaman (Dijital Pazarlama Müdürü) with format type 0', () => {
    const cv = `
Mustafa Zaman
İstanbul / Şişli | 0532 999 00 11 | candidate@domain.com
Dijital Pazarlama Müdürü

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Dijital Pazarlama Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
Galatasaray Üniversitesi - İletişim Fakültesi (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mustafa Zaman');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[ADVERSARIAL_117/500] Extract Elif Özdemir (Saha Satış Yöneticisi) with format type 1', () => {
    const cv = `
********************************************************************************
Elif Özdemir — Saha Satış Yöneticisi
Eskişehir / Tepebaşı | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Migros Ticaret A.Ş.
Saha Satış Yöneticisi (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
Anadolu Üniversitesi - İktisat (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Elif Özdemir');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Eskişehir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Migros', 'i'));
  });

  it('[ADVERSARIAL_118/500] Extract Can Sunal (Operasyonel Mükemmellik Lideri) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Can Sunal
Kocaeli / Gebze
Operasyonel Mükemmellik Lideri

İŞ TECRÜBELERİ
Arçelik Sanayi A.Ş. (2017 - 2024)
Operasyonel Mükemmellik Lideri
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Yıldız Teknik Üniversitesi - Makine Mühendisliği (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Can Sunal');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Kocaeli');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[ADVERSARIAL_119/500] Extract Zeynep Girik (Siber Güvenlik Direktörü) with format type 3', () => {
    const cv = `
Zeynep Girik
Ankara / Yenimahalle | contact@example.com
Siber Güvenlik Direktörü

WORK EXPERIENCE
STM Savunma Teknolojileri A.Ş. - Siber Güvenlik Direktörü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Bilkent Üniversitesi - Elektrik Elektronik (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Zeynep Girik');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('STM', 'i'));
  });

  it('[ADVERSARIAL_120/500] Extract Oğuzhan Bilginer (Kurumsal İletişim Müdürü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Oğuzhan Bilginer               | Doğan Holding A.Ş.                               |
| Şehir: İstanbul / Beyoğlu | Görev: Kurumsal İletişim Müdürü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: İstanbul Üniversitesi - İletişim (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Oğuzhan Bilginer');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Doğan', 'i'));
  });

  it('[ADVERSARIAL_121/500] Extract Uğur Akan (Çağrı Merkezi Operasyon Müdürü) with format type 0', () => {
    const cv = `
Uğur Akan
İstanbul / Kadıköy | 0532 999 00 11 | candidate@domain.com
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone Müşteri Hizmetleri A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Uğur Akan');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Vodafone', 'i'));
  });

  it('[ADVERSARIAL_122/500] Extract Burak Özkul (Kıdemli Backend Geliştirici) with format type 1', () => {
    const cv = `
********************************************************************************
Burak Özkul — Kıdemli Backend Geliştirici
Ankara / Çankaya | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Trendyol Teknoloji A.Ş.
Kıdemli Backend Geliştirici (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
ODTÜ - Bilgisayar Mühendisliği (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Burak Özkul');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[ADVERSARIAL_123/500] Extract Kemal Şen (Kurumsal Finans Direktörü) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Kemal Şen
İstanbul / Beşiktaş
Kurumsal Finans Direktörü

İŞ TECRÜBELERİ
Garanti BBVA A.Ş. (2017 - 2024)
Kurumsal Finans Direktörü
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Boğaziçi Üniversitesi - İşletme (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Kemal Şen');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Garanti', 'i'));
  });

  it('[ADVERSARIAL_124/500] Extract Fatma Naşit (Tedarik Zinciri Müdürü) with format type 3', () => {
    const cv = `
Fatma Naşit
İzmir / Bornova | contact@example.com
Tedarik Zinciri Müdürü

WORK EXPERIENCE
Ekol Lojistik A.Ş. - Tedarik Zinciri Müdürü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Dokuz Eylül Üniversitesi - Endüstri Mühendisliği (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Fatma Naşit');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İzmir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Ekol', 'i'));
  });

  it('[ADVERSARIAL_125/500] Extract Haluk Şentürk (İnsan Kaynakları Direktörü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Haluk Şentürk               | Koç Holding A.Ş.                               |
| Şehir: İstanbul / Üsküdar | Görev: İnsan Kaynakları Direktörü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: Marmara Üniversitesi - İktisadi ve İdari Bilimler (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Haluk Şentürk');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Koç', 'i'));
  });

  it('[ADVERSARIAL_126/500] Extract Zuhal Yalçın (Dijital Pazarlama Müdürü) with format type 0', () => {
    const cv = `
Zuhal Yalçın
İstanbul / Şişli | 0532 999 00 11 | candidate@domain.com
Dijital Pazarlama Müdürü

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Dijital Pazarlama Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
Galatasaray Üniversitesi - İletişim Fakültesi (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Zuhal Yalçın');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[ADVERSARIAL_127/500] Extract Tarık Kaya (Saha Satış Yöneticisi) with format type 1', () => {
    const cv = `
********************************************************************************
Tarık Kaya — Saha Satış Yöneticisi
Eskişehir / Tepebaşı | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Migros Ticaret A.Ş.
Saha Satış Yöneticisi (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
Anadolu Üniversitesi - İktisat (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Tarık Kaya');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Eskişehir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Migros', 'i'));
  });

  it('[ADVERSARIAL_128/500] Extract Münir Yılmaz (Operasyonel Mükemmellik Lideri) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Münir Yılmaz
Kocaeli / Gebze
Operasyonel Mükemmellik Lideri

İŞ TECRÜBELERİ
Arçelik Sanayi A.Ş. (2017 - 2024)
Operasyonel Mükemmellik Lideri
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Yıldız Teknik Üniversitesi - Makine Mühendisliği (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Münir Yılmaz');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Kocaeli');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[ADVERSARIAL_129/500] Extract Şener Demir (Siber Güvenlik Direktörü) with format type 3', () => {
    const cv = `
Şener Demir
Ankara / Yenimahalle | contact@example.com
Siber Güvenlik Direktörü

WORK EXPERIENCE
STM Savunma Teknolojileri A.Ş. - Siber Güvenlik Direktörü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Bilkent Üniversitesi - Elektrik Elektronik (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Şener Demir');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('STM', 'i'));
  });

  it('[ADVERSARIAL_130/500] Extract Adile Çelik (Kurumsal İletişim Müdürü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Adile Çelik               | Doğan Holding A.Ş.                               |
| Şehir: İstanbul / Beyoğlu | Görev: Kurumsal İletişim Müdürü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: İstanbul Üniversitesi - İletişim (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Adile Çelik');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Doğan', 'i'));
  });

  it('[ADVERSARIAL_131/500] Extract Ceren Soylu (Çağrı Merkezi Operasyon Müdürü) with format type 0', () => {
    const cv = `
Ceren Soylu
İstanbul / Kadıköy | 0532 999 00 11 | candidate@domain.com
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone Müşteri Hizmetleri A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Ceren Soylu');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Vodafone', 'i'));
  });

  it('[ADVERSARIAL_132/500] Extract Mert Şimşek (Kıdemli Backend Geliştirici) with format type 1', () => {
    const cv = `
********************************************************************************
Mert Şimşek — Kıdemli Backend Geliştirici
Ankara / Çankaya | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Trendyol Teknoloji A.Ş.
Kıdemli Backend Geliştirici (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
ODTÜ - Bilgisayar Mühendisliği (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mert Şimşek');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[ADVERSARIAL_133/500] Extract Emre Karaca (Kurumsal Finans Direktörü) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Emre Karaca
İstanbul / Beşiktaş
Kurumsal Finans Direktörü

İŞ TECRÜBELERİ
Garanti BBVA A.Ş. (2017 - 2024)
Kurumsal Finans Direktörü
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Boğaziçi Üniversitesi - İşletme (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Emre Karaca');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Garanti', 'i'));
  });

  it('[ADVERSARIAL_134/500] Extract Ayşe Korkmaz (Tedarik Zinciri Müdürü) with format type 3', () => {
    const cv = `
Ayşe Korkmaz
İzmir / Bornova | contact@example.com
Tedarik Zinciri Müdürü

WORK EXPERIENCE
Ekol Lojistik A.Ş. - Tedarik Zinciri Müdürü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Dokuz Eylül Üniversitesi - Endüstri Mühendisliği (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Ayşe Korkmaz');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İzmir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Ekol', 'i'));
  });

  it('[ADVERSARIAL_135/500] Extract Mehmet Zaman (İnsan Kaynakları Direktörü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Mehmet Zaman               | Koç Holding A.Ş.                               |
| Şehir: İstanbul / Üsküdar | Görev: İnsan Kaynakları Direktörü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: Marmara Üniversitesi - İktisadi ve İdari Bilimler (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mehmet Zaman');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Koç', 'i'));
  });

  it('[ADVERSARIAL_136/500] Extract Mustafa Özdemir (Dijital Pazarlama Müdürü) with format type 0', () => {
    const cv = `
Mustafa Özdemir
İstanbul / Şişli | 0532 999 00 11 | candidate@domain.com
Dijital Pazarlama Müdürü

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Dijital Pazarlama Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
Galatasaray Üniversitesi - İletişim Fakültesi (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mustafa Özdemir');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[ADVERSARIAL_137/500] Extract Elif Sunal (Saha Satış Yöneticisi) with format type 1', () => {
    const cv = `
********************************************************************************
Elif Sunal — Saha Satış Yöneticisi
Eskişehir / Tepebaşı | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Migros Ticaret A.Ş.
Saha Satış Yöneticisi (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
Anadolu Üniversitesi - İktisat (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Elif Sunal');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Eskişehir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Migros', 'i'));
  });

  it('[ADVERSARIAL_138/500] Extract Can Girik (Operasyonel Mükemmellik Lideri) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Can Girik
Kocaeli / Gebze
Operasyonel Mükemmellik Lideri

İŞ TECRÜBELERİ
Arçelik Sanayi A.Ş. (2017 - 2024)
Operasyonel Mükemmellik Lideri
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Yıldız Teknik Üniversitesi - Makine Mühendisliği (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Can Girik');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Kocaeli');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[ADVERSARIAL_139/500] Extract Zeynep Bilginer (Siber Güvenlik Direktörü) with format type 3', () => {
    const cv = `
Zeynep Bilginer
Ankara / Yenimahalle | contact@example.com
Siber Güvenlik Direktörü

WORK EXPERIENCE
STM Savunma Teknolojileri A.Ş. - Siber Güvenlik Direktörü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Bilkent Üniversitesi - Elektrik Elektronik (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Zeynep Bilginer');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('STM', 'i'));
  });

  it('[ADVERSARIAL_140/500] Extract Oğuzhan Olcay (Kurumsal İletişim Müdürü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Oğuzhan Olcay               | Doğan Holding A.Ş.                               |
| Şehir: İstanbul / Beyoğlu | Görev: Kurumsal İletişim Müdürü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: İstanbul Üniversitesi - İletişim (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Oğuzhan Olcay');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Doğan', 'i'));
  });

  it('[ADVERSARIAL_141/500] Extract Uğur Özkul (Çağrı Merkezi Operasyon Müdürü) with format type 0', () => {
    const cv = `
Uğur Özkul
İstanbul / Kadıköy | 0532 999 00 11 | candidate@domain.com
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone Müşteri Hizmetleri A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Uğur Özkul');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Vodafone', 'i'));
  });

  it('[ADVERSARIAL_142/500] Extract Burak Şen (Kıdemli Backend Geliştirici) with format type 1', () => {
    const cv = `
********************************************************************************
Burak Şen — Kıdemli Backend Geliştirici
Ankara / Çankaya | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Trendyol Teknoloji A.Ş.
Kıdemli Backend Geliştirici (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
ODTÜ - Bilgisayar Mühendisliği (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Burak Şen');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[ADVERSARIAL_143/500] Extract Kemal Naşit (Kurumsal Finans Direktörü) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Kemal Naşit
İstanbul / Beşiktaş
Kurumsal Finans Direktörü

İŞ TECRÜBELERİ
Garanti BBVA A.Ş. (2017 - 2024)
Kurumsal Finans Direktörü
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Boğaziçi Üniversitesi - İşletme (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Kemal Naşit');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Garanti', 'i'));
  });

  it('[ADVERSARIAL_144/500] Extract Fatma Şentürk (Tedarik Zinciri Müdürü) with format type 3', () => {
    const cv = `
Fatma Şentürk
İzmir / Bornova | contact@example.com
Tedarik Zinciri Müdürü

WORK EXPERIENCE
Ekol Lojistik A.Ş. - Tedarik Zinciri Müdürü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Dokuz Eylül Üniversitesi - Endüstri Mühendisliği (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Fatma Şentürk');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İzmir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Ekol', 'i'));
  });

  it('[ADVERSARIAL_145/500] Extract Haluk Yalçın (İnsan Kaynakları Direktörü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Haluk Yalçın               | Koç Holding A.Ş.                               |
| Şehir: İstanbul / Üsküdar | Görev: İnsan Kaynakları Direktörü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: Marmara Üniversitesi - İktisadi ve İdari Bilimler (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Haluk Yalçın');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Koç', 'i'));
  });

  it('[ADVERSARIAL_146/500] Extract Zuhal Kaya (Dijital Pazarlama Müdürü) with format type 0', () => {
    const cv = `
Zuhal Kaya
İstanbul / Şişli | 0532 999 00 11 | candidate@domain.com
Dijital Pazarlama Müdürü

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Dijital Pazarlama Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
Galatasaray Üniversitesi - İletişim Fakültesi (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Zuhal Kaya');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[ADVERSARIAL_147/500] Extract Tarık Yılmaz (Saha Satış Yöneticisi) with format type 1', () => {
    const cv = `
********************************************************************************
Tarık Yılmaz — Saha Satış Yöneticisi
Eskişehir / Tepebaşı | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Migros Ticaret A.Ş.
Saha Satış Yöneticisi (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
Anadolu Üniversitesi - İktisat (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Tarık Yılmaz');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Eskişehir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Migros', 'i'));
  });

  it('[ADVERSARIAL_148/500] Extract Münir Demir (Operasyonel Mükemmellik Lideri) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Münir Demir
Kocaeli / Gebze
Operasyonel Mükemmellik Lideri

İŞ TECRÜBELERİ
Arçelik Sanayi A.Ş. (2017 - 2024)
Operasyonel Mükemmellik Lideri
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Yıldız Teknik Üniversitesi - Makine Mühendisliği (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Münir Demir');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Kocaeli');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[ADVERSARIAL_149/500] Extract Şener Çelik (Siber Güvenlik Direktörü) with format type 3', () => {
    const cv = `
Şener Çelik
Ankara / Yenimahalle | contact@example.com
Siber Güvenlik Direktörü

WORK EXPERIENCE
STM Savunma Teknolojileri A.Ş. - Siber Güvenlik Direktörü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Bilkent Üniversitesi - Elektrik Elektronik (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Şener Çelik');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('STM', 'i'));
  });

  it('[ADVERSARIAL_150/500] Extract Adile Soylu (Kurumsal İletişim Müdürü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Adile Soylu               | Doğan Holding A.Ş.                               |
| Şehir: İstanbul / Beyoğlu | Görev: Kurumsal İletişim Müdürü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: İstanbul Üniversitesi - İletişim (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Adile Soylu');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Doğan', 'i'));
  });

  it('[ADVERSARIAL_151/500] Extract Ceren Şimşek (Çağrı Merkezi Operasyon Müdürü) with format type 0', () => {
    const cv = `
Ceren Şimşek
İstanbul / Kadıköy | 0532 999 00 11 | candidate@domain.com
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone Müşteri Hizmetleri A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Ceren Şimşek');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Vodafone', 'i'));
  });

  it('[ADVERSARIAL_152/500] Extract Mert Karaca (Kıdemli Backend Geliştirici) with format type 1', () => {
    const cv = `
********************************************************************************
Mert Karaca — Kıdemli Backend Geliştirici
Ankara / Çankaya | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Trendyol Teknoloji A.Ş.
Kıdemli Backend Geliştirici (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
ODTÜ - Bilgisayar Mühendisliği (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mert Karaca');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[ADVERSARIAL_153/500] Extract Emre Korkmaz (Kurumsal Finans Direktörü) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Emre Korkmaz
İstanbul / Beşiktaş
Kurumsal Finans Direktörü

İŞ TECRÜBELERİ
Garanti BBVA A.Ş. (2017 - 2024)
Kurumsal Finans Direktörü
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Boğaziçi Üniversitesi - İşletme (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Emre Korkmaz');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Garanti', 'i'));
  });

  it('[ADVERSARIAL_154/500] Extract Ayşe Zaman (Tedarik Zinciri Müdürü) with format type 3', () => {
    const cv = `
Ayşe Zaman
İzmir / Bornova | contact@example.com
Tedarik Zinciri Müdürü

WORK EXPERIENCE
Ekol Lojistik A.Ş. - Tedarik Zinciri Müdürü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Dokuz Eylül Üniversitesi - Endüstri Mühendisliği (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Ayşe Zaman');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İzmir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Ekol', 'i'));
  });

  it('[ADVERSARIAL_155/500] Extract Mehmet Özdemir (İnsan Kaynakları Direktörü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Mehmet Özdemir               | Koç Holding A.Ş.                               |
| Şehir: İstanbul / Üsküdar | Görev: İnsan Kaynakları Direktörü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: Marmara Üniversitesi - İktisadi ve İdari Bilimler (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mehmet Özdemir');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Koç', 'i'));
  });

  it('[ADVERSARIAL_156/500] Extract Mustafa Sunal (Dijital Pazarlama Müdürü) with format type 0', () => {
    const cv = `
Mustafa Sunal
İstanbul / Şişli | 0532 999 00 11 | candidate@domain.com
Dijital Pazarlama Müdürü

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Dijital Pazarlama Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
Galatasaray Üniversitesi - İletişim Fakültesi (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mustafa Sunal');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[ADVERSARIAL_157/500] Extract Elif Girik (Saha Satış Yöneticisi) with format type 1', () => {
    const cv = `
********************************************************************************
Elif Girik — Saha Satış Yöneticisi
Eskişehir / Tepebaşı | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Migros Ticaret A.Ş.
Saha Satış Yöneticisi (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
Anadolu Üniversitesi - İktisat (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Elif Girik');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Eskişehir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Migros', 'i'));
  });

  it('[ADVERSARIAL_158/500] Extract Can Bilginer (Operasyonel Mükemmellik Lideri) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Can Bilginer
Kocaeli / Gebze
Operasyonel Mükemmellik Lideri

İŞ TECRÜBELERİ
Arçelik Sanayi A.Ş. (2017 - 2024)
Operasyonel Mükemmellik Lideri
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Yıldız Teknik Üniversitesi - Makine Mühendisliği (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Can Bilginer');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Kocaeli');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[ADVERSARIAL_159/500] Extract Zeynep Olcay (Siber Güvenlik Direktörü) with format type 3', () => {
    const cv = `
Zeynep Olcay
Ankara / Yenimahalle | contact@example.com
Siber Güvenlik Direktörü

WORK EXPERIENCE
STM Savunma Teknolojileri A.Ş. - Siber Güvenlik Direktörü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Bilkent Üniversitesi - Elektrik Elektronik (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Zeynep Olcay');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('STM', 'i'));
  });

  it('[ADVERSARIAL_160/500] Extract Oğuzhan Akan (Kurumsal İletişim Müdürü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Oğuzhan Akan               | Doğan Holding A.Ş.                               |
| Şehir: İstanbul / Beyoğlu | Görev: Kurumsal İletişim Müdürü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: İstanbul Üniversitesi - İletişim (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Oğuzhan Akan');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Doğan', 'i'));
  });

  it('[ADVERSARIAL_161/500] Extract Uğur Şen (Çağrı Merkezi Operasyon Müdürü) with format type 0', () => {
    const cv = `
Uğur Şen
İstanbul / Kadıköy | 0532 999 00 11 | candidate@domain.com
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone Müşteri Hizmetleri A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Uğur Şen');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Vodafone', 'i'));
  });

  it('[ADVERSARIAL_162/500] Extract Burak Naşit (Kıdemli Backend Geliştirici) with format type 1', () => {
    const cv = `
********************************************************************************
Burak Naşit — Kıdemli Backend Geliştirici
Ankara / Çankaya | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Trendyol Teknoloji A.Ş.
Kıdemli Backend Geliştirici (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
ODTÜ - Bilgisayar Mühendisliği (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Burak Naşit');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[ADVERSARIAL_163/500] Extract Kemal Şentürk (Kurumsal Finans Direktörü) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Kemal Şentürk
İstanbul / Beşiktaş
Kurumsal Finans Direktörü

İŞ TECRÜBELERİ
Garanti BBVA A.Ş. (2017 - 2024)
Kurumsal Finans Direktörü
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Boğaziçi Üniversitesi - İşletme (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Kemal Şentürk');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Garanti', 'i'));
  });

  it('[ADVERSARIAL_164/500] Extract Fatma Yalçın (Tedarik Zinciri Müdürü) with format type 3', () => {
    const cv = `
Fatma Yalçın
İzmir / Bornova | contact@example.com
Tedarik Zinciri Müdürü

WORK EXPERIENCE
Ekol Lojistik A.Ş. - Tedarik Zinciri Müdürü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Dokuz Eylül Üniversitesi - Endüstri Mühendisliği (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Fatma Yalçın');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İzmir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Ekol', 'i'));
  });

  it('[ADVERSARIAL_165/500] Extract Haluk Kaya (İnsan Kaynakları Direktörü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Haluk Kaya               | Koç Holding A.Ş.                               |
| Şehir: İstanbul / Üsküdar | Görev: İnsan Kaynakları Direktörü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: Marmara Üniversitesi - İktisadi ve İdari Bilimler (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Haluk Kaya');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Koç', 'i'));
  });

  it('[ADVERSARIAL_166/500] Extract Zuhal Yılmaz (Dijital Pazarlama Müdürü) with format type 0', () => {
    const cv = `
Zuhal Yılmaz
İstanbul / Şişli | 0532 999 00 11 | candidate@domain.com
Dijital Pazarlama Müdürü

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Dijital Pazarlama Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
Galatasaray Üniversitesi - İletişim Fakültesi (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Zuhal Yılmaz');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[ADVERSARIAL_167/500] Extract Tarık Demir (Saha Satış Yöneticisi) with format type 1', () => {
    const cv = `
********************************************************************************
Tarık Demir — Saha Satış Yöneticisi
Eskişehir / Tepebaşı | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Migros Ticaret A.Ş.
Saha Satış Yöneticisi (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
Anadolu Üniversitesi - İktisat (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Tarık Demir');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Eskişehir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Migros', 'i'));
  });

  it('[ADVERSARIAL_168/500] Extract Münir Çelik (Operasyonel Mükemmellik Lideri) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Münir Çelik
Kocaeli / Gebze
Operasyonel Mükemmellik Lideri

İŞ TECRÜBELERİ
Arçelik Sanayi A.Ş. (2017 - 2024)
Operasyonel Mükemmellik Lideri
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Yıldız Teknik Üniversitesi - Makine Mühendisliği (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Münir Çelik');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Kocaeli');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[ADVERSARIAL_169/500] Extract Şener Soylu (Siber Güvenlik Direktörü) with format type 3', () => {
    const cv = `
Şener Soylu
Ankara / Yenimahalle | contact@example.com
Siber Güvenlik Direktörü

WORK EXPERIENCE
STM Savunma Teknolojileri A.Ş. - Siber Güvenlik Direktörü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Bilkent Üniversitesi - Elektrik Elektronik (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Şener Soylu');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('STM', 'i'));
  });

  it('[ADVERSARIAL_170/500] Extract Adile Şimşek (Kurumsal İletişim Müdürü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Adile Şimşek               | Doğan Holding A.Ş.                               |
| Şehir: İstanbul / Beyoğlu | Görev: Kurumsal İletişim Müdürü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: İstanbul Üniversitesi - İletişim (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Adile Şimşek');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Doğan', 'i'));
  });

  it('[ADVERSARIAL_171/500] Extract Ceren Karaca (Çağrı Merkezi Operasyon Müdürü) with format type 0', () => {
    const cv = `
Ceren Karaca
İstanbul / Kadıköy | 0532 999 00 11 | candidate@domain.com
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone Müşteri Hizmetleri A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Ceren Karaca');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Vodafone', 'i'));
  });

  it('[ADVERSARIAL_172/500] Extract Mert Korkmaz (Kıdemli Backend Geliştirici) with format type 1', () => {
    const cv = `
********************************************************************************
Mert Korkmaz — Kıdemli Backend Geliştirici
Ankara / Çankaya | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Trendyol Teknoloji A.Ş.
Kıdemli Backend Geliştirici (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
ODTÜ - Bilgisayar Mühendisliği (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mert Korkmaz');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[ADVERSARIAL_173/500] Extract Emre Zaman (Kurumsal Finans Direktörü) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Emre Zaman
İstanbul / Beşiktaş
Kurumsal Finans Direktörü

İŞ TECRÜBELERİ
Garanti BBVA A.Ş. (2017 - 2024)
Kurumsal Finans Direktörü
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Boğaziçi Üniversitesi - İşletme (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Emre Zaman');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Garanti', 'i'));
  });

  it('[ADVERSARIAL_174/500] Extract Ayşe Özdemir (Tedarik Zinciri Müdürü) with format type 3', () => {
    const cv = `
Ayşe Özdemir
İzmir / Bornova | contact@example.com
Tedarik Zinciri Müdürü

WORK EXPERIENCE
Ekol Lojistik A.Ş. - Tedarik Zinciri Müdürü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Dokuz Eylül Üniversitesi - Endüstri Mühendisliği (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Ayşe Özdemir');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İzmir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Ekol', 'i'));
  });

  it('[ADVERSARIAL_175/500] Extract Mehmet Sunal (İnsan Kaynakları Direktörü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Mehmet Sunal               | Koç Holding A.Ş.                               |
| Şehir: İstanbul / Üsküdar | Görev: İnsan Kaynakları Direktörü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: Marmara Üniversitesi - İktisadi ve İdari Bilimler (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mehmet Sunal');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Koç', 'i'));
  });

  it('[ADVERSARIAL_176/500] Extract Mustafa Girik (Dijital Pazarlama Müdürü) with format type 0', () => {
    const cv = `
Mustafa Girik
İstanbul / Şişli | 0532 999 00 11 | candidate@domain.com
Dijital Pazarlama Müdürü

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Dijital Pazarlama Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
Galatasaray Üniversitesi - İletişim Fakültesi (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mustafa Girik');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[ADVERSARIAL_177/500] Extract Elif Bilginer (Saha Satış Yöneticisi) with format type 1', () => {
    const cv = `
********************************************************************************
Elif Bilginer — Saha Satış Yöneticisi
Eskişehir / Tepebaşı | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Migros Ticaret A.Ş.
Saha Satış Yöneticisi (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
Anadolu Üniversitesi - İktisat (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Elif Bilginer');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Eskişehir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Migros', 'i'));
  });

  it('[ADVERSARIAL_178/500] Extract Can Olcay (Operasyonel Mükemmellik Lideri) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Can Olcay
Kocaeli / Gebze
Operasyonel Mükemmellik Lideri

İŞ TECRÜBELERİ
Arçelik Sanayi A.Ş. (2017 - 2024)
Operasyonel Mükemmellik Lideri
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Yıldız Teknik Üniversitesi - Makine Mühendisliği (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Can Olcay');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Kocaeli');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[ADVERSARIAL_179/500] Extract Zeynep Akan (Siber Güvenlik Direktörü) with format type 3', () => {
    const cv = `
Zeynep Akan
Ankara / Yenimahalle | contact@example.com
Siber Güvenlik Direktörü

WORK EXPERIENCE
STM Savunma Teknolojileri A.Ş. - Siber Güvenlik Direktörü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Bilkent Üniversitesi - Elektrik Elektronik (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Zeynep Akan');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('STM', 'i'));
  });

  it('[ADVERSARIAL_180/500] Extract Oğuzhan Özkul (Kurumsal İletişim Müdürü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Oğuzhan Özkul               | Doğan Holding A.Ş.                               |
| Şehir: İstanbul / Beyoğlu | Görev: Kurumsal İletişim Müdürü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: İstanbul Üniversitesi - İletişim (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Oğuzhan Özkul');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Doğan', 'i'));
  });

  it('[ADVERSARIAL_181/500] Extract Uğur Naşit (Çağrı Merkezi Operasyon Müdürü) with format type 0', () => {
    const cv = `
Uğur Naşit
İstanbul / Kadıköy | 0532 999 00 11 | candidate@domain.com
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone Müşteri Hizmetleri A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Uğur Naşit');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Vodafone', 'i'));
  });

  it('[ADVERSARIAL_182/500] Extract Burak Şentürk (Kıdemli Backend Geliştirici) with format type 1', () => {
    const cv = `
********************************************************************************
Burak Şentürk — Kıdemli Backend Geliştirici
Ankara / Çankaya | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Trendyol Teknoloji A.Ş.
Kıdemli Backend Geliştirici (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
ODTÜ - Bilgisayar Mühendisliği (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Burak Şentürk');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[ADVERSARIAL_183/500] Extract Kemal Yalçın (Kurumsal Finans Direktörü) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Kemal Yalçın
İstanbul / Beşiktaş
Kurumsal Finans Direktörü

İŞ TECRÜBELERİ
Garanti BBVA A.Ş. (2017 - 2024)
Kurumsal Finans Direktörü
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Boğaziçi Üniversitesi - İşletme (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Kemal Yalçın');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Garanti', 'i'));
  });

  it('[ADVERSARIAL_184/500] Extract Fatma Kaya (Tedarik Zinciri Müdürü) with format type 3', () => {
    const cv = `
Fatma Kaya
İzmir / Bornova | contact@example.com
Tedarik Zinciri Müdürü

WORK EXPERIENCE
Ekol Lojistik A.Ş. - Tedarik Zinciri Müdürü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Dokuz Eylül Üniversitesi - Endüstri Mühendisliği (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Fatma Kaya');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İzmir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Ekol', 'i'));
  });

  it('[ADVERSARIAL_185/500] Extract Haluk Yılmaz (İnsan Kaynakları Direktörü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Haluk Yılmaz               | Koç Holding A.Ş.                               |
| Şehir: İstanbul / Üsküdar | Görev: İnsan Kaynakları Direktörü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: Marmara Üniversitesi - İktisadi ve İdari Bilimler (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Haluk Yılmaz');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Koç', 'i'));
  });

  it('[ADVERSARIAL_186/500] Extract Zuhal Demir (Dijital Pazarlama Müdürü) with format type 0', () => {
    const cv = `
Zuhal Demir
İstanbul / Şişli | 0532 999 00 11 | candidate@domain.com
Dijital Pazarlama Müdürü

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Dijital Pazarlama Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
Galatasaray Üniversitesi - İletişim Fakültesi (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Zuhal Demir');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[ADVERSARIAL_187/500] Extract Tarık Çelik (Saha Satış Yöneticisi) with format type 1', () => {
    const cv = `
********************************************************************************
Tarık Çelik — Saha Satış Yöneticisi
Eskişehir / Tepebaşı | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Migros Ticaret A.Ş.
Saha Satış Yöneticisi (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
Anadolu Üniversitesi - İktisat (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Tarık Çelik');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Eskişehir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Migros', 'i'));
  });

  it('[ADVERSARIAL_188/500] Extract Münir Soylu (Operasyonel Mükemmellik Lideri) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Münir Soylu
Kocaeli / Gebze
Operasyonel Mükemmellik Lideri

İŞ TECRÜBELERİ
Arçelik Sanayi A.Ş. (2017 - 2024)
Operasyonel Mükemmellik Lideri
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Yıldız Teknik Üniversitesi - Makine Mühendisliği (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Münir Soylu');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Kocaeli');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[ADVERSARIAL_189/500] Extract Şener Şimşek (Siber Güvenlik Direktörü) with format type 3', () => {
    const cv = `
Şener Şimşek
Ankara / Yenimahalle | contact@example.com
Siber Güvenlik Direktörü

WORK EXPERIENCE
STM Savunma Teknolojileri A.Ş. - Siber Güvenlik Direktörü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Bilkent Üniversitesi - Elektrik Elektronik (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Şener Şimşek');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('STM', 'i'));
  });

  it('[ADVERSARIAL_190/500] Extract Adile Karaca (Kurumsal İletişim Müdürü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Adile Karaca               | Doğan Holding A.Ş.                               |
| Şehir: İstanbul / Beyoğlu | Görev: Kurumsal İletişim Müdürü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: İstanbul Üniversitesi - İletişim (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Adile Karaca');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Doğan', 'i'));
  });

  it('[ADVERSARIAL_191/500] Extract Ceren Korkmaz (Çağrı Merkezi Operasyon Müdürü) with format type 0', () => {
    const cv = `
Ceren Korkmaz
İstanbul / Kadıköy | 0532 999 00 11 | candidate@domain.com
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone Müşteri Hizmetleri A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Ceren Korkmaz');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Vodafone', 'i'));
  });

  it('[ADVERSARIAL_192/500] Extract Mert Zaman (Kıdemli Backend Geliştirici) with format type 1', () => {
    const cv = `
********************************************************************************
Mert Zaman — Kıdemli Backend Geliştirici
Ankara / Çankaya | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Trendyol Teknoloji A.Ş.
Kıdemli Backend Geliştirici (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
ODTÜ - Bilgisayar Mühendisliği (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mert Zaman');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[ADVERSARIAL_193/500] Extract Emre Özdemir (Kurumsal Finans Direktörü) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Emre Özdemir
İstanbul / Beşiktaş
Kurumsal Finans Direktörü

İŞ TECRÜBELERİ
Garanti BBVA A.Ş. (2017 - 2024)
Kurumsal Finans Direktörü
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Boğaziçi Üniversitesi - İşletme (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Emre Özdemir');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Garanti', 'i'));
  });

  it('[ADVERSARIAL_194/500] Extract Ayşe Sunal (Tedarik Zinciri Müdürü) with format type 3', () => {
    const cv = `
Ayşe Sunal
İzmir / Bornova | contact@example.com
Tedarik Zinciri Müdürü

WORK EXPERIENCE
Ekol Lojistik A.Ş. - Tedarik Zinciri Müdürü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Dokuz Eylül Üniversitesi - Endüstri Mühendisliği (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Ayşe Sunal');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İzmir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Ekol', 'i'));
  });

  it('[ADVERSARIAL_195/500] Extract Mehmet Girik (İnsan Kaynakları Direktörü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Mehmet Girik               | Koç Holding A.Ş.                               |
| Şehir: İstanbul / Üsküdar | Görev: İnsan Kaynakları Direktörü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: Marmara Üniversitesi - İktisadi ve İdari Bilimler (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mehmet Girik');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Koç', 'i'));
  });

  it('[ADVERSARIAL_196/500] Extract Mustafa Bilginer (Dijital Pazarlama Müdürü) with format type 0', () => {
    const cv = `
Mustafa Bilginer
İstanbul / Şişli | 0532 999 00 11 | candidate@domain.com
Dijital Pazarlama Müdürü

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Dijital Pazarlama Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
Galatasaray Üniversitesi - İletişim Fakültesi (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mustafa Bilginer');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[ADVERSARIAL_197/500] Extract Elif Olcay (Saha Satış Yöneticisi) with format type 1', () => {
    const cv = `
********************************************************************************
Elif Olcay — Saha Satış Yöneticisi
Eskişehir / Tepebaşı | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Migros Ticaret A.Ş.
Saha Satış Yöneticisi (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
Anadolu Üniversitesi - İktisat (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Elif Olcay');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Eskişehir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Migros', 'i'));
  });

  it('[ADVERSARIAL_198/500] Extract Can Akan (Operasyonel Mükemmellik Lideri) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Can Akan
Kocaeli / Gebze
Operasyonel Mükemmellik Lideri

İŞ TECRÜBELERİ
Arçelik Sanayi A.Ş. (2017 - 2024)
Operasyonel Mükemmellik Lideri
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Yıldız Teknik Üniversitesi - Makine Mühendisliği (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Can Akan');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Kocaeli');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[ADVERSARIAL_199/500] Extract Zeynep Özkul (Siber Güvenlik Direktörü) with format type 3', () => {
    const cv = `
Zeynep Özkul
Ankara / Yenimahalle | contact@example.com
Siber Güvenlik Direktörü

WORK EXPERIENCE
STM Savunma Teknolojileri A.Ş. - Siber Güvenlik Direktörü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Bilkent Üniversitesi - Elektrik Elektronik (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Zeynep Özkul');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('STM', 'i'));
  });

  it('[ADVERSARIAL_200/500] Extract Oğuzhan Şen (Kurumsal İletişim Müdürü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Oğuzhan Şen               | Doğan Holding A.Ş.                               |
| Şehir: İstanbul / Beyoğlu | Görev: Kurumsal İletişim Müdürü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: İstanbul Üniversitesi - İletişim (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Oğuzhan Şen');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Doğan', 'i'));
  });

  it('[ADVERSARIAL_201/500] Extract Uğur Şentürk (Çağrı Merkezi Operasyon Müdürü) with format type 0', () => {
    const cv = `
Uğur Şentürk
İstanbul / Kadıköy | 0532 999 00 11 | candidate@domain.com
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone Müşteri Hizmetleri A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Uğur Şentürk');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Vodafone', 'i'));
  });

  it('[ADVERSARIAL_202/500] Extract Burak Yalçın (Kıdemli Backend Geliştirici) with format type 1', () => {
    const cv = `
********************************************************************************
Burak Yalçın — Kıdemli Backend Geliştirici
Ankara / Çankaya | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Trendyol Teknoloji A.Ş.
Kıdemli Backend Geliştirici (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
ODTÜ - Bilgisayar Mühendisliği (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Burak Yalçın');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[ADVERSARIAL_203/500] Extract Kemal Kaya (Kurumsal Finans Direktörü) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Kemal Kaya
İstanbul / Beşiktaş
Kurumsal Finans Direktörü

İŞ TECRÜBELERİ
Garanti BBVA A.Ş. (2017 - 2024)
Kurumsal Finans Direktörü
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Boğaziçi Üniversitesi - İşletme (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Kemal Kaya');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Garanti', 'i'));
  });

  it('[ADVERSARIAL_204/500] Extract Fatma Yılmaz (Tedarik Zinciri Müdürü) with format type 3', () => {
    const cv = `
Fatma Yılmaz
İzmir / Bornova | contact@example.com
Tedarik Zinciri Müdürü

WORK EXPERIENCE
Ekol Lojistik A.Ş. - Tedarik Zinciri Müdürü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Dokuz Eylül Üniversitesi - Endüstri Mühendisliği (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Fatma Yılmaz');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İzmir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Ekol', 'i'));
  });

  it('[ADVERSARIAL_205/500] Extract Haluk Demir (İnsan Kaynakları Direktörü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Haluk Demir               | Koç Holding A.Ş.                               |
| Şehir: İstanbul / Üsküdar | Görev: İnsan Kaynakları Direktörü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: Marmara Üniversitesi - İktisadi ve İdari Bilimler (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Haluk Demir');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Koç', 'i'));
  });

  it('[ADVERSARIAL_206/500] Extract Zuhal Çelik (Dijital Pazarlama Müdürü) with format type 0', () => {
    const cv = `
Zuhal Çelik
İstanbul / Şişli | 0532 999 00 11 | candidate@domain.com
Dijital Pazarlama Müdürü

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Dijital Pazarlama Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
Galatasaray Üniversitesi - İletişim Fakültesi (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Zuhal Çelik');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[ADVERSARIAL_207/500] Extract Tarık Soylu (Saha Satış Yöneticisi) with format type 1', () => {
    const cv = `
********************************************************************************
Tarık Soylu — Saha Satış Yöneticisi
Eskişehir / Tepebaşı | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Migros Ticaret A.Ş.
Saha Satış Yöneticisi (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
Anadolu Üniversitesi - İktisat (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Tarık Soylu');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Eskişehir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Migros', 'i'));
  });

  it('[ADVERSARIAL_208/500] Extract Münir Şimşek (Operasyonel Mükemmellik Lideri) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Münir Şimşek
Kocaeli / Gebze
Operasyonel Mükemmellik Lideri

İŞ TECRÜBELERİ
Arçelik Sanayi A.Ş. (2017 - 2024)
Operasyonel Mükemmellik Lideri
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Yıldız Teknik Üniversitesi - Makine Mühendisliği (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Münir Şimşek');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Kocaeli');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[ADVERSARIAL_209/500] Extract Şener Karaca (Siber Güvenlik Direktörü) with format type 3', () => {
    const cv = `
Şener Karaca
Ankara / Yenimahalle | contact@example.com
Siber Güvenlik Direktörü

WORK EXPERIENCE
STM Savunma Teknolojileri A.Ş. - Siber Güvenlik Direktörü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Bilkent Üniversitesi - Elektrik Elektronik (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Şener Karaca');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('STM', 'i'));
  });

  it('[ADVERSARIAL_210/500] Extract Adile Korkmaz (Kurumsal İletişim Müdürü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Adile Korkmaz               | Doğan Holding A.Ş.                               |
| Şehir: İstanbul / Beyoğlu | Görev: Kurumsal İletişim Müdürü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: İstanbul Üniversitesi - İletişim (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Adile Korkmaz');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Doğan', 'i'));
  });

  it('[ADVERSARIAL_211/500] Extract Ceren Zaman (Çağrı Merkezi Operasyon Müdürü) with format type 0', () => {
    const cv = `
Ceren Zaman
İstanbul / Kadıköy | 0532 999 00 11 | candidate@domain.com
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone Müşteri Hizmetleri A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Ceren Zaman');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Vodafone', 'i'));
  });

  it('[ADVERSARIAL_212/500] Extract Mert Özdemir (Kıdemli Backend Geliştirici) with format type 1', () => {
    const cv = `
********************************************************************************
Mert Özdemir — Kıdemli Backend Geliştirici
Ankara / Çankaya | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Trendyol Teknoloji A.Ş.
Kıdemli Backend Geliştirici (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
ODTÜ - Bilgisayar Mühendisliği (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mert Özdemir');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[ADVERSARIAL_213/500] Extract Emre Sunal (Kurumsal Finans Direktörü) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Emre Sunal
İstanbul / Beşiktaş
Kurumsal Finans Direktörü

İŞ TECRÜBELERİ
Garanti BBVA A.Ş. (2017 - 2024)
Kurumsal Finans Direktörü
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Boğaziçi Üniversitesi - İşletme (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Emre Sunal');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Garanti', 'i'));
  });

  it('[ADVERSARIAL_214/500] Extract Ayşe Girik (Tedarik Zinciri Müdürü) with format type 3', () => {
    const cv = `
Ayşe Girik
İzmir / Bornova | contact@example.com
Tedarik Zinciri Müdürü

WORK EXPERIENCE
Ekol Lojistik A.Ş. - Tedarik Zinciri Müdürü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Dokuz Eylül Üniversitesi - Endüstri Mühendisliği (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Ayşe Girik');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İzmir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Ekol', 'i'));
  });

  it('[ADVERSARIAL_215/500] Extract Mehmet Bilginer (İnsan Kaynakları Direktörü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Mehmet Bilginer               | Koç Holding A.Ş.                               |
| Şehir: İstanbul / Üsküdar | Görev: İnsan Kaynakları Direktörü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: Marmara Üniversitesi - İktisadi ve İdari Bilimler (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mehmet Bilginer');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Koç', 'i'));
  });

  it('[ADVERSARIAL_216/500] Extract Mustafa Olcay (Dijital Pazarlama Müdürü) with format type 0', () => {
    const cv = `
Mustafa Olcay
İstanbul / Şişli | 0532 999 00 11 | candidate@domain.com
Dijital Pazarlama Müdürü

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Dijital Pazarlama Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
Galatasaray Üniversitesi - İletişim Fakültesi (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mustafa Olcay');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[ADVERSARIAL_217/500] Extract Elif Akan (Saha Satış Yöneticisi) with format type 1', () => {
    const cv = `
********************************************************************************
Elif Akan — Saha Satış Yöneticisi
Eskişehir / Tepebaşı | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Migros Ticaret A.Ş.
Saha Satış Yöneticisi (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
Anadolu Üniversitesi - İktisat (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Elif Akan');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Eskişehir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Migros', 'i'));
  });

  it('[ADVERSARIAL_218/500] Extract Can Özkul (Operasyonel Mükemmellik Lideri) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Can Özkul
Kocaeli / Gebze
Operasyonel Mükemmellik Lideri

İŞ TECRÜBELERİ
Arçelik Sanayi A.Ş. (2017 - 2024)
Operasyonel Mükemmellik Lideri
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Yıldız Teknik Üniversitesi - Makine Mühendisliği (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Can Özkul');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Kocaeli');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[ADVERSARIAL_219/500] Extract Zeynep Şen (Siber Güvenlik Direktörü) with format type 3', () => {
    const cv = `
Zeynep Şen
Ankara / Yenimahalle | contact@example.com
Siber Güvenlik Direktörü

WORK EXPERIENCE
STM Savunma Teknolojileri A.Ş. - Siber Güvenlik Direktörü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Bilkent Üniversitesi - Elektrik Elektronik (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Zeynep Şen');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('STM', 'i'));
  });

  it('[ADVERSARIAL_220/500] Extract Oğuzhan Naşit (Kurumsal İletişim Müdürü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Oğuzhan Naşit               | Doğan Holding A.Ş.                               |
| Şehir: İstanbul / Beyoğlu | Görev: Kurumsal İletişim Müdürü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: İstanbul Üniversitesi - İletişim (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Oğuzhan Naşit');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Doğan', 'i'));
  });

  it('[ADVERSARIAL_221/500] Extract Uğur Yalçın (Çağrı Merkezi Operasyon Müdürü) with format type 0', () => {
    const cv = `
Uğur Yalçın
İstanbul / Kadıköy | 0532 999 00 11 | candidate@domain.com
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone Müşteri Hizmetleri A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Uğur Yalçın');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Vodafone', 'i'));
  });

  it('[ADVERSARIAL_222/500] Extract Burak Kaya (Kıdemli Backend Geliştirici) with format type 1', () => {
    const cv = `
********************************************************************************
Burak Kaya — Kıdemli Backend Geliştirici
Ankara / Çankaya | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Trendyol Teknoloji A.Ş.
Kıdemli Backend Geliştirici (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
ODTÜ - Bilgisayar Mühendisliği (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Burak Kaya');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[ADVERSARIAL_223/500] Extract Kemal Yılmaz (Kurumsal Finans Direktörü) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Kemal Yılmaz
İstanbul / Beşiktaş
Kurumsal Finans Direktörü

İŞ TECRÜBELERİ
Garanti BBVA A.Ş. (2017 - 2024)
Kurumsal Finans Direktörü
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Boğaziçi Üniversitesi - İşletme (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Kemal Yılmaz');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Garanti', 'i'));
  });

  it('[ADVERSARIAL_224/500] Extract Fatma Demir (Tedarik Zinciri Müdürü) with format type 3', () => {
    const cv = `
Fatma Demir
İzmir / Bornova | contact@example.com
Tedarik Zinciri Müdürü

WORK EXPERIENCE
Ekol Lojistik A.Ş. - Tedarik Zinciri Müdürü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Dokuz Eylül Üniversitesi - Endüstri Mühendisliği (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Fatma Demir');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İzmir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Ekol', 'i'));
  });

  it('[ADVERSARIAL_225/500] Extract Haluk Çelik (İnsan Kaynakları Direktörü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Haluk Çelik               | Koç Holding A.Ş.                               |
| Şehir: İstanbul / Üsküdar | Görev: İnsan Kaynakları Direktörü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: Marmara Üniversitesi - İktisadi ve İdari Bilimler (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Haluk Çelik');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Koç', 'i'));
  });

  it('[ADVERSARIAL_226/500] Extract Zuhal Soylu (Dijital Pazarlama Müdürü) with format type 0', () => {
    const cv = `
Zuhal Soylu
İstanbul / Şişli | 0532 999 00 11 | candidate@domain.com
Dijital Pazarlama Müdürü

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Dijital Pazarlama Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
Galatasaray Üniversitesi - İletişim Fakültesi (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Zuhal Soylu');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[ADVERSARIAL_227/500] Extract Tarık Şimşek (Saha Satış Yöneticisi) with format type 1', () => {
    const cv = `
********************************************************************************
Tarık Şimşek — Saha Satış Yöneticisi
Eskişehir / Tepebaşı | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Migros Ticaret A.Ş.
Saha Satış Yöneticisi (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
Anadolu Üniversitesi - İktisat (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Tarık Şimşek');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Eskişehir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Migros', 'i'));
  });

  it('[ADVERSARIAL_228/500] Extract Münir Karaca (Operasyonel Mükemmellik Lideri) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Münir Karaca
Kocaeli / Gebze
Operasyonel Mükemmellik Lideri

İŞ TECRÜBELERİ
Arçelik Sanayi A.Ş. (2017 - 2024)
Operasyonel Mükemmellik Lideri
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Yıldız Teknik Üniversitesi - Makine Mühendisliği (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Münir Karaca');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Kocaeli');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[ADVERSARIAL_229/500] Extract Şener Korkmaz (Siber Güvenlik Direktörü) with format type 3', () => {
    const cv = `
Şener Korkmaz
Ankara / Yenimahalle | contact@example.com
Siber Güvenlik Direktörü

WORK EXPERIENCE
STM Savunma Teknolojileri A.Ş. - Siber Güvenlik Direktörü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Bilkent Üniversitesi - Elektrik Elektronik (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Şener Korkmaz');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('STM', 'i'));
  });

  it('[ADVERSARIAL_230/500] Extract Adile Zaman (Kurumsal İletişim Müdürü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Adile Zaman               | Doğan Holding A.Ş.                               |
| Şehir: İstanbul / Beyoğlu | Görev: Kurumsal İletişim Müdürü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: İstanbul Üniversitesi - İletişim (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Adile Zaman');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Doğan', 'i'));
  });

  it('[ADVERSARIAL_231/500] Extract Ceren Özdemir (Çağrı Merkezi Operasyon Müdürü) with format type 0', () => {
    const cv = `
Ceren Özdemir
İstanbul / Kadıköy | 0532 999 00 11 | candidate@domain.com
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone Müşteri Hizmetleri A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Ceren Özdemir');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Vodafone', 'i'));
  });

  it('[ADVERSARIAL_232/500] Extract Mert Sunal (Kıdemli Backend Geliştirici) with format type 1', () => {
    const cv = `
********************************************************************************
Mert Sunal — Kıdemli Backend Geliştirici
Ankara / Çankaya | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Trendyol Teknoloji A.Ş.
Kıdemli Backend Geliştirici (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
ODTÜ - Bilgisayar Mühendisliği (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mert Sunal');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[ADVERSARIAL_233/500] Extract Emre Girik (Kurumsal Finans Direktörü) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Emre Girik
İstanbul / Beşiktaş
Kurumsal Finans Direktörü

İŞ TECRÜBELERİ
Garanti BBVA A.Ş. (2017 - 2024)
Kurumsal Finans Direktörü
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Boğaziçi Üniversitesi - İşletme (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Emre Girik');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Garanti', 'i'));
  });

  it('[ADVERSARIAL_234/500] Extract Ayşe Bilginer (Tedarik Zinciri Müdürü) with format type 3', () => {
    const cv = `
Ayşe Bilginer
İzmir / Bornova | contact@example.com
Tedarik Zinciri Müdürü

WORK EXPERIENCE
Ekol Lojistik A.Ş. - Tedarik Zinciri Müdürü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Dokuz Eylül Üniversitesi - Endüstri Mühendisliği (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Ayşe Bilginer');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İzmir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Ekol', 'i'));
  });

  it('[ADVERSARIAL_235/500] Extract Mehmet Olcay (İnsan Kaynakları Direktörü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Mehmet Olcay               | Koç Holding A.Ş.                               |
| Şehir: İstanbul / Üsküdar | Görev: İnsan Kaynakları Direktörü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: Marmara Üniversitesi - İktisadi ve İdari Bilimler (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mehmet Olcay');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Koç', 'i'));
  });

  it('[ADVERSARIAL_236/500] Extract Mustafa Akan (Dijital Pazarlama Müdürü) with format type 0', () => {
    const cv = `
Mustafa Akan
İstanbul / Şişli | 0532 999 00 11 | candidate@domain.com
Dijital Pazarlama Müdürü

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Dijital Pazarlama Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
Galatasaray Üniversitesi - İletişim Fakültesi (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mustafa Akan');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[ADVERSARIAL_237/500] Extract Elif Özkul (Saha Satış Yöneticisi) with format type 1', () => {
    const cv = `
********************************************************************************
Elif Özkul — Saha Satış Yöneticisi
Eskişehir / Tepebaşı | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Migros Ticaret A.Ş.
Saha Satış Yöneticisi (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
Anadolu Üniversitesi - İktisat (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Elif Özkul');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Eskişehir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Migros', 'i'));
  });

  it('[ADVERSARIAL_238/500] Extract Can Şen (Operasyonel Mükemmellik Lideri) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Can Şen
Kocaeli / Gebze
Operasyonel Mükemmellik Lideri

İŞ TECRÜBELERİ
Arçelik Sanayi A.Ş. (2017 - 2024)
Operasyonel Mükemmellik Lideri
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Yıldız Teknik Üniversitesi - Makine Mühendisliği (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Can Şen');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Kocaeli');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[ADVERSARIAL_239/500] Extract Zeynep Naşit (Siber Güvenlik Direktörü) with format type 3', () => {
    const cv = `
Zeynep Naşit
Ankara / Yenimahalle | contact@example.com
Siber Güvenlik Direktörü

WORK EXPERIENCE
STM Savunma Teknolojileri A.Ş. - Siber Güvenlik Direktörü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Bilkent Üniversitesi - Elektrik Elektronik (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Zeynep Naşit');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('STM', 'i'));
  });

  it('[ADVERSARIAL_240/500] Extract Oğuzhan Şentürk (Kurumsal İletişim Müdürü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Oğuzhan Şentürk               | Doğan Holding A.Ş.                               |
| Şehir: İstanbul / Beyoğlu | Görev: Kurumsal İletişim Müdürü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: İstanbul Üniversitesi - İletişim (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Oğuzhan Şentürk');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Doğan', 'i'));
  });

  it('[ADVERSARIAL_241/500] Extract Uğur Kaya (Çağrı Merkezi Operasyon Müdürü) with format type 0', () => {
    const cv = `
Uğur Kaya
İstanbul / Kadıköy | 0532 999 00 11 | candidate@domain.com
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone Müşteri Hizmetleri A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Uğur Kaya');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Vodafone', 'i'));
  });

  it('[ADVERSARIAL_242/500] Extract Burak Yılmaz (Kıdemli Backend Geliştirici) with format type 1', () => {
    const cv = `
********************************************************************************
Burak Yılmaz — Kıdemli Backend Geliştirici
Ankara / Çankaya | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Trendyol Teknoloji A.Ş.
Kıdemli Backend Geliştirici (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
ODTÜ - Bilgisayar Mühendisliği (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Burak Yılmaz');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[ADVERSARIAL_243/500] Extract Kemal Demir (Kurumsal Finans Direktörü) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Kemal Demir
İstanbul / Beşiktaş
Kurumsal Finans Direktörü

İŞ TECRÜBELERİ
Garanti BBVA A.Ş. (2017 - 2024)
Kurumsal Finans Direktörü
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Boğaziçi Üniversitesi - İşletme (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Kemal Demir');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Garanti', 'i'));
  });

  it('[ADVERSARIAL_244/500] Extract Fatma Çelik (Tedarik Zinciri Müdürü) with format type 3', () => {
    const cv = `
Fatma Çelik
İzmir / Bornova | contact@example.com
Tedarik Zinciri Müdürü

WORK EXPERIENCE
Ekol Lojistik A.Ş. - Tedarik Zinciri Müdürü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Dokuz Eylül Üniversitesi - Endüstri Mühendisliği (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Fatma Çelik');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İzmir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Ekol', 'i'));
  });

  it('[ADVERSARIAL_245/500] Extract Haluk Soylu (İnsan Kaynakları Direktörü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Haluk Soylu               | Koç Holding A.Ş.                               |
| Şehir: İstanbul / Üsküdar | Görev: İnsan Kaynakları Direktörü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: Marmara Üniversitesi - İktisadi ve İdari Bilimler (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Haluk Soylu');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Koç', 'i'));
  });

  it('[ADVERSARIAL_246/500] Extract Zuhal Şimşek (Dijital Pazarlama Müdürü) with format type 0', () => {
    const cv = `
Zuhal Şimşek
İstanbul / Şişli | 0532 999 00 11 | candidate@domain.com
Dijital Pazarlama Müdürü

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Dijital Pazarlama Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
Galatasaray Üniversitesi - İletişim Fakültesi (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Zuhal Şimşek');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[ADVERSARIAL_247/500] Extract Tarık Karaca (Saha Satış Yöneticisi) with format type 1', () => {
    const cv = `
********************************************************************************
Tarık Karaca — Saha Satış Yöneticisi
Eskişehir / Tepebaşı | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Migros Ticaret A.Ş.
Saha Satış Yöneticisi (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
Anadolu Üniversitesi - İktisat (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Tarık Karaca');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Eskişehir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Migros', 'i'));
  });

  it('[ADVERSARIAL_248/500] Extract Münir Korkmaz (Operasyonel Mükemmellik Lideri) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Münir Korkmaz
Kocaeli / Gebze
Operasyonel Mükemmellik Lideri

İŞ TECRÜBELERİ
Arçelik Sanayi A.Ş. (2017 - 2024)
Operasyonel Mükemmellik Lideri
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Yıldız Teknik Üniversitesi - Makine Mühendisliği (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Münir Korkmaz');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Kocaeli');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[ADVERSARIAL_249/500] Extract Şener Zaman (Siber Güvenlik Direktörü) with format type 3', () => {
    const cv = `
Şener Zaman
Ankara / Yenimahalle | contact@example.com
Siber Güvenlik Direktörü

WORK EXPERIENCE
STM Savunma Teknolojileri A.Ş. - Siber Güvenlik Direktörü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Bilkent Üniversitesi - Elektrik Elektronik (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Şener Zaman');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('STM', 'i'));
  });

  it('[ADVERSARIAL_250/500] Extract Adile Özdemir (Kurumsal İletişim Müdürü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Adile Özdemir               | Doğan Holding A.Ş.                               |
| Şehir: İstanbul / Beyoğlu | Görev: Kurumsal İletişim Müdürü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: İstanbul Üniversitesi - İletişim (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Adile Özdemir');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Doğan', 'i'));
  });

  it('[ADVERSARIAL_251/500] Extract Ceren Sunal (Çağrı Merkezi Operasyon Müdürü) with format type 0', () => {
    const cv = `
Ceren Sunal
İstanbul / Kadıköy | 0532 999 00 11 | candidate@domain.com
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone Müşteri Hizmetleri A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Ceren Sunal');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Vodafone', 'i'));
  });

  it('[ADVERSARIAL_252/500] Extract Mert Girik (Kıdemli Backend Geliştirici) with format type 1', () => {
    const cv = `
********************************************************************************
Mert Girik — Kıdemli Backend Geliştirici
Ankara / Çankaya | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Trendyol Teknoloji A.Ş.
Kıdemli Backend Geliştirici (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
ODTÜ - Bilgisayar Mühendisliği (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mert Girik');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[ADVERSARIAL_253/500] Extract Emre Bilginer (Kurumsal Finans Direktörü) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Emre Bilginer
İstanbul / Beşiktaş
Kurumsal Finans Direktörü

İŞ TECRÜBELERİ
Garanti BBVA A.Ş. (2017 - 2024)
Kurumsal Finans Direktörü
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Boğaziçi Üniversitesi - İşletme (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Emre Bilginer');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Garanti', 'i'));
  });

  it('[ADVERSARIAL_254/500] Extract Ayşe Olcay (Tedarik Zinciri Müdürü) with format type 3', () => {
    const cv = `
Ayşe Olcay
İzmir / Bornova | contact@example.com
Tedarik Zinciri Müdürü

WORK EXPERIENCE
Ekol Lojistik A.Ş. - Tedarik Zinciri Müdürü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Dokuz Eylül Üniversitesi - Endüstri Mühendisliği (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Ayşe Olcay');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İzmir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Ekol', 'i'));
  });

  it('[ADVERSARIAL_255/500] Extract Mehmet Akan (İnsan Kaynakları Direktörü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Mehmet Akan               | Koç Holding A.Ş.                               |
| Şehir: İstanbul / Üsküdar | Görev: İnsan Kaynakları Direktörü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: Marmara Üniversitesi - İktisadi ve İdari Bilimler (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mehmet Akan');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Koç', 'i'));
  });

  it('[ADVERSARIAL_256/500] Extract Mustafa Özkul (Dijital Pazarlama Müdürü) with format type 0', () => {
    const cv = `
Mustafa Özkul
İstanbul / Şişli | 0532 999 00 11 | candidate@domain.com
Dijital Pazarlama Müdürü

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Dijital Pazarlama Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
Galatasaray Üniversitesi - İletişim Fakültesi (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mustafa Özkul');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[ADVERSARIAL_257/500] Extract Elif Şen (Saha Satış Yöneticisi) with format type 1', () => {
    const cv = `
********************************************************************************
Elif Şen — Saha Satış Yöneticisi
Eskişehir / Tepebaşı | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Migros Ticaret A.Ş.
Saha Satış Yöneticisi (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
Anadolu Üniversitesi - İktisat (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Elif Şen');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Eskişehir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Migros', 'i'));
  });

  it('[ADVERSARIAL_258/500] Extract Can Naşit (Operasyonel Mükemmellik Lideri) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Can Naşit
Kocaeli / Gebze
Operasyonel Mükemmellik Lideri

İŞ TECRÜBELERİ
Arçelik Sanayi A.Ş. (2017 - 2024)
Operasyonel Mükemmellik Lideri
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Yıldız Teknik Üniversitesi - Makine Mühendisliği (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Can Naşit');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Kocaeli');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[ADVERSARIAL_259/500] Extract Zeynep Şentürk (Siber Güvenlik Direktörü) with format type 3', () => {
    const cv = `
Zeynep Şentürk
Ankara / Yenimahalle | contact@example.com
Siber Güvenlik Direktörü

WORK EXPERIENCE
STM Savunma Teknolojileri A.Ş. - Siber Güvenlik Direktörü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Bilkent Üniversitesi - Elektrik Elektronik (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Zeynep Şentürk');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('STM', 'i'));
  });

  it('[ADVERSARIAL_260/500] Extract Oğuzhan Yalçın (Kurumsal İletişim Müdürü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Oğuzhan Yalçın               | Doğan Holding A.Ş.                               |
| Şehir: İstanbul / Beyoğlu | Görev: Kurumsal İletişim Müdürü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: İstanbul Üniversitesi - İletişim (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Oğuzhan Yalçın');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Doğan', 'i'));
  });

  it('[ADVERSARIAL_261/500] Extract Uğur Yılmaz (Çağrı Merkezi Operasyon Müdürü) with format type 0', () => {
    const cv = `
Uğur Yılmaz
İstanbul / Kadıköy | 0532 999 00 11 | candidate@domain.com
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone Müşteri Hizmetleri A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Uğur Yılmaz');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Vodafone', 'i'));
  });

  it('[ADVERSARIAL_262/500] Extract Burak Demir (Kıdemli Backend Geliştirici) with format type 1', () => {
    const cv = `
********************************************************************************
Burak Demir — Kıdemli Backend Geliştirici
Ankara / Çankaya | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Trendyol Teknoloji A.Ş.
Kıdemli Backend Geliştirici (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
ODTÜ - Bilgisayar Mühendisliği (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Burak Demir');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[ADVERSARIAL_263/500] Extract Kemal Çelik (Kurumsal Finans Direktörü) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Kemal Çelik
İstanbul / Beşiktaş
Kurumsal Finans Direktörü

İŞ TECRÜBELERİ
Garanti BBVA A.Ş. (2017 - 2024)
Kurumsal Finans Direktörü
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Boğaziçi Üniversitesi - İşletme (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Kemal Çelik');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Garanti', 'i'));
  });

  it('[ADVERSARIAL_264/500] Extract Fatma Soylu (Tedarik Zinciri Müdürü) with format type 3', () => {
    const cv = `
Fatma Soylu
İzmir / Bornova | contact@example.com
Tedarik Zinciri Müdürü

WORK EXPERIENCE
Ekol Lojistik A.Ş. - Tedarik Zinciri Müdürü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Dokuz Eylül Üniversitesi - Endüstri Mühendisliği (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Fatma Soylu');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İzmir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Ekol', 'i'));
  });

  it('[ADVERSARIAL_265/500] Extract Haluk Şimşek (İnsan Kaynakları Direktörü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Haluk Şimşek               | Koç Holding A.Ş.                               |
| Şehir: İstanbul / Üsküdar | Görev: İnsan Kaynakları Direktörü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: Marmara Üniversitesi - İktisadi ve İdari Bilimler (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Haluk Şimşek');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Koç', 'i'));
  });

  it('[ADVERSARIAL_266/500] Extract Zuhal Karaca (Dijital Pazarlama Müdürü) with format type 0', () => {
    const cv = `
Zuhal Karaca
İstanbul / Şişli | 0532 999 00 11 | candidate@domain.com
Dijital Pazarlama Müdürü

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Dijital Pazarlama Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
Galatasaray Üniversitesi - İletişim Fakültesi (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Zuhal Karaca');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[ADVERSARIAL_267/500] Extract Tarık Korkmaz (Saha Satış Yöneticisi) with format type 1', () => {
    const cv = `
********************************************************************************
Tarık Korkmaz — Saha Satış Yöneticisi
Eskişehir / Tepebaşı | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Migros Ticaret A.Ş.
Saha Satış Yöneticisi (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
Anadolu Üniversitesi - İktisat (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Tarık Korkmaz');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Eskişehir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Migros', 'i'));
  });

  it('[ADVERSARIAL_268/500] Extract Münir Zaman (Operasyonel Mükemmellik Lideri) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Münir Zaman
Kocaeli / Gebze
Operasyonel Mükemmellik Lideri

İŞ TECRÜBELERİ
Arçelik Sanayi A.Ş. (2017 - 2024)
Operasyonel Mükemmellik Lideri
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Yıldız Teknik Üniversitesi - Makine Mühendisliği (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Münir Zaman');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Kocaeli');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[ADVERSARIAL_269/500] Extract Şener Özdemir (Siber Güvenlik Direktörü) with format type 3', () => {
    const cv = `
Şener Özdemir
Ankara / Yenimahalle | contact@example.com
Siber Güvenlik Direktörü

WORK EXPERIENCE
STM Savunma Teknolojileri A.Ş. - Siber Güvenlik Direktörü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Bilkent Üniversitesi - Elektrik Elektronik (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Şener Özdemir');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('STM', 'i'));
  });

  it('[ADVERSARIAL_270/500] Extract Adile Sunal (Kurumsal İletişim Müdürü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Adile Sunal               | Doğan Holding A.Ş.                               |
| Şehir: İstanbul / Beyoğlu | Görev: Kurumsal İletişim Müdürü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: İstanbul Üniversitesi - İletişim (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Adile Sunal');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Doğan', 'i'));
  });

  it('[ADVERSARIAL_271/500] Extract Ceren Girik (Çağrı Merkezi Operasyon Müdürü) with format type 0', () => {
    const cv = `
Ceren Girik
İstanbul / Kadıköy | 0532 999 00 11 | candidate@domain.com
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone Müşteri Hizmetleri A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Ceren Girik');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Vodafone', 'i'));
  });

  it('[ADVERSARIAL_272/500] Extract Mert Bilginer (Kıdemli Backend Geliştirici) with format type 1', () => {
    const cv = `
********************************************************************************
Mert Bilginer — Kıdemli Backend Geliştirici
Ankara / Çankaya | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Trendyol Teknoloji A.Ş.
Kıdemli Backend Geliştirici (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
ODTÜ - Bilgisayar Mühendisliği (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mert Bilginer');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[ADVERSARIAL_273/500] Extract Emre Olcay (Kurumsal Finans Direktörü) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Emre Olcay
İstanbul / Beşiktaş
Kurumsal Finans Direktörü

İŞ TECRÜBELERİ
Garanti BBVA A.Ş. (2017 - 2024)
Kurumsal Finans Direktörü
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Boğaziçi Üniversitesi - İşletme (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Emre Olcay');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Garanti', 'i'));
  });

  it('[ADVERSARIAL_274/500] Extract Ayşe Akan (Tedarik Zinciri Müdürü) with format type 3', () => {
    const cv = `
Ayşe Akan
İzmir / Bornova | contact@example.com
Tedarik Zinciri Müdürü

WORK EXPERIENCE
Ekol Lojistik A.Ş. - Tedarik Zinciri Müdürü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Dokuz Eylül Üniversitesi - Endüstri Mühendisliği (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Ayşe Akan');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İzmir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Ekol', 'i'));
  });

  it('[ADVERSARIAL_275/500] Extract Mehmet Özkul (İnsan Kaynakları Direktörü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Mehmet Özkul               | Koç Holding A.Ş.                               |
| Şehir: İstanbul / Üsküdar | Görev: İnsan Kaynakları Direktörü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: Marmara Üniversitesi - İktisadi ve İdari Bilimler (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mehmet Özkul');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Koç', 'i'));
  });

  it('[ADVERSARIAL_276/500] Extract Mustafa Şen (Dijital Pazarlama Müdürü) with format type 0', () => {
    const cv = `
Mustafa Şen
İstanbul / Şişli | 0532 999 00 11 | candidate@domain.com
Dijital Pazarlama Müdürü

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Dijital Pazarlama Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
Galatasaray Üniversitesi - İletişim Fakültesi (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mustafa Şen');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[ADVERSARIAL_277/500] Extract Elif Naşit (Saha Satış Yöneticisi) with format type 1', () => {
    const cv = `
********************************************************************************
Elif Naşit — Saha Satış Yöneticisi
Eskişehir / Tepebaşı | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Migros Ticaret A.Ş.
Saha Satış Yöneticisi (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
Anadolu Üniversitesi - İktisat (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Elif Naşit');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Eskişehir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Migros', 'i'));
  });

  it('[ADVERSARIAL_278/500] Extract Can Şentürk (Operasyonel Mükemmellik Lideri) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Can Şentürk
Kocaeli / Gebze
Operasyonel Mükemmellik Lideri

İŞ TECRÜBELERİ
Arçelik Sanayi A.Ş. (2017 - 2024)
Operasyonel Mükemmellik Lideri
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Yıldız Teknik Üniversitesi - Makine Mühendisliği (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Can Şentürk');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Kocaeli');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[ADVERSARIAL_279/500] Extract Zeynep Yalçın (Siber Güvenlik Direktörü) with format type 3', () => {
    const cv = `
Zeynep Yalçın
Ankara / Yenimahalle | contact@example.com
Siber Güvenlik Direktörü

WORK EXPERIENCE
STM Savunma Teknolojileri A.Ş. - Siber Güvenlik Direktörü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Bilkent Üniversitesi - Elektrik Elektronik (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Zeynep Yalçın');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('STM', 'i'));
  });

  it('[ADVERSARIAL_280/500] Extract Oğuzhan Kaya (Kurumsal İletişim Müdürü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Oğuzhan Kaya               | Doğan Holding A.Ş.                               |
| Şehir: İstanbul / Beyoğlu | Görev: Kurumsal İletişim Müdürü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: İstanbul Üniversitesi - İletişim (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Oğuzhan Kaya');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Doğan', 'i'));
  });

  it('[ADVERSARIAL_281/500] Extract Uğur Demir (Çağrı Merkezi Operasyon Müdürü) with format type 0', () => {
    const cv = `
Uğur Demir
İstanbul / Kadıköy | 0532 999 00 11 | candidate@domain.com
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone Müşteri Hizmetleri A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Uğur Demir');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Vodafone', 'i'));
  });

  it('[ADVERSARIAL_282/500] Extract Burak Çelik (Kıdemli Backend Geliştirici) with format type 1', () => {
    const cv = `
********************************************************************************
Burak Çelik — Kıdemli Backend Geliştirici
Ankara / Çankaya | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Trendyol Teknoloji A.Ş.
Kıdemli Backend Geliştirici (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
ODTÜ - Bilgisayar Mühendisliği (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Burak Çelik');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[ADVERSARIAL_283/500] Extract Kemal Soylu (Kurumsal Finans Direktörü) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Kemal Soylu
İstanbul / Beşiktaş
Kurumsal Finans Direktörü

İŞ TECRÜBELERİ
Garanti BBVA A.Ş. (2017 - 2024)
Kurumsal Finans Direktörü
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Boğaziçi Üniversitesi - İşletme (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Kemal Soylu');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Garanti', 'i'));
  });

  it('[ADVERSARIAL_284/500] Extract Fatma Şimşek (Tedarik Zinciri Müdürü) with format type 3', () => {
    const cv = `
Fatma Şimşek
İzmir / Bornova | contact@example.com
Tedarik Zinciri Müdürü

WORK EXPERIENCE
Ekol Lojistik A.Ş. - Tedarik Zinciri Müdürü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Dokuz Eylül Üniversitesi - Endüstri Mühendisliği (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Fatma Şimşek');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İzmir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Ekol', 'i'));
  });

  it('[ADVERSARIAL_285/500] Extract Haluk Karaca (İnsan Kaynakları Direktörü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Haluk Karaca               | Koç Holding A.Ş.                               |
| Şehir: İstanbul / Üsküdar | Görev: İnsan Kaynakları Direktörü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: Marmara Üniversitesi - İktisadi ve İdari Bilimler (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Haluk Karaca');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Koç', 'i'));
  });

  it('[ADVERSARIAL_286/500] Extract Zuhal Korkmaz (Dijital Pazarlama Müdürü) with format type 0', () => {
    const cv = `
Zuhal Korkmaz
İstanbul / Şişli | 0532 999 00 11 | candidate@domain.com
Dijital Pazarlama Müdürü

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Dijital Pazarlama Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
Galatasaray Üniversitesi - İletişim Fakültesi (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Zuhal Korkmaz');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[ADVERSARIAL_287/500] Extract Tarık Zaman (Saha Satış Yöneticisi) with format type 1', () => {
    const cv = `
********************************************************************************
Tarık Zaman — Saha Satış Yöneticisi
Eskişehir / Tepebaşı | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Migros Ticaret A.Ş.
Saha Satış Yöneticisi (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
Anadolu Üniversitesi - İktisat (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Tarık Zaman');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Eskişehir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Migros', 'i'));
  });

  it('[ADVERSARIAL_288/500] Extract Münir Özdemir (Operasyonel Mükemmellik Lideri) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Münir Özdemir
Kocaeli / Gebze
Operasyonel Mükemmellik Lideri

İŞ TECRÜBELERİ
Arçelik Sanayi A.Ş. (2017 - 2024)
Operasyonel Mükemmellik Lideri
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Yıldız Teknik Üniversitesi - Makine Mühendisliği (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Münir Özdemir');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Kocaeli');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[ADVERSARIAL_289/500] Extract Şener Sunal (Siber Güvenlik Direktörü) with format type 3', () => {
    const cv = `
Şener Sunal
Ankara / Yenimahalle | contact@example.com
Siber Güvenlik Direktörü

WORK EXPERIENCE
STM Savunma Teknolojileri A.Ş. - Siber Güvenlik Direktörü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Bilkent Üniversitesi - Elektrik Elektronik (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Şener Sunal');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('STM', 'i'));
  });

  it('[ADVERSARIAL_290/500] Extract Adile Girik (Kurumsal İletişim Müdürü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Adile Girik               | Doğan Holding A.Ş.                               |
| Şehir: İstanbul / Beyoğlu | Görev: Kurumsal İletişim Müdürü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: İstanbul Üniversitesi - İletişim (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Adile Girik');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Doğan', 'i'));
  });

  it('[ADVERSARIAL_291/500] Extract Ceren Bilginer (Çağrı Merkezi Operasyon Müdürü) with format type 0', () => {
    const cv = `
Ceren Bilginer
İstanbul / Kadıköy | 0532 999 00 11 | candidate@domain.com
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone Müşteri Hizmetleri A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Ceren Bilginer');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Vodafone', 'i'));
  });

  it('[ADVERSARIAL_292/500] Extract Mert Olcay (Kıdemli Backend Geliştirici) with format type 1', () => {
    const cv = `
********************************************************************************
Mert Olcay — Kıdemli Backend Geliştirici
Ankara / Çankaya | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Trendyol Teknoloji A.Ş.
Kıdemli Backend Geliştirici (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
ODTÜ - Bilgisayar Mühendisliği (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mert Olcay');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[ADVERSARIAL_293/500] Extract Emre Akan (Kurumsal Finans Direktörü) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Emre Akan
İstanbul / Beşiktaş
Kurumsal Finans Direktörü

İŞ TECRÜBELERİ
Garanti BBVA A.Ş. (2017 - 2024)
Kurumsal Finans Direktörü
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Boğaziçi Üniversitesi - İşletme (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Emre Akan');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Garanti', 'i'));
  });

  it('[ADVERSARIAL_294/500] Extract Ayşe Özkul (Tedarik Zinciri Müdürü) with format type 3', () => {
    const cv = `
Ayşe Özkul
İzmir / Bornova | contact@example.com
Tedarik Zinciri Müdürü

WORK EXPERIENCE
Ekol Lojistik A.Ş. - Tedarik Zinciri Müdürü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Dokuz Eylül Üniversitesi - Endüstri Mühendisliği (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Ayşe Özkul');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İzmir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Ekol', 'i'));
  });

  it('[ADVERSARIAL_295/500] Extract Mehmet Şen (İnsan Kaynakları Direktörü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Mehmet Şen               | Koç Holding A.Ş.                               |
| Şehir: İstanbul / Üsküdar | Görev: İnsan Kaynakları Direktörü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: Marmara Üniversitesi - İktisadi ve İdari Bilimler (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mehmet Şen');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Koç', 'i'));
  });

  it('[ADVERSARIAL_296/500] Extract Mustafa Naşit (Dijital Pazarlama Müdürü) with format type 0', () => {
    const cv = `
Mustafa Naşit
İstanbul / Şişli | 0532 999 00 11 | candidate@domain.com
Dijital Pazarlama Müdürü

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Dijital Pazarlama Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
Galatasaray Üniversitesi - İletişim Fakültesi (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mustafa Naşit');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[ADVERSARIAL_297/500] Extract Elif Şentürk (Saha Satış Yöneticisi) with format type 1', () => {
    const cv = `
********************************************************************************
Elif Şentürk — Saha Satış Yöneticisi
Eskişehir / Tepebaşı | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Migros Ticaret A.Ş.
Saha Satış Yöneticisi (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
Anadolu Üniversitesi - İktisat (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Elif Şentürk');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Eskişehir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Migros', 'i'));
  });

  it('[ADVERSARIAL_298/500] Extract Can Yalçın (Operasyonel Mükemmellik Lideri) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Can Yalçın
Kocaeli / Gebze
Operasyonel Mükemmellik Lideri

İŞ TECRÜBELERİ
Arçelik Sanayi A.Ş. (2017 - 2024)
Operasyonel Mükemmellik Lideri
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Yıldız Teknik Üniversitesi - Makine Mühendisliği (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Can Yalçın');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Kocaeli');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[ADVERSARIAL_299/500] Extract Zeynep Kaya (Siber Güvenlik Direktörü) with format type 3', () => {
    const cv = `
Zeynep Kaya
Ankara / Yenimahalle | contact@example.com
Siber Güvenlik Direktörü

WORK EXPERIENCE
STM Savunma Teknolojileri A.Ş. - Siber Güvenlik Direktörü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Bilkent Üniversitesi - Elektrik Elektronik (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Zeynep Kaya');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('STM', 'i'));
  });

  it('[ADVERSARIAL_300/500] Extract Oğuzhan Yılmaz (Kurumsal İletişim Müdürü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Oğuzhan Yılmaz               | Doğan Holding A.Ş.                               |
| Şehir: İstanbul / Beyoğlu | Görev: Kurumsal İletişim Müdürü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: İstanbul Üniversitesi - İletişim (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Oğuzhan Yılmaz');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Doğan', 'i'));
  });

  it('[ADVERSARIAL_301/500] Extract Uğur Çelik (Çağrı Merkezi Operasyon Müdürü) with format type 0', () => {
    const cv = `
Uğur Çelik
İstanbul / Kadıköy | 0532 999 00 11 | candidate@domain.com
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone Müşteri Hizmetleri A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Uğur Çelik');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Vodafone', 'i'));
  });

  it('[ADVERSARIAL_302/500] Extract Burak Soylu (Kıdemli Backend Geliştirici) with format type 1', () => {
    const cv = `
********************************************************************************
Burak Soylu — Kıdemli Backend Geliştirici
Ankara / Çankaya | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Trendyol Teknoloji A.Ş.
Kıdemli Backend Geliştirici (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
ODTÜ - Bilgisayar Mühendisliği (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Burak Soylu');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[ADVERSARIAL_303/500] Extract Kemal Şimşek (Kurumsal Finans Direktörü) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Kemal Şimşek
İstanbul / Beşiktaş
Kurumsal Finans Direktörü

İŞ TECRÜBELERİ
Garanti BBVA A.Ş. (2017 - 2024)
Kurumsal Finans Direktörü
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Boğaziçi Üniversitesi - İşletme (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Kemal Şimşek');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Garanti', 'i'));
  });

  it('[ADVERSARIAL_304/500] Extract Fatma Karaca (Tedarik Zinciri Müdürü) with format type 3', () => {
    const cv = `
Fatma Karaca
İzmir / Bornova | contact@example.com
Tedarik Zinciri Müdürü

WORK EXPERIENCE
Ekol Lojistik A.Ş. - Tedarik Zinciri Müdürü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Dokuz Eylül Üniversitesi - Endüstri Mühendisliği (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Fatma Karaca');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İzmir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Ekol', 'i'));
  });

  it('[ADVERSARIAL_305/500] Extract Haluk Korkmaz (İnsan Kaynakları Direktörü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Haluk Korkmaz               | Koç Holding A.Ş.                               |
| Şehir: İstanbul / Üsküdar | Görev: İnsan Kaynakları Direktörü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: Marmara Üniversitesi - İktisadi ve İdari Bilimler (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Haluk Korkmaz');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Koç', 'i'));
  });

  it('[ADVERSARIAL_306/500] Extract Zuhal Zaman (Dijital Pazarlama Müdürü) with format type 0', () => {
    const cv = `
Zuhal Zaman
İstanbul / Şişli | 0532 999 00 11 | candidate@domain.com
Dijital Pazarlama Müdürü

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Dijital Pazarlama Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
Galatasaray Üniversitesi - İletişim Fakültesi (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Zuhal Zaman');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[ADVERSARIAL_307/500] Extract Tarık Özdemir (Saha Satış Yöneticisi) with format type 1', () => {
    const cv = `
********************************************************************************
Tarık Özdemir — Saha Satış Yöneticisi
Eskişehir / Tepebaşı | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Migros Ticaret A.Ş.
Saha Satış Yöneticisi (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
Anadolu Üniversitesi - İktisat (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Tarık Özdemir');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Eskişehir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Migros', 'i'));
  });

  it('[ADVERSARIAL_308/500] Extract Münir Sunal (Operasyonel Mükemmellik Lideri) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Münir Sunal
Kocaeli / Gebze
Operasyonel Mükemmellik Lideri

İŞ TECRÜBELERİ
Arçelik Sanayi A.Ş. (2017 - 2024)
Operasyonel Mükemmellik Lideri
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Yıldız Teknik Üniversitesi - Makine Mühendisliği (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Münir Sunal');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Kocaeli');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[ADVERSARIAL_309/500] Extract Şener Girik (Siber Güvenlik Direktörü) with format type 3', () => {
    const cv = `
Şener Girik
Ankara / Yenimahalle | contact@example.com
Siber Güvenlik Direktörü

WORK EXPERIENCE
STM Savunma Teknolojileri A.Ş. - Siber Güvenlik Direktörü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Bilkent Üniversitesi - Elektrik Elektronik (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Şener Girik');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('STM', 'i'));
  });

  it('[ADVERSARIAL_310/500] Extract Adile Bilginer (Kurumsal İletişim Müdürü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Adile Bilginer               | Doğan Holding A.Ş.                               |
| Şehir: İstanbul / Beyoğlu | Görev: Kurumsal İletişim Müdürü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: İstanbul Üniversitesi - İletişim (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Adile Bilginer');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Doğan', 'i'));
  });

  it('[ADVERSARIAL_311/500] Extract Ceren Olcay (Çağrı Merkezi Operasyon Müdürü) with format type 0', () => {
    const cv = `
Ceren Olcay
İstanbul / Kadıköy | 0532 999 00 11 | candidate@domain.com
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone Müşteri Hizmetleri A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Ceren Olcay');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Vodafone', 'i'));
  });

  it('[ADVERSARIAL_312/500] Extract Mert Akan (Kıdemli Backend Geliştirici) with format type 1', () => {
    const cv = `
********************************************************************************
Mert Akan — Kıdemli Backend Geliştirici
Ankara / Çankaya | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Trendyol Teknoloji A.Ş.
Kıdemli Backend Geliştirici (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
ODTÜ - Bilgisayar Mühendisliği (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mert Akan');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[ADVERSARIAL_313/500] Extract Emre Özkul (Kurumsal Finans Direktörü) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Emre Özkul
İstanbul / Beşiktaş
Kurumsal Finans Direktörü

İŞ TECRÜBELERİ
Garanti BBVA A.Ş. (2017 - 2024)
Kurumsal Finans Direktörü
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Boğaziçi Üniversitesi - İşletme (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Emre Özkul');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Garanti', 'i'));
  });

  it('[ADVERSARIAL_314/500] Extract Ayşe Şen (Tedarik Zinciri Müdürü) with format type 3', () => {
    const cv = `
Ayşe Şen
İzmir / Bornova | contact@example.com
Tedarik Zinciri Müdürü

WORK EXPERIENCE
Ekol Lojistik A.Ş. - Tedarik Zinciri Müdürü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Dokuz Eylül Üniversitesi - Endüstri Mühendisliği (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Ayşe Şen');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İzmir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Ekol', 'i'));
  });

  it('[ADVERSARIAL_315/500] Extract Mehmet Naşit (İnsan Kaynakları Direktörü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Mehmet Naşit               | Koç Holding A.Ş.                               |
| Şehir: İstanbul / Üsküdar | Görev: İnsan Kaynakları Direktörü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: Marmara Üniversitesi - İktisadi ve İdari Bilimler (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mehmet Naşit');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Koç', 'i'));
  });

  it('[ADVERSARIAL_316/500] Extract Mustafa Şentürk (Dijital Pazarlama Müdürü) with format type 0', () => {
    const cv = `
Mustafa Şentürk
İstanbul / Şişli | 0532 999 00 11 | candidate@domain.com
Dijital Pazarlama Müdürü

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Dijital Pazarlama Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
Galatasaray Üniversitesi - İletişim Fakültesi (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mustafa Şentürk');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[ADVERSARIAL_317/500] Extract Elif Yalçın (Saha Satış Yöneticisi) with format type 1', () => {
    const cv = `
********************************************************************************
Elif Yalçın — Saha Satış Yöneticisi
Eskişehir / Tepebaşı | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Migros Ticaret A.Ş.
Saha Satış Yöneticisi (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
Anadolu Üniversitesi - İktisat (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Elif Yalçın');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Eskişehir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Migros', 'i'));
  });

  it('[ADVERSARIAL_318/500] Extract Can Kaya (Operasyonel Mükemmellik Lideri) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Can Kaya
Kocaeli / Gebze
Operasyonel Mükemmellik Lideri

İŞ TECRÜBELERİ
Arçelik Sanayi A.Ş. (2017 - 2024)
Operasyonel Mükemmellik Lideri
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Yıldız Teknik Üniversitesi - Makine Mühendisliği (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Can Kaya');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Kocaeli');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[ADVERSARIAL_319/500] Extract Zeynep Yılmaz (Siber Güvenlik Direktörü) with format type 3', () => {
    const cv = `
Zeynep Yılmaz
Ankara / Yenimahalle | contact@example.com
Siber Güvenlik Direktörü

WORK EXPERIENCE
STM Savunma Teknolojileri A.Ş. - Siber Güvenlik Direktörü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Bilkent Üniversitesi - Elektrik Elektronik (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Zeynep Yılmaz');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('STM', 'i'));
  });

  it('[ADVERSARIAL_320/500] Extract Oğuzhan Demir (Kurumsal İletişim Müdürü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Oğuzhan Demir               | Doğan Holding A.Ş.                               |
| Şehir: İstanbul / Beyoğlu | Görev: Kurumsal İletişim Müdürü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: İstanbul Üniversitesi - İletişim (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Oğuzhan Demir');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Doğan', 'i'));
  });

  it('[ADVERSARIAL_321/500] Extract Uğur Soylu (Çağrı Merkezi Operasyon Müdürü) with format type 0', () => {
    const cv = `
Uğur Soylu
İstanbul / Kadıköy | 0532 999 00 11 | candidate@domain.com
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone Müşteri Hizmetleri A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Uğur Soylu');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Vodafone', 'i'));
  });

  it('[ADVERSARIAL_322/500] Extract Burak Şimşek (Kıdemli Backend Geliştirici) with format type 1', () => {
    const cv = `
********************************************************************************
Burak Şimşek — Kıdemli Backend Geliştirici
Ankara / Çankaya | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Trendyol Teknoloji A.Ş.
Kıdemli Backend Geliştirici (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
ODTÜ - Bilgisayar Mühendisliği (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Burak Şimşek');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[ADVERSARIAL_323/500] Extract Kemal Karaca (Kurumsal Finans Direktörü) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Kemal Karaca
İstanbul / Beşiktaş
Kurumsal Finans Direktörü

İŞ TECRÜBELERİ
Garanti BBVA A.Ş. (2017 - 2024)
Kurumsal Finans Direktörü
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Boğaziçi Üniversitesi - İşletme (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Kemal Karaca');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Garanti', 'i'));
  });

  it('[ADVERSARIAL_324/500] Extract Fatma Korkmaz (Tedarik Zinciri Müdürü) with format type 3', () => {
    const cv = `
Fatma Korkmaz
İzmir / Bornova | contact@example.com
Tedarik Zinciri Müdürü

WORK EXPERIENCE
Ekol Lojistik A.Ş. - Tedarik Zinciri Müdürü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Dokuz Eylül Üniversitesi - Endüstri Mühendisliği (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Fatma Korkmaz');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İzmir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Ekol', 'i'));
  });

  it('[ADVERSARIAL_325/500] Extract Haluk Zaman (İnsan Kaynakları Direktörü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Haluk Zaman               | Koç Holding A.Ş.                               |
| Şehir: İstanbul / Üsküdar | Görev: İnsan Kaynakları Direktörü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: Marmara Üniversitesi - İktisadi ve İdari Bilimler (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Haluk Zaman');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Koç', 'i'));
  });

  it('[ADVERSARIAL_326/500] Extract Zuhal Özdemir (Dijital Pazarlama Müdürü) with format type 0', () => {
    const cv = `
Zuhal Özdemir
İstanbul / Şişli | 0532 999 00 11 | candidate@domain.com
Dijital Pazarlama Müdürü

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Dijital Pazarlama Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
Galatasaray Üniversitesi - İletişim Fakültesi (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Zuhal Özdemir');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[ADVERSARIAL_327/500] Extract Tarık Sunal (Saha Satış Yöneticisi) with format type 1', () => {
    const cv = `
********************************************************************************
Tarık Sunal — Saha Satış Yöneticisi
Eskişehir / Tepebaşı | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Migros Ticaret A.Ş.
Saha Satış Yöneticisi (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
Anadolu Üniversitesi - İktisat (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Tarık Sunal');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Eskişehir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Migros', 'i'));
  });

  it('[ADVERSARIAL_328/500] Extract Münir Girik (Operasyonel Mükemmellik Lideri) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Münir Girik
Kocaeli / Gebze
Operasyonel Mükemmellik Lideri

İŞ TECRÜBELERİ
Arçelik Sanayi A.Ş. (2017 - 2024)
Operasyonel Mükemmellik Lideri
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Yıldız Teknik Üniversitesi - Makine Mühendisliği (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Münir Girik');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Kocaeli');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[ADVERSARIAL_329/500] Extract Şener Bilginer (Siber Güvenlik Direktörü) with format type 3', () => {
    const cv = `
Şener Bilginer
Ankara / Yenimahalle | contact@example.com
Siber Güvenlik Direktörü

WORK EXPERIENCE
STM Savunma Teknolojileri A.Ş. - Siber Güvenlik Direktörü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Bilkent Üniversitesi - Elektrik Elektronik (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Şener Bilginer');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('STM', 'i'));
  });

  it('[ADVERSARIAL_330/500] Extract Adile Olcay (Kurumsal İletişim Müdürü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Adile Olcay               | Doğan Holding A.Ş.                               |
| Şehir: İstanbul / Beyoğlu | Görev: Kurumsal İletişim Müdürü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: İstanbul Üniversitesi - İletişim (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Adile Olcay');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Doğan', 'i'));
  });

  it('[ADVERSARIAL_331/500] Extract Ceren Akan (Çağrı Merkezi Operasyon Müdürü) with format type 0', () => {
    const cv = `
Ceren Akan
İstanbul / Kadıköy | 0532 999 00 11 | candidate@domain.com
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone Müşteri Hizmetleri A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Ceren Akan');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Vodafone', 'i'));
  });

  it('[ADVERSARIAL_332/500] Extract Mert Özkul (Kıdemli Backend Geliştirici) with format type 1', () => {
    const cv = `
********************************************************************************
Mert Özkul — Kıdemli Backend Geliştirici
Ankara / Çankaya | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Trendyol Teknoloji A.Ş.
Kıdemli Backend Geliştirici (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
ODTÜ - Bilgisayar Mühendisliği (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mert Özkul');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[ADVERSARIAL_333/500] Extract Emre Şen (Kurumsal Finans Direktörü) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Emre Şen
İstanbul / Beşiktaş
Kurumsal Finans Direktörü

İŞ TECRÜBELERİ
Garanti BBVA A.Ş. (2017 - 2024)
Kurumsal Finans Direktörü
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Boğaziçi Üniversitesi - İşletme (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Emre Şen');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Garanti', 'i'));
  });

  it('[ADVERSARIAL_334/500] Extract Ayşe Naşit (Tedarik Zinciri Müdürü) with format type 3', () => {
    const cv = `
Ayşe Naşit
İzmir / Bornova | contact@example.com
Tedarik Zinciri Müdürü

WORK EXPERIENCE
Ekol Lojistik A.Ş. - Tedarik Zinciri Müdürü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Dokuz Eylül Üniversitesi - Endüstri Mühendisliği (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Ayşe Naşit');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İzmir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Ekol', 'i'));
  });

  it('[ADVERSARIAL_335/500] Extract Mehmet Şentürk (İnsan Kaynakları Direktörü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Mehmet Şentürk               | Koç Holding A.Ş.                               |
| Şehir: İstanbul / Üsküdar | Görev: İnsan Kaynakları Direktörü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: Marmara Üniversitesi - İktisadi ve İdari Bilimler (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mehmet Şentürk');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Koç', 'i'));
  });

  it('[ADVERSARIAL_336/500] Extract Mustafa Yalçın (Dijital Pazarlama Müdürü) with format type 0', () => {
    const cv = `
Mustafa Yalçın
İstanbul / Şişli | 0532 999 00 11 | candidate@domain.com
Dijital Pazarlama Müdürü

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Dijital Pazarlama Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
Galatasaray Üniversitesi - İletişim Fakültesi (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mustafa Yalçın');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[ADVERSARIAL_337/500] Extract Elif Kaya (Saha Satış Yöneticisi) with format type 1', () => {
    const cv = `
********************************************************************************
Elif Kaya — Saha Satış Yöneticisi
Eskişehir / Tepebaşı | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Migros Ticaret A.Ş.
Saha Satış Yöneticisi (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
Anadolu Üniversitesi - İktisat (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Elif Kaya');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Eskişehir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Migros', 'i'));
  });

  it('[ADVERSARIAL_338/500] Extract Can Yılmaz (Operasyonel Mükemmellik Lideri) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Can Yılmaz
Kocaeli / Gebze
Operasyonel Mükemmellik Lideri

İŞ TECRÜBELERİ
Arçelik Sanayi A.Ş. (2017 - 2024)
Operasyonel Mükemmellik Lideri
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Yıldız Teknik Üniversitesi - Makine Mühendisliği (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Can Yılmaz');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Kocaeli');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[ADVERSARIAL_339/500] Extract Zeynep Demir (Siber Güvenlik Direktörü) with format type 3', () => {
    const cv = `
Zeynep Demir
Ankara / Yenimahalle | contact@example.com
Siber Güvenlik Direktörü

WORK EXPERIENCE
STM Savunma Teknolojileri A.Ş. - Siber Güvenlik Direktörü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Bilkent Üniversitesi - Elektrik Elektronik (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Zeynep Demir');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('STM', 'i'));
  });

  it('[ADVERSARIAL_340/500] Extract Oğuzhan Çelik (Kurumsal İletişim Müdürü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Oğuzhan Çelik               | Doğan Holding A.Ş.                               |
| Şehir: İstanbul / Beyoğlu | Görev: Kurumsal İletişim Müdürü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: İstanbul Üniversitesi - İletişim (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Oğuzhan Çelik');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Doğan', 'i'));
  });

  it('[ADVERSARIAL_341/500] Extract Uğur Şimşek (Çağrı Merkezi Operasyon Müdürü) with format type 0', () => {
    const cv = `
Uğur Şimşek
İstanbul / Kadıköy | 0532 999 00 11 | candidate@domain.com
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone Müşteri Hizmetleri A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Uğur Şimşek');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Vodafone', 'i'));
  });

  it('[ADVERSARIAL_342/500] Extract Burak Karaca (Kıdemli Backend Geliştirici) with format type 1', () => {
    const cv = `
********************************************************************************
Burak Karaca — Kıdemli Backend Geliştirici
Ankara / Çankaya | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Trendyol Teknoloji A.Ş.
Kıdemli Backend Geliştirici (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
ODTÜ - Bilgisayar Mühendisliği (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Burak Karaca');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[ADVERSARIAL_343/500] Extract Kemal Korkmaz (Kurumsal Finans Direktörü) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Kemal Korkmaz
İstanbul / Beşiktaş
Kurumsal Finans Direktörü

İŞ TECRÜBELERİ
Garanti BBVA A.Ş. (2017 - 2024)
Kurumsal Finans Direktörü
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Boğaziçi Üniversitesi - İşletme (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Kemal Korkmaz');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Garanti', 'i'));
  });

  it('[ADVERSARIAL_344/500] Extract Fatma Zaman (Tedarik Zinciri Müdürü) with format type 3', () => {
    const cv = `
Fatma Zaman
İzmir / Bornova | contact@example.com
Tedarik Zinciri Müdürü

WORK EXPERIENCE
Ekol Lojistik A.Ş. - Tedarik Zinciri Müdürü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Dokuz Eylül Üniversitesi - Endüstri Mühendisliği (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Fatma Zaman');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İzmir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Ekol', 'i'));
  });

  it('[ADVERSARIAL_345/500] Extract Haluk Özdemir (İnsan Kaynakları Direktörü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Haluk Özdemir               | Koç Holding A.Ş.                               |
| Şehir: İstanbul / Üsküdar | Görev: İnsan Kaynakları Direktörü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: Marmara Üniversitesi - İktisadi ve İdari Bilimler (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Haluk Özdemir');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Koç', 'i'));
  });

  it('[ADVERSARIAL_346/500] Extract Zuhal Sunal (Dijital Pazarlama Müdürü) with format type 0', () => {
    const cv = `
Zuhal Sunal
İstanbul / Şişli | 0532 999 00 11 | candidate@domain.com
Dijital Pazarlama Müdürü

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Dijital Pazarlama Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
Galatasaray Üniversitesi - İletişim Fakültesi (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Zuhal Sunal');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[ADVERSARIAL_347/500] Extract Tarık Girik (Saha Satış Yöneticisi) with format type 1', () => {
    const cv = `
********************************************************************************
Tarık Girik — Saha Satış Yöneticisi
Eskişehir / Tepebaşı | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Migros Ticaret A.Ş.
Saha Satış Yöneticisi (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
Anadolu Üniversitesi - İktisat (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Tarık Girik');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Eskişehir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Migros', 'i'));
  });

  it('[ADVERSARIAL_348/500] Extract Münir Bilginer (Operasyonel Mükemmellik Lideri) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Münir Bilginer
Kocaeli / Gebze
Operasyonel Mükemmellik Lideri

İŞ TECRÜBELERİ
Arçelik Sanayi A.Ş. (2017 - 2024)
Operasyonel Mükemmellik Lideri
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Yıldız Teknik Üniversitesi - Makine Mühendisliği (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Münir Bilginer');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Kocaeli');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[ADVERSARIAL_349/500] Extract Şener Olcay (Siber Güvenlik Direktörü) with format type 3', () => {
    const cv = `
Şener Olcay
Ankara / Yenimahalle | contact@example.com
Siber Güvenlik Direktörü

WORK EXPERIENCE
STM Savunma Teknolojileri A.Ş. - Siber Güvenlik Direktörü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Bilkent Üniversitesi - Elektrik Elektronik (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Şener Olcay');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('STM', 'i'));
  });

  it('[ADVERSARIAL_350/500] Extract Adile Akan (Kurumsal İletişim Müdürü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Adile Akan               | Doğan Holding A.Ş.                               |
| Şehir: İstanbul / Beyoğlu | Görev: Kurumsal İletişim Müdürü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: İstanbul Üniversitesi - İletişim (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Adile Akan');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Doğan', 'i'));
  });

  it('[ADVERSARIAL_351/500] Extract Ceren Özkul (Çağrı Merkezi Operasyon Müdürü) with format type 0', () => {
    const cv = `
Ceren Özkul
İstanbul / Kadıköy | 0532 999 00 11 | candidate@domain.com
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone Müşteri Hizmetleri A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Ceren Özkul');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Vodafone', 'i'));
  });

  it('[ADVERSARIAL_352/500] Extract Mert Şen (Kıdemli Backend Geliştirici) with format type 1', () => {
    const cv = `
********************************************************************************
Mert Şen — Kıdemli Backend Geliştirici
Ankara / Çankaya | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Trendyol Teknoloji A.Ş.
Kıdemli Backend Geliştirici (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
ODTÜ - Bilgisayar Mühendisliği (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mert Şen');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[ADVERSARIAL_353/500] Extract Emre Naşit (Kurumsal Finans Direktörü) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Emre Naşit
İstanbul / Beşiktaş
Kurumsal Finans Direktörü

İŞ TECRÜBELERİ
Garanti BBVA A.Ş. (2017 - 2024)
Kurumsal Finans Direktörü
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Boğaziçi Üniversitesi - İşletme (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Emre Naşit');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Garanti', 'i'));
  });

  it('[ADVERSARIAL_354/500] Extract Ayşe Şentürk (Tedarik Zinciri Müdürü) with format type 3', () => {
    const cv = `
Ayşe Şentürk
İzmir / Bornova | contact@example.com
Tedarik Zinciri Müdürü

WORK EXPERIENCE
Ekol Lojistik A.Ş. - Tedarik Zinciri Müdürü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Dokuz Eylül Üniversitesi - Endüstri Mühendisliği (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Ayşe Şentürk');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İzmir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Ekol', 'i'));
  });

  it('[ADVERSARIAL_355/500] Extract Mehmet Yalçın (İnsan Kaynakları Direktörü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Mehmet Yalçın               | Koç Holding A.Ş.                               |
| Şehir: İstanbul / Üsküdar | Görev: İnsan Kaynakları Direktörü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: Marmara Üniversitesi - İktisadi ve İdari Bilimler (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mehmet Yalçın');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Koç', 'i'));
  });

  it('[ADVERSARIAL_356/500] Extract Mustafa Kaya (Dijital Pazarlama Müdürü) with format type 0', () => {
    const cv = `
Mustafa Kaya
İstanbul / Şişli | 0532 999 00 11 | candidate@domain.com
Dijital Pazarlama Müdürü

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Dijital Pazarlama Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
Galatasaray Üniversitesi - İletişim Fakültesi (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mustafa Kaya');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[ADVERSARIAL_357/500] Extract Elif Yılmaz (Saha Satış Yöneticisi) with format type 1', () => {
    const cv = `
********************************************************************************
Elif Yılmaz — Saha Satış Yöneticisi
Eskişehir / Tepebaşı | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Migros Ticaret A.Ş.
Saha Satış Yöneticisi (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
Anadolu Üniversitesi - İktisat (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Elif Yılmaz');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Eskişehir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Migros', 'i'));
  });

  it('[ADVERSARIAL_358/500] Extract Can Demir (Operasyonel Mükemmellik Lideri) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Can Demir
Kocaeli / Gebze
Operasyonel Mükemmellik Lideri

İŞ TECRÜBELERİ
Arçelik Sanayi A.Ş. (2017 - 2024)
Operasyonel Mükemmellik Lideri
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Yıldız Teknik Üniversitesi - Makine Mühendisliği (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Can Demir');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Kocaeli');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[ADVERSARIAL_359/500] Extract Zeynep Çelik (Siber Güvenlik Direktörü) with format type 3', () => {
    const cv = `
Zeynep Çelik
Ankara / Yenimahalle | contact@example.com
Siber Güvenlik Direktörü

WORK EXPERIENCE
STM Savunma Teknolojileri A.Ş. - Siber Güvenlik Direktörü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Bilkent Üniversitesi - Elektrik Elektronik (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Zeynep Çelik');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('STM', 'i'));
  });

  it('[ADVERSARIAL_360/500] Extract Oğuzhan Soylu (Kurumsal İletişim Müdürü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Oğuzhan Soylu               | Doğan Holding A.Ş.                               |
| Şehir: İstanbul / Beyoğlu | Görev: Kurumsal İletişim Müdürü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: İstanbul Üniversitesi - İletişim (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Oğuzhan Soylu');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Doğan', 'i'));
  });

  it('[ADVERSARIAL_361/500] Extract Uğur Karaca (Çağrı Merkezi Operasyon Müdürü) with format type 0', () => {
    const cv = `
Uğur Karaca
İstanbul / Kadıköy | 0532 999 00 11 | candidate@domain.com
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone Müşteri Hizmetleri A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Uğur Karaca');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Vodafone', 'i'));
  });

  it('[ADVERSARIAL_362/500] Extract Burak Korkmaz (Kıdemli Backend Geliştirici) with format type 1', () => {
    const cv = `
********************************************************************************
Burak Korkmaz — Kıdemli Backend Geliştirici
Ankara / Çankaya | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Trendyol Teknoloji A.Ş.
Kıdemli Backend Geliştirici (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
ODTÜ - Bilgisayar Mühendisliği (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Burak Korkmaz');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[ADVERSARIAL_363/500] Extract Kemal Zaman (Kurumsal Finans Direktörü) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Kemal Zaman
İstanbul / Beşiktaş
Kurumsal Finans Direktörü

İŞ TECRÜBELERİ
Garanti BBVA A.Ş. (2017 - 2024)
Kurumsal Finans Direktörü
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Boğaziçi Üniversitesi - İşletme (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Kemal Zaman');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Garanti', 'i'));
  });

  it('[ADVERSARIAL_364/500] Extract Fatma Özdemir (Tedarik Zinciri Müdürü) with format type 3', () => {
    const cv = `
Fatma Özdemir
İzmir / Bornova | contact@example.com
Tedarik Zinciri Müdürü

WORK EXPERIENCE
Ekol Lojistik A.Ş. - Tedarik Zinciri Müdürü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Dokuz Eylül Üniversitesi - Endüstri Mühendisliği (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Fatma Özdemir');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İzmir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Ekol', 'i'));
  });

  it('[ADVERSARIAL_365/500] Extract Haluk Sunal (İnsan Kaynakları Direktörü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Haluk Sunal               | Koç Holding A.Ş.                               |
| Şehir: İstanbul / Üsküdar | Görev: İnsan Kaynakları Direktörü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: Marmara Üniversitesi - İktisadi ve İdari Bilimler (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Haluk Sunal');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Koç', 'i'));
  });

  it('[ADVERSARIAL_366/500] Extract Zuhal Girik (Dijital Pazarlama Müdürü) with format type 0', () => {
    const cv = `
Zuhal Girik
İstanbul / Şişli | 0532 999 00 11 | candidate@domain.com
Dijital Pazarlama Müdürü

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Dijital Pazarlama Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
Galatasaray Üniversitesi - İletişim Fakültesi (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Zuhal Girik');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[ADVERSARIAL_367/500] Extract Tarık Bilginer (Saha Satış Yöneticisi) with format type 1', () => {
    const cv = `
********************************************************************************
Tarık Bilginer — Saha Satış Yöneticisi
Eskişehir / Tepebaşı | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Migros Ticaret A.Ş.
Saha Satış Yöneticisi (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
Anadolu Üniversitesi - İktisat (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Tarık Bilginer');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Eskişehir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Migros', 'i'));
  });

  it('[ADVERSARIAL_368/500] Extract Münir Olcay (Operasyonel Mükemmellik Lideri) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Münir Olcay
Kocaeli / Gebze
Operasyonel Mükemmellik Lideri

İŞ TECRÜBELERİ
Arçelik Sanayi A.Ş. (2017 - 2024)
Operasyonel Mükemmellik Lideri
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Yıldız Teknik Üniversitesi - Makine Mühendisliği (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Münir Olcay');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Kocaeli');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[ADVERSARIAL_369/500] Extract Şener Akan (Siber Güvenlik Direktörü) with format type 3', () => {
    const cv = `
Şener Akan
Ankara / Yenimahalle | contact@example.com
Siber Güvenlik Direktörü

WORK EXPERIENCE
STM Savunma Teknolojileri A.Ş. - Siber Güvenlik Direktörü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Bilkent Üniversitesi - Elektrik Elektronik (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Şener Akan');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('STM', 'i'));
  });

  it('[ADVERSARIAL_370/500] Extract Adile Özkul (Kurumsal İletişim Müdürü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Adile Özkul               | Doğan Holding A.Ş.                               |
| Şehir: İstanbul / Beyoğlu | Görev: Kurumsal İletişim Müdürü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: İstanbul Üniversitesi - İletişim (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Adile Özkul');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Doğan', 'i'));
  });

  it('[ADVERSARIAL_371/500] Extract Ceren Şen (Çağrı Merkezi Operasyon Müdürü) with format type 0', () => {
    const cv = `
Ceren Şen
İstanbul / Kadıköy | 0532 999 00 11 | candidate@domain.com
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone Müşteri Hizmetleri A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Ceren Şen');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Vodafone', 'i'));
  });

  it('[ADVERSARIAL_372/500] Extract Mert Naşit (Kıdemli Backend Geliştirici) with format type 1', () => {
    const cv = `
********************************************************************************
Mert Naşit — Kıdemli Backend Geliştirici
Ankara / Çankaya | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Trendyol Teknoloji A.Ş.
Kıdemli Backend Geliştirici (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
ODTÜ - Bilgisayar Mühendisliği (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mert Naşit');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[ADVERSARIAL_373/500] Extract Emre Şentürk (Kurumsal Finans Direktörü) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Emre Şentürk
İstanbul / Beşiktaş
Kurumsal Finans Direktörü

İŞ TECRÜBELERİ
Garanti BBVA A.Ş. (2017 - 2024)
Kurumsal Finans Direktörü
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Boğaziçi Üniversitesi - İşletme (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Emre Şentürk');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Garanti', 'i'));
  });

  it('[ADVERSARIAL_374/500] Extract Ayşe Yalçın (Tedarik Zinciri Müdürü) with format type 3', () => {
    const cv = `
Ayşe Yalçın
İzmir / Bornova | contact@example.com
Tedarik Zinciri Müdürü

WORK EXPERIENCE
Ekol Lojistik A.Ş. - Tedarik Zinciri Müdürü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Dokuz Eylül Üniversitesi - Endüstri Mühendisliği (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Ayşe Yalçın');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İzmir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Ekol', 'i'));
  });

  it('[ADVERSARIAL_375/500] Extract Mehmet Kaya (İnsan Kaynakları Direktörü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Mehmet Kaya               | Koç Holding A.Ş.                               |
| Şehir: İstanbul / Üsküdar | Görev: İnsan Kaynakları Direktörü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: Marmara Üniversitesi - İktisadi ve İdari Bilimler (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mehmet Kaya');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Koç', 'i'));
  });

  it('[ADVERSARIAL_376/500] Extract Mustafa Yılmaz (Dijital Pazarlama Müdürü) with format type 0', () => {
    const cv = `
Mustafa Yılmaz
İstanbul / Şişli | 0532 999 00 11 | candidate@domain.com
Dijital Pazarlama Müdürü

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Dijital Pazarlama Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
Galatasaray Üniversitesi - İletişim Fakültesi (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mustafa Yılmaz');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[ADVERSARIAL_377/500] Extract Elif Demir (Saha Satış Yöneticisi) with format type 1', () => {
    const cv = `
********************************************************************************
Elif Demir — Saha Satış Yöneticisi
Eskişehir / Tepebaşı | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Migros Ticaret A.Ş.
Saha Satış Yöneticisi (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
Anadolu Üniversitesi - İktisat (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Elif Demir');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Eskişehir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Migros', 'i'));
  });

  it('[ADVERSARIAL_378/500] Extract Can Çelik (Operasyonel Mükemmellik Lideri) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Can Çelik
Kocaeli / Gebze
Operasyonel Mükemmellik Lideri

İŞ TECRÜBELERİ
Arçelik Sanayi A.Ş. (2017 - 2024)
Operasyonel Mükemmellik Lideri
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Yıldız Teknik Üniversitesi - Makine Mühendisliği (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Can Çelik');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Kocaeli');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[ADVERSARIAL_379/500] Extract Zeynep Soylu (Siber Güvenlik Direktörü) with format type 3', () => {
    const cv = `
Zeynep Soylu
Ankara / Yenimahalle | contact@example.com
Siber Güvenlik Direktörü

WORK EXPERIENCE
STM Savunma Teknolojileri A.Ş. - Siber Güvenlik Direktörü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Bilkent Üniversitesi - Elektrik Elektronik (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Zeynep Soylu');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('STM', 'i'));
  });

  it('[ADVERSARIAL_380/500] Extract Oğuzhan Şimşek (Kurumsal İletişim Müdürü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Oğuzhan Şimşek               | Doğan Holding A.Ş.                               |
| Şehir: İstanbul / Beyoğlu | Görev: Kurumsal İletişim Müdürü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: İstanbul Üniversitesi - İletişim (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Oğuzhan Şimşek');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Doğan', 'i'));
  });

  it('[ADVERSARIAL_381/500] Extract Uğur Korkmaz (Çağrı Merkezi Operasyon Müdürü) with format type 0', () => {
    const cv = `
Uğur Korkmaz
İstanbul / Kadıköy | 0532 999 00 11 | candidate@domain.com
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone Müşteri Hizmetleri A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Uğur Korkmaz');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Vodafone', 'i'));
  });

  it('[ADVERSARIAL_382/500] Extract Burak Zaman (Kıdemli Backend Geliştirici) with format type 1', () => {
    const cv = `
********************************************************************************
Burak Zaman — Kıdemli Backend Geliştirici
Ankara / Çankaya | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Trendyol Teknoloji A.Ş.
Kıdemli Backend Geliştirici (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
ODTÜ - Bilgisayar Mühendisliği (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Burak Zaman');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[ADVERSARIAL_383/500] Extract Kemal Özdemir (Kurumsal Finans Direktörü) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Kemal Özdemir
İstanbul / Beşiktaş
Kurumsal Finans Direktörü

İŞ TECRÜBELERİ
Garanti BBVA A.Ş. (2017 - 2024)
Kurumsal Finans Direktörü
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Boğaziçi Üniversitesi - İşletme (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Kemal Özdemir');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Garanti', 'i'));
  });

  it('[ADVERSARIAL_384/500] Extract Fatma Sunal (Tedarik Zinciri Müdürü) with format type 3', () => {
    const cv = `
Fatma Sunal
İzmir / Bornova | contact@example.com
Tedarik Zinciri Müdürü

WORK EXPERIENCE
Ekol Lojistik A.Ş. - Tedarik Zinciri Müdürü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Dokuz Eylül Üniversitesi - Endüstri Mühendisliği (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Fatma Sunal');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İzmir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Ekol', 'i'));
  });

  it('[ADVERSARIAL_385/500] Extract Haluk Girik (İnsan Kaynakları Direktörü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Haluk Girik               | Koç Holding A.Ş.                               |
| Şehir: İstanbul / Üsküdar | Görev: İnsan Kaynakları Direktörü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: Marmara Üniversitesi - İktisadi ve İdari Bilimler (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Haluk Girik');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Koç', 'i'));
  });

  it('[ADVERSARIAL_386/500] Extract Zuhal Bilginer (Dijital Pazarlama Müdürü) with format type 0', () => {
    const cv = `
Zuhal Bilginer
İstanbul / Şişli | 0532 999 00 11 | candidate@domain.com
Dijital Pazarlama Müdürü

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Dijital Pazarlama Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
Galatasaray Üniversitesi - İletişim Fakültesi (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Zuhal Bilginer');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[ADVERSARIAL_387/500] Extract Tarık Olcay (Saha Satış Yöneticisi) with format type 1', () => {
    const cv = `
********************************************************************************
Tarık Olcay — Saha Satış Yöneticisi
Eskişehir / Tepebaşı | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Migros Ticaret A.Ş.
Saha Satış Yöneticisi (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
Anadolu Üniversitesi - İktisat (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Tarık Olcay');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Eskişehir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Migros', 'i'));
  });

  it('[ADVERSARIAL_388/500] Extract Münir Akan (Operasyonel Mükemmellik Lideri) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Münir Akan
Kocaeli / Gebze
Operasyonel Mükemmellik Lideri

İŞ TECRÜBELERİ
Arçelik Sanayi A.Ş. (2017 - 2024)
Operasyonel Mükemmellik Lideri
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Yıldız Teknik Üniversitesi - Makine Mühendisliği (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Münir Akan');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Kocaeli');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[ADVERSARIAL_389/500] Extract Şener Özkul (Siber Güvenlik Direktörü) with format type 3', () => {
    const cv = `
Şener Özkul
Ankara / Yenimahalle | contact@example.com
Siber Güvenlik Direktörü

WORK EXPERIENCE
STM Savunma Teknolojileri A.Ş. - Siber Güvenlik Direktörü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Bilkent Üniversitesi - Elektrik Elektronik (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Şener Özkul');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('STM', 'i'));
  });

  it('[ADVERSARIAL_390/500] Extract Adile Şen (Kurumsal İletişim Müdürü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Adile Şen               | Doğan Holding A.Ş.                               |
| Şehir: İstanbul / Beyoğlu | Görev: Kurumsal İletişim Müdürü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: İstanbul Üniversitesi - İletişim (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Adile Şen');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Doğan', 'i'));
  });

  it('[ADVERSARIAL_391/500] Extract Ceren Naşit (Çağrı Merkezi Operasyon Müdürü) with format type 0', () => {
    const cv = `
Ceren Naşit
İstanbul / Kadıköy | 0532 999 00 11 | candidate@domain.com
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone Müşteri Hizmetleri A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Ceren Naşit');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Vodafone', 'i'));
  });

  it('[ADVERSARIAL_392/500] Extract Mert Şentürk (Kıdemli Backend Geliştirici) with format type 1', () => {
    const cv = `
********************************************************************************
Mert Şentürk — Kıdemli Backend Geliştirici
Ankara / Çankaya | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Trendyol Teknoloji A.Ş.
Kıdemli Backend Geliştirici (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
ODTÜ - Bilgisayar Mühendisliği (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mert Şentürk');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[ADVERSARIAL_393/500] Extract Emre Yalçın (Kurumsal Finans Direktörü) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Emre Yalçın
İstanbul / Beşiktaş
Kurumsal Finans Direktörü

İŞ TECRÜBELERİ
Garanti BBVA A.Ş. (2017 - 2024)
Kurumsal Finans Direktörü
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Boğaziçi Üniversitesi - İşletme (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Emre Yalçın');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Garanti', 'i'));
  });

  it('[ADVERSARIAL_394/500] Extract Ayşe Kaya (Tedarik Zinciri Müdürü) with format type 3', () => {
    const cv = `
Ayşe Kaya
İzmir / Bornova | contact@example.com
Tedarik Zinciri Müdürü

WORK EXPERIENCE
Ekol Lojistik A.Ş. - Tedarik Zinciri Müdürü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Dokuz Eylül Üniversitesi - Endüstri Mühendisliği (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Ayşe Kaya');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İzmir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Ekol', 'i'));
  });

  it('[ADVERSARIAL_395/500] Extract Mehmet Yılmaz (İnsan Kaynakları Direktörü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Mehmet Yılmaz               | Koç Holding A.Ş.                               |
| Şehir: İstanbul / Üsküdar | Görev: İnsan Kaynakları Direktörü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: Marmara Üniversitesi - İktisadi ve İdari Bilimler (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mehmet Yılmaz');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Koç', 'i'));
  });

  it('[ADVERSARIAL_396/500] Extract Mustafa Demir (Dijital Pazarlama Müdürü) with format type 0', () => {
    const cv = `
Mustafa Demir
İstanbul / Şişli | 0532 999 00 11 | candidate@domain.com
Dijital Pazarlama Müdürü

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Dijital Pazarlama Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
Galatasaray Üniversitesi - İletişim Fakültesi (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mustafa Demir');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[ADVERSARIAL_397/500] Extract Elif Çelik (Saha Satış Yöneticisi) with format type 1', () => {
    const cv = `
********************************************************************************
Elif Çelik — Saha Satış Yöneticisi
Eskişehir / Tepebaşı | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Migros Ticaret A.Ş.
Saha Satış Yöneticisi (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
Anadolu Üniversitesi - İktisat (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Elif Çelik');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Eskişehir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Migros', 'i'));
  });

  it('[ADVERSARIAL_398/500] Extract Can Soylu (Operasyonel Mükemmellik Lideri) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Can Soylu
Kocaeli / Gebze
Operasyonel Mükemmellik Lideri

İŞ TECRÜBELERİ
Arçelik Sanayi A.Ş. (2017 - 2024)
Operasyonel Mükemmellik Lideri
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Yıldız Teknik Üniversitesi - Makine Mühendisliği (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Can Soylu');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Kocaeli');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[ADVERSARIAL_399/500] Extract Zeynep Şimşek (Siber Güvenlik Direktörü) with format type 3', () => {
    const cv = `
Zeynep Şimşek
Ankara / Yenimahalle | contact@example.com
Siber Güvenlik Direktörü

WORK EXPERIENCE
STM Savunma Teknolojileri A.Ş. - Siber Güvenlik Direktörü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Bilkent Üniversitesi - Elektrik Elektronik (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Zeynep Şimşek');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('STM', 'i'));
  });

  it('[ADVERSARIAL_400/500] Extract Oğuzhan Karaca (Kurumsal İletişim Müdürü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Oğuzhan Karaca               | Doğan Holding A.Ş.                               |
| Şehir: İstanbul / Beyoğlu | Görev: Kurumsal İletişim Müdürü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: İstanbul Üniversitesi - İletişim (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Oğuzhan Karaca');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Doğan', 'i'));
  });

  it('[ADVERSARIAL_401/500] Extract Uğur Zaman (Çağrı Merkezi Operasyon Müdürü) with format type 0', () => {
    const cv = `
Uğur Zaman
İstanbul / Kadıköy | 0532 999 00 11 | candidate@domain.com
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone Müşteri Hizmetleri A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Uğur Zaman');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Vodafone', 'i'));
  });

  it('[ADVERSARIAL_402/500] Extract Burak Özdemir (Kıdemli Backend Geliştirici) with format type 1', () => {
    const cv = `
********************************************************************************
Burak Özdemir — Kıdemli Backend Geliştirici
Ankara / Çankaya | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Trendyol Teknoloji A.Ş.
Kıdemli Backend Geliştirici (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
ODTÜ - Bilgisayar Mühendisliği (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Burak Özdemir');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[ADVERSARIAL_403/500] Extract Kemal Sunal (Kurumsal Finans Direktörü) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Kemal Sunal
İstanbul / Beşiktaş
Kurumsal Finans Direktörü

İŞ TECRÜBELERİ
Garanti BBVA A.Ş. (2017 - 2024)
Kurumsal Finans Direktörü
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Boğaziçi Üniversitesi - İşletme (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Kemal Sunal');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Garanti', 'i'));
  });

  it('[ADVERSARIAL_404/500] Extract Fatma Girik (Tedarik Zinciri Müdürü) with format type 3', () => {
    const cv = `
Fatma Girik
İzmir / Bornova | contact@example.com
Tedarik Zinciri Müdürü

WORK EXPERIENCE
Ekol Lojistik A.Ş. - Tedarik Zinciri Müdürü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Dokuz Eylül Üniversitesi - Endüstri Mühendisliği (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Fatma Girik');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İzmir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Ekol', 'i'));
  });

  it('[ADVERSARIAL_405/500] Extract Haluk Bilginer (İnsan Kaynakları Direktörü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Haluk Bilginer               | Koç Holding A.Ş.                               |
| Şehir: İstanbul / Üsküdar | Görev: İnsan Kaynakları Direktörü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: Marmara Üniversitesi - İktisadi ve İdari Bilimler (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Haluk Bilginer');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Koç', 'i'));
  });

  it('[ADVERSARIAL_406/500] Extract Zuhal Olcay (Dijital Pazarlama Müdürü) with format type 0', () => {
    const cv = `
Zuhal Olcay
İstanbul / Şişli | 0532 999 00 11 | candidate@domain.com
Dijital Pazarlama Müdürü

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Dijital Pazarlama Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
Galatasaray Üniversitesi - İletişim Fakültesi (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Zuhal Olcay');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[ADVERSARIAL_407/500] Extract Tarık Akan (Saha Satış Yöneticisi) with format type 1', () => {
    const cv = `
********************************************************************************
Tarık Akan — Saha Satış Yöneticisi
Eskişehir / Tepebaşı | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Migros Ticaret A.Ş.
Saha Satış Yöneticisi (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
Anadolu Üniversitesi - İktisat (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Tarık Akan');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Eskişehir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Migros', 'i'));
  });

  it('[ADVERSARIAL_408/500] Extract Münir Özkul (Operasyonel Mükemmellik Lideri) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Münir Özkul
Kocaeli / Gebze
Operasyonel Mükemmellik Lideri

İŞ TECRÜBELERİ
Arçelik Sanayi A.Ş. (2017 - 2024)
Operasyonel Mükemmellik Lideri
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Yıldız Teknik Üniversitesi - Makine Mühendisliği (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Münir Özkul');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Kocaeli');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[ADVERSARIAL_409/500] Extract Şener Şen (Siber Güvenlik Direktörü) with format type 3', () => {
    const cv = `
Şener Şen
Ankara / Yenimahalle | contact@example.com
Siber Güvenlik Direktörü

WORK EXPERIENCE
STM Savunma Teknolojileri A.Ş. - Siber Güvenlik Direktörü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Bilkent Üniversitesi - Elektrik Elektronik (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Şener Şen');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('STM', 'i'));
  });

  it('[ADVERSARIAL_410/500] Extract Adile Naşit (Kurumsal İletişim Müdürü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Adile Naşit               | Doğan Holding A.Ş.                               |
| Şehir: İstanbul / Beyoğlu | Görev: Kurumsal İletişim Müdürü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: İstanbul Üniversitesi - İletişim (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Adile Naşit');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Doğan', 'i'));
  });

  it('[ADVERSARIAL_411/500] Extract Ceren Şentürk (Çağrı Merkezi Operasyon Müdürü) with format type 0', () => {
    const cv = `
Ceren Şentürk
İstanbul / Kadıköy | 0532 999 00 11 | candidate@domain.com
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone Müşteri Hizmetleri A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Ceren Şentürk');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Vodafone', 'i'));
  });

  it('[ADVERSARIAL_412/500] Extract Mert Yalçın (Kıdemli Backend Geliştirici) with format type 1', () => {
    const cv = `
********************************************************************************
Mert Yalçın — Kıdemli Backend Geliştirici
Ankara / Çankaya | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Trendyol Teknoloji A.Ş.
Kıdemli Backend Geliştirici (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
ODTÜ - Bilgisayar Mühendisliği (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mert Yalçın');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[ADVERSARIAL_413/500] Extract Emre Kaya (Kurumsal Finans Direktörü) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Emre Kaya
İstanbul / Beşiktaş
Kurumsal Finans Direktörü

İŞ TECRÜBELERİ
Garanti BBVA A.Ş. (2017 - 2024)
Kurumsal Finans Direktörü
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Boğaziçi Üniversitesi - İşletme (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Emre Kaya');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Garanti', 'i'));
  });

  it('[ADVERSARIAL_414/500] Extract Ayşe Yılmaz (Tedarik Zinciri Müdürü) with format type 3', () => {
    const cv = `
Ayşe Yılmaz
İzmir / Bornova | contact@example.com
Tedarik Zinciri Müdürü

WORK EXPERIENCE
Ekol Lojistik A.Ş. - Tedarik Zinciri Müdürü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Dokuz Eylül Üniversitesi - Endüstri Mühendisliği (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Ayşe Yılmaz');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İzmir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Ekol', 'i'));
  });

  it('[ADVERSARIAL_415/500] Extract Mehmet Demir (İnsan Kaynakları Direktörü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Mehmet Demir               | Koç Holding A.Ş.                               |
| Şehir: İstanbul / Üsküdar | Görev: İnsan Kaynakları Direktörü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: Marmara Üniversitesi - İktisadi ve İdari Bilimler (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mehmet Demir');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Koç', 'i'));
  });

  it('[ADVERSARIAL_416/500] Extract Mustafa Çelik (Dijital Pazarlama Müdürü) with format type 0', () => {
    const cv = `
Mustafa Çelik
İstanbul / Şişli | 0532 999 00 11 | candidate@domain.com
Dijital Pazarlama Müdürü

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Dijital Pazarlama Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
Galatasaray Üniversitesi - İletişim Fakültesi (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mustafa Çelik');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[ADVERSARIAL_417/500] Extract Elif Soylu (Saha Satış Yöneticisi) with format type 1', () => {
    const cv = `
********************************************************************************
Elif Soylu — Saha Satış Yöneticisi
Eskişehir / Tepebaşı | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Migros Ticaret A.Ş.
Saha Satış Yöneticisi (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
Anadolu Üniversitesi - İktisat (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Elif Soylu');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Eskişehir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Migros', 'i'));
  });

  it('[ADVERSARIAL_418/500] Extract Can Şimşek (Operasyonel Mükemmellik Lideri) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Can Şimşek
Kocaeli / Gebze
Operasyonel Mükemmellik Lideri

İŞ TECRÜBELERİ
Arçelik Sanayi A.Ş. (2017 - 2024)
Operasyonel Mükemmellik Lideri
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Yıldız Teknik Üniversitesi - Makine Mühendisliği (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Can Şimşek');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Kocaeli');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[ADVERSARIAL_419/500] Extract Zeynep Karaca (Siber Güvenlik Direktörü) with format type 3', () => {
    const cv = `
Zeynep Karaca
Ankara / Yenimahalle | contact@example.com
Siber Güvenlik Direktörü

WORK EXPERIENCE
STM Savunma Teknolojileri A.Ş. - Siber Güvenlik Direktörü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Bilkent Üniversitesi - Elektrik Elektronik (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Zeynep Karaca');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('STM', 'i'));
  });

  it('[ADVERSARIAL_420/500] Extract Oğuzhan Korkmaz (Kurumsal İletişim Müdürü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Oğuzhan Korkmaz               | Doğan Holding A.Ş.                               |
| Şehir: İstanbul / Beyoğlu | Görev: Kurumsal İletişim Müdürü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: İstanbul Üniversitesi - İletişim (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Oğuzhan Korkmaz');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Doğan', 'i'));
  });

  it('[ADVERSARIAL_421/500] Extract Uğur Özdemir (Çağrı Merkezi Operasyon Müdürü) with format type 0', () => {
    const cv = `
Uğur Özdemir
İstanbul / Kadıköy | 0532 999 00 11 | candidate@domain.com
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone Müşteri Hizmetleri A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Uğur Özdemir');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Vodafone', 'i'));
  });

  it('[ADVERSARIAL_422/500] Extract Burak Sunal (Kıdemli Backend Geliştirici) with format type 1', () => {
    const cv = `
********************************************************************************
Burak Sunal — Kıdemli Backend Geliştirici
Ankara / Çankaya | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Trendyol Teknoloji A.Ş.
Kıdemli Backend Geliştirici (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
ODTÜ - Bilgisayar Mühendisliği (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Burak Sunal');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[ADVERSARIAL_423/500] Extract Kemal Girik (Kurumsal Finans Direktörü) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Kemal Girik
İstanbul / Beşiktaş
Kurumsal Finans Direktörü

İŞ TECRÜBELERİ
Garanti BBVA A.Ş. (2017 - 2024)
Kurumsal Finans Direktörü
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Boğaziçi Üniversitesi - İşletme (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Kemal Girik');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Garanti', 'i'));
  });

  it('[ADVERSARIAL_424/500] Extract Fatma Bilginer (Tedarik Zinciri Müdürü) with format type 3', () => {
    const cv = `
Fatma Bilginer
İzmir / Bornova | contact@example.com
Tedarik Zinciri Müdürü

WORK EXPERIENCE
Ekol Lojistik A.Ş. - Tedarik Zinciri Müdürü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Dokuz Eylül Üniversitesi - Endüstri Mühendisliği (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Fatma Bilginer');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İzmir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Ekol', 'i'));
  });

  it('[ADVERSARIAL_425/500] Extract Haluk Olcay (İnsan Kaynakları Direktörü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Haluk Olcay               | Koç Holding A.Ş.                               |
| Şehir: İstanbul / Üsküdar | Görev: İnsan Kaynakları Direktörü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: Marmara Üniversitesi - İktisadi ve İdari Bilimler (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Haluk Olcay');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Koç', 'i'));
  });

  it('[ADVERSARIAL_426/500] Extract Zuhal Akan (Dijital Pazarlama Müdürü) with format type 0', () => {
    const cv = `
Zuhal Akan
İstanbul / Şişli | 0532 999 00 11 | candidate@domain.com
Dijital Pazarlama Müdürü

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Dijital Pazarlama Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
Galatasaray Üniversitesi - İletişim Fakültesi (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Zuhal Akan');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[ADVERSARIAL_427/500] Extract Tarık Özkul (Saha Satış Yöneticisi) with format type 1', () => {
    const cv = `
********************************************************************************
Tarık Özkul — Saha Satış Yöneticisi
Eskişehir / Tepebaşı | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Migros Ticaret A.Ş.
Saha Satış Yöneticisi (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
Anadolu Üniversitesi - İktisat (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Tarık Özkul');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Eskişehir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Migros', 'i'));
  });

  it('[ADVERSARIAL_428/500] Extract Münir Şen (Operasyonel Mükemmellik Lideri) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Münir Şen
Kocaeli / Gebze
Operasyonel Mükemmellik Lideri

İŞ TECRÜBELERİ
Arçelik Sanayi A.Ş. (2017 - 2024)
Operasyonel Mükemmellik Lideri
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Yıldız Teknik Üniversitesi - Makine Mühendisliği (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Münir Şen');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Kocaeli');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[ADVERSARIAL_429/500] Extract Şener Naşit (Siber Güvenlik Direktörü) with format type 3', () => {
    const cv = `
Şener Naşit
Ankara / Yenimahalle | contact@example.com
Siber Güvenlik Direktörü

WORK EXPERIENCE
STM Savunma Teknolojileri A.Ş. - Siber Güvenlik Direktörü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Bilkent Üniversitesi - Elektrik Elektronik (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Şener Naşit');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('STM', 'i'));
  });

  it('[ADVERSARIAL_430/500] Extract Adile Şentürk (Kurumsal İletişim Müdürü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Adile Şentürk               | Doğan Holding A.Ş.                               |
| Şehir: İstanbul / Beyoğlu | Görev: Kurumsal İletişim Müdürü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: İstanbul Üniversitesi - İletişim (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Adile Şentürk');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Doğan', 'i'));
  });

  it('[ADVERSARIAL_431/500] Extract Ceren Yalçın (Çağrı Merkezi Operasyon Müdürü) with format type 0', () => {
    const cv = `
Ceren Yalçın
İstanbul / Kadıköy | 0532 999 00 11 | candidate@domain.com
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone Müşteri Hizmetleri A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Ceren Yalçın');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Vodafone', 'i'));
  });

  it('[ADVERSARIAL_432/500] Extract Mert Kaya (Kıdemli Backend Geliştirici) with format type 1', () => {
    const cv = `
********************************************************************************
Mert Kaya — Kıdemli Backend Geliştirici
Ankara / Çankaya | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Trendyol Teknoloji A.Ş.
Kıdemli Backend Geliştirici (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
ODTÜ - Bilgisayar Mühendisliği (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mert Kaya');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[ADVERSARIAL_433/500] Extract Emre Yılmaz (Kurumsal Finans Direktörü) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Emre Yılmaz
İstanbul / Beşiktaş
Kurumsal Finans Direktörü

İŞ TECRÜBELERİ
Garanti BBVA A.Ş. (2017 - 2024)
Kurumsal Finans Direktörü
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Boğaziçi Üniversitesi - İşletme (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Emre Yılmaz');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Garanti', 'i'));
  });

  it('[ADVERSARIAL_434/500] Extract Ayşe Demir (Tedarik Zinciri Müdürü) with format type 3', () => {
    const cv = `
Ayşe Demir
İzmir / Bornova | contact@example.com
Tedarik Zinciri Müdürü

WORK EXPERIENCE
Ekol Lojistik A.Ş. - Tedarik Zinciri Müdürü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Dokuz Eylül Üniversitesi - Endüstri Mühendisliği (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Ayşe Demir');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İzmir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Ekol', 'i'));
  });

  it('[ADVERSARIAL_435/500] Extract Mehmet Çelik (İnsan Kaynakları Direktörü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Mehmet Çelik               | Koç Holding A.Ş.                               |
| Şehir: İstanbul / Üsküdar | Görev: İnsan Kaynakları Direktörü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: Marmara Üniversitesi - İktisadi ve İdari Bilimler (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mehmet Çelik');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Koç', 'i'));
  });

  it('[ADVERSARIAL_436/500] Extract Mustafa Soylu (Dijital Pazarlama Müdürü) with format type 0', () => {
    const cv = `
Mustafa Soylu
İstanbul / Şişli | 0532 999 00 11 | candidate@domain.com
Dijital Pazarlama Müdürü

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Dijital Pazarlama Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
Galatasaray Üniversitesi - İletişim Fakültesi (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mustafa Soylu');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[ADVERSARIAL_437/500] Extract Elif Şimşek (Saha Satış Yöneticisi) with format type 1', () => {
    const cv = `
********************************************************************************
Elif Şimşek — Saha Satış Yöneticisi
Eskişehir / Tepebaşı | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Migros Ticaret A.Ş.
Saha Satış Yöneticisi (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
Anadolu Üniversitesi - İktisat (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Elif Şimşek');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Eskişehir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Migros', 'i'));
  });

  it('[ADVERSARIAL_438/500] Extract Can Karaca (Operasyonel Mükemmellik Lideri) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Can Karaca
Kocaeli / Gebze
Operasyonel Mükemmellik Lideri

İŞ TECRÜBELERİ
Arçelik Sanayi A.Ş. (2017 - 2024)
Operasyonel Mükemmellik Lideri
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Yıldız Teknik Üniversitesi - Makine Mühendisliği (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Can Karaca');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Kocaeli');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[ADVERSARIAL_439/500] Extract Zeynep Korkmaz (Siber Güvenlik Direktörü) with format type 3', () => {
    const cv = `
Zeynep Korkmaz
Ankara / Yenimahalle | contact@example.com
Siber Güvenlik Direktörü

WORK EXPERIENCE
STM Savunma Teknolojileri A.Ş. - Siber Güvenlik Direktörü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Bilkent Üniversitesi - Elektrik Elektronik (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Zeynep Korkmaz');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('STM', 'i'));
  });

  it('[ADVERSARIAL_440/500] Extract Oğuzhan Zaman (Kurumsal İletişim Müdürü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Oğuzhan Zaman               | Doğan Holding A.Ş.                               |
| Şehir: İstanbul / Beyoğlu | Görev: Kurumsal İletişim Müdürü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: İstanbul Üniversitesi - İletişim (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Oğuzhan Zaman');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Doğan', 'i'));
  });

  it('[ADVERSARIAL_441/500] Extract Uğur Sunal (Çağrı Merkezi Operasyon Müdürü) with format type 0', () => {
    const cv = `
Uğur Sunal
İstanbul / Kadıköy | 0532 999 00 11 | candidate@domain.com
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone Müşteri Hizmetleri A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Uğur Sunal');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Vodafone', 'i'));
  });

  it('[ADVERSARIAL_442/500] Extract Burak Girik (Kıdemli Backend Geliştirici) with format type 1', () => {
    const cv = `
********************************************************************************
Burak Girik — Kıdemli Backend Geliştirici
Ankara / Çankaya | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Trendyol Teknoloji A.Ş.
Kıdemli Backend Geliştirici (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
ODTÜ - Bilgisayar Mühendisliği (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Burak Girik');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[ADVERSARIAL_443/500] Extract Kemal Bilginer (Kurumsal Finans Direktörü) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Kemal Bilginer
İstanbul / Beşiktaş
Kurumsal Finans Direktörü

İŞ TECRÜBELERİ
Garanti BBVA A.Ş. (2017 - 2024)
Kurumsal Finans Direktörü
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Boğaziçi Üniversitesi - İşletme (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Kemal Bilginer');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Garanti', 'i'));
  });

  it('[ADVERSARIAL_444/500] Extract Fatma Olcay (Tedarik Zinciri Müdürü) with format type 3', () => {
    const cv = `
Fatma Olcay
İzmir / Bornova | contact@example.com
Tedarik Zinciri Müdürü

WORK EXPERIENCE
Ekol Lojistik A.Ş. - Tedarik Zinciri Müdürü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Dokuz Eylül Üniversitesi - Endüstri Mühendisliği (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Fatma Olcay');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İzmir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Ekol', 'i'));
  });

  it('[ADVERSARIAL_445/500] Extract Haluk Akan (İnsan Kaynakları Direktörü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Haluk Akan               | Koç Holding A.Ş.                               |
| Şehir: İstanbul / Üsküdar | Görev: İnsan Kaynakları Direktörü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: Marmara Üniversitesi - İktisadi ve İdari Bilimler (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Haluk Akan');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Koç', 'i'));
  });

  it('[ADVERSARIAL_446/500] Extract Zuhal Özkul (Dijital Pazarlama Müdürü) with format type 0', () => {
    const cv = `
Zuhal Özkul
İstanbul / Şişli | 0532 999 00 11 | candidate@domain.com
Dijital Pazarlama Müdürü

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Dijital Pazarlama Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
Galatasaray Üniversitesi - İletişim Fakültesi (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Zuhal Özkul');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[ADVERSARIAL_447/500] Extract Tarık Şen (Saha Satış Yöneticisi) with format type 1', () => {
    const cv = `
********************************************************************************
Tarık Şen — Saha Satış Yöneticisi
Eskişehir / Tepebaşı | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Migros Ticaret A.Ş.
Saha Satış Yöneticisi (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
Anadolu Üniversitesi - İktisat (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Tarık Şen');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Eskişehir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Migros', 'i'));
  });

  it('[ADVERSARIAL_448/500] Extract Münir Naşit (Operasyonel Mükemmellik Lideri) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Münir Naşit
Kocaeli / Gebze
Operasyonel Mükemmellik Lideri

İŞ TECRÜBELERİ
Arçelik Sanayi A.Ş. (2017 - 2024)
Operasyonel Mükemmellik Lideri
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Yıldız Teknik Üniversitesi - Makine Mühendisliği (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Münir Naşit');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Kocaeli');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[ADVERSARIAL_449/500] Extract Şener Şentürk (Siber Güvenlik Direktörü) with format type 3', () => {
    const cv = `
Şener Şentürk
Ankara / Yenimahalle | contact@example.com
Siber Güvenlik Direktörü

WORK EXPERIENCE
STM Savunma Teknolojileri A.Ş. - Siber Güvenlik Direktörü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Bilkent Üniversitesi - Elektrik Elektronik (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Şener Şentürk');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('STM', 'i'));
  });

  it('[ADVERSARIAL_450/500] Extract Adile Yalçın (Kurumsal İletişim Müdürü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Adile Yalçın               | Doğan Holding A.Ş.                               |
| Şehir: İstanbul / Beyoğlu | Görev: Kurumsal İletişim Müdürü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: İstanbul Üniversitesi - İletişim (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Adile Yalçın');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Doğan', 'i'));
  });

  it('[ADVERSARIAL_451/500] Extract Ceren Kaya (Çağrı Merkezi Operasyon Müdürü) with format type 0', () => {
    const cv = `
Ceren Kaya
İstanbul / Kadıköy | 0532 999 00 11 | candidate@domain.com
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone Müşteri Hizmetleri A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Ceren Kaya');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Vodafone', 'i'));
  });

  it('[ADVERSARIAL_452/500] Extract Mert Yılmaz (Kıdemli Backend Geliştirici) with format type 1', () => {
    const cv = `
********************************************************************************
Mert Yılmaz — Kıdemli Backend Geliştirici
Ankara / Çankaya | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Trendyol Teknoloji A.Ş.
Kıdemli Backend Geliştirici (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
ODTÜ - Bilgisayar Mühendisliği (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mert Yılmaz');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[ADVERSARIAL_453/500] Extract Emre Demir (Kurumsal Finans Direktörü) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Emre Demir
İstanbul / Beşiktaş
Kurumsal Finans Direktörü

İŞ TECRÜBELERİ
Garanti BBVA A.Ş. (2017 - 2024)
Kurumsal Finans Direktörü
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Boğaziçi Üniversitesi - İşletme (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Emre Demir');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Garanti', 'i'));
  });

  it('[ADVERSARIAL_454/500] Extract Ayşe Çelik (Tedarik Zinciri Müdürü) with format type 3', () => {
    const cv = `
Ayşe Çelik
İzmir / Bornova | contact@example.com
Tedarik Zinciri Müdürü

WORK EXPERIENCE
Ekol Lojistik A.Ş. - Tedarik Zinciri Müdürü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Dokuz Eylül Üniversitesi - Endüstri Mühendisliği (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Ayşe Çelik');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İzmir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Ekol', 'i'));
  });

  it('[ADVERSARIAL_455/500] Extract Mehmet Soylu (İnsan Kaynakları Direktörü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Mehmet Soylu               | Koç Holding A.Ş.                               |
| Şehir: İstanbul / Üsküdar | Görev: İnsan Kaynakları Direktörü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: Marmara Üniversitesi - İktisadi ve İdari Bilimler (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mehmet Soylu');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Koç', 'i'));
  });

  it('[ADVERSARIAL_456/500] Extract Mustafa Şimşek (Dijital Pazarlama Müdürü) with format type 0', () => {
    const cv = `
Mustafa Şimşek
İstanbul / Şişli | 0532 999 00 11 | candidate@domain.com
Dijital Pazarlama Müdürü

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Dijital Pazarlama Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
Galatasaray Üniversitesi - İletişim Fakültesi (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mustafa Şimşek');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[ADVERSARIAL_457/500] Extract Elif Karaca (Saha Satış Yöneticisi) with format type 1', () => {
    const cv = `
********************************************************************************
Elif Karaca — Saha Satış Yöneticisi
Eskişehir / Tepebaşı | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Migros Ticaret A.Ş.
Saha Satış Yöneticisi (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
Anadolu Üniversitesi - İktisat (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Elif Karaca');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Eskişehir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Migros', 'i'));
  });

  it('[ADVERSARIAL_458/500] Extract Can Korkmaz (Operasyonel Mükemmellik Lideri) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Can Korkmaz
Kocaeli / Gebze
Operasyonel Mükemmellik Lideri

İŞ TECRÜBELERİ
Arçelik Sanayi A.Ş. (2017 - 2024)
Operasyonel Mükemmellik Lideri
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Yıldız Teknik Üniversitesi - Makine Mühendisliği (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Can Korkmaz');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Kocaeli');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[ADVERSARIAL_459/500] Extract Zeynep Zaman (Siber Güvenlik Direktörü) with format type 3', () => {
    const cv = `
Zeynep Zaman
Ankara / Yenimahalle | contact@example.com
Siber Güvenlik Direktörü

WORK EXPERIENCE
STM Savunma Teknolojileri A.Ş. - Siber Güvenlik Direktörü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Bilkent Üniversitesi - Elektrik Elektronik (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Zeynep Zaman');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('STM', 'i'));
  });

  it('[ADVERSARIAL_460/500] Extract Oğuzhan Özdemir (Kurumsal İletişim Müdürü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Oğuzhan Özdemir               | Doğan Holding A.Ş.                               |
| Şehir: İstanbul / Beyoğlu | Görev: Kurumsal İletişim Müdürü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: İstanbul Üniversitesi - İletişim (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Oğuzhan Özdemir');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Doğan', 'i'));
  });

  it('[ADVERSARIAL_461/500] Extract Uğur Girik (Çağrı Merkezi Operasyon Müdürü) with format type 0', () => {
    const cv = `
Uğur Girik
İstanbul / Kadıköy | 0532 999 00 11 | candidate@domain.com
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone Müşteri Hizmetleri A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Uğur Girik');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Vodafone', 'i'));
  });

  it('[ADVERSARIAL_462/500] Extract Burak Bilginer (Kıdemli Backend Geliştirici) with format type 1', () => {
    const cv = `
********************************************************************************
Burak Bilginer — Kıdemli Backend Geliştirici
Ankara / Çankaya | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Trendyol Teknoloji A.Ş.
Kıdemli Backend Geliştirici (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
ODTÜ - Bilgisayar Mühendisliği (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Burak Bilginer');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[ADVERSARIAL_463/500] Extract Kemal Olcay (Kurumsal Finans Direktörü) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Kemal Olcay
İstanbul / Beşiktaş
Kurumsal Finans Direktörü

İŞ TECRÜBELERİ
Garanti BBVA A.Ş. (2017 - 2024)
Kurumsal Finans Direktörü
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Boğaziçi Üniversitesi - İşletme (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Kemal Olcay');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Garanti', 'i'));
  });

  it('[ADVERSARIAL_464/500] Extract Fatma Akan (Tedarik Zinciri Müdürü) with format type 3', () => {
    const cv = `
Fatma Akan
İzmir / Bornova | contact@example.com
Tedarik Zinciri Müdürü

WORK EXPERIENCE
Ekol Lojistik A.Ş. - Tedarik Zinciri Müdürü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Dokuz Eylül Üniversitesi - Endüstri Mühendisliği (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Fatma Akan');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İzmir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Ekol', 'i'));
  });

  it('[ADVERSARIAL_465/500] Extract Haluk Özkul (İnsan Kaynakları Direktörü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Haluk Özkul               | Koç Holding A.Ş.                               |
| Şehir: İstanbul / Üsküdar | Görev: İnsan Kaynakları Direktörü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: Marmara Üniversitesi - İktisadi ve İdari Bilimler (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Haluk Özkul');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Koç', 'i'));
  });

  it('[ADVERSARIAL_466/500] Extract Zuhal Şen (Dijital Pazarlama Müdürü) with format type 0', () => {
    const cv = `
Zuhal Şen
İstanbul / Şişli | 0532 999 00 11 | candidate@domain.com
Dijital Pazarlama Müdürü

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Dijital Pazarlama Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
Galatasaray Üniversitesi - İletişim Fakültesi (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Zuhal Şen');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[ADVERSARIAL_467/500] Extract Tarık Naşit (Saha Satış Yöneticisi) with format type 1', () => {
    const cv = `
********************************************************************************
Tarık Naşit — Saha Satış Yöneticisi
Eskişehir / Tepebaşı | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Migros Ticaret A.Ş.
Saha Satış Yöneticisi (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
Anadolu Üniversitesi - İktisat (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Tarık Naşit');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Eskişehir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Migros', 'i'));
  });

  it('[ADVERSARIAL_468/500] Extract Münir Şentürk (Operasyonel Mükemmellik Lideri) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Münir Şentürk
Kocaeli / Gebze
Operasyonel Mükemmellik Lideri

İŞ TECRÜBELERİ
Arçelik Sanayi A.Ş. (2017 - 2024)
Operasyonel Mükemmellik Lideri
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Yıldız Teknik Üniversitesi - Makine Mühendisliği (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Münir Şentürk');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Kocaeli');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[ADVERSARIAL_469/500] Extract Şener Yalçın (Siber Güvenlik Direktörü) with format type 3', () => {
    const cv = `
Şener Yalçın
Ankara / Yenimahalle | contact@example.com
Siber Güvenlik Direktörü

WORK EXPERIENCE
STM Savunma Teknolojileri A.Ş. - Siber Güvenlik Direktörü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Bilkent Üniversitesi - Elektrik Elektronik (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Şener Yalçın');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('STM', 'i'));
  });

  it('[ADVERSARIAL_470/500] Extract Adile Kaya (Kurumsal İletişim Müdürü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Adile Kaya               | Doğan Holding A.Ş.                               |
| Şehir: İstanbul / Beyoğlu | Görev: Kurumsal İletişim Müdürü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: İstanbul Üniversitesi - İletişim (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Adile Kaya');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Doğan', 'i'));
  });

  it('[ADVERSARIAL_471/500] Extract Ceren Yılmaz (Çağrı Merkezi Operasyon Müdürü) with format type 0', () => {
    const cv = `
Ceren Yılmaz
İstanbul / Kadıköy | 0532 999 00 11 | candidate@domain.com
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone Müşteri Hizmetleri A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Ceren Yılmaz');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Vodafone', 'i'));
  });

  it('[ADVERSARIAL_472/500] Extract Mert Demir (Kıdemli Backend Geliştirici) with format type 1', () => {
    const cv = `
********************************************************************************
Mert Demir — Kıdemli Backend Geliştirici
Ankara / Çankaya | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Trendyol Teknoloji A.Ş.
Kıdemli Backend Geliştirici (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
ODTÜ - Bilgisayar Mühendisliği (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mert Demir');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[ADVERSARIAL_473/500] Extract Emre Çelik (Kurumsal Finans Direktörü) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Emre Çelik
İstanbul / Beşiktaş
Kurumsal Finans Direktörü

İŞ TECRÜBELERİ
Garanti BBVA A.Ş. (2017 - 2024)
Kurumsal Finans Direktörü
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Boğaziçi Üniversitesi - İşletme (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Emre Çelik');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Garanti', 'i'));
  });

  it('[ADVERSARIAL_474/500] Extract Ayşe Soylu (Tedarik Zinciri Müdürü) with format type 3', () => {
    const cv = `
Ayşe Soylu
İzmir / Bornova | contact@example.com
Tedarik Zinciri Müdürü

WORK EXPERIENCE
Ekol Lojistik A.Ş. - Tedarik Zinciri Müdürü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Dokuz Eylül Üniversitesi - Endüstri Mühendisliği (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Ayşe Soylu');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İzmir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Ekol', 'i'));
  });

  it('[ADVERSARIAL_475/500] Extract Mehmet Şimşek (İnsan Kaynakları Direktörü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Mehmet Şimşek               | Koç Holding A.Ş.                               |
| Şehir: İstanbul / Üsküdar | Görev: İnsan Kaynakları Direktörü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: Marmara Üniversitesi - İktisadi ve İdari Bilimler (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mehmet Şimşek');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Koç', 'i'));
  });

  it('[ADVERSARIAL_476/500] Extract Mustafa Karaca (Dijital Pazarlama Müdürü) with format type 0', () => {
    const cv = `
Mustafa Karaca
İstanbul / Şişli | 0532 999 00 11 | candidate@domain.com
Dijital Pazarlama Müdürü

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Dijital Pazarlama Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
Galatasaray Üniversitesi - İletişim Fakültesi (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mustafa Karaca');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[ADVERSARIAL_477/500] Extract Elif Korkmaz (Saha Satış Yöneticisi) with format type 1', () => {
    const cv = `
********************************************************************************
Elif Korkmaz — Saha Satış Yöneticisi
Eskişehir / Tepebaşı | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Migros Ticaret A.Ş.
Saha Satış Yöneticisi (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
Anadolu Üniversitesi - İktisat (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Elif Korkmaz');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Eskişehir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Migros', 'i'));
  });

  it('[ADVERSARIAL_478/500] Extract Can Zaman (Operasyonel Mükemmellik Lideri) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Can Zaman
Kocaeli / Gebze
Operasyonel Mükemmellik Lideri

İŞ TECRÜBELERİ
Arçelik Sanayi A.Ş. (2017 - 2024)
Operasyonel Mükemmellik Lideri
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Yıldız Teknik Üniversitesi - Makine Mühendisliği (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Can Zaman');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Kocaeli');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[ADVERSARIAL_479/500] Extract Zeynep Özdemir (Siber Güvenlik Direktörü) with format type 3', () => {
    const cv = `
Zeynep Özdemir
Ankara / Yenimahalle | contact@example.com
Siber Güvenlik Direktörü

WORK EXPERIENCE
STM Savunma Teknolojileri A.Ş. - Siber Güvenlik Direktörü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Bilkent Üniversitesi - Elektrik Elektronik (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Zeynep Özdemir');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('STM', 'i'));
  });

  it('[ADVERSARIAL_480/500] Extract Oğuzhan Sunal (Kurumsal İletişim Müdürü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Oğuzhan Sunal               | Doğan Holding A.Ş.                               |
| Şehir: İstanbul / Beyoğlu | Görev: Kurumsal İletişim Müdürü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: İstanbul Üniversitesi - İletişim (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Oğuzhan Sunal');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Doğan', 'i'));
  });

  it('[ADVERSARIAL_481/500] Extract Uğur Bilginer (Çağrı Merkezi Operasyon Müdürü) with format type 0', () => {
    const cv = `
Uğur Bilginer
İstanbul / Kadıköy | 0532 999 00 11 | candidate@domain.com
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone Müşteri Hizmetleri A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Uğur Bilginer');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Vodafone', 'i'));
  });

  it('[ADVERSARIAL_482/500] Extract Burak Olcay (Kıdemli Backend Geliştirici) with format type 1', () => {
    const cv = `
********************************************************************************
Burak Olcay — Kıdemli Backend Geliştirici
Ankara / Çankaya | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Trendyol Teknoloji A.Ş.
Kıdemli Backend Geliştirici (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
ODTÜ - Bilgisayar Mühendisliği (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Burak Olcay');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[ADVERSARIAL_483/500] Extract Kemal Akan (Kurumsal Finans Direktörü) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Kemal Akan
İstanbul / Beşiktaş
Kurumsal Finans Direktörü

İŞ TECRÜBELERİ
Garanti BBVA A.Ş. (2017 - 2024)
Kurumsal Finans Direktörü
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Boğaziçi Üniversitesi - İşletme (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Kemal Akan');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Garanti', 'i'));
  });

  it('[ADVERSARIAL_484/500] Extract Fatma Özkul (Tedarik Zinciri Müdürü) with format type 3', () => {
    const cv = `
Fatma Özkul
İzmir / Bornova | contact@example.com
Tedarik Zinciri Müdürü

WORK EXPERIENCE
Ekol Lojistik A.Ş. - Tedarik Zinciri Müdürü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Dokuz Eylül Üniversitesi - Endüstri Mühendisliği (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Fatma Özkul');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İzmir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Ekol', 'i'));
  });

  it('[ADVERSARIAL_485/500] Extract Haluk Şen (İnsan Kaynakları Direktörü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Haluk Şen               | Koç Holding A.Ş.                               |
| Şehir: İstanbul / Üsküdar | Görev: İnsan Kaynakları Direktörü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: Marmara Üniversitesi - İktisadi ve İdari Bilimler (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Haluk Şen');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Koç', 'i'));
  });

  it('[ADVERSARIAL_486/500] Extract Zuhal Naşit (Dijital Pazarlama Müdürü) with format type 0', () => {
    const cv = `
Zuhal Naşit
İstanbul / Şişli | 0532 999 00 11 | candidate@domain.com
Dijital Pazarlama Müdürü

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Dijital Pazarlama Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
Galatasaray Üniversitesi - İletişim Fakültesi (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Zuhal Naşit');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[ADVERSARIAL_487/500] Extract Tarık Şentürk (Saha Satış Yöneticisi) with format type 1', () => {
    const cv = `
********************************************************************************
Tarık Şentürk — Saha Satış Yöneticisi
Eskişehir / Tepebaşı | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Migros Ticaret A.Ş.
Saha Satış Yöneticisi (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
Anadolu Üniversitesi - İktisat (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Tarık Şentürk');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Eskişehir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Migros', 'i'));
  });

  it('[ADVERSARIAL_488/500] Extract Münir Yalçın (Operasyonel Mükemmellik Lideri) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Münir Yalçın
Kocaeli / Gebze
Operasyonel Mükemmellik Lideri

İŞ TECRÜBELERİ
Arçelik Sanayi A.Ş. (2017 - 2024)
Operasyonel Mükemmellik Lideri
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Yıldız Teknik Üniversitesi - Makine Mühendisliği (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Münir Yalçın');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Kocaeli');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[ADVERSARIAL_489/500] Extract Şener Kaya (Siber Güvenlik Direktörü) with format type 3', () => {
    const cv = `
Şener Kaya
Ankara / Yenimahalle | contact@example.com
Siber Güvenlik Direktörü

WORK EXPERIENCE
STM Savunma Teknolojileri A.Ş. - Siber Güvenlik Direktörü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Bilkent Üniversitesi - Elektrik Elektronik (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Şener Kaya');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('STM', 'i'));
  });

  it('[ADVERSARIAL_490/500] Extract Adile Yılmaz (Kurumsal İletişim Müdürü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Adile Yılmaz               | Doğan Holding A.Ş.                               |
| Şehir: İstanbul / Beyoğlu | Görev: Kurumsal İletişim Müdürü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: İstanbul Üniversitesi - İletişim (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Adile Yılmaz');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Doğan', 'i'));
  });

  it('[ADVERSARIAL_491/500] Extract Ceren Demir (Çağrı Merkezi Operasyon Müdürü) with format type 0', () => {
    const cv = `
Ceren Demir
İstanbul / Kadıköy | 0532 999 00 11 | candidate@domain.com
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Vodafone Müşteri Hizmetleri A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Ceren Demir');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Vodafone', 'i'));
  });

  it('[ADVERSARIAL_492/500] Extract Mert Çelik (Kıdemli Backend Geliştirici) with format type 1', () => {
    const cv = `
********************************************************************************
Mert Çelik — Kıdemli Backend Geliştirici
Ankara / Çankaya | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Trendyol Teknoloji A.Ş.
Kıdemli Backend Geliştirici (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
ODTÜ - Bilgisayar Mühendisliği (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mert Çelik');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Trendyol', 'i'));
  });

  it('[ADVERSARIAL_493/500] Extract Emre Soylu (Kurumsal Finans Direktörü) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Emre Soylu
İstanbul / Beşiktaş
Kurumsal Finans Direktörü

İŞ TECRÜBELERİ
Garanti BBVA A.Ş. (2017 - 2024)
Kurumsal Finans Direktörü
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Boğaziçi Üniversitesi - İşletme (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Emre Soylu');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Garanti', 'i'));
  });

  it('[ADVERSARIAL_494/500] Extract Ayşe Şimşek (Tedarik Zinciri Müdürü) with format type 3', () => {
    const cv = `
Ayşe Şimşek
İzmir / Bornova | contact@example.com
Tedarik Zinciri Müdürü

WORK EXPERIENCE
Ekol Lojistik A.Ş. - Tedarik Zinciri Müdürü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Dokuz Eylül Üniversitesi - Endüstri Mühendisliği (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Ayşe Şimşek');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İzmir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Ekol', 'i'));
  });

  it('[ADVERSARIAL_495/500] Extract Mehmet Karaca (İnsan Kaynakları Direktörü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Mehmet Karaca               | Koç Holding A.Ş.                               |
| Şehir: İstanbul / Üsküdar | Görev: İnsan Kaynakları Direktörü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: Marmara Üniversitesi - İktisadi ve İdari Bilimler (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mehmet Karaca');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Koç', 'i'));
  });

  it('[ADVERSARIAL_496/500] Extract Mustafa Korkmaz (Dijital Pazarlama Müdürü) with format type 0', () => {
    const cv = `
Mustafa Korkmaz
İstanbul / Şişli | 0532 999 00 11 | candidate@domain.com
Dijital Pazarlama Müdürü

DENEYİM
Hepsiburada E-Ticaret A.Ş. - Dijital Pazarlama Müdürü (2018 - 2024)
• Operasyonel süreçlerin yönetimi ve optimizasyonu | KPI ve SLA hedeflerinin tutturulması
- Yıllık bütçe planlaması ve 50+ kişilik departman idaresi

EĞİTİM
Galatasaray Üniversitesi - İletişim Fakültesi (2010 - 2014)

YETKİNLİKLER
Stratejik Yönetim, Liderlik, Bütçe, Agile, Risk Yönetimi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Mustafa Korkmaz');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Hepsiburada', 'i'));
  });

  it('[ADVERSARIAL_497/500] Extract Elif Zaman (Saha Satış Yöneticisi) with format type 1', () => {
    const cv = `
********************************************************************************
Elif Zaman — Saha Satış Yöneticisi
Eskişehir / Tepebaşı | candidate@domain.com | 0533 111 22 33
********************************************************************************

PROFESYONEL İŞ DENEYİMİ
Migros Ticaret A.Ş.
Saha Satış Yöneticisi (2019 - Devam Ediyor)
Kurumsal büyüme ve dijital dönüşüm süreçlerinin liderliği.

AKADEMİK GEÇMİŞ
Anadolu Üniversitesi - İktisat (2012 - 2016)

SERTİFİKALAR
PMP Proje Yönetimi, ITIL v4, ISO 9001
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Elif Zaman');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Eskişehir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Migros', 'i'));
  });

  it('[ADVERSARIAL_498/500] Extract Can Özdemir (Operasyonel Mükemmellik Lideri) with format type 2', () => {
    const cv = `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Rektör | 0532 111 00 00 | rektor@uni.edu.tr

Can Özdemir
Kocaeli / Gebze
Operasyonel Mükemmellik Lideri

İŞ TECRÜBELERİ
Arçelik Sanayi A.Ş. (2017 - 2024)
Operasyonel Mükemmellik Lideri
Tüm departman operasyonlarının koordinasyonu ve performans takibi.

EĞİTİM BİLGİLERİ
Yıldız Teknik Üniversitesi - Makine Mühendisliği (2011 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Can Özdemir');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Kocaeli');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Arçelik', 'i'));
  });

  it('[ADVERSARIAL_499/500] Extract Zeynep Sunal (Siber Güvenlik Direktörü) with format type 3', () => {
    const cv = `
Zeynep Sunal
Ankara / Yenimahalle | contact@example.com
Siber Güvenlik Direktörü

WORK EXPERIENCE
STM Savunma Teknolojileri A.Ş. - Siber Güvenlik Direktörü (2018 - 2024)
Responsible for strategic initiatives and execution across regional operations.

EDUCATION
Bilkent Üniversitesi - Elektrik Elektronik (2010 - 2014)

CORE COMPETENCIES & SKILLS
Leadership, Strategic Planning, Financial Analysis, Process Optimization
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Zeynep Sunal');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('STM', 'i'));
  });

  it('[ADVERSARIAL_500/500] Extract Oğuzhan Girik (Kurumsal İletişim Müdürü) with format type 4', () => {
    const cv = `
--------------------------------------------------------------------------------
| KİŞİSEL BİLGİLER                | MESLEKİ DENEYİM                            |
--------------------------------------------------------------------------------
| İsim: Oğuzhan Girik               | Doğan Holding A.Ş.                               |
| Şehir: İstanbul / Beyoğlu | Görev: Kurumsal İletişim Müdürü                     |
| E-posta: cand@example.com       | Dönem: 2019 - 2024                         |
| Telefon: 0532 888 77 66         | Operasyonel büyüme ve süreç optimizasyonu. |
|                                 |                                            |
| EĞİTİM: İstanbul Üniversitesi - İletişim (2015)      | YETKİNLİKLER: KPI, Planlama, Yönetim       |
--------------------------------------------------------------------------------
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const cleanPayload = enforceEvidenceGraphFirewall(res, graph);
    const canonical = mapCvToCanonicalTaxonomy(cleanPayload);

    expect(canonical.fullName).toBe('Oğuzhan Girik');
    expect(canonical.fullName).not.toBe('Referanslar');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Doğan', 'i'));
  });
});
