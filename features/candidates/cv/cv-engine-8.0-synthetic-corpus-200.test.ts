import { describe, expect, it } from 'vitest';
import { extractDeterministicCv } from './cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from './cv-taxonomy-mapper';
import { buildCvEvidenceGraph } from './cv-evidence-graph';

describe('CV Extraction Engine 8.0 — 200 Realistic Synthetic CV Matrix', () => {
  it('Synthetic Matrix [#1/200]: Ahmet Yılmaz (Kıdemli Yazılım Geliştirici)', () => {
    const cv = `
Ahmet Yılmaz
İstanbul / Kadıköy | 0532 999 00 00
Kıdemli Yazılım Geliştirici

DENEYİM
Trendyol Teknoloji A.Ş. - Kıdemli Yazılım Geliştirici (2018 - 2024)
Bölüm yönetimi, stratejik hedefler ve KPI yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Liderlik, Strateji, Bütçe, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ahmet Yılmaz');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#2/200]: Mehmet Demir (Bölge Satış Müdürü)', () => {
    const cv = `
KİŞİSEL BİLGİLER
İsim: Mehmet Demir
Lokasyon: Ankara / Çankaya
İletişim: 0533 111 22 01

ÖZGEÇMİŞ ÖZETİ
Bölge Satış Müdürü alanında 10 yılı aşkın deneyim.

İŞ DENEYİMİ
Unilever Sanayi A.Ş. (2017 - 2024)
Bölge Satış Müdürü
Süreçlerin sevk ve idaresi.

EĞİTİM BİLGİLERİ
ODTÜ - Mühendislik Fakültesi (2010 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Mehmet Demir');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#3/200]: Mustafa Çelik (Mali İşler Direktörü)', () => {
    const cv = `
Mustafa Çelik
İzmir / Bornova
Mali İşler Direktörü

YETKİNLİKLER
Yönetim, Planlama, Organizasyon, İletişim

REFERANSLAR
Ali Vural - Genel Müdür

MESLEKİ DENEYİM
Garanti Bankası A.Ş. - Mali İşler Direktörü (2019 - 2024)
Operasyonel mükemmellik ve ekip yönetimi.

EĞİTİM
Ege Üniversitesi - Lisans (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Mustafa Çelik');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#4/200]: Ali Kaya (Çağrı Merkezi Operasyon Müdürü)', () => {
    const cv = `
Ali Kaya
München / Germany | 0532 777 88 03
Çağrı Merkezi Operasyon Müdürü

BERUFSERFAHRUNG
Turkcell Global Bilgi A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
International operational management and scaling.

AUSBILDUNG
Technical University - B.Sc. (2011 - 2015)

KOMPETENZEN
Leadership, Agile, Scrum, CI/CD
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ali Kaya');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#5/200]: Hüseyin Yıldız (Tedarik Zinciri ve Lojistik Müdürü)', () => {
    const cv = `
Hüseyin Yıldız | Bursa / Nilüfer | Tedarik Zinciri ve Lojistik Müdürü

İŞ TECRÜBESİ
Ekol Lojistik A.Ş. | Tedarik Zinciri ve Lojistik Müdürü | 2018 - 2024
Proje yürütme | Performans takibi | Ekip koordinasyonu

AKADEMİK GEÇMİŞ
Uludağ Üniversitesi - Lisans (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hüseyin Yıldız');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#6/200]: Hasan Yıldırım (İnsan Kaynakları Direktörü)', () => {
    const cv = `
Hasan Yıldırım
İstanbul / Kadıköy | 0532 999 00 05
İnsan Kaynakları Direktörü

DENEYİM
PwC Danışmanlık A.Ş. - İnsan Kaynakları Direktörü (2018 - 2024)
Bölüm yönetimi, stratejik hedefler ve KPI yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Liderlik, Strateji, Bütçe, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hasan Yıldırım');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#7/200]: İbrahim Öztürk (Şantiye ve Proje Müdürü)', () => {
    const cv = `
KİŞİSEL BİLGİLER
İsim: İbrahim Öztürk
Lokasyon: Ankara / Çankaya
İletişim: 0533 111 22 06

ÖZGEÇMİŞ ÖZETİ
Şantiye ve Proje Müdürü alanında 10 yılı aşkın deneyim.

İŞ DENEYİMİ
Enka İnşaat Sanayi A.Ş. (2017 - 2024)
Şantiye ve Proje Müdürü
Süreçlerin sevk ve idaresi.

EĞİTİM BİLGİLERİ
ODTÜ - Mühendislik Fakültesi (2010 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('İbrahim Öztürk');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#8/200]: İsmail Aydın (Dijital Pazarlama ve Büyüme Müdürü)', () => {
    const cv = `
İsmail Aydın
İzmir / Bornova
Dijital Pazarlama ve Büyüme Müdürü

YETKİNLİKLER
Yönetim, Planlama, Organizasyon, İletişim

REFERANSLAR
Ali Vural - Genel Müdür

MESLEKİ DENEYİM
Hepsiburada Elektronik A.Ş. - Dijital Pazarlama ve Büyüme Müdürü (2019 - 2024)
Operasyonel mükemmellik ve ekip yönetimi.

EĞİTİM
Ege Üniversitesi - Lisans (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('İsmail Aydın');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#9/200]: Osman Özdemir (Üretim ve Fabrika Müdürü)', () => {
    const cv = `
Osman Özdemir
München / Germany | 0532 777 88 08
Üretim ve Fabrika Müdürü

BERUFSERFAHRUNG
Arçelik Üretim A.Ş. - Üretim ve Fabrika Müdürü (2018 - 2024)
International operational management and scaling.

AUSBILDUNG
Technical University - B.Sc. (2011 - 2015)

KOMPETENZEN
Leadership, Agile, Scrum, CI/CD
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Osman Özdemir');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#10/200]: Fatih Arslan (Otel Genel Müdürü)', () => {
    const cv = `
Fatih Arslan | Bursa / Nilüfer | Otel Genel Müdürü

İŞ TECRÜBESİ
Divan Turizm İşletmeleri A.Ş. | Otel Genel Müdürü | 2018 - 2024
Proje yürütme | Performans takibi | Ekip koordinasyonu

AKADEMİK GEÇMİŞ
Uludağ Üniversitesi - Lisans (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Fatih Arslan');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#11/200]: Murat Doğan (Hukuk Müşaviri ve Uyum Direktörü)', () => {
    const cv = `
Murat Doğan
İstanbul / Kadıköy | 0532 999 00 10
Hukuk Müşaviri ve Uyum Direktörü

DENEYİM
Eczacıbaşı Holding A.Ş. - Hukuk Müşaviri ve Uyum Direktörü (2018 - 2024)
Bölüm yönetimi, stratejik hedefler ve KPI yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Liderlik, Strateji, Bütçe, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Murat Doğan');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#12/200]: Ömer Kılıç (Siber Güvenlik ve SOC Müdürü)', () => {
    const cv = `
KİŞİSEL BİLGİLER
İsim: Ömer Kılıç
Lokasyon: Ankara / Çankaya
İletişim: 0533 111 22 11

ÖZGEÇMİŞ ÖZETİ
Siber Güvenlik ve SOC Müdürü alanında 10 yılı aşkın deneyim.

İŞ DENEYİMİ
Havelsan Teknoloji A.Ş. (2017 - 2024)
Siber Güvenlik ve SOC Müdürü
Süreçlerin sevk ve idaresi.

EĞİTİM BİLGİLERİ
ODTÜ - Mühendislik Fakültesi (2010 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ömer Kılıç');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#13/200]: Ramazan Aslan (Yapay Zeka ve Veri Bilimi Lideri)', () => {
    const cv = `
Ramazan Aslan
İzmir / Bornova
Yapay Zeka ve Veri Bilimi Lideri

YETKİNLİKLER
Yönetim, Planlama, Organizasyon, İletişim

REFERANSLAR
Ali Vural - Genel Müdür

MESLEKİ DENEYİM
Insider Yazılım A.Ş. - Yapay Zeka ve Veri Bilimi Lideri (2019 - 2024)
Operasyonel mükemmellik ve ekip yönetimi.

EĞİTİM
Ege Üniversitesi - Lisans (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ramazan Aslan');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#14/200]: Halil Çetin (Aktüerya ve Risk Değerlendirme Müdürü)', () => {
    const cv = `
Halil Çetin
München / Germany | 0532 777 88 13
Aktüerya ve Risk Değerlendirme Müdürü

BERUFSERFAHRUNG
Anadolu Sigorta A.Ş. - Aktüerya ve Risk Değerlendirme Müdürü (2018 - 2024)
International operational management and scaling.

AUSBILDUNG
Technical University - B.Sc. (2011 - 2015)

KOMPETENZEN
Leadership, Agile, Scrum, CI/CD
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Halil Çetin');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#15/200]: Süleyman Kara (Başhekim ve Medikal Direktör)', () => {
    const cv = `
Süleyman Kara | Bursa / Nilüfer | Başhekim ve Medikal Direktör

İŞ TECRÜBESİ
Acıbadem Sağlık Grubu | Başhekim ve Medikal Direktör | 2018 - 2024
Proje yürütme | Performans takibi | Ekip koordinasyonu

AKADEMİK GEÇMİŞ
Uludağ Üniversitesi - Lisans (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Süleyman Kara');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#16/200]: Abdullah Koç (E-Ticaret ve Kategori Direktörü)', () => {
    const cv = `
Abdullah Koç
İstanbul / Kadıköy | 0532 999 00 15
E-Ticaret ve Kategori Direktörü

DENEYİM
Amazon Türkiye A.Ş. - E-Ticaret ve Kategori Direktörü (2018 - 2024)
Bölüm yönetimi, stratejik hedefler ve KPI yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Liderlik, Strateji, Bütçe, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Abdullah Koç');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#17/200]: Yusuf Kurt (Yalın Üretim ve Sürekli İyileştirme Lideri)', () => {
    const cv = `
KİŞİSEL BİLGİLER
İsim: Yusuf Kurt
Lokasyon: Ankara / Çankaya
İletişim: 0533 111 22 16

ÖZGEÇMİŞ ÖZETİ
Yalın Üretim ve Sürekli İyileştirme Lideri alanında 10 yılı aşkın deneyim.

İŞ DENEYİMİ
Bosch Sanayi A.Ş. (2017 - 2024)
Yalın Üretim ve Sürekli İyileştirme Lideri
Süreçlerin sevk ve idaresi.

EĞİTİM BİLGİLERİ
ODTÜ - Mühendislik Fakültesi (2010 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Yusuf Kurt');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#18/200]: Emre Özkan (Kurumsal İletişim ve PR Müdürü)', () => {
    const cv = `
Emre Özkan
İzmir / Bornova
Kurumsal İletişim ve PR Müdürü

YETKİNLİKLER
Yönetim, Planlama, Organizasyon, İletişim

REFERANSLAR
Ali Vural - Genel Müdür

MESLEKİ DENEYİM
Sabancı Holding A.Ş. - Kurumsal İletişim ve PR Müdürü (2019 - 2024)
Operasyonel mükemmellik ve ekip yönetimi.

EĞİTİM
Ege Üniversitesi - Lisans (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Emre Özkan');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#19/200]: Can Şimşek (Gıda Kalite ve Ar-Ge Müdürü)', () => {
    const cv = `
Can Şimşek
München / Germany | 0532 777 88 18
Gıda Kalite ve Ar-Ge Müdürü

BERUFSERFAHRUNG
Sütaş Süt Ürünleri A.Ş. - Gıda Kalite ve Ar-Ge Müdürü (2018 - 2024)
International operational management and scaling.

AUSBILDUNG
Technical University - B.Sc. (2011 - 2015)

KOMPETENZEN
Leadership, Agile, Scrum, CI/CD
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Can Şimşek');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#20/200]: Hakan Polat (Enerji Santrali Saha Mühendisi)', () => {
    const cv = `
Hakan Polat | Bursa / Nilüfer | Enerji Santrali Saha Mühendisi

İŞ TECRÜBESİ
Enerjisa Üretim A.Ş. | Enerji Santrali Saha Mühendisi | 2018 - 2024
Proje yürütme | Performans takibi | Ekip koordinasyonu

AKADEMİK GEÇMİŞ
Uludağ Üniversitesi - Lisans (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hakan Polat');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#21/200]: Burak Özcan (Kıdemli Yazılım Geliştirici)', () => {
    const cv = `
Burak Özcan
İstanbul / Kadıköy | 0532 999 00 20
Kıdemli Yazılım Geliştirici

DENEYİM
Trendyol Teknoloji A.Ş. - Kıdemli Yazılım Geliştirici (2018 - 2024)
Bölüm yönetimi, stratejik hedefler ve KPI yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Liderlik, Strateji, Bütçe, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Burak Özcan');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#22/200]: Oğuzhan Korkmaz (Bölge Satış Müdürü)', () => {
    const cv = `
KİŞİSEL BİLGİLER
İsim: Oğuzhan Korkmaz
Lokasyon: Ankara / Çankaya
İletişim: 0533 111 22 21

ÖZGEÇMİŞ ÖZETİ
Bölge Satış Müdürü alanında 10 yılı aşkın deneyim.

İŞ DENEYİMİ
Unilever Sanayi A.Ş. (2017 - 2024)
Bölge Satış Müdürü
Süreçlerin sevk ve idaresi.

EĞİTİM BİLGİLERİ
ODTÜ - Mühendislik Fakültesi (2010 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Oğuzhan Korkmaz');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#23/200]: Serkan Çakır (Mali İşler Direktörü)', () => {
    const cv = `
Serkan Çakır
İzmir / Bornova
Mali İşler Direktörü

YETKİNLİKLER
Yönetim, Planlama, Organizasyon, İletişim

REFERANSLAR
Ali Vural - Genel Müdür

MESLEKİ DENEYİM
Garanti Bankası A.Ş. - Mali İşler Direktörü (2019 - 2024)
Operasyonel mükemmellik ve ekip yönetimi.

EĞİTİM
Ege Üniversitesi - Lisans (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Serkan Çakır');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#24/200]: Uğur Erdoğan (Çağrı Merkezi Operasyon Müdürü)', () => {
    const cv = `
Uğur Erdoğan
München / Germany | 0532 777 88 23
Çağrı Merkezi Operasyon Müdürü

BERUFSERFAHRUNG
Turkcell Global Bilgi A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
International operational management and scaling.

AUSBILDUNG
Technical University - B.Sc. (2011 - 2015)

KOMPETENZEN
Leadership, Agile, Scrum, CI/CD
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Uğur Erdoğan');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#25/200]: Volkan Yavuz (Tedarik Zinciri ve Lojistik Müdürü)', () => {
    const cv = `
Volkan Yavuz | Bursa / Nilüfer | Tedarik Zinciri ve Lojistik Müdürü

İŞ TECRÜBESİ
Ekol Lojistik A.Ş. | Tedarik Zinciri ve Lojistik Müdürü | 2018 - 2024
Proje yürütme | Performans takibi | Ekip koordinasyonu

AKADEMİK GEÇMİŞ
Uludağ Üniversitesi - Lisans (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Volkan Yavuz');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#26/200]: Tolga Güneş (İnsan Kaynakları Direktörü)', () => {
    const cv = `
Tolga Güneş
İstanbul / Kadıköy | 0532 999 00 25
İnsan Kaynakları Direktörü

DENEYİM
PwC Danışmanlık A.Ş. - İnsan Kaynakları Direktörü (2018 - 2024)
Bölüm yönetimi, stratejik hedefler ve KPI yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Liderlik, Strateji, Bütçe, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Tolga Güneş');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#27/200]: Alper Aksoy (Şantiye ve Proje Müdürü)', () => {
    const cv = `
KİŞİSEL BİLGİLER
İsim: Alper Aksoy
Lokasyon: Ankara / Çankaya
İletişim: 0533 111 22 26

ÖZGEÇMİŞ ÖZETİ
Şantiye ve Proje Müdürü alanında 10 yılı aşkın deneyim.

İŞ DENEYİMİ
Enka İnşaat Sanayi A.Ş. (2017 - 2024)
Şantiye ve Proje Müdürü
Süreçlerin sevk ve idaresi.

EĞİTİM BİLGİLERİ
ODTÜ - Mühendislik Fakültesi (2010 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Alper Aksoy');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#28/200]: Onur Güler (Dijital Pazarlama ve Büyüme Müdürü)', () => {
    const cv = `
Onur Güler
İzmir / Bornova
Dijital Pazarlama ve Büyüme Müdürü

YETKİNLİKLER
Yönetim, Planlama, Organizasyon, İletişim

REFERANSLAR
Ali Vural - Genel Müdür

MESLEKİ DENEYİM
Hepsiburada Elektronik A.Ş. - Dijital Pazarlama ve Büyüme Müdürü (2019 - 2024)
Operasyonel mükemmellik ve ekip yönetimi.

EĞİTİM
Ege Üniversitesi - Lisans (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Onur Güler');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#29/200]: Gökhan Ünal (Üretim ve Fabrika Müdürü)', () => {
    const cv = `
Gökhan Ünal
München / Germany | 0532 777 88 28
Üretim ve Fabrika Müdürü

BERUFSERFAHRUNG
Arçelik Üretim A.Ş. - Üretim ve Fabrika Müdürü (2018 - 2024)
International operational management and scaling.

AUSBILDUNG
Technical University - B.Sc. (2011 - 2015)

KOMPETENZEN
Leadership, Agile, Scrum, CI/CD
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Gökhan Ünal');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#30/200]: Kaan Taş (Otel Genel Müdürü)', () => {
    const cv = `
Kaan Taş | Bursa / Nilüfer | Otel Genel Müdürü

İŞ TECRÜBESİ
Divan Turizm İşletmeleri A.Ş. | Otel Genel Müdürü | 2018 - 2024
Proje yürütme | Performans takibi | Ekip koordinasyonu

AKADEMİK GEÇMİŞ
Uludağ Üniversitesi - Lisans (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kaan Taş');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#31/200]: Barış Başaran (Hukuk Müşaviri ve Uyum Direktörü)', () => {
    const cv = `
Barış Başaran
İstanbul / Kadıköy | 0532 999 00 30
Hukuk Müşaviri ve Uyum Direktörü

DENEYİM
Eczacıbaşı Holding A.Ş. - Hukuk Müşaviri ve Uyum Direktörü (2018 - 2024)
Bölüm yönetimi, stratejik hedefler ve KPI yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Liderlik, Strateji, Bütçe, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Barış Başaran');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#32/200]: Kerem Erkul (Siber Güvenlik ve SOC Müdürü)', () => {
    const cv = `
KİŞİSEL BİLGİLER
İsim: Kerem Erkul
Lokasyon: Ankara / Çankaya
İletişim: 0533 111 22 31

ÖZGEÇMİŞ ÖZETİ
Siber Güvenlik ve SOC Müdürü alanında 10 yılı aşkın deneyim.

İŞ DENEYİMİ
Havelsan Teknoloji A.Ş. (2017 - 2024)
Siber Güvenlik ve SOC Müdürü
Süreçlerin sevk ve idaresi.

EĞİTİM BİLGİLERİ
ODTÜ - Mühendislik Fakültesi (2010 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kerem Erkul');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#33/200]: Cem Akalın (Yapay Zeka ve Veri Bilimi Lideri)', () => {
    const cv = `
Cem Akalın
İzmir / Bornova
Yapay Zeka ve Veri Bilimi Lideri

YETKİNLİKLER
Yönetim, Planlama, Organizasyon, İletişim

REFERANSLAR
Ali Vural - Genel Müdür

MESLEKİ DENEYİM
Insider Yazılım A.Ş. - Yapay Zeka ve Veri Bilimi Lideri (2019 - 2024)
Operasyonel mükemmellik ve ekip yönetimi.

EĞİTİM
Ege Üniversitesi - Lisans (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Cem Akalın');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#34/200]: Deniz Sezgin (Aktüerya ve Risk Değerlendirme Müdürü)', () => {
    const cv = `
Deniz Sezgin
München / Germany | 0532 777 88 33
Aktüerya ve Risk Değerlendirme Müdürü

BERUFSERFAHRUNG
Anadolu Sigorta A.Ş. - Aktüerya ve Risk Değerlendirme Müdürü (2018 - 2024)
International operational management and scaling.

AUSBILDUNG
Technical University - B.Sc. (2011 - 2015)

KOMPETENZEN
Leadership, Agile, Scrum, CI/CD
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Deniz Sezgin');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#35/200]: Mert Yalçın (Başhekim ve Medikal Direktör)', () => {
    const cv = `
Mert Yalçın | Bursa / Nilüfer | Başhekim ve Medikal Direktör

İŞ TECRÜBESİ
Acıbadem Sağlık Grubu | Başhekim ve Medikal Direktör | 2018 - 2024
Proje yürütme | Performans takibi | Ekip koordinasyonu

AKADEMİK GEÇMİŞ
Uludağ Üniversitesi - Lisans (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Mert Yalçın');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#36/200]: Berk Tekin (E-Ticaret ve Kategori Direktörü)', () => {
    const cv = `
Berk Tekin
İstanbul / Kadıköy | 0532 999 00 35
E-Ticaret ve Kategori Direktörü

DENEYİM
Amazon Türkiye A.Ş. - E-Ticaret ve Kategori Direktörü (2018 - 2024)
Bölüm yönetimi, stratejik hedefler ve KPI yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Liderlik, Strateji, Bütçe, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Berk Tekin');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#37/200]: Doruk Koçak (Yalın Üretim ve Sürekli İyileştirme Lideri)', () => {
    const cv = `
KİŞİSEL BİLGİLER
İsim: Doruk Koçak
Lokasyon: Ankara / Çankaya
İletişim: 0533 111 22 36

ÖZGEÇMİŞ ÖZETİ
Yalın Üretim ve Sürekli İyileştirme Lideri alanında 10 yılı aşkın deneyim.

İŞ DENEYİMİ
Bosch Sanayi A.Ş. (2017 - 2024)
Yalın Üretim ve Sürekli İyileştirme Lideri
Süreçlerin sevk ve idaresi.

EĞİTİM BİLGİLERİ
ODTÜ - Mühendislik Fakültesi (2010 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Doruk Koçak');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#38/200]: Efe Sarı (Kurumsal İletişim ve PR Müdürü)', () => {
    const cv = `
Efe Sarı
İzmir / Bornova
Kurumsal İletişim ve PR Müdürü

YETKİNLİKLER
Yönetim, Planlama, Organizasyon, İletişim

REFERANSLAR
Ali Vural - Genel Müdür

MESLEKİ DENEYİM
Sabancı Holding A.Ş. - Kurumsal İletişim ve PR Müdürü (2019 - 2024)
Operasyonel mükemmellik ve ekip yönetimi.

EĞİTİM
Ege Üniversitesi - Lisans (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Efe Sarı');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#39/200]: Arda Tan (Gıda Kalite ve Ar-Ge Müdürü)', () => {
    const cv = `
Arda Tan
München / Germany | 0532 777 88 38
Gıda Kalite ve Ar-Ge Müdürü

BERUFSERFAHRUNG
Sütaş Süt Ürünleri A.Ş. - Gıda Kalite ve Ar-Ge Müdürü (2018 - 2024)
International operational management and scaling.

AUSBILDUNG
Technical University - B.Sc. (2011 - 2015)

KOMPETENZEN
Leadership, Agile, Scrum, CI/CD
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Arda Tan');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#40/200]: Yiğit Uçar (Enerji Santrali Saha Mühendisi)', () => {
    const cv = `
Yiğit Uçar | Bursa / Nilüfer | Enerji Santrali Saha Mühendisi

İŞ TECRÜBESİ
Enerjisa Üretim A.Ş. | Enerji Santrali Saha Mühendisi | 2018 - 2024
Proje yürütme | Performans takibi | Ekip koordinasyonu

AKADEMİK GEÇMİŞ
Uludağ Üniversitesi - Lisans (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Yiğit Uçar');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#41/200]: Ayşe Vural (Kıdemli Yazılım Geliştirici)', () => {
    const cv = `
Ayşe Vural
İstanbul / Kadıköy | 0532 999 00 40
Kıdemli Yazılım Geliştirici

DENEYİM
Trendyol Teknoloji A.Ş. - Kıdemli Yazılım Geliştirici (2018 - 2024)
Bölüm yönetimi, stratejik hedefler ve KPI yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Liderlik, Strateji, Bütçe, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ayşe Vural');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#42/200]: Fatma Bulut (Bölge Satış Müdürü)', () => {
    const cv = `
KİŞİSEL BİLGİLER
İsim: Fatma Bulut
Lokasyon: Ankara / Çankaya
İletişim: 0533 111 22 41

ÖZGEÇMİŞ ÖZETİ
Bölge Satış Müdürü alanında 10 yılı aşkın deneyim.

İŞ DENEYİMİ
Unilever Sanayi A.Ş. (2017 - 2024)
Bölge Satış Müdürü
Süreçlerin sevk ve idaresi.

EĞİTİM BİLGİLERİ
ODTÜ - Mühendislik Fakültesi (2010 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Fatma Bulut');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#43/200]: Emine Keskin (Mali İşler Direktörü)', () => {
    const cv = `
Emine Keskin
İzmir / Bornova
Mali İşler Direktörü

YETKİNLİKLER
Yönetim, Planlama, Organizasyon, İletişim

REFERANSLAR
Ali Vural - Genel Müdür

MESLEKİ DENEYİM
Garanti Bankası A.Ş. - Mali İşler Direktörü (2019 - 2024)
Operasyonel mükemmellik ve ekip yönetimi.

EĞİTİM
Ege Üniversitesi - Lisans (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Emine Keskin');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#44/200]: Hatice Yüksel (Çağrı Merkezi Operasyon Müdürü)', () => {
    const cv = `
Hatice Yüksel
München / Germany | 0532 777 88 43
Çağrı Merkezi Operasyon Müdürü

BERUFSERFAHRUNG
Turkcell Global Bilgi A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
International operational management and scaling.

AUSBILDUNG
Technical University - B.Sc. (2011 - 2015)

KOMPETENZEN
Leadership, Agile, Scrum, CI/CD
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hatice Yüksel');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#45/200]: Zeynep Karaca (Tedarik Zinciri ve Lojistik Müdürü)', () => {
    const cv = `
Zeynep Karaca | Bursa / Nilüfer | Tedarik Zinciri ve Lojistik Müdürü

İŞ TECRÜBESİ
Ekol Lojistik A.Ş. | Tedarik Zinciri ve Lojistik Müdürü | 2018 - 2024
Proje yürütme | Performans takibi | Ekip koordinasyonu

AKADEMİK GEÇMİŞ
Uludağ Üniversitesi - Lisans (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Karaca');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#46/200]: Elif Soylu (İnsan Kaynakları Direktörü)', () => {
    const cv = `
Elif Soylu
İstanbul / Kadıköy | 0532 999 00 45
İnsan Kaynakları Direktörü

DENEYİM
PwC Danışmanlık A.Ş. - İnsan Kaynakları Direktörü (2018 - 2024)
Bölüm yönetimi, stratejik hedefler ve KPI yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Liderlik, Strateji, Bütçe, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Elif Soylu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#47/200]: Merve Gündoğan (Şantiye ve Proje Müdürü)', () => {
    const cv = `
KİŞİSEL BİLGİLER
İsim: Merve Gündoğan
Lokasyon: Ankara / Çankaya
İletişim: 0533 111 22 46

ÖZGEÇMİŞ ÖZETİ
Şantiye ve Proje Müdürü alanında 10 yılı aşkın deneyim.

İŞ DENEYİMİ
Enka İnşaat Sanayi A.Ş. (2017 - 2024)
Şantiye ve Proje Müdürü
Süreçlerin sevk ve idaresi.

EĞİTİM BİLGİLERİ
ODTÜ - Mühendislik Fakültesi (2010 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Merve Gündoğan');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#48/200]: Büşra Avcı (Dijital Pazarlama ve Büyüme Müdürü)', () => {
    const cv = `
Büşra Avcı
İzmir / Bornova
Dijital Pazarlama ve Büyüme Müdürü

YETKİNLİKLER
Yönetim, Planlama, Organizasyon, İletişim

REFERANSLAR
Ali Vural - Genel Müdür

MESLEKİ DENEYİM
Hepsiburada Elektronik A.Ş. - Dijital Pazarlama ve Büyüme Müdürü (2019 - 2024)
Operasyonel mükemmellik ve ekip yönetimi.

EĞİTİM
Ege Üniversitesi - Lisans (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Büşra Avcı');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#49/200]: Gamze Duran (Üretim ve Fabrika Müdürü)', () => {
    const cv = `
Gamze Duran
München / Germany | 0532 777 88 48
Üretim ve Fabrika Müdürü

BERUFSERFAHRUNG
Arçelik Üretim A.Ş. - Üretim ve Fabrika Müdürü (2018 - 2024)
International operational management and scaling.

AUSBILDUNG
Technical University - B.Sc. (2011 - 2015)

KOMPETENZEN
Leadership, Agile, Scrum, CI/CD
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Gamze Duran');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#50/200]: Seda Bozkurt (Otel Genel Müdürü)', () => {
    const cv = `
Seda Bozkurt | Bursa / Nilüfer | Otel Genel Müdürü

İŞ TECRÜBESİ
Divan Turizm İşletmeleri A.Ş. | Otel Genel Müdürü | 2018 - 2024
Proje yürütme | Performans takibi | Ekip koordinasyonu

AKADEMİK GEÇMİŞ
Uludağ Üniversitesi - Lisans (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Seda Bozkurt');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#51/200]: Ebru Turan (Hukuk Müşaviri ve Uyum Direktörü)', () => {
    const cv = `
Ebru Turan
İstanbul / Kadıköy | 0532 999 00 50
Hukuk Müşaviri ve Uyum Direktörü

DENEYİM
Eczacıbaşı Holding A.Ş. - Hukuk Müşaviri ve Uyum Direktörü (2018 - 2024)
Bölüm yönetimi, stratejik hedefler ve KPI yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Liderlik, Strateji, Bütçe, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ebru Turan');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#52/200]: Tuğba Yurttaş (Siber Güvenlik ve SOC Müdürü)', () => {
    const cv = `
KİŞİSEL BİLGİLER
İsim: Tuğba Yurttaş
Lokasyon: Ankara / Çankaya
İletişim: 0533 111 22 51

ÖZGEÇMİŞ ÖZETİ
Siber Güvenlik ve SOC Müdürü alanında 10 yılı aşkın deneyim.

İŞ DENEYİMİ
Havelsan Teknoloji A.Ş. (2017 - 2024)
Siber Güvenlik ve SOC Müdürü
Süreçlerin sevk ve idaresi.

EĞİTİM BİLGİLERİ
ODTÜ - Mühendislik Fakültesi (2010 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Tuğba Yurttaş');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#53/200]: Derya Ergin (Yapay Zeka ve Veri Bilimi Lideri)', () => {
    const cv = `
Derya Ergin
İzmir / Bornova
Yapay Zeka ve Veri Bilimi Lideri

YETKİNLİKLER
Yönetim, Planlama, Organizasyon, İletişim

REFERANSLAR
Ali Vural - Genel Müdür

MESLEKİ DENEYİM
Insider Yazılım A.Ş. - Yapay Zeka ve Veri Bilimi Lideri (2019 - 2024)
Operasyonel mükemmellik ve ekip yönetimi.

EĞİTİM
Ege Üniversitesi - Lisans (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Derya Ergin');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#54/200]: Selin Yaman (Aktüerya ve Risk Değerlendirme Müdürü)', () => {
    const cv = `
Selin Yaman
München / Germany | 0532 777 88 53
Aktüerya ve Risk Değerlendirme Müdürü

BERUFSERFAHRUNG
Anadolu Sigorta A.Ş. - Aktüerya ve Risk Değerlendirme Müdürü (2018 - 2024)
International operational management and scaling.

AUSBILDUNG
Technical University - B.Sc. (2011 - 2015)

KOMPETENZEN
Leadership, Agile, Scrum, CI/CD
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Yaman');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#55/200]: Gizem Duman (Başhekim ve Medikal Direktör)', () => {
    const cv = `
Gizem Duman | Bursa / Nilüfer | Başhekim ve Medikal Direktör

İŞ TECRÜBESİ
Acıbadem Sağlık Grubu | Başhekim ve Medikal Direktör | 2018 - 2024
Proje yürütme | Performans takibi | Ekip koordinasyonu

AKADEMİK GEÇMİŞ
Uludağ Üniversitesi - Lisans (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Gizem Duman');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#56/200]: Pınar Göktaş (E-Ticaret ve Kategori Direktörü)', () => {
    const cv = `
Pınar Göktaş
İstanbul / Kadıköy | 0532 999 00 55
E-Ticaret ve Kategori Direktörü

DENEYİM
Amazon Türkiye A.Ş. - E-Ticaret ve Kategori Direktörü (2018 - 2024)
Bölüm yönetimi, stratejik hedefler ve KPI yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Liderlik, Strateji, Bütçe, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Pınar Göktaş');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#57/200]: Hande Peker (Yalın Üretim ve Sürekli İyileştirme Lideri)', () => {
    const cv = `
KİŞİSEL BİLGİLER
İsim: Hande Peker
Lokasyon: Ankara / Çankaya
İletişim: 0533 111 22 56

ÖZGEÇMİŞ ÖZETİ
Yalın Üretim ve Sürekli İyileştirme Lideri alanında 10 yılı aşkın deneyim.

İŞ DENEYİMİ
Bosch Sanayi A.Ş. (2017 - 2024)
Yalın Üretim ve Sürekli İyileştirme Lideri
Süreçlerin sevk ve idaresi.

EĞİTİM BİLGİLERİ
ODTÜ - Mühendislik Fakültesi (2010 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hande Peker');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#58/200]: İrem Sancak (Kurumsal İletişim ve PR Müdürü)', () => {
    const cv = `
İrem Sancak
İzmir / Bornova
Kurumsal İletişim ve PR Müdürü

YETKİNLİKLER
Yönetim, Planlama, Organizasyon, İletişim

REFERANSLAR
Ali Vural - Genel Müdür

MESLEKİ DENEYİM
Sabancı Holding A.Ş. - Kurumsal İletişim ve PR Müdürü (2019 - 2024)
Operasyonel mükemmellik ve ekip yönetimi.

EĞİTİM
Ege Üniversitesi - Lisans (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('İrem Sancak');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#59/200]: Ceren Şentürk (Gıda Kalite ve Ar-Ge Müdürü)', () => {
    const cv = `
Ceren Şentürk
München / Germany | 0532 777 88 58
Gıda Kalite ve Ar-Ge Müdürü

BERUFSERFAHRUNG
Sütaş Süt Ürünleri A.Ş. - Gıda Kalite ve Ar-Ge Müdürü (2018 - 2024)
International operational management and scaling.

AUSBILDUNG
Technical University - B.Sc. (2011 - 2015)

KOMPETENZEN
Leadership, Agile, Scrum, CI/CD
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ceren Şentürk');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#60/200]: Aslı Kandemir (Enerji Santrali Saha Mühendisi)', () => {
    const cv = `
Aslı Kandemir | Bursa / Nilüfer | Enerji Santrali Saha Mühendisi

İŞ TECRÜBESİ
Enerjisa Üretim A.Ş. | Enerji Santrali Saha Mühendisi | 2018 - 2024
Proje yürütme | Performans takibi | Ekip koordinasyonu

AKADEMİK GEÇMİŞ
Uludağ Üniversitesi - Lisans (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Aslı Kandemir');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#61/200]: Duygu Gültekin (Kıdemli Yazılım Geliştirici)', () => {
    const cv = `
Duygu Gültekin
İstanbul / Kadıköy | 0532 999 00 60
Kıdemli Yazılım Geliştirici

DENEYİM
Trendyol Teknoloji A.Ş. - Kıdemli Yazılım Geliştirici (2018 - 2024)
Bölüm yönetimi, stratejik hedefler ve KPI yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Liderlik, Strateji, Bütçe, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Duygu Gültekin');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#62/200]: Melis Aktaş (Bölge Satış Müdürü)', () => {
    const cv = `
KİŞİSEL BİLGİLER
İsim: Melis Aktaş
Lokasyon: Ankara / Çankaya
İletişim: 0533 111 22 61

ÖZGEÇMİŞ ÖZETİ
Bölge Satış Müdürü alanında 10 yılı aşkın deneyim.

İŞ DENEYİMİ
Unilever Sanayi A.Ş. (2017 - 2024)
Bölge Satış Müdürü
Süreçlerin sevk ve idaresi.

EĞİTİM BİLGİLERİ
ODTÜ - Mühendislik Fakültesi (2010 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Melis Aktaş');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#63/200]: Fulya Erten (Mali İşler Direktörü)', () => {
    const cv = `
Fulya Erten
İzmir / Bornova
Mali İşler Direktörü

YETKİNLİKLER
Yönetim, Planlama, Organizasyon, İletişim

REFERANSLAR
Ali Vural - Genel Müdür

MESLEKİ DENEYİM
Garanti Bankası A.Ş. - Mali İşler Direktörü (2019 - 2024)
Operasyonel mükemmellik ve ekip yönetimi.

EĞİTİM
Ege Üniversitesi - Lisans (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Fulya Erten');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#64/200]: Simge Ulu (Çağrı Merkezi Operasyon Müdürü)', () => {
    const cv = `
Simge Ulu
München / Germany | 0532 777 88 63
Çağrı Merkezi Operasyon Müdürü

BERUFSERFAHRUNG
Turkcell Global Bilgi A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
International operational management and scaling.

AUSBILDUNG
Technical University - B.Sc. (2011 - 2015)

KOMPETENZEN
Leadership, Agile, Scrum, CI/CD
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Simge Ulu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#65/200]: Hazal Albayrak (Tedarik Zinciri ve Lojistik Müdürü)', () => {
    const cv = `
Hazal Albayrak | Bursa / Nilüfer | Tedarik Zinciri ve Lojistik Müdürü

İŞ TECRÜBESİ
Ekol Lojistik A.Ş. | Tedarik Zinciri ve Lojistik Müdürü | 2018 - 2024
Proje yürütme | Performans takibi | Ekip koordinasyonu

AKADEMİK GEÇMİŞ
Uludağ Üniversitesi - Lisans (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hazal Albayrak');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#66/200]: Ece Gül (İnsan Kaynakları Direktörü)', () => {
    const cv = `
Ece Gül
İstanbul / Kadıköy | 0532 999 00 65
İnsan Kaynakları Direktörü

DENEYİM
PwC Danışmanlık A.Ş. - İnsan Kaynakları Direktörü (2018 - 2024)
Bölüm yönetimi, stratejik hedefler ve KPI yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Liderlik, Strateji, Bütçe, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ece Gül');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#67/200]: Ezgi Bayram (Şantiye ve Proje Müdürü)', () => {
    const cv = `
KİŞİSEL BİLGİLER
İsim: Ezgi Bayram
Lokasyon: Ankara / Çankaya
İletişim: 0533 111 22 66

ÖZGEÇMİŞ ÖZETİ
Şantiye ve Proje Müdürü alanında 10 yılı aşkın deneyim.

İŞ DENEYİMİ
Enka İnşaat Sanayi A.Ş. (2017 - 2024)
Şantiye ve Proje Müdürü
Süreçlerin sevk ve idaresi.

EĞİTİM BİLGİLERİ
ODTÜ - Mühendislik Fakültesi (2010 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ezgi Bayram');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#68/200]: Gülşah Ateş (Dijital Pazarlama ve Büyüme Müdürü)', () => {
    const cv = `
Gülşah Ateş
İzmir / Bornova
Dijital Pazarlama ve Büyüme Müdürü

YETKİNLİKLER
Yönetim, Planlama, Organizasyon, İletişim

REFERANSLAR
Ali Vural - Genel Müdür

MESLEKİ DENEYİM
Hepsiburada Elektronik A.Ş. - Dijital Pazarlama ve Büyüme Müdürü (2019 - 2024)
Operasyonel mükemmellik ve ekip yönetimi.

EĞİTİM
Ege Üniversitesi - Lisans (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Gülşah Ateş');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#69/200]: Banu Yalın (Üretim ve Fabrika Müdürü)', () => {
    const cv = `
Banu Yalın
München / Germany | 0532 777 88 68
Üretim ve Fabrika Müdürü

BERUFSERFAHRUNG
Arçelik Üretim A.Ş. - Üretim ve Fabrika Müdürü (2018 - 2024)
International operational management and scaling.

AUSBILDUNG
Technical University - B.Sc. (2011 - 2015)

KOMPETENZEN
Leadership, Agile, Scrum, CI/CD
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Banu Yalın');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#70/200]: Berna Fidan (Otel Genel Müdürü)', () => {
    const cv = `
Berna Fidan | Bursa / Nilüfer | Otel Genel Müdürü

İŞ TECRÜBESİ
Divan Turizm İşletmeleri A.Ş. | Otel Genel Müdürü | 2018 - 2024
Proje yürütme | Performans takibi | Ekip koordinasyonu

AKADEMİK GEÇMİŞ
Uludağ Üniversitesi - Lisans (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Berna Fidan');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#71/200]: Ceyda Güner (Hukuk Müşaviri ve Uyum Direktörü)', () => {
    const cv = `
Ceyda Güner
İstanbul / Kadıköy | 0532 999 00 70
Hukuk Müşaviri ve Uyum Direktörü

DENEYİM
Eczacıbaşı Holding A.Ş. - Hukuk Müşaviri ve Uyum Direktörü (2018 - 2024)
Bölüm yönetimi, stratejik hedefler ve KPI yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Liderlik, Strateji, Bütçe, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ceyda Güner');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#72/200]: Damla Hakan (Siber Güvenlik ve SOC Müdürü)', () => {
    const cv = `
KİŞİSEL BİLGİLER
İsim: Damla Hakan
Lokasyon: Ankara / Çankaya
İletişim: 0533 111 22 71

ÖZGEÇMİŞ ÖZETİ
Siber Güvenlik ve SOC Müdürü alanında 10 yılı aşkın deneyim.

İŞ DENEYİMİ
Havelsan Teknoloji A.Ş. (2017 - 2024)
Siber Güvenlik ve SOC Müdürü
Süreçlerin sevk ve idaresi.

EĞİTİM BİLGİLERİ
ODTÜ - Mühendislik Fakültesi (2010 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Damla Hakan');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#73/200]: Dilara Işık (Yapay Zeka ve Veri Bilimi Lideri)', () => {
    const cv = `
Dilara Işık
İzmir / Bornova
Yapay Zeka ve Veri Bilimi Lideri

YETKİNLİKLER
Yönetim, Planlama, Organizasyon, İletişim

REFERANSLAR
Ali Vural - Genel Müdür

MESLEKİ DENEYİM
Insider Yazılım A.Ş. - Yapay Zeka ve Veri Bilimi Lideri (2019 - 2024)
Operasyonel mükemmellik ve ekip yönetimi.

EĞİTİM
Ege Üniversitesi - Lisans (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Dilara Işık');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#74/200]: Filiz Jale (Aktüerya ve Risk Değerlendirme Müdürü)', () => {
    const cv = `
Filiz Jale
München / Germany | 0532 777 88 73
Aktüerya ve Risk Değerlendirme Müdürü

BERUFSERFAHRUNG
Anadolu Sigorta A.Ş. - Aktüerya ve Risk Değerlendirme Müdürü (2018 - 2024)
International operational management and scaling.

AUSBILDUNG
Technical University - B.Sc. (2011 - 2015)

KOMPETENZEN
Leadership, Agile, Scrum, CI/CD
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Filiz Jale');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#75/200]: Gonca Mutlu (Başhekim ve Medikal Direktör)', () => {
    const cv = `
Gonca Mutlu | Bursa / Nilüfer | Başhekim ve Medikal Direktör

İŞ TECRÜBESİ
Acıbadem Sağlık Grubu | Başhekim ve Medikal Direktör | 2018 - 2024
Proje yürütme | Performans takibi | Ekip koordinasyonu

AKADEMİK GEÇMİŞ
Uludağ Üniversitesi - Lisans (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Gonca Mutlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#76/200]: Hilal Nalbant (E-Ticaret ve Kategori Direktörü)', () => {
    const cv = `
Hilal Nalbant
İstanbul / Kadıköy | 0532 999 00 75
E-Ticaret ve Kategori Direktörü

DENEYİM
Amazon Türkiye A.Ş. - E-Ticaret ve Kategori Direktörü (2018 - 2024)
Bölüm yönetimi, stratejik hedefler ve KPI yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Liderlik, Strateji, Bütçe, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hilal Nalbant');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#77/200]: Işıl Oğuz (Yalın Üretim ve Sürekli İyileştirme Lideri)', () => {
    const cv = `
KİŞİSEL BİLGİLER
İsim: Işıl Oğuz
Lokasyon: Ankara / Çankaya
İletişim: 0533 111 22 76

ÖZGEÇMİŞ ÖZETİ
Yalın Üretim ve Sürekli İyileştirme Lideri alanında 10 yılı aşkın deneyim.

İŞ DENEYİMİ
Bosch Sanayi A.Ş. (2017 - 2024)
Yalın Üretim ve Sürekli İyileştirme Lideri
Süreçlerin sevk ve idaresi.

EĞİTİM BİLGİLERİ
ODTÜ - Mühendislik Fakültesi (2010 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Işıl Oğuz');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#78/200]: Jale Soydan (Kurumsal İletişim ve PR Müdürü)', () => {
    const cv = `
Jale Soydan
İzmir / Bornova
Kurumsal İletişim ve PR Müdürü

YETKİNLİKLER
Yönetim, Planlama, Organizasyon, İletişim

REFERANSLAR
Ali Vural - Genel Müdür

MESLEKİ DENEYİM
Sabancı Holding A.Ş. - Kurumsal İletişim ve PR Müdürü (2019 - 2024)
Operasyonel mükemmellik ve ekip yönetimi.

EĞİTİM
Ege Üniversitesi - Lisans (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Jale Soydan');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#79/200]: Kübra Sururi (Gıda Kalite ve Ar-Ge Müdürü)', () => {
    const cv = `
Kübra Sururi
München / Germany | 0532 777 88 78
Gıda Kalite ve Ar-Ge Müdürü

BERUFSERFAHRUNG
Sütaş Süt Ürünleri A.Ş. - Gıda Kalite ve Ar-Ge Müdürü (2018 - 2024)
International operational management and scaling.

AUSBILDUNG
Technical University - B.Sc. (2011 - 2015)

KOMPETENZEN
Leadership, Agile, Scrum, CI/CD
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kübra Sururi');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#80/200]: Lale Orman (Enerji Santrali Saha Mühendisi)', () => {
    const cv = `
Lale Orman | Bursa / Nilüfer | Enerji Santrali Saha Mühendisi

İŞ TECRÜBESİ
Enerjisa Üretim A.Ş. | Enerji Santrali Saha Mühendisi | 2018 - 2024
Proje yürütme | Performans takibi | Ekip koordinasyonu

AKADEMİK GEÇMİŞ
Uludağ Üniversitesi - Lisans (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Lale Orman');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#81/200]: Mine Uslu (Kıdemli Yazılım Geliştirici)', () => {
    const cv = `
Mine Uslu
İstanbul / Kadıköy | 0532 999 00 80
Kıdemli Yazılım Geliştirici

DENEYİM
Trendyol Teknoloji A.Ş. - Kıdemli Yazılım Geliştirici (2018 - 2024)
Bölüm yönetimi, stratejik hedefler ve KPI yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Liderlik, Strateji, Bütçe, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Mine Uslu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#82/200]: Nazlı Kurtoğlu (Bölge Satış Müdürü)', () => {
    const cv = `
KİŞİSEL BİLGİLER
İsim: Nazlı Kurtoğlu
Lokasyon: Ankara / Çankaya
İletişim: 0533 111 22 81

ÖZGEÇMİŞ ÖZETİ
Bölge Satış Müdürü alanında 10 yılı aşkın deneyim.

İŞ DENEYİMİ
Unilever Sanayi A.Ş. (2017 - 2024)
Bölge Satış Müdürü
Süreçlerin sevk ve idaresi.

EĞİTİM BİLGİLERİ
ODTÜ - Mühendislik Fakültesi (2010 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Nazlı Kurtoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#83/200]: Nihan Demirtaş (Mali İşler Direktörü)', () => {
    const cv = `
Nihan Demirtaş
İzmir / Bornova
Mali İşler Direktörü

YETKİNLİKLER
Yönetim, Planlama, Organizasyon, İletişim

REFERANSLAR
Ali Vural - Genel Müdür

MESLEKİ DENEYİM
Garanti Bankası A.Ş. - Mali İşler Direktörü (2019 - 2024)
Operasyonel mükemmellik ve ekip yönetimi.

EĞİTİM
Ege Üniversitesi - Lisans (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Nihan Demirtaş');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#84/200]: Nurten Çelebi (Çağrı Merkezi Operasyon Müdürü)', () => {
    const cv = `
Nurten Çelebi
München / Germany | 0532 777 88 83
Çağrı Merkezi Operasyon Müdürü

BERUFSERFAHRUNG
Turkcell Global Bilgi A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
International operational management and scaling.

AUSBILDUNG
Technical University - B.Sc. (2011 - 2015)

KOMPETENZEN
Leadership, Agile, Scrum, CI/CD
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Nurten Çelebi');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#85/200]: Özge Baştürk (Tedarik Zinciri ve Lojistik Müdürü)', () => {
    const cv = `
Özge Baştürk | Bursa / Nilüfer | Tedarik Zinciri ve Lojistik Müdürü

İŞ TECRÜBESİ
Ekol Lojistik A.Ş. | Tedarik Zinciri ve Lojistik Müdürü | 2018 - 2024
Proje yürütme | Performans takibi | Ekip koordinasyonu

AKADEMİK GEÇMİŞ
Uludağ Üniversitesi - Lisans (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Özge Baştürk');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#86/200]: Pelin Özbek (İnsan Kaynakları Direktörü)', () => {
    const cv = `
Pelin Özbek
İstanbul / Kadıköy | 0532 999 00 85
İnsan Kaynakları Direktörü

DENEYİM
PwC Danışmanlık A.Ş. - İnsan Kaynakları Direktörü (2018 - 2024)
Bölüm yönetimi, stratejik hedefler ve KPI yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Liderlik, Strateji, Bütçe, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Pelin Özbek');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#87/200]: Rabia Kocaman (Şantiye ve Proje Müdürü)', () => {
    const cv = `
KİŞİSEL BİLGİLER
İsim: Rabia Kocaman
Lokasyon: Ankara / Çankaya
İletişim: 0533 111 22 86

ÖZGEÇMİŞ ÖZETİ
Şantiye ve Proje Müdürü alanında 10 yılı aşkın deneyim.

İŞ DENEYİMİ
Enka İnşaat Sanayi A.Ş. (2017 - 2024)
Şantiye ve Proje Müdürü
Süreçlerin sevk ve idaresi.

EĞİTİM BİLGİLERİ
ODTÜ - Mühendislik Fakültesi (2010 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Rabia Kocaman');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#88/200]: Rüya Ertekin (Dijital Pazarlama ve Büyüme Müdürü)', () => {
    const cv = `
Rüya Ertekin
İzmir / Bornova
Dijital Pazarlama ve Büyüme Müdürü

YETKİNLİKLER
Yönetim, Planlama, Organizasyon, İletişim

REFERANSLAR
Ali Vural - Genel Müdür

MESLEKİ DENEYİM
Hepsiburada Elektronik A.Ş. - Dijital Pazarlama ve Büyüme Müdürü (2019 - 2024)
Operasyonel mükemmellik ve ekip yönetimi.

EĞİTİM
Ege Üniversitesi - Lisans (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Rüya Ertekin');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#89/200]: Sevim Akpınar (Üretim ve Fabrika Müdürü)', () => {
    const cv = `
Sevim Akpınar
München / Germany | 0532 777 88 88
Üretim ve Fabrika Müdürü

BERUFSERFAHRUNG
Arçelik Üretim A.Ş. - Üretim ve Fabrika Müdürü (2018 - 2024)
International operational management and scaling.

AUSBILDUNG
Technical University - B.Sc. (2011 - 2015)

KOMPETENZEN
Leadership, Agile, Scrum, CI/CD
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Sevim Akpınar');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#90/200]: Sinem Batıl (Otel Genel Müdürü)', () => {
    const cv = `
Sinem Batıl | Bursa / Nilüfer | Otel Genel Müdürü

İŞ TECRÜBESİ
Divan Turizm İşletmeleri A.Ş. | Otel Genel Müdürü | 2018 - 2024
Proje yürütme | Performans takibi | Ekip koordinasyonu

AKADEMİK GEÇMİŞ
Uludağ Üniversitesi - Lisans (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Sinem Batıl');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#91/200]: Şeyma Saylan (Hukuk Müşaviri ve Uyum Direktörü)', () => {
    const cv = `
Şeyma Saylan
İstanbul / Kadıköy | 0532 999 00 90
Hukuk Müşaviri ve Uyum Direktörü

DENEYİM
Eczacıbaşı Holding A.Ş. - Hukuk Müşaviri ve Uyum Direktörü (2018 - 2024)
Bölüm yönetimi, stratejik hedefler ve KPI yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Liderlik, Strateji, Bütçe, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Şeyma Saylan');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#92/200]: Tülay Ekşi (Siber Güvenlik ve SOC Müdürü)', () => {
    const cv = `
KİŞİSEL BİLGİLER
İsim: Tülay Ekşi
Lokasyon: Ankara / Çankaya
İletişim: 0533 111 22 91

ÖZGEÇMİŞ ÖZETİ
Siber Güvenlik ve SOC Müdürü alanında 10 yılı aşkın deneyim.

İŞ DENEYİMİ
Havelsan Teknoloji A.Ş. (2017 - 2024)
Siber Güvenlik ve SOC Müdürü
Süreçlerin sevk ve idaresi.

EĞİTİM BİLGİLERİ
ODTÜ - Mühendislik Fakültesi (2010 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Tülay Ekşi');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#93/200]: Ülkü Zaman (Yapay Zeka ve Veri Bilimi Lideri)', () => {
    const cv = `
Ülkü Zaman
İzmir / Bornova
Yapay Zeka ve Veri Bilimi Lideri

YETKİNLİKLER
Yönetim, Planlama, Organizasyon, İletişim

REFERANSLAR
Ali Vural - Genel Müdür

MESLEKİ DENEYİM
Insider Yazılım A.Ş. - Yapay Zeka ve Veri Bilimi Lideri (2019 - 2024)
Operasyonel mükemmellik ve ekip yönetimi.

EĞİTİM
Ege Üniversitesi - Lisans (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ülkü Zaman');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#94/200]: Vildan Hürkuş (Aktüerya ve Risk Değerlendirme Müdürü)', () => {
    const cv = `
Vildan Hürkuş
München / Germany | 0532 777 88 93
Aktüerya ve Risk Değerlendirme Müdürü

BERUFSERFAHRUNG
Anadolu Sigorta A.Ş. - Aktüerya ve Risk Değerlendirme Müdürü (2018 - 2024)
International operational management and scaling.

AUSBILDUNG
Technical University - B.Sc. (2011 - 2015)

KOMPETENZEN
Leadership, Agile, Scrum, CI/CD
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Vildan Hürkuş');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#95/200]: Yasemin Gürbüz (Başhekim ve Medikal Direktör)', () => {
    const cv = `
Yasemin Gürbüz | Bursa / Nilüfer | Başhekim ve Medikal Direktör

İŞ TECRÜBESİ
Acıbadem Sağlık Grubu | Başhekim ve Medikal Direktör | 2018 - 2024
Proje yürütme | Performans takibi | Ekip koordinasyonu

AKADEMİK GEÇMİŞ
Uludağ Üniversitesi - Lisans (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Yasemin Gürbüz');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#96/200]: Zehra Alkan (E-Ticaret ve Kategori Direktörü)', () => {
    const cv = `
Zehra Alkan
İstanbul / Kadıköy | 0532 999 00 95
E-Ticaret ve Kategori Direktörü

DENEYİM
Amazon Türkiye A.Ş. - E-Ticaret ve Kategori Direktörü (2018 - 2024)
Bölüm yönetimi, stratejik hedefler ve KPI yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Liderlik, Strateji, Bütçe, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zehra Alkan');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#97/200]: Züleyha Tuncer (Yalın Üretim ve Sürekli İyileştirme Lideri)', () => {
    const cv = `
KİŞİSEL BİLGİLER
İsim: Züleyha Tuncer
Lokasyon: Ankara / Çankaya
İletişim: 0533 111 22 96

ÖZGEÇMİŞ ÖZETİ
Yalın Üretim ve Sürekli İyileştirme Lideri alanında 10 yılı aşkın deneyim.

İŞ DENEYİMİ
Bosch Sanayi A.Ş. (2017 - 2024)
Yalın Üretim ve Sürekli İyileştirme Lideri
Süreçlerin sevk ve idaresi.

EĞİTİM BİLGİLERİ
ODTÜ - Mühendislik Fakültesi (2010 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Züleyha Tuncer');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#98/200]: Asuman Orman (Kurumsal İletişim ve PR Müdürü)', () => {
    const cv = `
Asuman Orman
İzmir / Bornova
Kurumsal İletişim ve PR Müdürü

YETKİNLİKLER
Yönetim, Planlama, Organizasyon, İletişim

REFERANSLAR
Ali Vural - Genel Müdür

MESLEKİ DENEYİM
Sabancı Holding A.Ş. - Kurumsal İletişim ve PR Müdürü (2019 - 2024)
Operasyonel mükemmellik ve ekip yönetimi.

EĞİTİM
Ege Üniversitesi - Lisans (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Asuman Orman');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#99/200]: Belgin Uslu (Gıda Kalite ve Ar-Ge Müdürü)', () => {
    const cv = `
Belgin Uslu
München / Germany | 0532 777 88 98
Gıda Kalite ve Ar-Ge Müdürü

BERUFSERFAHRUNG
Sütaş Süt Ürünleri A.Ş. - Gıda Kalite ve Ar-Ge Müdürü (2018 - 2024)
International operational management and scaling.

AUSBILDUNG
Technical University - B.Sc. (2011 - 2015)

KOMPETENZEN
Leadership, Agile, Scrum, CI/CD
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Belgin Uslu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#100/200]: Berrin Soydan (Enerji Santrali Saha Mühendisi)', () => {
    const cv = `
Berrin Soydan | Bursa / Nilüfer | Enerji Santrali Saha Mühendisi

İŞ TECRÜBESİ
Enerjisa Üretim A.Ş. | Enerji Santrali Saha Mühendisi | 2018 - 2024
Proje yürütme | Performans takibi | Ekip koordinasyonu

AKADEMİK GEÇMİŞ
Uludağ Üniversitesi - Lisans (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Berrin Soydan');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#101/200]: Ahmet Yılmazoğlu (Kıdemli Yazılım Geliştirici)', () => {
    const cv = `
Ahmet Yılmazoğlu
İstanbul / Kadıköy | 0532 999 00 100
Kıdemli Yazılım Geliştirici

DENEYİM
Trendyol Teknoloji A.Ş. - Kıdemli Yazılım Geliştirici (2018 - 2024)
Bölüm yönetimi, stratejik hedefler ve KPI yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Liderlik, Strateji, Bütçe, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ahmet Yılmazoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#102/200]: Mehmet Demiroğlu (Bölge Satış Müdürü)', () => {
    const cv = `
KİŞİSEL BİLGİLER
İsim: Mehmet Demiroğlu
Lokasyon: Ankara / Çankaya
İletişim: 0533 111 22 101

ÖZGEÇMİŞ ÖZETİ
Bölge Satış Müdürü alanında 10 yılı aşkın deneyim.

İŞ DENEYİMİ
Unilever Sanayi A.Ş. (2017 - 2024)
Bölge Satış Müdürü
Süreçlerin sevk ve idaresi.

EĞİTİM BİLGİLERİ
ODTÜ - Mühendislik Fakültesi (2010 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Mehmet Demiroğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#103/200]: Mustafa Çelikoğlu (Mali İşler Direktörü)', () => {
    const cv = `
Mustafa Çelikoğlu
İzmir / Bornova
Mali İşler Direktörü

YETKİNLİKLER
Yönetim, Planlama, Organizasyon, İletişim

REFERANSLAR
Ali Vural - Genel Müdür

MESLEKİ DENEYİM
Garanti Bankası A.Ş. - Mali İşler Direktörü (2019 - 2024)
Operasyonel mükemmellik ve ekip yönetimi.

EĞİTİM
Ege Üniversitesi - Lisans (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Mustafa Çelikoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#104/200]: Ali Kayaoğlu (Çağrı Merkezi Operasyon Müdürü)', () => {
    const cv = `
Ali Kayaoğlu
München / Germany | 0532 777 88 103
Çağrı Merkezi Operasyon Müdürü

BERUFSERFAHRUNG
Turkcell Global Bilgi A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
International operational management and scaling.

AUSBILDUNG
Technical University - B.Sc. (2011 - 2015)

KOMPETENZEN
Leadership, Agile, Scrum, CI/CD
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ali Kayaoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#105/200]: Hüseyin Yıldızoğlu (Tedarik Zinciri ve Lojistik Müdürü)', () => {
    const cv = `
Hüseyin Yıldızoğlu | Bursa / Nilüfer | Tedarik Zinciri ve Lojistik Müdürü

İŞ TECRÜBESİ
Ekol Lojistik A.Ş. | Tedarik Zinciri ve Lojistik Müdürü | 2018 - 2024
Proje yürütme | Performans takibi | Ekip koordinasyonu

AKADEMİK GEÇMİŞ
Uludağ Üniversitesi - Lisans (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hüseyin Yıldızoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#106/200]: Hasan Yıldırımoğlu (İnsan Kaynakları Direktörü)', () => {
    const cv = `
Hasan Yıldırımoğlu
İstanbul / Kadıköy | 0532 999 00 105
İnsan Kaynakları Direktörü

DENEYİM
PwC Danışmanlık A.Ş. - İnsan Kaynakları Direktörü (2018 - 2024)
Bölüm yönetimi, stratejik hedefler ve KPI yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Liderlik, Strateji, Bütçe, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hasan Yıldırımoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#107/200]: İbrahim Öztürkoğlu (Şantiye ve Proje Müdürü)', () => {
    const cv = `
KİŞİSEL BİLGİLER
İsim: İbrahim Öztürkoğlu
Lokasyon: Ankara / Çankaya
İletişim: 0533 111 22 106

ÖZGEÇMİŞ ÖZETİ
Şantiye ve Proje Müdürü alanında 10 yılı aşkın deneyim.

İŞ DENEYİMİ
Enka İnşaat Sanayi A.Ş. (2017 - 2024)
Şantiye ve Proje Müdürü
Süreçlerin sevk ve idaresi.

EĞİTİM BİLGİLERİ
ODTÜ - Mühendislik Fakültesi (2010 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('İbrahim Öztürkoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#108/200]: İsmail Aydınoğlu (Dijital Pazarlama ve Büyüme Müdürü)', () => {
    const cv = `
İsmail Aydınoğlu
İzmir / Bornova
Dijital Pazarlama ve Büyüme Müdürü

YETKİNLİKLER
Yönetim, Planlama, Organizasyon, İletişim

REFERANSLAR
Ali Vural - Genel Müdür

MESLEKİ DENEYİM
Hepsiburada Elektronik A.Ş. - Dijital Pazarlama ve Büyüme Müdürü (2019 - 2024)
Operasyonel mükemmellik ve ekip yönetimi.

EĞİTİM
Ege Üniversitesi - Lisans (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('İsmail Aydınoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#109/200]: Osman Özdemiroğlu (Üretim ve Fabrika Müdürü)', () => {
    const cv = `
Osman Özdemiroğlu
München / Germany | 0532 777 88 108
Üretim ve Fabrika Müdürü

BERUFSERFAHRUNG
Arçelik Üretim A.Ş. - Üretim ve Fabrika Müdürü (2018 - 2024)
International operational management and scaling.

AUSBILDUNG
Technical University - B.Sc. (2011 - 2015)

KOMPETENZEN
Leadership, Agile, Scrum, CI/CD
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Osman Özdemiroğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#110/200]: Fatih Arslanoğlu (Otel Genel Müdürü)', () => {
    const cv = `
Fatih Arslanoğlu | Bursa / Nilüfer | Otel Genel Müdürü

İŞ TECRÜBESİ
Divan Turizm İşletmeleri A.Ş. | Otel Genel Müdürü | 2018 - 2024
Proje yürütme | Performans takibi | Ekip koordinasyonu

AKADEMİK GEÇMİŞ
Uludağ Üniversitesi - Lisans (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Fatih Arslanoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#111/200]: Murat Doğanoğlu (Hukuk Müşaviri ve Uyum Direktörü)', () => {
    const cv = `
Murat Doğanoğlu
İstanbul / Kadıköy | 0532 999 00 110
Hukuk Müşaviri ve Uyum Direktörü

DENEYİM
Eczacıbaşı Holding A.Ş. - Hukuk Müşaviri ve Uyum Direktörü (2018 - 2024)
Bölüm yönetimi, stratejik hedefler ve KPI yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Liderlik, Strateji, Bütçe, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Murat Doğanoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#112/200]: Ömer Kılıçoğlu (Siber Güvenlik ve SOC Müdürü)', () => {
    const cv = `
KİŞİSEL BİLGİLER
İsim: Ömer Kılıçoğlu
Lokasyon: Ankara / Çankaya
İletişim: 0533 111 22 111

ÖZGEÇMİŞ ÖZETİ
Siber Güvenlik ve SOC Müdürü alanında 10 yılı aşkın deneyim.

İŞ DENEYİMİ
Havelsan Teknoloji A.Ş. (2017 - 2024)
Siber Güvenlik ve SOC Müdürü
Süreçlerin sevk ve idaresi.

EĞİTİM BİLGİLERİ
ODTÜ - Mühendislik Fakültesi (2010 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ömer Kılıçoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#113/200]: Ramazan Aslanoğlu (Yapay Zeka ve Veri Bilimi Lideri)', () => {
    const cv = `
Ramazan Aslanoğlu
İzmir / Bornova
Yapay Zeka ve Veri Bilimi Lideri

YETKİNLİKLER
Yönetim, Planlama, Organizasyon, İletişim

REFERANSLAR
Ali Vural - Genel Müdür

MESLEKİ DENEYİM
Insider Yazılım A.Ş. - Yapay Zeka ve Veri Bilimi Lideri (2019 - 2024)
Operasyonel mükemmellik ve ekip yönetimi.

EĞİTİM
Ege Üniversitesi - Lisans (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ramazan Aslanoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#114/200]: Halil Çetinoğlu (Aktüerya ve Risk Değerlendirme Müdürü)', () => {
    const cv = `
Halil Çetinoğlu
München / Germany | 0532 777 88 113
Aktüerya ve Risk Değerlendirme Müdürü

BERUFSERFAHRUNG
Anadolu Sigorta A.Ş. - Aktüerya ve Risk Değerlendirme Müdürü (2018 - 2024)
International operational management and scaling.

AUSBILDUNG
Technical University - B.Sc. (2011 - 2015)

KOMPETENZEN
Leadership, Agile, Scrum, CI/CD
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Halil Çetinoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#115/200]: Süleyman Karaoğlu (Başhekim ve Medikal Direktör)', () => {
    const cv = `
Süleyman Karaoğlu | Bursa / Nilüfer | Başhekim ve Medikal Direktör

İŞ TECRÜBESİ
Acıbadem Sağlık Grubu | Başhekim ve Medikal Direktör | 2018 - 2024
Proje yürütme | Performans takibi | Ekip koordinasyonu

AKADEMİK GEÇMİŞ
Uludağ Üniversitesi - Lisans (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Süleyman Karaoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#116/200]: Abdullah Koçoğlu (E-Ticaret ve Kategori Direktörü)', () => {
    const cv = `
Abdullah Koçoğlu
İstanbul / Kadıköy | 0532 999 00 115
E-Ticaret ve Kategori Direktörü

DENEYİM
Amazon Türkiye A.Ş. - E-Ticaret ve Kategori Direktörü (2018 - 2024)
Bölüm yönetimi, stratejik hedefler ve KPI yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Liderlik, Strateji, Bütçe, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Abdullah Koçoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#117/200]: Yusuf Kurtoğlu (Yalın Üretim ve Sürekli İyileştirme Lideri)', () => {
    const cv = `
KİŞİSEL BİLGİLER
İsim: Yusuf Kurtoğlu
Lokasyon: Ankara / Çankaya
İletişim: 0533 111 22 116

ÖZGEÇMİŞ ÖZETİ
Yalın Üretim ve Sürekli İyileştirme Lideri alanında 10 yılı aşkın deneyim.

İŞ DENEYİMİ
Bosch Sanayi A.Ş. (2017 - 2024)
Yalın Üretim ve Sürekli İyileştirme Lideri
Süreçlerin sevk ve idaresi.

EĞİTİM BİLGİLERİ
ODTÜ - Mühendislik Fakültesi (2010 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Yusuf Kurtoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#118/200]: Emre Özkanoğlu (Kurumsal İletişim ve PR Müdürü)', () => {
    const cv = `
Emre Özkanoğlu
İzmir / Bornova
Kurumsal İletişim ve PR Müdürü

YETKİNLİKLER
Yönetim, Planlama, Organizasyon, İletişim

REFERANSLAR
Ali Vural - Genel Müdür

MESLEKİ DENEYİM
Sabancı Holding A.Ş. - Kurumsal İletişim ve PR Müdürü (2019 - 2024)
Operasyonel mükemmellik ve ekip yönetimi.

EĞİTİM
Ege Üniversitesi - Lisans (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Emre Özkanoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#119/200]: Can Şimşekoğlu (Gıda Kalite ve Ar-Ge Müdürü)', () => {
    const cv = `
Can Şimşekoğlu
München / Germany | 0532 777 88 118
Gıda Kalite ve Ar-Ge Müdürü

BERUFSERFAHRUNG
Sütaş Süt Ürünleri A.Ş. - Gıda Kalite ve Ar-Ge Müdürü (2018 - 2024)
International operational management and scaling.

AUSBILDUNG
Technical University - B.Sc. (2011 - 2015)

KOMPETENZEN
Leadership, Agile, Scrum, CI/CD
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Can Şimşekoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#120/200]: Hakan Polatoğlu (Enerji Santrali Saha Mühendisi)', () => {
    const cv = `
Hakan Polatoğlu | Bursa / Nilüfer | Enerji Santrali Saha Mühendisi

İŞ TECRÜBESİ
Enerjisa Üretim A.Ş. | Enerji Santrali Saha Mühendisi | 2018 - 2024
Proje yürütme | Performans takibi | Ekip koordinasyonu

AKADEMİK GEÇMİŞ
Uludağ Üniversitesi - Lisans (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hakan Polatoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#121/200]: Burak Özcanoğlu (Kıdemli Yazılım Geliştirici)', () => {
    const cv = `
Burak Özcanoğlu
İstanbul / Kadıköy | 0532 999 00 120
Kıdemli Yazılım Geliştirici

DENEYİM
Trendyol Teknoloji A.Ş. - Kıdemli Yazılım Geliştirici (2018 - 2024)
Bölüm yönetimi, stratejik hedefler ve KPI yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Liderlik, Strateji, Bütçe, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Burak Özcanoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#122/200]: Oğuzhan Korkmazoğlu (Bölge Satış Müdürü)', () => {
    const cv = `
KİŞİSEL BİLGİLER
İsim: Oğuzhan Korkmazoğlu
Lokasyon: Ankara / Çankaya
İletişim: 0533 111 22 121

ÖZGEÇMİŞ ÖZETİ
Bölge Satış Müdürü alanında 10 yılı aşkın deneyim.

İŞ DENEYİMİ
Unilever Sanayi A.Ş. (2017 - 2024)
Bölge Satış Müdürü
Süreçlerin sevk ve idaresi.

EĞİTİM BİLGİLERİ
ODTÜ - Mühendislik Fakültesi (2010 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Oğuzhan Korkmazoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#123/200]: Serkan Çakıroğlu (Mali İşler Direktörü)', () => {
    const cv = `
Serkan Çakıroğlu
İzmir / Bornova
Mali İşler Direktörü

YETKİNLİKLER
Yönetim, Planlama, Organizasyon, İletişim

REFERANSLAR
Ali Vural - Genel Müdür

MESLEKİ DENEYİM
Garanti Bankası A.Ş. - Mali İşler Direktörü (2019 - 2024)
Operasyonel mükemmellik ve ekip yönetimi.

EĞİTİM
Ege Üniversitesi - Lisans (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Serkan Çakıroğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#124/200]: Uğur Erdoğanoğlu (Çağrı Merkezi Operasyon Müdürü)', () => {
    const cv = `
Uğur Erdoğanoğlu
München / Germany | 0532 777 88 123
Çağrı Merkezi Operasyon Müdürü

BERUFSERFAHRUNG
Turkcell Global Bilgi A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
International operational management and scaling.

AUSBILDUNG
Technical University - B.Sc. (2011 - 2015)

KOMPETENZEN
Leadership, Agile, Scrum, CI/CD
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Uğur Erdoğanoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#125/200]: Volkan Yavuzoğlu (Tedarik Zinciri ve Lojistik Müdürü)', () => {
    const cv = `
Volkan Yavuzoğlu | Bursa / Nilüfer | Tedarik Zinciri ve Lojistik Müdürü

İŞ TECRÜBESİ
Ekol Lojistik A.Ş. | Tedarik Zinciri ve Lojistik Müdürü | 2018 - 2024
Proje yürütme | Performans takibi | Ekip koordinasyonu

AKADEMİK GEÇMİŞ
Uludağ Üniversitesi - Lisans (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Volkan Yavuzoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#126/200]: Tolga Güneşoğlu (İnsan Kaynakları Direktörü)', () => {
    const cv = `
Tolga Güneşoğlu
İstanbul / Kadıköy | 0532 999 00 125
İnsan Kaynakları Direktörü

DENEYİM
PwC Danışmanlık A.Ş. - İnsan Kaynakları Direktörü (2018 - 2024)
Bölüm yönetimi, stratejik hedefler ve KPI yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Liderlik, Strateji, Bütçe, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Tolga Güneşoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#127/200]: Alper Aksoyoğlu (Şantiye ve Proje Müdürü)', () => {
    const cv = `
KİŞİSEL BİLGİLER
İsim: Alper Aksoyoğlu
Lokasyon: Ankara / Çankaya
İletişim: 0533 111 22 126

ÖZGEÇMİŞ ÖZETİ
Şantiye ve Proje Müdürü alanında 10 yılı aşkın deneyim.

İŞ DENEYİMİ
Enka İnşaat Sanayi A.Ş. (2017 - 2024)
Şantiye ve Proje Müdürü
Süreçlerin sevk ve idaresi.

EĞİTİM BİLGİLERİ
ODTÜ - Mühendislik Fakültesi (2010 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Alper Aksoyoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#128/200]: Onur Güleroğlu (Dijital Pazarlama ve Büyüme Müdürü)', () => {
    const cv = `
Onur Güleroğlu
İzmir / Bornova
Dijital Pazarlama ve Büyüme Müdürü

YETKİNLİKLER
Yönetim, Planlama, Organizasyon, İletişim

REFERANSLAR
Ali Vural - Genel Müdür

MESLEKİ DENEYİM
Hepsiburada Elektronik A.Ş. - Dijital Pazarlama ve Büyüme Müdürü (2019 - 2024)
Operasyonel mükemmellik ve ekip yönetimi.

EĞİTİM
Ege Üniversitesi - Lisans (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Onur Güleroğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#129/200]: Gökhan Ünaloğlu (Üretim ve Fabrika Müdürü)', () => {
    const cv = `
Gökhan Ünaloğlu
München / Germany | 0532 777 88 128
Üretim ve Fabrika Müdürü

BERUFSERFAHRUNG
Arçelik Üretim A.Ş. - Üretim ve Fabrika Müdürü (2018 - 2024)
International operational management and scaling.

AUSBILDUNG
Technical University - B.Sc. (2011 - 2015)

KOMPETENZEN
Leadership, Agile, Scrum, CI/CD
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Gökhan Ünaloğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#130/200]: Kaan Taşoğlu (Otel Genel Müdürü)', () => {
    const cv = `
Kaan Taşoğlu | Bursa / Nilüfer | Otel Genel Müdürü

İŞ TECRÜBESİ
Divan Turizm İşletmeleri A.Ş. | Otel Genel Müdürü | 2018 - 2024
Proje yürütme | Performans takibi | Ekip koordinasyonu

AKADEMİK GEÇMİŞ
Uludağ Üniversitesi - Lisans (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kaan Taşoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#131/200]: Barış Başaranoğlu (Hukuk Müşaviri ve Uyum Direktörü)', () => {
    const cv = `
Barış Başaranoğlu
İstanbul / Kadıköy | 0532 999 00 130
Hukuk Müşaviri ve Uyum Direktörü

DENEYİM
Eczacıbaşı Holding A.Ş. - Hukuk Müşaviri ve Uyum Direktörü (2018 - 2024)
Bölüm yönetimi, stratejik hedefler ve KPI yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Liderlik, Strateji, Bütçe, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Barış Başaranoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#132/200]: Kerem Erkuloğlu (Siber Güvenlik ve SOC Müdürü)', () => {
    const cv = `
KİŞİSEL BİLGİLER
İsim: Kerem Erkuloğlu
Lokasyon: Ankara / Çankaya
İletişim: 0533 111 22 131

ÖZGEÇMİŞ ÖZETİ
Siber Güvenlik ve SOC Müdürü alanında 10 yılı aşkın deneyim.

İŞ DENEYİMİ
Havelsan Teknoloji A.Ş. (2017 - 2024)
Siber Güvenlik ve SOC Müdürü
Süreçlerin sevk ve idaresi.

EĞİTİM BİLGİLERİ
ODTÜ - Mühendislik Fakültesi (2010 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kerem Erkuloğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#133/200]: Cem Akalınoğlu (Yapay Zeka ve Veri Bilimi Lideri)', () => {
    const cv = `
Cem Akalınoğlu
İzmir / Bornova
Yapay Zeka ve Veri Bilimi Lideri

YETKİNLİKLER
Yönetim, Planlama, Organizasyon, İletişim

REFERANSLAR
Ali Vural - Genel Müdür

MESLEKİ DENEYİM
Insider Yazılım A.Ş. - Yapay Zeka ve Veri Bilimi Lideri (2019 - 2024)
Operasyonel mükemmellik ve ekip yönetimi.

EĞİTİM
Ege Üniversitesi - Lisans (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Cem Akalınoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#134/200]: Deniz Sezginoğlu (Aktüerya ve Risk Değerlendirme Müdürü)', () => {
    const cv = `
Deniz Sezginoğlu
München / Germany | 0532 777 88 133
Aktüerya ve Risk Değerlendirme Müdürü

BERUFSERFAHRUNG
Anadolu Sigorta A.Ş. - Aktüerya ve Risk Değerlendirme Müdürü (2018 - 2024)
International operational management and scaling.

AUSBILDUNG
Technical University - B.Sc. (2011 - 2015)

KOMPETENZEN
Leadership, Agile, Scrum, CI/CD
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Deniz Sezginoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#135/200]: Mert Yalçınoğlu (Başhekim ve Medikal Direktör)', () => {
    const cv = `
Mert Yalçınoğlu | Bursa / Nilüfer | Başhekim ve Medikal Direktör

İŞ TECRÜBESİ
Acıbadem Sağlık Grubu | Başhekim ve Medikal Direktör | 2018 - 2024
Proje yürütme | Performans takibi | Ekip koordinasyonu

AKADEMİK GEÇMİŞ
Uludağ Üniversitesi - Lisans (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Mert Yalçınoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#136/200]: Berk Tekinoğlu (E-Ticaret ve Kategori Direktörü)', () => {
    const cv = `
Berk Tekinoğlu
İstanbul / Kadıköy | 0532 999 00 135
E-Ticaret ve Kategori Direktörü

DENEYİM
Amazon Türkiye A.Ş. - E-Ticaret ve Kategori Direktörü (2018 - 2024)
Bölüm yönetimi, stratejik hedefler ve KPI yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Liderlik, Strateji, Bütçe, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Berk Tekinoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#137/200]: Doruk Koçakoğlu (Yalın Üretim ve Sürekli İyileştirme Lideri)', () => {
    const cv = `
KİŞİSEL BİLGİLER
İsim: Doruk Koçakoğlu
Lokasyon: Ankara / Çankaya
İletişim: 0533 111 22 136

ÖZGEÇMİŞ ÖZETİ
Yalın Üretim ve Sürekli İyileştirme Lideri alanında 10 yılı aşkın deneyim.

İŞ DENEYİMİ
Bosch Sanayi A.Ş. (2017 - 2024)
Yalın Üretim ve Sürekli İyileştirme Lideri
Süreçlerin sevk ve idaresi.

EĞİTİM BİLGİLERİ
ODTÜ - Mühendislik Fakültesi (2010 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Doruk Koçakoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#138/200]: Efe Sarıoğlu (Kurumsal İletişim ve PR Müdürü)', () => {
    const cv = `
Efe Sarıoğlu
İzmir / Bornova
Kurumsal İletişim ve PR Müdürü

YETKİNLİKLER
Yönetim, Planlama, Organizasyon, İletişim

REFERANSLAR
Ali Vural - Genel Müdür

MESLEKİ DENEYİM
Sabancı Holding A.Ş. - Kurumsal İletişim ve PR Müdürü (2019 - 2024)
Operasyonel mükemmellik ve ekip yönetimi.

EĞİTİM
Ege Üniversitesi - Lisans (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Efe Sarıoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#139/200]: Arda Tanoğlu (Gıda Kalite ve Ar-Ge Müdürü)', () => {
    const cv = `
Arda Tanoğlu
München / Germany | 0532 777 88 138
Gıda Kalite ve Ar-Ge Müdürü

BERUFSERFAHRUNG
Sütaş Süt Ürünleri A.Ş. - Gıda Kalite ve Ar-Ge Müdürü (2018 - 2024)
International operational management and scaling.

AUSBILDUNG
Technical University - B.Sc. (2011 - 2015)

KOMPETENZEN
Leadership, Agile, Scrum, CI/CD
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Arda Tanoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#140/200]: Yiğit Uçaroğlu (Enerji Santrali Saha Mühendisi)', () => {
    const cv = `
Yiğit Uçaroğlu | Bursa / Nilüfer | Enerji Santrali Saha Mühendisi

İŞ TECRÜBESİ
Enerjisa Üretim A.Ş. | Enerji Santrali Saha Mühendisi | 2018 - 2024
Proje yürütme | Performans takibi | Ekip koordinasyonu

AKADEMİK GEÇMİŞ
Uludağ Üniversitesi - Lisans (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Yiğit Uçaroğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#141/200]: Ayşe Vuraloğlu (Kıdemli Yazılım Geliştirici)', () => {
    const cv = `
Ayşe Vuraloğlu
İstanbul / Kadıköy | 0532 999 00 140
Kıdemli Yazılım Geliştirici

DENEYİM
Trendyol Teknoloji A.Ş. - Kıdemli Yazılım Geliştirici (2018 - 2024)
Bölüm yönetimi, stratejik hedefler ve KPI yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Liderlik, Strateji, Bütçe, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ayşe Vuraloğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#142/200]: Fatma Bulutoğlu (Bölge Satış Müdürü)', () => {
    const cv = `
KİŞİSEL BİLGİLER
İsim: Fatma Bulutoğlu
Lokasyon: Ankara / Çankaya
İletişim: 0533 111 22 141

ÖZGEÇMİŞ ÖZETİ
Bölge Satış Müdürü alanında 10 yılı aşkın deneyim.

İŞ DENEYİMİ
Unilever Sanayi A.Ş. (2017 - 2024)
Bölge Satış Müdürü
Süreçlerin sevk ve idaresi.

EĞİTİM BİLGİLERİ
ODTÜ - Mühendislik Fakültesi (2010 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Fatma Bulutoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#143/200]: Emine Keskinoğlu (Mali İşler Direktörü)', () => {
    const cv = `
Emine Keskinoğlu
İzmir / Bornova
Mali İşler Direktörü

YETKİNLİKLER
Yönetim, Planlama, Organizasyon, İletişim

REFERANSLAR
Ali Vural - Genel Müdür

MESLEKİ DENEYİM
Garanti Bankası A.Ş. - Mali İşler Direktörü (2019 - 2024)
Operasyonel mükemmellik ve ekip yönetimi.

EĞİTİM
Ege Üniversitesi - Lisans (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Emine Keskinoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#144/200]: Hatice Yükseloğlu (Çağrı Merkezi Operasyon Müdürü)', () => {
    const cv = `
Hatice Yükseloğlu
München / Germany | 0532 777 88 143
Çağrı Merkezi Operasyon Müdürü

BERUFSERFAHRUNG
Turkcell Global Bilgi A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
International operational management and scaling.

AUSBILDUNG
Technical University - B.Sc. (2011 - 2015)

KOMPETENZEN
Leadership, Agile, Scrum, CI/CD
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hatice Yükseloğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#145/200]: Zeynep Karacaoğlu (Tedarik Zinciri ve Lojistik Müdürü)', () => {
    const cv = `
Zeynep Karacaoğlu | Bursa / Nilüfer | Tedarik Zinciri ve Lojistik Müdürü

İŞ TECRÜBESİ
Ekol Lojistik A.Ş. | Tedarik Zinciri ve Lojistik Müdürü | 2018 - 2024
Proje yürütme | Performans takibi | Ekip koordinasyonu

AKADEMİK GEÇMİŞ
Uludağ Üniversitesi - Lisans (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Karacaoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#146/200]: Elif Soyluoğlu (İnsan Kaynakları Direktörü)', () => {
    const cv = `
Elif Soyluoğlu
İstanbul / Kadıköy | 0532 999 00 145
İnsan Kaynakları Direktörü

DENEYİM
PwC Danışmanlık A.Ş. - İnsan Kaynakları Direktörü (2018 - 2024)
Bölüm yönetimi, stratejik hedefler ve KPI yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Liderlik, Strateji, Bütçe, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Elif Soyluoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#147/200]: Merve Gündoğanoğlu (Şantiye ve Proje Müdürü)', () => {
    const cv = `
KİŞİSEL BİLGİLER
İsim: Merve Gündoğanoğlu
Lokasyon: Ankara / Çankaya
İletişim: 0533 111 22 146

ÖZGEÇMİŞ ÖZETİ
Şantiye ve Proje Müdürü alanında 10 yılı aşkın deneyim.

İŞ DENEYİMİ
Enka İnşaat Sanayi A.Ş. (2017 - 2024)
Şantiye ve Proje Müdürü
Süreçlerin sevk ve idaresi.

EĞİTİM BİLGİLERİ
ODTÜ - Mühendislik Fakültesi (2010 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Merve Gündoğanoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#148/200]: Büşra Avcıoğlu (Dijital Pazarlama ve Büyüme Müdürü)', () => {
    const cv = `
Büşra Avcıoğlu
İzmir / Bornova
Dijital Pazarlama ve Büyüme Müdürü

YETKİNLİKLER
Yönetim, Planlama, Organizasyon, İletişim

REFERANSLAR
Ali Vural - Genel Müdür

MESLEKİ DENEYİM
Hepsiburada Elektronik A.Ş. - Dijital Pazarlama ve Büyüme Müdürü (2019 - 2024)
Operasyonel mükemmellik ve ekip yönetimi.

EĞİTİM
Ege Üniversitesi - Lisans (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Büşra Avcıoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#149/200]: Gamze Duranoğlu (Üretim ve Fabrika Müdürü)', () => {
    const cv = `
Gamze Duranoğlu
München / Germany | 0532 777 88 148
Üretim ve Fabrika Müdürü

BERUFSERFAHRUNG
Arçelik Üretim A.Ş. - Üretim ve Fabrika Müdürü (2018 - 2024)
International operational management and scaling.

AUSBILDUNG
Technical University - B.Sc. (2011 - 2015)

KOMPETENZEN
Leadership, Agile, Scrum, CI/CD
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Gamze Duranoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#150/200]: Seda Bozkurtoğlu (Otel Genel Müdürü)', () => {
    const cv = `
Seda Bozkurtoğlu | Bursa / Nilüfer | Otel Genel Müdürü

İŞ TECRÜBESİ
Divan Turizm İşletmeleri A.Ş. | Otel Genel Müdürü | 2018 - 2024
Proje yürütme | Performans takibi | Ekip koordinasyonu

AKADEMİK GEÇMİŞ
Uludağ Üniversitesi - Lisans (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Seda Bozkurtoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#151/200]: Ebru Turanoğlu (Hukuk Müşaviri ve Uyum Direktörü)', () => {
    const cv = `
Ebru Turanoğlu
İstanbul / Kadıköy | 0532 999 00 150
Hukuk Müşaviri ve Uyum Direktörü

DENEYİM
Eczacıbaşı Holding A.Ş. - Hukuk Müşaviri ve Uyum Direktörü (2018 - 2024)
Bölüm yönetimi, stratejik hedefler ve KPI yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Liderlik, Strateji, Bütçe, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ebru Turanoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#152/200]: Tuğba Yurttaşoğlu (Siber Güvenlik ve SOC Müdürü)', () => {
    const cv = `
KİŞİSEL BİLGİLER
İsim: Tuğba Yurttaşoğlu
Lokasyon: Ankara / Çankaya
İletişim: 0533 111 22 151

ÖZGEÇMİŞ ÖZETİ
Siber Güvenlik ve SOC Müdürü alanında 10 yılı aşkın deneyim.

İŞ DENEYİMİ
Havelsan Teknoloji A.Ş. (2017 - 2024)
Siber Güvenlik ve SOC Müdürü
Süreçlerin sevk ve idaresi.

EĞİTİM BİLGİLERİ
ODTÜ - Mühendislik Fakültesi (2010 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Tuğba Yurttaşoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#153/200]: Derya Erginoğlu (Yapay Zeka ve Veri Bilimi Lideri)', () => {
    const cv = `
Derya Erginoğlu
İzmir / Bornova
Yapay Zeka ve Veri Bilimi Lideri

YETKİNLİKLER
Yönetim, Planlama, Organizasyon, İletişim

REFERANSLAR
Ali Vural - Genel Müdür

MESLEKİ DENEYİM
Insider Yazılım A.Ş. - Yapay Zeka ve Veri Bilimi Lideri (2019 - 2024)
Operasyonel mükemmellik ve ekip yönetimi.

EĞİTİM
Ege Üniversitesi - Lisans (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Derya Erginoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#154/200]: Selin Yamanoğlu (Aktüerya ve Risk Değerlendirme Müdürü)', () => {
    const cv = `
Selin Yamanoğlu
München / Germany | 0532 777 88 153
Aktüerya ve Risk Değerlendirme Müdürü

BERUFSERFAHRUNG
Anadolu Sigorta A.Ş. - Aktüerya ve Risk Değerlendirme Müdürü (2018 - 2024)
International operational management and scaling.

AUSBILDUNG
Technical University - B.Sc. (2011 - 2015)

KOMPETENZEN
Leadership, Agile, Scrum, CI/CD
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Yamanoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#155/200]: Gizem Dumanoğlu (Başhekim ve Medikal Direktör)', () => {
    const cv = `
Gizem Dumanoğlu | Bursa / Nilüfer | Başhekim ve Medikal Direktör

İŞ TECRÜBESİ
Acıbadem Sağlık Grubu | Başhekim ve Medikal Direktör | 2018 - 2024
Proje yürütme | Performans takibi | Ekip koordinasyonu

AKADEMİK GEÇMİŞ
Uludağ Üniversitesi - Lisans (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Gizem Dumanoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#156/200]: Pınar Göktaşoğlu (E-Ticaret ve Kategori Direktörü)', () => {
    const cv = `
Pınar Göktaşoğlu
İstanbul / Kadıköy | 0532 999 00 155
E-Ticaret ve Kategori Direktörü

DENEYİM
Amazon Türkiye A.Ş. - E-Ticaret ve Kategori Direktörü (2018 - 2024)
Bölüm yönetimi, stratejik hedefler ve KPI yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Liderlik, Strateji, Bütçe, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Pınar Göktaşoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#157/200]: Hande Pekeroğlu (Yalın Üretim ve Sürekli İyileştirme Lideri)', () => {
    const cv = `
KİŞİSEL BİLGİLER
İsim: Hande Pekeroğlu
Lokasyon: Ankara / Çankaya
İletişim: 0533 111 22 156

ÖZGEÇMİŞ ÖZETİ
Yalın Üretim ve Sürekli İyileştirme Lideri alanında 10 yılı aşkın deneyim.

İŞ DENEYİMİ
Bosch Sanayi A.Ş. (2017 - 2024)
Yalın Üretim ve Sürekli İyileştirme Lideri
Süreçlerin sevk ve idaresi.

EĞİTİM BİLGİLERİ
ODTÜ - Mühendislik Fakültesi (2010 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hande Pekeroğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#158/200]: İrem Sancakoğlu (Kurumsal İletişim ve PR Müdürü)', () => {
    const cv = `
İrem Sancakoğlu
İzmir / Bornova
Kurumsal İletişim ve PR Müdürü

YETKİNLİKLER
Yönetim, Planlama, Organizasyon, İletişim

REFERANSLAR
Ali Vural - Genel Müdür

MESLEKİ DENEYİM
Sabancı Holding A.Ş. - Kurumsal İletişim ve PR Müdürü (2019 - 2024)
Operasyonel mükemmellik ve ekip yönetimi.

EĞİTİM
Ege Üniversitesi - Lisans (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('İrem Sancakoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#159/200]: Ceren Şentürkoğlu (Gıda Kalite ve Ar-Ge Müdürü)', () => {
    const cv = `
Ceren Şentürkoğlu
München / Germany | 0532 777 88 158
Gıda Kalite ve Ar-Ge Müdürü

BERUFSERFAHRUNG
Sütaş Süt Ürünleri A.Ş. - Gıda Kalite ve Ar-Ge Müdürü (2018 - 2024)
International operational management and scaling.

AUSBILDUNG
Technical University - B.Sc. (2011 - 2015)

KOMPETENZEN
Leadership, Agile, Scrum, CI/CD
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ceren Şentürkoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#160/200]: Aslı Kandemiroğlu (Enerji Santrali Saha Mühendisi)', () => {
    const cv = `
Aslı Kandemiroğlu | Bursa / Nilüfer | Enerji Santrali Saha Mühendisi

İŞ TECRÜBESİ
Enerjisa Üretim A.Ş. | Enerji Santrali Saha Mühendisi | 2018 - 2024
Proje yürütme | Performans takibi | Ekip koordinasyonu

AKADEMİK GEÇMİŞ
Uludağ Üniversitesi - Lisans (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Aslı Kandemiroğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#161/200]: Duygu Gültekinoğlu (Kıdemli Yazılım Geliştirici)', () => {
    const cv = `
Duygu Gültekinoğlu
İstanbul / Kadıköy | 0532 999 00 160
Kıdemli Yazılım Geliştirici

DENEYİM
Trendyol Teknoloji A.Ş. - Kıdemli Yazılım Geliştirici (2018 - 2024)
Bölüm yönetimi, stratejik hedefler ve KPI yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Liderlik, Strateji, Bütçe, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Duygu Gültekinoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#162/200]: Melis Aktaşoğlu (Bölge Satış Müdürü)', () => {
    const cv = `
KİŞİSEL BİLGİLER
İsim: Melis Aktaşoğlu
Lokasyon: Ankara / Çankaya
İletişim: 0533 111 22 161

ÖZGEÇMİŞ ÖZETİ
Bölge Satış Müdürü alanında 10 yılı aşkın deneyim.

İŞ DENEYİMİ
Unilever Sanayi A.Ş. (2017 - 2024)
Bölge Satış Müdürü
Süreçlerin sevk ve idaresi.

EĞİTİM BİLGİLERİ
ODTÜ - Mühendislik Fakültesi (2010 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Melis Aktaşoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#163/200]: Fulya Ertenoğlu (Mali İşler Direktörü)', () => {
    const cv = `
Fulya Ertenoğlu
İzmir / Bornova
Mali İşler Direktörü

YETKİNLİKLER
Yönetim, Planlama, Organizasyon, İletişim

REFERANSLAR
Ali Vural - Genel Müdür

MESLEKİ DENEYİM
Garanti Bankası A.Ş. - Mali İşler Direktörü (2019 - 2024)
Operasyonel mükemmellik ve ekip yönetimi.

EĞİTİM
Ege Üniversitesi - Lisans (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Fulya Ertenoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#164/200]: Simge Uluoğlu (Çağrı Merkezi Operasyon Müdürü)', () => {
    const cv = `
Simge Uluoğlu
München / Germany | 0532 777 88 163
Çağrı Merkezi Operasyon Müdürü

BERUFSERFAHRUNG
Turkcell Global Bilgi A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
International operational management and scaling.

AUSBILDUNG
Technical University - B.Sc. (2011 - 2015)

KOMPETENZEN
Leadership, Agile, Scrum, CI/CD
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Simge Uluoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#165/200]: Hazal Albayrakoğlu (Tedarik Zinciri ve Lojistik Müdürü)', () => {
    const cv = `
Hazal Albayrakoğlu | Bursa / Nilüfer | Tedarik Zinciri ve Lojistik Müdürü

İŞ TECRÜBESİ
Ekol Lojistik A.Ş. | Tedarik Zinciri ve Lojistik Müdürü | 2018 - 2024
Proje yürütme | Performans takibi | Ekip koordinasyonu

AKADEMİK GEÇMİŞ
Uludağ Üniversitesi - Lisans (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hazal Albayrakoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#166/200]: Ece Güloğlu (İnsan Kaynakları Direktörü)', () => {
    const cv = `
Ece Güloğlu
İstanbul / Kadıköy | 0532 999 00 165
İnsan Kaynakları Direktörü

DENEYİM
PwC Danışmanlık A.Ş. - İnsan Kaynakları Direktörü (2018 - 2024)
Bölüm yönetimi, stratejik hedefler ve KPI yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Liderlik, Strateji, Bütçe, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ece Güloğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#167/200]: Ezgi Bayramoğlu (Şantiye ve Proje Müdürü)', () => {
    const cv = `
KİŞİSEL BİLGİLER
İsim: Ezgi Bayramoğlu
Lokasyon: Ankara / Çankaya
İletişim: 0533 111 22 166

ÖZGEÇMİŞ ÖZETİ
Şantiye ve Proje Müdürü alanında 10 yılı aşkın deneyim.

İŞ DENEYİMİ
Enka İnşaat Sanayi A.Ş. (2017 - 2024)
Şantiye ve Proje Müdürü
Süreçlerin sevk ve idaresi.

EĞİTİM BİLGİLERİ
ODTÜ - Mühendislik Fakültesi (2010 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ezgi Bayramoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#168/200]: Gülşah Ateşoğlu (Dijital Pazarlama ve Büyüme Müdürü)', () => {
    const cv = `
Gülşah Ateşoğlu
İzmir / Bornova
Dijital Pazarlama ve Büyüme Müdürü

YETKİNLİKLER
Yönetim, Planlama, Organizasyon, İletişim

REFERANSLAR
Ali Vural - Genel Müdür

MESLEKİ DENEYİM
Hepsiburada Elektronik A.Ş. - Dijital Pazarlama ve Büyüme Müdürü (2019 - 2024)
Operasyonel mükemmellik ve ekip yönetimi.

EĞİTİM
Ege Üniversitesi - Lisans (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Gülşah Ateşoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#169/200]: Banu Yalınoğlu (Üretim ve Fabrika Müdürü)', () => {
    const cv = `
Banu Yalınoğlu
München / Germany | 0532 777 88 168
Üretim ve Fabrika Müdürü

BERUFSERFAHRUNG
Arçelik Üretim A.Ş. - Üretim ve Fabrika Müdürü (2018 - 2024)
International operational management and scaling.

AUSBILDUNG
Technical University - B.Sc. (2011 - 2015)

KOMPETENZEN
Leadership, Agile, Scrum, CI/CD
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Banu Yalınoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#170/200]: Berna Fidanoğlu (Otel Genel Müdürü)', () => {
    const cv = `
Berna Fidanoğlu | Bursa / Nilüfer | Otel Genel Müdürü

İŞ TECRÜBESİ
Divan Turizm İşletmeleri A.Ş. | Otel Genel Müdürü | 2018 - 2024
Proje yürütme | Performans takibi | Ekip koordinasyonu

AKADEMİK GEÇMİŞ
Uludağ Üniversitesi - Lisans (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Berna Fidanoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#171/200]: Ceyda Güneroğlu (Hukuk Müşaviri ve Uyum Direktörü)', () => {
    const cv = `
Ceyda Güneroğlu
İstanbul / Kadıköy | 0532 999 00 170
Hukuk Müşaviri ve Uyum Direktörü

DENEYİM
Eczacıbaşı Holding A.Ş. - Hukuk Müşaviri ve Uyum Direktörü (2018 - 2024)
Bölüm yönetimi, stratejik hedefler ve KPI yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Liderlik, Strateji, Bütçe, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ceyda Güneroğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#172/200]: Damla Hakanoğlu (Siber Güvenlik ve SOC Müdürü)', () => {
    const cv = `
KİŞİSEL BİLGİLER
İsim: Damla Hakanoğlu
Lokasyon: Ankara / Çankaya
İletişim: 0533 111 22 171

ÖZGEÇMİŞ ÖZETİ
Siber Güvenlik ve SOC Müdürü alanında 10 yılı aşkın deneyim.

İŞ DENEYİMİ
Havelsan Teknoloji A.Ş. (2017 - 2024)
Siber Güvenlik ve SOC Müdürü
Süreçlerin sevk ve idaresi.

EĞİTİM BİLGİLERİ
ODTÜ - Mühendislik Fakültesi (2010 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Damla Hakanoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#173/200]: Dilara Işıkoğlu (Yapay Zeka ve Veri Bilimi Lideri)', () => {
    const cv = `
Dilara Işıkoğlu
İzmir / Bornova
Yapay Zeka ve Veri Bilimi Lideri

YETKİNLİKLER
Yönetim, Planlama, Organizasyon, İletişim

REFERANSLAR
Ali Vural - Genel Müdür

MESLEKİ DENEYİM
Insider Yazılım A.Ş. - Yapay Zeka ve Veri Bilimi Lideri (2019 - 2024)
Operasyonel mükemmellik ve ekip yönetimi.

EĞİTİM
Ege Üniversitesi - Lisans (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Dilara Işıkoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#174/200]: Filiz Jaleoğlu (Aktüerya ve Risk Değerlendirme Müdürü)', () => {
    const cv = `
Filiz Jaleoğlu
München / Germany | 0532 777 88 173
Aktüerya ve Risk Değerlendirme Müdürü

BERUFSERFAHRUNG
Anadolu Sigorta A.Ş. - Aktüerya ve Risk Değerlendirme Müdürü (2018 - 2024)
International operational management and scaling.

AUSBILDUNG
Technical University - B.Sc. (2011 - 2015)

KOMPETENZEN
Leadership, Agile, Scrum, CI/CD
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Filiz Jaleoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#175/200]: Gonca Mutluoğlu (Başhekim ve Medikal Direktör)', () => {
    const cv = `
Gonca Mutluoğlu | Bursa / Nilüfer | Başhekim ve Medikal Direktör

İŞ TECRÜBESİ
Acıbadem Sağlık Grubu | Başhekim ve Medikal Direktör | 2018 - 2024
Proje yürütme | Performans takibi | Ekip koordinasyonu

AKADEMİK GEÇMİŞ
Uludağ Üniversitesi - Lisans (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Gonca Mutluoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#176/200]: Hilal Nalbantoğlu (E-Ticaret ve Kategori Direktörü)', () => {
    const cv = `
Hilal Nalbantoğlu
İstanbul / Kadıköy | 0532 999 00 175
E-Ticaret ve Kategori Direktörü

DENEYİM
Amazon Türkiye A.Ş. - E-Ticaret ve Kategori Direktörü (2018 - 2024)
Bölüm yönetimi, stratejik hedefler ve KPI yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Liderlik, Strateji, Bütçe, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hilal Nalbantoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#177/200]: Işıl Oğuzoğlu (Yalın Üretim ve Sürekli İyileştirme Lideri)', () => {
    const cv = `
KİŞİSEL BİLGİLER
İsim: Işıl Oğuzoğlu
Lokasyon: Ankara / Çankaya
İletişim: 0533 111 22 176

ÖZGEÇMİŞ ÖZETİ
Yalın Üretim ve Sürekli İyileştirme Lideri alanında 10 yılı aşkın deneyim.

İŞ DENEYİMİ
Bosch Sanayi A.Ş. (2017 - 2024)
Yalın Üretim ve Sürekli İyileştirme Lideri
Süreçlerin sevk ve idaresi.

EĞİTİM BİLGİLERİ
ODTÜ - Mühendislik Fakültesi (2010 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Işıl Oğuzoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#178/200]: Jale Soydanoğlu (Kurumsal İletişim ve PR Müdürü)', () => {
    const cv = `
Jale Soydanoğlu
İzmir / Bornova
Kurumsal İletişim ve PR Müdürü

YETKİNLİKLER
Yönetim, Planlama, Organizasyon, İletişim

REFERANSLAR
Ali Vural - Genel Müdür

MESLEKİ DENEYİM
Sabancı Holding A.Ş. - Kurumsal İletişim ve PR Müdürü (2019 - 2024)
Operasyonel mükemmellik ve ekip yönetimi.

EĞİTİM
Ege Üniversitesi - Lisans (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Jale Soydanoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#179/200]: Kübra Sururioğlu (Gıda Kalite ve Ar-Ge Müdürü)', () => {
    const cv = `
Kübra Sururioğlu
München / Germany | 0532 777 88 178
Gıda Kalite ve Ar-Ge Müdürü

BERUFSERFAHRUNG
Sütaş Süt Ürünleri A.Ş. - Gıda Kalite ve Ar-Ge Müdürü (2018 - 2024)
International operational management and scaling.

AUSBILDUNG
Technical University - B.Sc. (2011 - 2015)

KOMPETENZEN
Leadership, Agile, Scrum, CI/CD
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kübra Sururioğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#180/200]: Lale Ormanoğlu (Enerji Santrali Saha Mühendisi)', () => {
    const cv = `
Lale Ormanoğlu | Bursa / Nilüfer | Enerji Santrali Saha Mühendisi

İŞ TECRÜBESİ
Enerjisa Üretim A.Ş. | Enerji Santrali Saha Mühendisi | 2018 - 2024
Proje yürütme | Performans takibi | Ekip koordinasyonu

AKADEMİK GEÇMİŞ
Uludağ Üniversitesi - Lisans (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Lale Ormanoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#181/200]: Mine Usluoğlu (Kıdemli Yazılım Geliştirici)', () => {
    const cv = `
Mine Usluoğlu
İstanbul / Kadıköy | 0532 999 00 180
Kıdemli Yazılım Geliştirici

DENEYİM
Trendyol Teknoloji A.Ş. - Kıdemli Yazılım Geliştirici (2018 - 2024)
Bölüm yönetimi, stratejik hedefler ve KPI yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Liderlik, Strateji, Bütçe, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Mine Usluoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#182/200]: Nazlı Kurtoğluoğlu (Bölge Satış Müdürü)', () => {
    const cv = `
KİŞİSEL BİLGİLER
İsim: Nazlı Kurtoğluoğlu
Lokasyon: Ankara / Çankaya
İletişim: 0533 111 22 181

ÖZGEÇMİŞ ÖZETİ
Bölge Satış Müdürü alanında 10 yılı aşkın deneyim.

İŞ DENEYİMİ
Unilever Sanayi A.Ş. (2017 - 2024)
Bölge Satış Müdürü
Süreçlerin sevk ve idaresi.

EĞİTİM BİLGİLERİ
ODTÜ - Mühendislik Fakültesi (2010 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Nazlı Kurtoğluoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#183/200]: Nihan Demirtaşoğlu (Mali İşler Direktörü)', () => {
    const cv = `
Nihan Demirtaşoğlu
İzmir / Bornova
Mali İşler Direktörü

YETKİNLİKLER
Yönetim, Planlama, Organizasyon, İletişim

REFERANSLAR
Ali Vural - Genel Müdür

MESLEKİ DENEYİM
Garanti Bankası A.Ş. - Mali İşler Direktörü (2019 - 2024)
Operasyonel mükemmellik ve ekip yönetimi.

EĞİTİM
Ege Üniversitesi - Lisans (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Nihan Demirtaşoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#184/200]: Nurten Çelebioğlu (Çağrı Merkezi Operasyon Müdürü)', () => {
    const cv = `
Nurten Çelebioğlu
München / Germany | 0532 777 88 183
Çağrı Merkezi Operasyon Müdürü

BERUFSERFAHRUNG
Turkcell Global Bilgi A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
International operational management and scaling.

AUSBILDUNG
Technical University - B.Sc. (2011 - 2015)

KOMPETENZEN
Leadership, Agile, Scrum, CI/CD
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Nurten Çelebioğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#185/200]: Özge Baştürkoğlu (Tedarik Zinciri ve Lojistik Müdürü)', () => {
    const cv = `
Özge Baştürkoğlu | Bursa / Nilüfer | Tedarik Zinciri ve Lojistik Müdürü

İŞ TECRÜBESİ
Ekol Lojistik A.Ş. | Tedarik Zinciri ve Lojistik Müdürü | 2018 - 2024
Proje yürütme | Performans takibi | Ekip koordinasyonu

AKADEMİK GEÇMİŞ
Uludağ Üniversitesi - Lisans (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Özge Baştürkoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#186/200]: Pelin Özbekoğlu (İnsan Kaynakları Direktörü)', () => {
    const cv = `
Pelin Özbekoğlu
İstanbul / Kadıköy | 0532 999 00 185
İnsan Kaynakları Direktörü

DENEYİM
PwC Danışmanlık A.Ş. - İnsan Kaynakları Direktörü (2018 - 2024)
Bölüm yönetimi, stratejik hedefler ve KPI yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Liderlik, Strateji, Bütçe, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Pelin Özbekoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#187/200]: Rabia Kocamanoğlu (Şantiye ve Proje Müdürü)', () => {
    const cv = `
KİŞİSEL BİLGİLER
İsim: Rabia Kocamanoğlu
Lokasyon: Ankara / Çankaya
İletişim: 0533 111 22 186

ÖZGEÇMİŞ ÖZETİ
Şantiye ve Proje Müdürü alanında 10 yılı aşkın deneyim.

İŞ DENEYİMİ
Enka İnşaat Sanayi A.Ş. (2017 - 2024)
Şantiye ve Proje Müdürü
Süreçlerin sevk ve idaresi.

EĞİTİM BİLGİLERİ
ODTÜ - Mühendislik Fakültesi (2010 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Rabia Kocamanoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#188/200]: Rüya Ertekinoğlu (Dijital Pazarlama ve Büyüme Müdürü)', () => {
    const cv = `
Rüya Ertekinoğlu
İzmir / Bornova
Dijital Pazarlama ve Büyüme Müdürü

YETKİNLİKLER
Yönetim, Planlama, Organizasyon, İletişim

REFERANSLAR
Ali Vural - Genel Müdür

MESLEKİ DENEYİM
Hepsiburada Elektronik A.Ş. - Dijital Pazarlama ve Büyüme Müdürü (2019 - 2024)
Operasyonel mükemmellik ve ekip yönetimi.

EĞİTİM
Ege Üniversitesi - Lisans (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Rüya Ertekinoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#189/200]: Sevim Akpınaroğlu (Üretim ve Fabrika Müdürü)', () => {
    const cv = `
Sevim Akpınaroğlu
München / Germany | 0532 777 88 188
Üretim ve Fabrika Müdürü

BERUFSERFAHRUNG
Arçelik Üretim A.Ş. - Üretim ve Fabrika Müdürü (2018 - 2024)
International operational management and scaling.

AUSBILDUNG
Technical University - B.Sc. (2011 - 2015)

KOMPETENZEN
Leadership, Agile, Scrum, CI/CD
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Sevim Akpınaroğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#190/200]: Sinem Batıloğlu (Otel Genel Müdürü)', () => {
    const cv = `
Sinem Batıloğlu | Bursa / Nilüfer | Otel Genel Müdürü

İŞ TECRÜBESİ
Divan Turizm İşletmeleri A.Ş. | Otel Genel Müdürü | 2018 - 2024
Proje yürütme | Performans takibi | Ekip koordinasyonu

AKADEMİK GEÇMİŞ
Uludağ Üniversitesi - Lisans (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Sinem Batıloğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#191/200]: Şeyma Saylanoğlu (Hukuk Müşaviri ve Uyum Direktörü)', () => {
    const cv = `
Şeyma Saylanoğlu
İstanbul / Kadıköy | 0532 999 00 190
Hukuk Müşaviri ve Uyum Direktörü

DENEYİM
Eczacıbaşı Holding A.Ş. - Hukuk Müşaviri ve Uyum Direktörü (2018 - 2024)
Bölüm yönetimi, stratejik hedefler ve KPI yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Liderlik, Strateji, Bütçe, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Şeyma Saylanoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#192/200]: Tülay Ekşioğlu (Siber Güvenlik ve SOC Müdürü)', () => {
    const cv = `
KİŞİSEL BİLGİLER
İsim: Tülay Ekşioğlu
Lokasyon: Ankara / Çankaya
İletişim: 0533 111 22 191

ÖZGEÇMİŞ ÖZETİ
Siber Güvenlik ve SOC Müdürü alanında 10 yılı aşkın deneyim.

İŞ DENEYİMİ
Havelsan Teknoloji A.Ş. (2017 - 2024)
Siber Güvenlik ve SOC Müdürü
Süreçlerin sevk ve idaresi.

EĞİTİM BİLGİLERİ
ODTÜ - Mühendislik Fakültesi (2010 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Tülay Ekşioğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#193/200]: Ülkü Zamanoğlu (Yapay Zeka ve Veri Bilimi Lideri)', () => {
    const cv = `
Ülkü Zamanoğlu
İzmir / Bornova
Yapay Zeka ve Veri Bilimi Lideri

YETKİNLİKLER
Yönetim, Planlama, Organizasyon, İletişim

REFERANSLAR
Ali Vural - Genel Müdür

MESLEKİ DENEYİM
Insider Yazılım A.Ş. - Yapay Zeka ve Veri Bilimi Lideri (2019 - 2024)
Operasyonel mükemmellik ve ekip yönetimi.

EĞİTİM
Ege Üniversitesi - Lisans (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ülkü Zamanoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#194/200]: Vildan Hürkuşoğlu (Aktüerya ve Risk Değerlendirme Müdürü)', () => {
    const cv = `
Vildan Hürkuşoğlu
München / Germany | 0532 777 88 193
Aktüerya ve Risk Değerlendirme Müdürü

BERUFSERFAHRUNG
Anadolu Sigorta A.Ş. - Aktüerya ve Risk Değerlendirme Müdürü (2018 - 2024)
International operational management and scaling.

AUSBILDUNG
Technical University - B.Sc. (2011 - 2015)

KOMPETENZEN
Leadership, Agile, Scrum, CI/CD
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Vildan Hürkuşoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#195/200]: Yasemin Gürbüzoğlu (Başhekim ve Medikal Direktör)', () => {
    const cv = `
Yasemin Gürbüzoğlu | Bursa / Nilüfer | Başhekim ve Medikal Direktör

İŞ TECRÜBESİ
Acıbadem Sağlık Grubu | Başhekim ve Medikal Direktör | 2018 - 2024
Proje yürütme | Performans takibi | Ekip koordinasyonu

AKADEMİK GEÇMİŞ
Uludağ Üniversitesi - Lisans (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Yasemin Gürbüzoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#196/200]: Zehra Alkanoğlu (E-Ticaret ve Kategori Direktörü)', () => {
    const cv = `
Zehra Alkanoğlu
İstanbul / Kadıköy | 0532 999 00 195
E-Ticaret ve Kategori Direktörü

DENEYİM
Amazon Türkiye A.Ş. - E-Ticaret ve Kategori Direktörü (2018 - 2024)
Bölüm yönetimi, stratejik hedefler ve KPI yönetimi.

EĞİTİM
İstanbul Üniversitesi - İktisat Lisans (2010 - 2014)

YETKİNLİKLER
Liderlik, Strateji, Bütçe, ERP
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zehra Alkanoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#197/200]: Züleyha Tunceroğlu (Yalın Üretim ve Sürekli İyileştirme Lideri)', () => {
    const cv = `
KİŞİSEL BİLGİLER
İsim: Züleyha Tunceroğlu
Lokasyon: Ankara / Çankaya
İletişim: 0533 111 22 196

ÖZGEÇMİŞ ÖZETİ
Yalın Üretim ve Sürekli İyileştirme Lideri alanında 10 yılı aşkın deneyim.

İŞ DENEYİMİ
Bosch Sanayi A.Ş. (2017 - 2024)
Yalın Üretim ve Sürekli İyileştirme Lideri
Süreçlerin sevk ve idaresi.

EĞİTİM BİLGİLERİ
ODTÜ - Mühendislik Fakültesi (2010 - 2015)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Züleyha Tunceroğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#198/200]: Asuman Ormanoğlu (Kurumsal İletişim ve PR Müdürü)', () => {
    const cv = `
Asuman Ormanoğlu
İzmir / Bornova
Kurumsal İletişim ve PR Müdürü

YETKİNLİKLER
Yönetim, Planlama, Organizasyon, İletişim

REFERANSLAR
Ali Vural - Genel Müdür

MESLEKİ DENEYİM
Sabancı Holding A.Ş. - Kurumsal İletişim ve PR Müdürü (2019 - 2024)
Operasyonel mükemmellik ve ekip yönetimi.

EĞİTİM
Ege Üniversitesi - Lisans (2012 - 2016)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Asuman Ormanoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#199/200]: Belgin Usluoğlu (Gıda Kalite ve Ar-Ge Müdürü)', () => {
    const cv = `
Belgin Usluoğlu
München / Germany | 0532 777 88 198
Gıda Kalite ve Ar-Ge Müdürü

BERUFSERFAHRUNG
Sütaş Süt Ürünleri A.Ş. - Gıda Kalite ve Ar-Ge Müdürü (2018 - 2024)
International operational management and scaling.

AUSBILDUNG
Technical University - B.Sc. (2011 - 2015)

KOMPETENZEN
Leadership, Agile, Scrum, CI/CD
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Belgin Usluoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Synthetic Matrix [#200/200]: Berrin Soydanoğlu (Enerji Santrali Saha Mühendisi)', () => {
    const cv = `
Berrin Soydanoğlu | Bursa / Nilüfer | Enerji Santrali Saha Mühendisi

İŞ TECRÜBESİ
Enerjisa Üretim A.Ş. | Enerji Santrali Saha Mühendisi | 2018 - 2024
Proje yürütme | Performans takibi | Ekip koordinasyonu

AKADEMİK GEÇMİŞ
Uludağ Üniversitesi - Lisans (2010 - 2014)
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Berrin Soydanoğlu');
    expect(canonical.fullName).not.toBe('Eğitim');
    expect(canonical.fullName).not.toBe('Deneyim');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.desiredRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });
});
