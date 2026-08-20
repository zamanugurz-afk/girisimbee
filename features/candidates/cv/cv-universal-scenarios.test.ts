import { describe, expect, it } from 'vitest';
import {
  normalizeTrUniversal,
  standardizeMonthWords,
  parseUniversalDateRange,
  isUniversalPureDateLine,
  extractUniversalDemographics,
  scanUniversalCertificates,
  isCorporateEntity,
} from './cv-universal-normalizer';
import { extractDeterministicCv } from './cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from './cv-taxonomy-mapper';
import { buildProfileDraftFromCanonicalResult } from './cv-profile-builder';

describe('Girişimbee Universal CV Scenario Suite', () => {
  describe('1. Universal Date Parsing across all Turkish & English Formats', () => {
    it('parses Turkish 3-letter month abbreviations (Mar 2023 - Ağu 2025)', () => {
      const parsed = parseUniversalDateRange('Mar 2023 - Ağu 2025');
      expect(parsed).not.toBeNull();
      expect(parsed?.startYear).toBe(2023);
      expect(parsed?.endYear).toBe(2025);
      expect(parsed?.isCurrent).toBe(false);
    });

    it('parses Turkish full month names (Eylül 2019 - Temmuz 2022)', () => {
      const parsed = parseUniversalDateRange('Eylül 2019 - Temmuz 2022');
      expect(parsed).not.toBeNull();
      expect(parsed?.startYear).toBe(2019);
      expect(parsed?.endYear).toBe(2022);
    });

    it('parses English 3-letter month abbreviations (Jan 2020 - Dec 2023)', () => {
      const parsed = parseUniversalDateRange('Jan 2020 - Dec 2023');
      expect(parsed).not.toBeNull();
      expect(parsed?.startYear).toBe(2020);
      expect(parsed?.endYear).toBe(2023);
    });

    it('parses slash and dot numeric dates (03/2018 - 09/2021 and 15.06.2019 - 20.08.2023)', () => {
      const p1 = parseUniversalDateRange('03/2018 - 09/2021');
      expect(p1?.startYear).toBe(2018);
      expect(p1?.endYear).toBe(2021);

      const p2 = parseUniversalDateRange('15.06.2019 - 20.08.2023');
      expect(p2?.startYear).toBe(2019);
      expect(p2?.endYear).toBe(2023);
    });

    it('parses active / ongoing roles (2021 - Halen / Present / Devam Ediyor)', () => {
      const p1 = parseUniversalDateRange('2021 - Halen');
      expect(p1?.startYear).toBe(2021);
      expect(p1?.isCurrent).toBe(true);

      const p2 = parseUniversalDateRange('Mar 2022 - Present');
      expect(p2?.startYear).toBe(2022);
      expect(p2?.isCurrent).toBe(true);

      const p3 = parseUniversalDateRange('Oca 2020 - Devam');
      expect(p3?.startYear).toBe(2020);
      expect(p3?.isCurrent).toBe(true);
    });

    it('identifies pure date lines correctly', () => {
      expect(isUniversalPureDateLine('Mar 2023 - Ağu 2025')).toBe(true);
      expect(isUniversalPureDateLine('2019 - Halen (4 yıl 2 ay)')).toBe(true);
      expect(isUniversalPureDateLine('Software Engineer at Trendyol')).toBe(false);
    });
  });

  describe('2. Corporate & Directorate Blacklist (Preventing Department as Role)', () => {
    it('flags corporate entities, directorates and platforms', () => {
      expect(isCorporateEntity('Viennalife Genel Müdürlük, İstanbul')).toBe(true);
      expect(isCorporateEntity('Türkiye Cumhuriyeti Sağlık Bakanlığı')).toBe(true);
      expect(isCorporateEntity('İstanbul Üniversitesi Rektörlüğü')).toBe(true);
      expect(isCorporateEntity('Koçav Ekonomi ve İş Dünyası Platformu')).toBe(true);
      expect(isCorporateEntity('Anadolu Anonim Türk Sigorta Şirketi A.Ş.')).toBe(true);
      expect(isCorporateEntity('Acıbadem Maslak Hastanesi')).toBe(true);
    });

    it('does not flag individual job titles', () => {
      expect(isCorporateEntity('Finansal Güvence Danışmanı')).toBe(false);
      expect(isCorporateEntity('Vardiya Müdürü')).toBe(false);
      expect(isCorporateEntity('İnsan Kaynakları Uzmanı')).toBe(false);
      expect(isCorporateEntity('Yazılım Geliştirici')).toBe(false);
      expect(isCorporateEntity('Şantiye Şefi')).toBe(false);
      expect(isCorporateEntity('Mali Müşavir')).toBe(false);
    });
  });

  describe('3. Universal Certificate Extraction across Industries', () => {
    it('extracts finance, tech, safety, logistics, language, and legal certificates', () => {
      const text = `
Sertifikalar ve Yetkinlikler:
- SEGEM Teknik Personel Belgesi
- SPK Düzey 3 Lisansı
- AWS Certified Solutions Architect
- CKA (Certified Kubernetes Administrator)
- CISSP ve CEH
- PMP ve Professional Scrum Master (PSM I)
- İSG A Sınıfı İş Güvenliği Uzmanlığı
- ISO 9001 ve HACCP
- SRC 4 ve Psikoteknik Belgesi
- TOEFL iBT ve YDS
- Adalet Bakanlığı Arabuluculuk Belgesi
- Seviye 5 Sorumlu Emlak Danışmanı
- MEB Ustalık Belgesi
`;
      const certs = scanUniversalCertificates(text);
      expect(certs).toContain('SEGEM');
      expect(certs).toContain('SPK Düzey 3');
      expect(certs).toContain('AWS Certified Solutions Architect');
      expect(certs).toContain('CKA (Certified Kubernetes Administrator)');
      expect(certs).toContain('Certified Information Systems Security Professional (CISSP)');
      expect(certs).toContain('Certified Ethical Hacker (CEH)');
      expect(certs).toContain('Project Management Professional (PMP)');
      expect(certs).toContain('Professional Scrum Master (PSM I)');
      expect(certs).toContain('İSG A Sınıfı İş Güvenliği Uzmanlığı');
      expect(certs).toContain('ISO 9001 Kalite Yönetim Sistemi');
      expect(certs).toContain('HACCP Gıda Güvenliği');
      expect(certs).toContain('SRC 4 (Yurtiçi Eşya/Kargo Taşımacılığı)');
      expect(certs).toContain('Psikoteknik Değerlendirme Raporu');
      expect(certs).toContain('TOEFL iBT');
      expect(certs).toContain('YDS (Yabancı Dil Bilgisi Seviye Tespit Sınavı)');
      expect(certs).toContain('Adalet Bakanlığı Arabuluculuk Belgesi');
      expect(certs).toContain('Sorumlu Emlak Danışmanı (MYK Seviye 5)');
      expect(certs).toContain('MEB Ustalık Belgesi');
    });
  });

  describe('4. Demographics & Gender Resolution from Turkish First Names', () => {
    it('infers gender correctly from Turkish first names when no explicit gender label is present', () => {
      const cvBurak = extractUniversalDemographics('Burak Batıl Özdemir\nİstanbul, Türkiye\n0532 111 22 33');
      expect(cvBurak.gender).toBe('Erkek');

      const cvGizem = extractUniversalDemographics('Gizem Şaylan\nİstanbul, Türkiye\n0532 222 33 44');
      expect(cvGizem.gender).toBe('Kadın');

      const cvUgur = extractUniversalDemographics('Uğur Zaman\nİzmir, Türkiye');
      expect(cvUgur.gender).toBe('Erkek');

      const cvRukiye = extractUniversalDemographics('Rukiye Gürsoy\nAnkara, Türkiye');
      expect(cvRukiye.gender).toBe('Kadın');

      const cvMeryem = extractUniversalDemographics('Meryem Ekşi\nTrabzon, Türkiye');
      expect(cvMeryem.gender).toBe('Kadın');
    });

    it('extracts birth dates across hyphen, dot, and age parenthesized formats', () => {
      const d1 = extractUniversalDemographics('Doğum Tarihi: 13-06-1996');
      expect(d1.birthDate).toBe('1996-06-13');

      const d2 = extractUniversalDemographics('Doğum Tarihi: 24.04.1997');
      expect(d2.birthDate).toBe('1997-04-24');

      const d3 = extractUniversalDemographics('Ahmet Yılmaz (1993 doğumlu)');
      expect(d3.birthDate).toBe('1993-01-01');
    });
  });

  describe('5. Real Multi-Sector CV End-to-End Archetypes', () => {
    it('Archetype A: Insurance & Finance Professional (Viennalife / Caffe Nero)', () => {
      const cv = `
BURAK BATIL ÖZDEMİR
Doğum Tarihi: 13-06-1996
Adres: 34000 İstanbul/Esenyurt
Ehliyet: A, B
Diller: İngilizce A2

İŞ DENEYİMİ
Finansal Güvence Danışmanı
Viennalife Genel Müdürlük, İstanbul
Mar 2026 - May 2026
* Hayat sigortası ve bireysel emeklilik ürünlerinin tanıtımını yaptım.

Vardiya Müdürü
Caffe Nero, İstanbul
Mar 2023 - Ağu 2025
* Satış hedefleri ve ekip koordinasyonunu yönettim.

EĞİTİM VE NİTELİKLER
Muğla Sıtkı Koçman Üniversitesi - Turizm ve Otel İşletmesi
Eyl 2019 - Tem 2022

KURSLAR
Ekonomi Okulu - KOÇAV Ekonomi ve İş Dünyası Platformu
Mar 2026 - Nis 2026

BECERİLER
Yeni Müşteri Kazanımı, Satış ve İkna, Microsoft Office
`;
      const raw = extractDeterministicCv(cv);
      const canonical = mapCvToCanonicalTaxonomy(raw);
      const draft = buildProfileDraftFromCanonicalResult(canonical, 'burak.pdf');

      expect(raw.experiences.length).toBe(2);
      expect(raw.experiences[0].role).toBe('Finansal Güvence Danışmanı');
      expect(raw.experiences[1].role).toBe('Vardiya Müdürü');
      expect(draft.formValues.sector).toBe('Sigorta');
      expect(draft.formValues.city).toBe('İstanbul');
      expect(draft.formValues.residenceDistrict).toBe('Esenyurt');
      expect(draft.formValues.profileGender).toBe('Erkek');
      expect(draft.formValues.birthDate).toBe('1996-06-13');
    });

    it('Archetype B: HR Specialist with Canva 2-Column Format', () => {
      const cv = `
Gizem Şaylan
Doğum Tarihi: 24-04-1997
Adres: İstanbul/Kadıköy

İŞ DENEYİMİ
İnsan Kaynakları Uzmanı
LC Waikiki Genel Müdürlük, İstanbul
Oca 2022 - Ağu 2024
* Mülakat süreçleri ve işe alım organizasyonu.

İnsan Kaynakları Asistanı
Defacto, İstanbul
Eyl 2020 - Ara 2021
* Personel özlük işleri ve bordro desteği.

EĞİTİM
İstanbul Üniversitesi - İktisat Fakültesi
Eyl 2016 - Haz 2020

BECERİLER VE ARAÇLAR
İşe Alım, Bordro, SAP HR, Excel
`;
      const raw = extractDeterministicCv(cv);
      const canonical = mapCvToCanonicalTaxonomy(raw);
      const draft = buildProfileDraftFromCanonicalResult(canonical, 'gizem.pdf');

      expect(raw.experiences.length).toBe(2);
      expect(draft.formValues.role).toBe('İnsan Kaynakları Uzmanı');
      expect(draft.formValues.sector).toBe('İnsan kaynakları');
      expect(draft.formValues.city).toBe('İstanbul');
      expect(draft.formValues.residenceDistrict).toBe('Kadıköy');
      expect(draft.formValues.profileGender).toBe('Kadın');
      expect(draft.formValues.birthDate).toBe('1997-04-24');
    });

    it('Archetype C: Heavy Industry Site Manager & Civil Engineer with ISG Certificate', () => {
      const cv = `
Mustafa Kaya
Ankara - Çankaya
0533 999 88 77

DENEYİM
Şantiye Şefi
Limak İnşaat A.Ş., Ankara
Nis 2019 - Halen
* Üstyapı ve tünel projelerinde saha yönetimi ve taşeron koordinasyonu.

İnşaat Mühendisi
Kalyon Holding, Gaziantep
Oca 2015 - Mar 2019
* Hakediş, metraj ve statik proje kontrolü.

EĞİTİM
ODTÜ - İnşaat Mühendisliği (Lisans)
2010 - 2014

SERTİFİKALAR
İSG A Sınıfı İş Güvenliği Uzmanlığı, PMP, AutoCAD, Primavera P6
`;
      const raw = extractDeterministicCv(cv);
      const canonical = mapCvToCanonicalTaxonomy(raw);
      const draft = buildProfileDraftFromCanonicalResult(canonical, 'mustafa.pdf');

      expect(raw.experiences.length).toBe(2);
      expect(draft.formValues.role).toBe('Şantiye Şefi');
      expect(draft.formValues.sector).toBe('İnşaat / Gayrimenkul');
      expect(draft.formValues.city).toBe('Ankara');
      expect(draft.formValues.residenceDistrict).toBe('Çankaya');
      expect(draft.formValues.profileGender).toBe('Erkek');
      expect(draft.formValues.certificates).toContain('İSG A Sınıfı');
    });
  });
});
