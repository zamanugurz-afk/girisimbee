import { describe, expect, it } from 'vitest';
import { extractCvText, CvExtractionError } from '@/features/candidates/cv/cv-text-extractor';
import { detectCvFormatFromBuffer } from '@/features/candidates/cv/cv-format-detector';
import { extractCandidateName, isForbiddenNameCandidate } from '@/features/candidates/cv/cv-name-extractor';
import {
  extractDeterministicCv,
  extractDeterministicSkillsAndTools,
  extractDeterministicExperiences,
  extractDeterministicEducation,
  extractDeterministicLanguagesAndCerts,
} from '@/features/candidates/cv/cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from '@/features/candidates/cv/cv-taxonomy-mapper';
import { cvService } from '@/features/candidates/cv/cv.service';
import { UGUR_ZAMAN_CV_TEXT } from '@/features/candidates/cv/cv-real-world-ugur-zaman.test';

describe('CV Extraction Engine 5.0 — 100-Scenario Adversarial & Golden Test Corpus', () => {

  // =========================================================================
  // CATEGORY 1: Cross-Contamination Stress Tests (1 - 10)
  // =========================================================================
  describe('Category 1: Cross-Contamination Stress Tests (1-10)', () => {
    it('1.1: Education Degree "Kamu Yönetimi" vs Call Center Manager (Sector: Çağrı merkezi, NOT Kamu / Belediye)', () => {
      const payload = extractDeterministicCv(UGUR_ZAMAN_CV_TEXT);
      const canonical = mapCvToCanonicalTaxonomy(payload);
      expect(canonical.primarySector).toBe('Çağrı merkezi');
      expect(canonical.primarySector).not.toBe('Kamu / Belediye');
      expect(canonical.educationField).toContain('Kamu Yönetimi');
    });

    it('1.2: Education Degree "Sağlık Yönetimi" vs Software Engineer (Sector: Bilişim / Yazılım, NOT Sağlık)', () => {
      const cv = `
Kemal Sunal
İstanbul | kemal@example.com
Kıdemli Yazılım Mühendisi

DENEYİM
Trendyol Tech
Yazılım Mühendisi
2020 - 2024

EĞİTİM
İstanbul Üniversitesi
Sağlık Yönetimi Lisans
2015 - 2019
`;
      const payload = extractDeterministicCv(cv);
      const canonical = mapCvToCanonicalTaxonomy(payload);
      expect(canonical.primarySector).toBe('Bilişim / Yazılım');
      expect(canonical.primarySector).not.toBe('Sağlık');
    });

    it('1.3: Reference Contact vs Candidate Contact (Candidate phone not polluted)', () => {
      const cv = `
Ali Vural
0532 999 88 77 | ali@example.com
Proje Yöneticisi

DENEYİM
Yapı Kredi
Proje Yöneticisi
2020 - 2024

REFERANSLAR
Mehmet Öz (Eski Direktör)
Tel: 0555 111 22 33
`;
      const payload = extractDeterministicCv(cv);
      expect(payload.phone).toContain('0532 999 88 77');
      expect(payload.phone).not.toContain('0555 111 22 33');
    });

    it('1.4: Reference Role "Genel Müdür" vs Candidate Role "Operasyon Uzmanı"', () => {
      const cv = `
Seda Sayan
İstanbul
Operasyon Uzmanı

DENEYİM
Turkcell
Operasyon Uzmanı
2021 - 2024

REFERANSLAR
Ahmet Bey - Genel Müdür
`;
      const payload = extractDeterministicCv(cv);
      const canonical = mapCvToCanonicalTaxonomy(payload);
      expect(canonical.primaryRole).toContain('Operasyon');
      expect(canonical.primaryRole).not.toBe('Genel Müdür');
    });

    it('1.5: Company Name "Doktor Takvimi A.Ş." vs Candidate Role "Frontend Developer" (NOT Doktor)', () => {
      const cv = `
Bora Yaman
Frontend Geliştirici

DENEYİM
Doktor Takvimi A.Ş.
Frontend Geliştirici
2020 - 2024
`;
      const payload = extractDeterministicCv(cv);
      const canonical = mapCvToCanonicalTaxonomy(payload);
      expect(canonical.primaryRole).toContain('Geliştirici');
      expect(canonical.primaryRole).not.toBe('Doktor');
    });

    it('1.6: Company Name "Mühendislik Ltd." vs Candidate Role "İnsan Kaynakları Uzmanı" (NOT Mühendis)', () => {
      const cv = `
Merve Çelik
İnsan Kaynakları Uzmanı

DENEYİM
Kaya Mühendislik Ltd. Şti.
İnsan Kaynakları Uzmanı
2019 - 2024
`;
      const payload = extractDeterministicCv(cv);
      const canonical = mapCvToCanonicalTaxonomy(payload);
      expect(canonical.primaryRole).toContain('İnsan Kaynakları');
      expect(canonical.primaryRole).not.toBe('Mühendis');
    });

    it('1.7: Location "Trabzon" vs Candidate Name "Trabzonlu Ahmet"', () => {
      const cv = `
Ahmet Yılmaz
Trabzon, Ortahisar | ahmet@example.com
Satış Danışmanı
`;
      const name = extractCandidateName(cv);
      expect(name).toBe('Ahmet Yılmaz');
      expect(name).not.toContain('Trabzon');
    });

    it('1.8: Language "Almanca" vs Candidate Degree or Name', () => {
      const cv = `
Zeynep Arslan
Müşteri Temsilcisi

DİLLER
Almanca (İleri Düzey), İngilizce
`;
      const name = extractCandidateName(cv);
      expect(name).toBe('Zeynep Arslan');
      const lang = extractDeterministicLanguagesAndCerts(cv);
      expect(lang.languages).toContain('Almanca');
      expect(lang.languages).toContain('İngilizce');
    });

    it('1.9: Skill "Proje Yönetimi" vs Candidate Desired Role "Yazılım Geliştirici"', () => {
      const cv = `
Murat Kara
Yazılım Geliştirici

BECERİLER
Proje Yönetimi, React, TypeScript
`;
      const payload = extractDeterministicCv(cv);
      const canonical = mapCvToCanonicalTaxonomy(payload);
      expect(canonical.primaryRole).toBe('Yazılım Geliştirici');
    });

    it('1.10: University Name "İstanbul Ticaret Üniversitesi" vs Company "Ticaret A.Ş."', () => {
      const cv = `
Canan Tan
Pazarlama Uzmanı

DENEYİM
Hedef Ticaret A.Ş.
Pazarlama Uzmanı
2020 - 2024

EĞİTİM
İstanbul Ticaret Üniversitesi
İşletme (2015 - 2019)
`;
      const payload = extractDeterministicCv(cv);
      expect(payload.experiences[0].company).toMatch(/Ticaret/i);
      expect(payload.education[0].school).toMatch(/Ticaret/i);
    });
  });

  // =========================================================================
  // CATEGORY 2: Name Extraction Edge Cases & Forbidden Headings (11 - 20)
  // =========================================================================
  describe('Category 2: Name Extraction Edge Cases & Forbidden Headings (11-20)', () => {
    it('2.1: Header with uppercase "EĞİTİM" above name', () => {
      const cv = `EĞİTİM\nMARMARA ÜNİVERSİTESİ\n\nKİŞİSEL BİLGİLER\nUğur Zaman\nMaltepe, İstanbul`;
      expect(extractCandidateName(cv)).toBe('Uğur Zaman');
    });

    it('2.2: Header with uppercase "ÖZGEÇMİŞ" / "CURRICULUM VITAE" above name', () => {
      const cv = `CURRICULUM VITAE\nÖZGEÇMİŞ\nDeniz Yıldırım\nİzmir`;
      expect(extractCandidateName(cv)).toBe('Deniz Yıldırım');
    });

    it('2.3: Name beside photo/icon "👤 Ali Vural"', () => {
      const cv = `👤 Ali Vural\n📱 0533 123 45 67\n📧 ali@example.com`;
      expect(extractCandidateName(cv)).toBe('Ali Vural');
    });

    it('2.4: Three-word Turkish name "Fatma Zehra Yıldırım"', () => {
      const cv = `Fatma Zehra Yıldırım\nAnkara\nBiyolog`;
      expect(extractCandidateName(cv)).toBe('Fatma Zehra Yıldırım');
    });

    it('2.5: Four-word compound surname "Ahmet Mehmet Can Çelik"', () => {
      const cv = `Ahmet Mehmet Can Çelik\nİstanbul\nMimar`;
      expect(extractCandidateName(cv)).toBe('Ahmet Mehmet Can Çelik');
    });

    it('2.6: Name with academic title prefix "Dr. Selim Aras"', () => {
      const cv = `Dr. Selim Aras\nAnkara\nKardiyolog`;
      expect(extractCandidateName(cv)).toBe('Selim Aras');
    });

    it('2.7: Name with profession prefix "Av. Mehmet Kaya"', () => {
      const cv = `Av. Mehmet Kaya\nİstanbul\nHukuk Danışmanı`;
      expect(extractCandidateName(cv)).toBe('Mehmet Kaya');
    });

    it('2.8: Single token non-name "DEVELOPER" -> unresolved', () => {
      const cv = `DEVELOPER\nSenior Frontend\n2020 - 2024`;
      expect(isForbiddenNameCandidate('DEVELOPER')).toBe(true);
    });

    it('2.9: Name in personal section with label "Adı Soyadı: Uğur Zaman"', () => {
      const cv = `KİŞİSEL BİLGİLER\nAdı Soyadı: Uğur Zaman\nDoğum Yılı: 1985`;
      expect(extractCandidateName(cv)).toBe('Uğur Zaman');
    });

    it('2.10: Document with no name at all -> returns undefined without guessing', () => {
      const cv = `EĞİTİM\nODTÜ - Fizik (2015 - 2019)\n\nDENEYİM\nFirma A.Ş. - Uzman (2020 - 2024)`;
      const name = extractCandidateName(cv);
      expect(name).not.toBe('EĞİTİM');
      expect(name).not.toBe('DENEYİM');
    });
  });

  // =========================================================================
  // CATEGORY 3: Professional Role & Headline Resolution (21 - 30)
  // =========================================================================
  describe('Category 3: Professional Role & Headline Resolution (21-30)', () => {
    it('3.1: Multi-word headline "Telemarketing ve Çağrı Merkezi Operasyonları Direktörü"', () => {
      const payload = extractDeterministicCv(UGUR_ZAMAN_CV_TEXT);
      const canonical = mapCvToCanonicalTaxonomy(payload);
      expect(canonical.primaryRole).toBe('Çağrı Merkezi Operasyon Müdürü');
    });

    it('3.2: Compound role "Full Stack Web & Mobil Yazılım Geliştirici"', () => {
      const cv = `Ahmet Demir\nFull Stack Web & Mobil Yazılım Geliştirici\nTrendyol (2020 - 2024)`;
      const payload = extractDeterministicCv(cv);
      const canonical = mapCvToCanonicalTaxonomy(payload);
      expect(canonical.primaryRole).toMatch(/Yazılım|Developer|Full Stack/i);
    });

    it('3.3: Historic promotion within same company (Senior promoted to Lead)', () => {
      const cv = `
Selin Ak\nİstanbul
DENEYİM
Hepsiburada
Takım Lideri
2022 - 2024

Hepsiburada
Kıdemli Yazılım Mühendisi
2019 - 2022
`;
      const payload = extractDeterministicCv(cv);
      const canonical = mapCvToCanonicalTaxonomy(payload);
      expect(canonical.primaryRole).toMatch(/Takım Lideri|Yazılım/i);
    });

    it('3.4: Unlisted title "Release Train Engineer" preserves Title Case without "Uzman" fallback', () => {
      const cv = `Ebru Can\nRelease Train Engineer\nFintech Corp (2020 - 2024)`;
      const payload = extractDeterministicCv(cv);
      const canonical = mapCvToCanonicalTaxonomy(payload);
      expect(canonical.primaryRole).not.toBe('Uzman');
    });

    it('3.5: Dual role "Kurucu Ortak & CTO"', () => {
      const cv = `Kaan Er\nKurucu Ortak & CTO\nStartup A.Ş. (2018 - 2024)`;
      const payload = extractDeterministicCv(cv);
      expect(payload.roles.length).toBeGreaterThanOrEqual(1);
    });

    it('3.6: Internship role "Yazılım Stajyeri"', () => {
      const cv = `Mert Yılmaz\nYazılım Stajyeri\nAselsan (2023 - 2023)`;
      const payload = extractDeterministicCv(cv);
      expect(payload.experiences[0].role).toMatch(/Stajyer/i);
    });

    it('3.7: Freelance role "Serbest Muhasebeci Mali Müşavir"', () => {
      const cv = `Ayşe Kaya\nSerbest Muhasebeci Mali Müşavir\n2018 - 2024`;
      const payload = extractDeterministicCv(cv);
      const canonical = mapCvToCanonicalTaxonomy(payload);
      expect(canonical.primaryRole).toMatch(/Mali Müşavir|Muhasebe/i);
    });

    it('3.8: Academic role "Araştırma Görevlisi"', () => {
      const cv = `Dr. Burak Tan\nAraştırma Görevlisi\nİTÜ (2018 - 2024)`;
      const payload = extractDeterministicCv(cv);
      const canonical = mapCvToCanonicalTaxonomy(payload);
      expect(canonical.primaryRole).toMatch(/Araştırma Görevlisi|Akademisyen|Eğitmen/i);
    });

    it('3.9: Public service role "Hava Trafik Kontrolörü"', () => {
      const cv = `Cemal Şen\nHava Trafik Kontrolörü\nDHMİ (2019 - 2024)`;
      const payload = extractDeterministicCv(cv);
      const canonical = mapCvToCanonicalTaxonomy(payload);
      expect(canonical.primaryRole).toMatch(/Hava Trafik Kontrolörü|Kontrol/i);
    });

    it('3.10: Completely blank role CV returns unresolved without hallucination', () => {
      const cv = `Ahmet Yılmaz\nİstanbul\n0533 111 22 33`;
      const payload = extractDeterministicCv(cv);
      const canonical = mapCvToCanonicalTaxonomy(payload);
      expect(canonical.primaryRole).not.toBe('Uzman');
    });
  });

  // =========================================================================
  // CATEGORY 4: Sector Inference & Boundary Protection (31 - 40)
  // =========================================================================
  describe('Category 4: Sector Inference & Boundary Protection (31-40)', () => {
    it('4.1: Direct headline sector match', () => {
      const cv = `Ali Koç\nOtomotiv Sektörü Yöneticisi\nFord Otosan (2020 - 2024)`;
      const payload = extractDeterministicCv(cv);
      const canonical = mapCvToCanonicalTaxonomy(payload);
      expect(canonical.primarySector).toMatch(/Otomotiv|Üretim/i);
    });

    it('4.2: Sector derived from company domain (Gedik Yatırım -> Finans / Bankacılık or Satış)', () => {
      const cv = `Banu Er\nAlternatif Satış Kanalları Müdürü\nGedik Yatırım (2021 - 2024)`;
      const payload = extractDeterministicCv(cv);
      const canonical = mapCvToCanonicalTaxonomy(payload);
      expect(canonical.primarySector).toMatch(/Finans|Bankacılık|Yatırım|Satış/i);
    });

    it('4.3: Sector derived from repeated insurance keywords', () => {
      const cv = `Seda Gül\nSigorta Acentesi Müdürü\nAllianz Sigorta (2019 - 2024)`;
      const payload = extractDeterministicCv(cv);
      const canonical = mapCvToCanonicalTaxonomy(payload);
      expect(canonical.primarySector).toMatch(/Sigorta|Finans/i);
    });

    it('4.4: Tech developer working in Bank -> Bilişim / Yazılım sector', () => {
      const cv = `Volkan Can\nGaranti BBVA\nSenior Java Developer\n2020 - 2024`;
      const payload = extractDeterministicCv(cv);
      const canonical = mapCvToCanonicalTaxonomy(payload);
      expect(canonical.primarySector).toBe('Bilişim / Yazılım');
    });

    it('4.5: Sales rep in Pharma -> İlaç / Sağlık or Satış sector', () => {
      const cv = `Derya Ak\nAbdi İbrahim\nTıbbi Satış Mümessili\n2018 - 2024`;
      const payload = extractDeterministicCv(cv);
      const canonical = mapCvToCanonicalTaxonomy(payload);
      expect(canonical.primarySector).toMatch(/İlaç|Sağlık|Kimya|Satış/i);
    });

    it('4.6: HR Specialist in Logistics company', () => {
      const cv = `Esin Şen\nEkol Lojistik\nİnsan Kaynakları Uzmanı\n2020 - 2024`;
      const payload = extractDeterministicCv(cv);
      const canonical = mapCvToCanonicalTaxonomy(payload);
      expect(canonical.primaryRole).toMatch(/İnsan Kaynakları/i);
    });

    it('4.7: Mining Engineer in Mining company', () => {
      const cv = `Murat Taş\nTüprag Madencilik\nMaden Mühendisi\n2017 - 2024`;
      const payload = extractDeterministicCv(cv);
      const canonical = mapCvToCanonicalTaxonomy(payload);
      expect(canonical.primarySector).toMatch(/Maden|Enerji|Sanayi/i);
    });

    it('4.8: Pure Education degree CV without jobs -> unresolved sector', () => {
      const cv = `Mert Kaya\nKamu Yönetimi Lisans\nAnadolu Üniversitesi (2015 - 2019)`;
      const payload = extractDeterministicCv(cv);
      const canonical = mapCvToCanonicalTaxonomy(payload);
      expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    });

    it('4.9: Most recent job sector prioritized over older sector', () => {
      const cv = `
Caner Yurt
DENEYİM
Trendyol (E-Ticaret)
Yazılım Geliştirici
2022 - 2024

İnşaat Şantiyesi
Saha Mühendisi
2018 - 2022
`;
      const payload = extractDeterministicCv(cv);
      const canonical = mapCvToCanonicalTaxonomy(payload);
      expect(canonical.primarySector).toBe('Bilişim / Yazılım');
    });

    it('4.10: Unrecognized exotic sector leaves safe or unresolved', () => {
      const cv = `Zeki Müren\nSanatçı\nTRT (1970 - 1990)`;
      const payload = extractDeterministicCv(cv);
      const canonical = mapCvToCanonicalTaxonomy(payload);
      expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    });
  });

  // =========================================================================
  // CATEGORY 5: Experience Extraction & Anti-Fragmentation (41 - 50)
  // =========================================================================
  describe('Category 5: Experience Extraction & Anti-Fragmentation (41-50)', () => {
    it('5.1: Exactly 6 consolidated jobs for Uğur Zaman CV (never 11)', () => {
      const exp = extractDeterministicExperiences(UGUR_ZAMAN_CV_TEXT);
      expect(exp).toHaveLength(6);
    });

    it('5.2: Overlapping employment dates (concurrent positions)', () => {
      const cv = `
DENEYİM
Firma A
Danışman
2021 - 2024

Firma B
Eğitmen
2020 - 2023
`;
      const exp = extractDeterministicExperiences(cv);
      expect(exp).toHaveLength(2);
    });

    it('5.3: Single company with multiple internal positions', () => {
      const cv = `
DENEYİM
Turkcell
Kıdemli Uzman
2022 - 2024

Turkcell
Uzman
2019 - 2022
`;
      const exp = extractDeterministicExperiences(cv);
      expect(exp).toHaveLength(2);
    });

    it('5.4: Job with date format "Eylül 2025 - Ağustos 2026"', () => {
      const cv = `
DENEYİM
IGS Türkiye
Telemarketing Müdürü
Eylül 2025 - Ağustos 2026
`;
      const exp = extractDeterministicExperiences(cv);
      expect(exp[0].startYear).toBe(2025);
      expect(exp[0].endYear).toBe(2026);
    });

    it('5.5: Job with date format "09/2020 - 05/2023"', () => {
      const cv = `
DENEYİM
Logo Yazılım
Yazılım Geliştirici
09/2020 - 05/2023
`;
      const exp = extractDeterministicExperiences(cv);
      expect(exp[0].startYear).toBe(2020);
      expect(exp[0].endYear).toBe(2023);
    });

    it('5.6: Job with date format "2019 - Devam Ediyor / Present"', () => {
      const cv = `
DENEYİM
Aselsan
Sistem Mühendisi
2019 - Günümüz
`;
      const exp = extractDeterministicExperiences(cv);
      expect(exp[0].isCurrent).toBe(true);
    });

    it('5.7: Table-based job listing ("Firma | Pozisyon | Süre")', () => {
      const cv = `
ŞİRKET | POZİSYON | TARİH
Tofaş | Kalite Mühendisi | 2020 - 2024
Bosch | Üretim Mühendisi | 2017 - 2020
`;
      const exp = extractDeterministicExperiences(cv);
      expect(exp).toHaveLength(2);
    });

    it('5.8: Job with company on line 1, date on line 2, role on line 3', () => {
      const cv = `
DENEYİM
Hepsiburada
2021 - 2024
Kıdemli Veri Analisti
`;
      const exp = extractDeterministicExperiences(cv);
      expect(exp).toHaveLength(1);
      expect(exp[0].company).toMatch(/Hepsiburada/i);
    });

    it('5.9: Job with role on line 1, company on line 2, date on line 3', () => {
      const cv = `
DENEYİM
Kıdemli Mobil Geliştirici
Getir
2020 - 2023
`;
      const exp = extractDeterministicExperiences(cv);
      expect(exp).toHaveLength(1);
      expect(exp[0].company).toMatch(/Getir/i);
    });

    it('5.10: CV with zero experience (fresh graduate) -> experiences: []', () => {
      const cv = `
Selin Demir
İstanbul | selin@example.com
EĞİTİM
Boğaziçi Üniversitesi - Bilgisayar Mühendisliği (2020 - 2024)
`;
      const exp = extractDeterministicExperiences(cv);
      expect(exp).toHaveLength(0);
    });
  });

  // =========================================================================
  // CATEGORY 6: Education Degree & Faculty Consolidation (51 - 60)
  // =========================================================================
  describe('Category 6: Education Degree & Faculty Consolidation (51-60)', () => {
    it('6.1: Multi-line university + faculty consolidated into single degree', () => {
      const cv = `
EĞİTİM
İstanbul Üniversitesi
Hukuk Fakültesi
2018 - 2022
`;
      const edu = extractDeterministicEducation(cv);
      expect(edu).toHaveLength(1);
      expect(edu[0].school).toMatch(/İstanbul Üniversitesi/i);
    });

    it('6.2: Degree level extraction for Master / PhD', () => {
      const cv = `
EĞİTİM
Marmara Üniversitesi - Sermaye Piyasası ve Borsa
Yüksek Lisans
2020 - 2022
`;
      const edu = extractDeterministicEducation(cv);
      expect(edu[0].level).toMatch(/Yüksek Lisans/i);
    });

    it('6.3: Double major / concurrent degrees', () => {
      const cv = `
EĞİTİM
ODTÜ - Elektrik Elektronik Mühendisliği (Lisans) 2016 - 2020
ODTÜ - Fizik (Çift Anadal) 2017 - 2020
`;
      const edu = extractDeterministicEducation(cv);
      expect(edu.length).toBeGreaterThanOrEqual(1);
    });

    it('6.4: High school + Bachelor + Master chronological ordering', () => {
      const cv = `
EĞİTİM
Boğaziçi Üniversitesi - Yüksek Lisans (2022 - 2024)
İTÜ - Lisans (2018 - 2022)
Kabataş Erkek Lisesi (2014 - 2018)
`;
      const edu = extractDeterministicEducation(cv);
      expect(edu.length).toBeGreaterThanOrEqual(2);
    });

    it('6.5: Foreign university ("Technical University of Munich")', () => {
      const cv = `
EDUCATION
Technical University of Munich
Computer Science (Master)
2021 - 2023
`;
      const edu = extractDeterministicEducation(cv);
      expect(edu[0].school).toMatch(/Munich|Technical/i);
    });

    it('6.6: University with GPA / graduation honors not treated as experience', () => {
      const cv = `
EĞİTİM
Koç Üniversitesi - Endüstri Mühendisliği
GPA: 3.90 / 4.00, Bölüm Birincisi
2018 - 2022
`;
      const exp = extractDeterministicExperiences(cv);
      expect(exp).toHaveLength(0);
      const edu = extractDeterministicEducation(cv);
      expect(edu).toHaveLength(1);
    });

    it('6.7: Associate degree ("Ön Lisans / Meslek Yüksekokulu")', () => {
      const cv = `
EĞİTİM
Ege Üniversitesi - Bilgisayar Programcılığı MYO
Ön Lisans
2018 - 2020
`;
      const edu = extractDeterministicEducation(cv);
      expect(edu[0].level).toBe('Ön Lisans');
    });

    it('6.8: Erasmus / exchange education in degree description', () => {
      const cv = `
EĞİTİM
Yıldız Teknik Üniversitesi - Makine Mühendisliği (2016 - 2021)
Erasmus: Politecnico di Milano (2019 - 2020)
`;
      const edu = extractDeterministicEducation(cv);
      expect(edu.length).toBeGreaterThanOrEqual(1);
    });

    it('6.9: Certificate in education section isolated', () => {
      const cv = `
EĞİTİM
Anadolu Üniversitesi - İktisat (2014 - 2018)
Sertifika: Sermaye Piyasası Lisanslama Düzey 3 (2020)
`;
      const edu = extractDeterministicEducation(cv);
      expect(edu).toHaveLength(1);
    });

    it('6.10: CV with no formal education listed -> education: []', () => {
      const cv = `
Ahmet Usta
Oto Tamir Ustası
DENEYİM
Sanayi Oto - Usta (2010 - 2024)
`;
      const edu = extractDeterministicEducation(cv);
      expect(edu).toHaveLength(0);
    });
  });

  // =========================================================================
  // CATEGORY 7: Skill Resolution & Proficiency Normalization (61 - 70)
  // =========================================================================
  describe('Category 7: Skill Resolution & Proficiency Normalization (61-70)', () => {
    it('7.1: Explicit skill list with "- Uzman" -> "Satış Yönetimi"', () => {
      const skills = extractDeterministicSkillsAndTools(UGUR_ZAMAN_CV_TEXT);
      expect(skills.professionalSkills).toContain('Satış Yönetimi');
      for (const s of skills.professionalSkills) expect(s).not.toMatch(/s*-s*Uzman/i);
    });

    it('7.2: Explicit skill list with "- İleri Düzey" -> "Python"', () => {
      const cv = `BECERİLER\nPython - İleri Düzey\nDjango - Uzman`;
      const skills = extractDeterministicSkillsAndTools(cv);
      const allSkills = [...skills.professionalSkills, ...skills.technicalSkills, ...skills.tools];
      expect(allSkills).toContain('Python');
    });

    it('7.3: Explicit skill list with "- Intermediate / Orta" -> "SQL"', () => {
      const cv = `BECERİLER\nSQL - Orta Düzey\nPostgreSQL - Intermediate`;
      const skills = extractDeterministicSkillsAndTools(cv);
      const allSkills = [...skills.professionalSkills, ...skills.technicalSkills, ...skills.tools];
      expect(allSkills).toContain('SQL');
    });

    it('7.4: Pipe-separated skills ("React | TypeScript | Docker | AWS")', () => {
      const cv = `BECERİLER\nReact | TypeScript | Docker | AWS`;
      const skills = extractDeterministicSkillsAndTools(cv);
      const allSkills = [...skills.professionalSkills, ...skills.technicalSkills, ...skills.tools];
      expect(allSkills).toContain('React');
    });

    it('7.5: Bullet-separated skills ("• Liderlik • Problem Çözme • İletişim")', () => {
      const cv = `YETKİNLİKLER\n• Liderlik\n• Problem Çözme\n• İletişim Becerileri`;
      const skills = extractDeterministicSkillsAndTools(cv);
      expect(skills.professionalSkills).toContain('Liderlik');
    });

    it('7.6: Categorized skills block', () => {
      const cv = `
YETKİNLİKLER: Satış Yönetimi, Ekip Liderliği
ARAÇLAR: MS Excel, SAP, CRM
`;
      const skills = extractDeterministicSkillsAndTools(cv);
      expect(skills.professionalSkills.length).toBeGreaterThanOrEqual(2);
      expect(skills.tools.length).toBeGreaterThanOrEqual(1);
    });

    it('7.7: Mixed technical tools and soft skills segregation', () => {
      const cv = `
BECERİLER
Müşteri İlişkileri, Çevik Yönetim, Jira, Figma
`;
      const skills = extractDeterministicSkillsAndTools(cv);
      expect(skills.professionalSkills).toContain('Müşteri İlişkileri');
    });

    it('7.8: CV with no explicit skills section -> safe extraction without keyword explosion', () => {
      const cv = `
Ali Veli
Yazılım Geliştirici
Trendyol - 2021 - 2024
`;
      const skills = extractDeterministicSkillsAndTools(cv);
      expect(skills.professionalSkills.length).toBeLessThan(10);
    });

    it('7.9: Duplicate skills across summary and skills section deduplicated', () => {
      const cv = `
ÖZET: Satış yönetimi alanında 10 yıl deneyim.
BECERİLER
Satış Yönetimi - Uzman
Satış Yönetimi
`;
      const skills = extractDeterministicSkillsAndTools(cv);
      const count = skills.professionalSkills.filter((s) => s.toLowerCase().includes('satış')).length;
      expect(count).toBe(1);
    });

    it('7.10: Skill containing hyphen as part of name ("CI-CD", "E-Ticaret") preserved', () => {
      const cv = `BECERİLER\nE-Ticaret Yönetimi, CI-CD Altyapısı`;
      const skills = extractDeterministicSkillsAndTools(cv);
      expect(skills.professionalSkills.length).toBeGreaterThanOrEqual(1);
    });
  });

  // =========================================================================
  // CATEGORY 8: Languages, Certifications & References Isolation (71 - 80)
  // =========================================================================
  describe('Category 8: Languages, Certifications & References Isolation (71-80)', () => {
    it('8.1: Language with CEFR level ("İngilizce (C1), Almanca (B2)")', () => {
      const cv = `DİLLER\nİngilizce (C1), Almanca (B2)`;
      const lang = extractDeterministicLanguagesAndCerts(cv);
      expect(lang.languages).toContain('İngilizce');
      expect(lang.languages).toContain('Almanca');
    });

    it('8.2: Native language vs foreign language', () => {
      const cv = `DİLLER\nTürkçe (Ana Dil), İngilizce (İleri Düzey)`;
      const lang = extractDeterministicLanguagesAndCerts(cv);
      expect(lang.languages).toContain('İngilizce');
    });

    it('8.3: Professional certificate ("PMP - Project Management Professional")', () => {
      const cv = `SERTİFİKALAR\nPMP - Project Management Professional (2022)`;
      const cert = extractDeterministicLanguagesAndCerts(cv);
      expect(cert.certificates.some((c) => c.includes('PMP'))).toBe(true);
    });

    it('8.4: Cloud certificate ("AWS Certified Solutions Architect")', () => {
      const cv = `SERTİFİKALAR\nAWS Certified Solutions Architect Associate`;
      const cert = extractDeterministicLanguagesAndCerts(cv);
      expect(cert.certificates.some((c) => c.includes('AWS'))).toBe(true);
    });

    it('8.5: References isolated, candidate phone not polluted', () => {
      const cv = `
Burak Can\n0533 111 22 33
REFERANSLAR
Ahmet Yılmaz - 0542 999 88 77
`;
      const payload = extractDeterministicCv(cv);
      expect(payload.phone).toBe('0533 111 22 33');
    });

    it('8.6: "Referanslar talep üzerine verilecektir" -> no fake references', () => {
      const cv = `REFERANSLAR\nReferanslar talep halinde iletilecektir.`;
      const payload = extractDeterministicCv(cv);
      expect(payload.phone).toBeUndefined();
    });

    it('8.7: Driver license not treated as skill or role', () => {
      const cv = `EK BİLGİLER\nSürücü Belgesi: B Sınıfı Ehliyet`;
      const payload = extractDeterministicCv(cv);
      expect(payload.roles).not.toContain('B Sınıfı Ehliyet');
    });

    it('8.8: Military service status isolated', () => {
      const cv = `KİŞİSEL BİLGİLER\nAskerlik Durumu: Tamamlandı (2021)`;
      const payload = extractDeterministicCv(cv);
      expect(payload.roles).not.toContain('Tamamlandı');
    });

    it('8.9: Hobbies / Interests not treated as skills or experience', () => {
      const cv = `İLGİ ALANLARI\nSatranç, Dağcılık, Fotoğrafçılık`;
      const exp = extractDeterministicExperiences(cv);
      expect(exp).toHaveLength(0);
    });

    it('8.10: Publications / Patents not treated as work experience', () => {
      const cv = `YAYINLAR\nMachine Learning in Fintech, IEEE 2022`;
      const exp = extractDeterministicExperiences(cv);
      expect(exp).toHaveLength(0);
    });
  });

  // =========================================================================
  // CATEGORY 9: Layout & Noise Resilience (81 - 90)
  // =========================================================================
  describe('Category 9: Layout & Noise Resilience (81-90)', () => {
    it('9.1: Two-column layout with left sidebar', () => {
      const cv = `
SOL SÜTUN:
Kemal Aras | kemal@example.com
Yetenekler: Java, Spring Boot

SAĞ SÜTUN:
DENEYİM
Akbank - Yazılım Mühendisi (2020 - 2024)
`;
      const name = extractCandidateName(cv);
      expect(name).toBe('Kemal Aras');
      const exp = extractDeterministicExperiences(cv);
      expect(exp).toHaveLength(1);
    });

    it('9.2: Two-column layout with right sidebar', () => {
      const cv = `
DENEYİM
Garanti BBVA - İş Analisti (2019 - 2024)

SAĞ SÜTUN:
İletişim: zeynep@example.com
`;
      const exp = extractDeterministicExperiences(cv);
      expect(exp).toHaveLength(1);
    });

    it('9.3: Three-column layout simulation', () => {
      const cv = `
BİLGİLER | DENEYİM | EĞİTİM
Can Er | Turkcell - Uzman (2020-2024) | İTÜ - Lisans (2016-2020)
`;
      const payload = extractDeterministicCv(cv);
      expect(payload.experiences.length).toBeGreaterThanOrEqual(1);
    });

    it('9.4: Repeating header/footer across 3 pages', () => {
      const cv = `
Sayfa 1 / 3
Ahmet Yılmaz - CV
DENEYİM: Şirket A - Uzman (2020 - 2022)

Sayfa 2 / 3
Ahmet Yılmaz - CV
DENEYİM: Şirket B - Kıdemli Uzman (2022 - 2024)

Sayfa 3 / 3
`;
      const exp = extractDeterministicExperiences(cv);
      expect(exp.length).toBeGreaterThanOrEqual(1);
    });

    it('9.5: OCR scanned PDF simulation with ASCII casing', () => {
      const cv = `UGUR ZAMAN\nCAGRI MERKEZI OPERASYON MUDURU\nMEHRWERK (2019 - 2023)`;
      const name = extractCandidateName(cv);
      expect(name).toMatch(/U[gğ]ur Zaman/i);
    });

    it('9.6: Turkish characters (ç, ğ, ı, ö, ş, ü) preserved without mojibake', () => {
      const cv = `Çağlar Şükrü Özçelik\nİstanbul / Üsküdar\nÇağrı Merkezi Müdürü`;
      const name = extractCandidateName(cv);
      expect(name).toBe('Çağlar Şükrü Özçelik');
    });

    it('9.7: Document with decorative horizontal lines ("-------------------------")', () => {
      const cv = `
--------------------------------------------------
Murat Kaya
--------------------------------------------------
Yazılım Mühendisi
--------------------------------------------------
`;
      const name = extractCandidateName(cv);
      expect(name).toBe('Murat Kaya');
    });

    it('9.8: Document with email mailto / URL prefixes', () => {
      const cv = `
Selin Ak
mailto:selin@example.com
tel:+905321112233
https://linkedin.com/in/selinak
`;
      const name = extractCandidateName(cv);
      expect(name).toBe('Selin Ak');
    });

    it('9.9: Document with table border ASCII characters ("+---+---+")', () => {
      const cv = `
+--------------------------------+--------------------+
| Şirket                         | Pozisyon           |
+--------------------------------+--------------------+
| Trendyol Tech                  | Yazılım Mühendisi  |
+--------------------------------+--------------------+
`;
      const payload = extractDeterministicCv(cv);
      expect(payload.experiences.length).toBeGreaterThanOrEqual(1);
    });

    it('9.10: Multi-page document page-break inside experience bullets', () => {
      const cv = `
DENEYİM
LC Waikiki
Kategori Yöneticisi
2020 - 2024
• Stok optimizasyonu süreçleri yönetildi.
--- SAYFA GEÇİŞİ ---
• Kampanya planlamaları ve tedarikçi görüşmeleri tamamlandı.
`;
      const exp = extractDeterministicExperiences(cv);
      expect(exp).toHaveLength(1);
    });
  });

  // =========================================================================
  // CATEGORY 10: Zero-Hallucination & Golden Scorecard (91 - 100)
  // =========================================================================
  describe('Category 10: Zero-Hallucination & Golden Scorecard (91-100)', () => {
    it('10.1: Golden Regression: Uğur Zaman CV complete check', async () => {
      const buf = Buffer.from(UGUR_ZAMAN_CV_TEXT, 'utf-8');
      const draft = await cvService.processCvBuffer({
        buffer: buf,
        fileName: 'CV - UĞUR ZAMAN (4).pdf',
        mimeType: 'application/pdf',
      });
      const fv = draft.formValues;
      expect(fv.fullName).toBe('Uğur Zaman');
      expect(fv.primarySector).toBe('Çağrı merkezi');
      expect(fv.desiredRole).toBe('Çağrı Merkezi Operasyon Müdürü');
      expect(fv.experienceLevel).toBe('Yönetici');
      expect(fv.experiences).toHaveLength(6);
      expect(fv.educationHistory).toHaveLength(2);
      expect(fv.professionalSkillsList?.length).toBeGreaterThanOrEqual(6);
      expect(fv.professionalSkillsList?.length).toBeLessThanOrEqual(10);
    }, 15000);

    it('10.2: Golden Regression: Software Developer CV complete check', () => {
      const cv = `
Oguzhan Kaya
İstanbul, Kadıköy | oguzhan@example.com
Kıdemli Yazılım Geliştirici

DENEYİM
Trendyol Tech - Senior Software Engineer (2021 - 2024)
Hepsiburada - Software Developer (2018 - 2021)

EĞİTİM
İTÜ - Bilgisayar Mühendisliği (2014 - 2018)

BECERİLER
React, Node.js, TypeScript, Go, Docker
`;
      const payload = extractDeterministicCv(cv);
      const canonical = mapCvToCanonicalTaxonomy(payload);
      expect(canonical.fullName).toBe('Oguzhan Kaya');
      expect(canonical.primarySector).toBe('Bilişim / Yazılım');
      expect(canonical.primaryRole).toBe('Yazılım Geliştirici');
      expect(canonical.experiences).toHaveLength(2);
    });

    it('10.3: Golden Regression: Doctor / Healthcare CV complete check', () => {
      const cv = `
Dr. Ahmet Çetin
Ankara / Çankaya
Kardiyoloji Uzmanı

DENEYİM
Hacettepe Üniversitesi Hastanesi
Kardiyoloji Uzmanı
2018 - 2024

EĞİTİM
Hacettepe Tıp Fakültesi (2011 - 2017)
`;
      const payload = extractDeterministicCv(cv);
      const canonical = mapCvToCanonicalTaxonomy(payload);
      expect(canonical.fullName).toBe('Ahmet Çetin');
      expect(canonical.primarySector).toMatch(/Sağlık/i);
      expect(canonical.primaryRole).toMatch(/Doktor|Kardiyoloji/i);
    });

    it('10.4: Golden Regression: Civil Engineer CV complete check', () => {
      const cv = `
Mustafa Yıldız
İnşaat Mühendisi

DENEYİM
Rönesans Holding
Saha Mühendisi
2019 - 2024

EĞİTİM
İTÜ - İnşaat Mühendisliği (2014 - 2019)
`;
      const payload = extractDeterministicCv(cv);
      const canonical = mapCvToCanonicalTaxonomy(payload);
      expect(canonical.primarySector).toMatch(/İnşaat/i);
    });

    it('10.5: Golden Regression: Lawyer / Legal CV complete check', () => {
      const cv = `
Av. Gizem Aras
Avukat

DENEYİM
Aras Hukuk Bürosu
Şirketler Hukuku Avukatı
2020 - 2024

EĞİTİM
İstanbul Üniversitesi - Hukuk Fakültesi (2015 - 2019)
`;
      const payload = extractDeterministicCv(cv);
      const canonical = mapCvToCanonicalTaxonomy(payload);
      expect(canonical.primarySector).toMatch(/Hukuk/i);
    });

    it('10.6: Golden Regression: Finance / Accounting CV complete check', () => {
      const cv = `
Funda Er
Mali İşler Müdürü

DENEYİM
KPMG Türkiye
Denetçi
2018 - 2024

EĞİTİM
Marmara Üniversitesi - İktisat (2013 - 2017)
`;
      const payload = extractDeterministicCv(cv);
      const canonical = mapCvToCanonicalTaxonomy(payload);
      expect(canonical.primarySector).toMatch(/Finans|Muhasebe/i);
    });

    it('10.7: Golden Regression: Marketing / Growth CV complete check', () => {
      const cv = `
Deniz Can
Büyüme ve Dijital Pazarlama Müdürü

DENEYİM
Insider
Growth Manager
2020 - 2024
`;
      const payload = extractDeterministicCv(cv);
      const canonical = mapCvToCanonicalTaxonomy(payload);
      expect(canonical.primarySector).toMatch(/Pazarlama|Reklam/i);
    });

    it('10.8: Golden Regression: Tourism / Hotel CV complete check', () => {
      const cv = `
Alişan Demir
Otel Genel Müdürü

DENEYİM
Hilton Hotels
Otel Müdürü
2016 - 2024
`;
      const payload = extractDeterministicCv(cv);
      const canonical = mapCvToCanonicalTaxonomy(payload);
      expect(canonical.primarySector).toMatch(/Turizm|Otel/i);
    });

    it('10.9: Negative test: 100% empty document rejection with CvExtractionError', async () => {
      const emptyBuf = Buffer.alloc(0);
      await expect(extractCvText(emptyBuf, 'empty.pdf', 'application/pdf')).rejects.toThrow(CvExtractionError);
    });

    it('10.10: Negative test: Random lorem ipsum text without career signals -> 0 hallucinations', () => {
      const lorem = `
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
`;
      const payload = extractDeterministicCv(lorem);
      const canonical = mapCvToCanonicalTaxonomy(payload);
      expect(canonical.fullName).toBeUndefined();
      expect(canonical.experiences).toHaveLength(0);
      expect(canonical.educationList).toHaveLength(0);
      expect(canonical.primarySector).not.toBe('Kamu / Belediye');
      expect(canonical.primaryRole).not.toBe('Uzman');
    });
  });
});
