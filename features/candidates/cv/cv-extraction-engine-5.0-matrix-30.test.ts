import { describe, expect, it } from 'vitest';
import { extractCvText, CvExtractionError } from '@/features/candidates/cv/cv-text-extractor';
import { detectCvFormatFromBuffer } from '@/features/candidates/cv/cv-format-detector';
import { extractCandidateName, isForbiddenNameCandidate } from '@/features/candidates/cv/cv-name-extractor';
import {
  extractDeterministicCv,
  extractDeterministicSkillsAndTools,
  extractDeterministicExperiences,
  extractDeterministicEducation,
} from '@/features/candidates/cv/cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from '@/features/candidates/cv/cv-taxonomy-mapper';
import { cvService } from '@/features/candidates/cv/cv.service';

describe('CV Extraction Engine 5.0 — 30 Adversarial & Edge-Case Matrix', () => {

  // 1. Normal Turkish CV
  it('Scenario 1: Normal Turkish CV', () => {
    const cv = `
Ahmet Yılmaz
İstanbul / Kadıköy | ahmet@example.com | 0532 111 22 33
Kıdemli Yazılım Geliştirici

İŞ DENEYİMİ
Trendyol Tech
Yazılım Geliştirici
2021 - 2024
• Mikroservis mimarileri geliştirildi.

EĞİTİM
İstanbul Teknik Üniversitesi
Bilgisayar Mühendisliği
Lisans
2016 - 2020

BECERİLER
React, Node.js, TypeScript
`;
    const payload = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(payload);
    expect(canonical.fullName).toBe('Ahmet Yılmaz');
    expect(canonical.primarySector).toBe('Bilişim / Yazılım');
    expect(canonical.primaryRole).toBe('Yazılım Geliştirici');
    expect(canonical.experiences).toHaveLength(1);
    expect(canonical.educationList).toHaveLength(1);
  });

  // 2. Normal English CV
  it('Scenario 2: Normal English CV', () => {
    const cv = `
John Doe
London, UK | john.doe@example.com
Senior Product Manager

WORK EXPERIENCE
Fintech Global Inc.
Product Manager
2020 - 2023
• Led cross-functional growth teams.

EDUCATION
University of Oxford
Economics, Bachelor
2015 - 2019

SKILLS
Agile, Scrum, Product Roadmapping
`;
    const payload = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(payload);
    expect(canonical.fullName).toBe('John Doe');
    expect(canonical.primaryRole).toContain('Ürün Yöneticisi');
    expect(canonical.experiences).toHaveLength(1);
  });

  // 3. Two-Column CV
  it('Scenario 3: Two-Column CV layout', () => {
    const cv = `
Elif Kaya
İstanbul, Beşiktaş | elif@example.com

DENEYİM                            | BECERİLER
Vodafone Türkiye                   | Müşteri İlişkileri
Müşteri Temsilcisi                 | Problem Çözme
2022 - 2024                        | İletişim Becerileri
                                   |
EĞİTİM                             | DİLLER
Marmara Üniversitesi               | İngilizce
İletişim Fakültesi                 |
2017 - 2021                        |
`;
    const payload = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(payload);
    expect(canonical.fullName).toBe('Elif Kaya');
    expect(canonical.primaryRole).toContain('Müşteri Temsilcisi');
    expect(canonical.experiences).toHaveLength(1);
  });

  // 4. Photo CV metadata lines
  it('Scenario 4: Photo CV with header metadata tokens', () => {
    const cv = `
[PHOTO / VESİKALIK]
Burak Demir
Ankara / Çankaya | 0555 123 45 67
İnsan Kaynakları Uzmanı

DENEYİM
Aselsan A.Ş.
İnsan Kaynakları Uzmanı
2019 - 2023

EĞİTİM
Hacettepe Üniversitesi
Psikoloji
2014 - 2018
`;
    const name = extractCandidateName(cv);
    expect(name).toBe('Burak Demir');
  });

  // 5. No section labels
  it('Scenario 5: CV without explicit section headers', () => {
    const cv = `
Selin Akın
İzmir, Bornova | selin@example.com
Muhasebe Sorumlusu

Ege Seramik A.Ş.
Muhasebe Sorumlusu
2019 - 2024
Mizan ve genel muhasebe kayıtları tutuldu.

Dokuz Eylül Üniversitesi
İktisat Lisans
2014 - 2018
`;
    const payload = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(payload);
    expect(canonical.fullName).toBe('Selin Akın');
    expect(canonical.primaryRole).toMatch(/Muhasebe/i);
    expect(canonical.experiences.length).toBeGreaterThanOrEqual(1);
  });

  // 6. Different section labels
  it('Scenario 6: Non-standard synonym section headers', () => {
    const cv = `
Caner Erkin
İstanbul / Kadıköy

MESLEKİ TECRÜBE
Turkcell İletişim
Saha Satış Yöneticisi
2018 - 2023

ÖĞRENİM BİLGİLERİ
İstanbul Üniversitesi
İşletme Fakültesi
2013 - 2017

YETENEK HAVUZU
B2B Satış, Müzakere, Portföy Yönetimi
`;
    const payload = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(payload);
    expect(canonical.fullName).toBe('Caner Erkin');
    expect(canonical.primaryRole).toContain('Satış');
    expect(canonical.experiences).toHaveLength(1);
    expect(canonical.educationList).toHaveLength(1);
  });

  // 7. Table-based CV
  it('Scenario 7: Table-based experience rows', () => {
    const cv = `
Gamze Şen
Bursa, Nilüfer

ŞİRKET | POZİSYON | TARİH
Tofaş Türk Otomobil Fabrikası | Kalite Mühendisi | 2020 - 2024
Bosch Türkiye | Üretim Mühendisi | 2017 - 2020

EĞİTİM
Uludağ Üniversitesi - Makine Mühendisliği (2012 - 2016)
`;
    const payload = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(payload);
    expect(canonical.fullName).toBe('Gamze Şen');
    expect(canonical.experiences).toHaveLength(2);
  });

  // 8. Bullet-heavy CV (anti-fragmentation)
  it('Scenario 8: Heavy bullet points inside single position', () => {
    const cv = `
Murat Kara
Ankara

DENEYİM
Havelsan
Siber Güvenlik Uzmanı
2020 - 2024
• SOC operasyonlarının 7/24 yönetimi ve izlenmesi
• SIEM altyapısının konfigürasyonu ve log analizi
• Güvenlik duvarı kural optimizasyonu
• Zafiyet taramaları ve penetrasyon test raporlaması
• Olay müdahale süreçlerinin yürütülmesi
• ISO 27001 denetimlerine hazırlık ve uyumluluk

EĞİTİM
ODTÜ - Bilgisayar Mühendisliği (2015 - 2019)
`;
    const experiences = extractDeterministicExperiences(cv);
    expect(experiences).toHaveLength(1);
    expect(experiences[0].company).toMatch(/Havelsan/i);
  });

  // 9. Header-heavy CV
  it('Scenario 9: Multiple repeated header banners', () => {
    const cv = `
CURRICULUM VITAE
ÖZGEÇMİŞ FORMU
KİŞİSEL BİLGİLER
Serdar Taşçı
İstanbul, Maltepe | serdar@example.com

DENEYİM
Garanti BBVA
Portföy Yöneticisi
2019 - 2023
`;
    const name = extractCandidateName(cv);
    expect(name).toBe('Serdar Taşçı');
  });

  // 10. CV with no explicit skills section
  it('Scenario 10: CV without explicit skills section does not explode with whole dictionary', () => {
    const cv = `
Gülşen Yıldız
Adana, Seyhan
Finans Müdürü

DENEYİM
Sabancı Holding
Finans Müdürü
2018 - 2024

EĞİTİM
Çukurova Üniversitesi - İktisat (2013 - 2017)
`;
    const skills = extractDeterministicSkillsAndTools(cv);
    expect(skills.professionalSkills.length).toBeLessThan(15);
  });

  // 11. Skills containing proficiency suffixes
  it('Scenario 11: Normalizes proficiency suffixes in explicit skills', () => {
    const cv = `
Deniz Yılmaz
İstanbul

BECERİLER
Proje Yönetimi - İleri Düzey
Finansal Analiz - Uzman
Pazarlama Stratejisi - Orta
İngilizce - Advanced
Python - Beginner
`;
    const skills = extractDeterministicSkillsAndTools(cv);
    expect(skills.professionalSkills).toContain('Proje Yönetimi');
    expect(skills.professionalSkills).toContain('Finansal Analiz');
    expect(skills.professionalSkills).toContain('Pazarlama Stratejisi');
    for (const s of skills.professionalSkills) {
      expect(s).not.toMatch(/-(?:\s*Uzman|\s*İleri|\s*Orta)/i);
    }
  });

  // 12. CV with education "Kamu Yönetimi"
  it('Scenario 12: Degree "Kamu Yönetimi" does NOT output "Kamu / Belediye" sector', () => {
    const cv = `
Volkan Çetin
İzmir

DENEYİM
Migros Ticaret A.Ş.
Mağaza Müdürü
2020 - 2024

EĞİTİM
Anadolu Üniversitesi
Kamu Yönetimi Lisans
2014 - 2018
`;
    const payload = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(payload);
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.educationField).toContain('Kamu Yönetimi');
  });

  // 13. CV where actual sector is unrelated to education
  it('Scenario 13: Construction Engineering graduate working as Software Developer -> IT Sector', () => {
    const cv = `
Kaan Öztürk
İstanbul

DENEYİM
Getir
Frontend Geliştirici
2021 - 2024

EĞİTİM
Yıldız Teknik Üniversitesi
İnşaat Mühendisliği Lisans
2015 - 2020
`;
    const payload = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(payload);
    expect(canonical.primarySector).toBe('Bilişim / Yazılım');
    expect(canonical.primarySector).not.toBe('İnşaat / Gayrimenkul');
  });

  // 14. CV with references
  it('Scenario 14: Reference contact numbers do not contaminate candidate phone', () => {
    const cv = `
Merve Çelik
İstanbul | merve@example.com | 0542 999 88 77

DENEYİM
LC Waikiki
Kategori Yöneticisi
2019 - 2023

REFERANSLAR
Ali Vural, LC Waikiki Direktörü
Tel: 0532 111 00 00
`;
    const payload = extractDeterministicCv(cv);
    expect(payload.phone).not.toContain('0532 111 00 00');
    expect(payload.phone).toContain('0542 999 88 77');
  });

  // 15. CV with repeated names
  it('Scenario 15: Name appearing in header and personal section resolves cleanly', () => {
    const cv = `
METİN KORKMAZ
metin@example.com

KİŞİSEL BİLGİLER
Adı Soyadı: Metin Korkmaz
Doğum Tarihi: 1990

DENEYİM
Arçelik A.Ş.
Bakım Onarım Teknisyeni
2015 - 2023
`;
    const name = extractCandidateName(cv);
    expect(name).toBe('Metin Korkmaz');
  });

  // 16. CV with footer/header repetition
  it('Scenario 16: Page numbers and repeated page footers filtered out', () => {
    const cv = `
Zeynep Arslan
İstanbul

DENEYİM
Akbank T.A.Ş.
Müşteri Temsilcisi
2020 - 2022

Sayfa 1 / 2
Zeynep Arslan - Özgeçmiş

DENEYİM (Devam)
Yapı Kredi
Bireysel Müşteri Temsilcisi
2022 - 2024

Sayfa 2 / 2
`;
    const experiences = extractDeterministicExperiences(cv);
    expect(experiences.length).toBeGreaterThanOrEqual(1);
    for (const exp of experiences) {
      expect(exp.company).not.toContain('Sayfa');
      expect(exp.role).not.toContain('Sayfa');
    }
  });

  // 17. CV with broken PDF text order
  it('Scenario 17: Multi-token date and company lines assembled without crashing', () => {
    const cv = `
Hakan Bayraktar
Ankara
2021 - 2024
ASELSAN
Kıdemli Sistem Mühendisi
`;
    const experiences = extractDeterministicExperiences(cv);
    expect(experiences).toHaveLength(1);
    expect(experiences[0].company).toMatch(/ASELSAN/i);
  });

  // 18. CV with OCR-like text
  it('Scenario 18: OCR unicode artifacts and spacing handled safely', () => {
    const cv = `
UGUR  ZAMAN
ISTANBUL / MALTEPE
Cagri Merkezi Operasyon Muduru

DENEYIM
Mehrwerk Sigorta
Cagri Merkezi Operasyon Muduru
2019 - 2023
`;
    const name = extractCandidateName(cv);
    expect(name).toMatch(/U[gğ]ur Zaman/i);
  });

  // 19. CV with Turkish/English mixed sections
  it('Scenario 19: Mixed Turkish and English headings', () => {
    const cv = `
Ebru Gündeş
İstanbul

WORK EXPERIENCE
Pegasus Hava Yolları
Kabin Amiri
2018 - 2024

EĞİTİM
İstanbul Aydın Üniversitesi
Havacılık Yönetimi
2014 - 2018

LANGUAGES
İngilizce (C1), Almanca (B1)
`;
    const payload = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(payload);
    expect(canonical.fullName).toBe('Ebru Gündeş');
    expect(canonical.primaryRole).toContain('Kabin');
    expect(canonical.experiences).toHaveLength(1);
    expect(canonical.languages).toContain('İngilizce');
  });

  // 20. CV with no reliable name
  it('Scenario 20: Missing name leaves candidate name unresolved without hallucinating', () => {
    const cv = `
EĞİTİM
İstanbul Üniversitesi - Hukuk Fakültesi (2018 - 2022)

DENEYİM
Hukuk Bürosu
Stajyer Avukat
2022 - 2023
`;
    const name = extractCandidateName(cv);
    expect(name).not.toBe('EĞİTİM');
    expect(name).not.toBe('DENEYİM');
  });

  // 21. CV with no reliable sector
  it('Scenario 21: CV with pure generic role leaves sector unresolved or canonical safe', () => {
    const cv = `
Ali Veli
Genel Başvuru
`;
    const payload = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(payload);
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
  });

  // 22. CV with multiple possible roles
  it('Scenario 22: Prioritizes most recent position over older historical jobs', () => {
    const cv = `
Derya Şahin
İstanbul

DENEYİM
Trendyol
Kıdemli Ürün Müdürü
2022 - 2024

Hepsiburada
Yazılım Geliştirici
2018 - 2022
`;
    const payload = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(payload);
    expect(canonical.primaryRole).toContain('Ürün');
  });

  // 23. CV with overlapping employment dates
  it('Scenario 23: Overlapping jobs correctly parsed as discrete records', () => {
    const cv = `
Emre Can
İstanbul

DENEYİM
Danışmanlık A.Ş.
Yönetim Danışmanı
2021 - 2023

Freelance
Yazılım Danışmanı
2020 - 2024
`;
    const experiences = extractDeterministicExperiences(cv);
    expect(experiences).toHaveLength(2);
  });

  // 24. CV with same company multiple roles
  it('Scenario 24: Multiple roles in same company preserved', () => {
    const cv = `
Oğuz Atay
Ankara

DENEYİM
Türk Telekom
Kıdemli Network Mühendisi
2022 - 2024

Türk Telekom
Network Mühendisi
2019 - 2022
`;
    const experiences = extractDeterministicExperiences(cv);
    expect(experiences).toHaveLength(2);
  });

  // 25. CV with multiple pages
  it('Scenario 25: Multi-page document model', () => {
    const page1 = `
Seda Sayan
İstanbul / Etiler | seda@example.com

İŞ DENEYİMİ
Kanal D
Program Sunucusu
2021 - 2024
`;
    const page2 = `
Star TV
Program Sunucusu
2018 - 2021

EĞİTİM
Mimar Sinan Güzel Sanatlar Üniversitesi (2012 - 2016)
`;
    const full = page1 + '\n\n' + page2;
    const experiences = extractDeterministicExperiences(full);
    expect(experiences).toHaveLength(2);
  });

  // 26. CV with sidebar
  it('Scenario 26: Left sidebar contact & skills with right column experience', () => {
    const cv = `
SIDEBAR:
Bahar Candan
bahar@example.com
0533 000 11 22
Yetenekler: Hukuk, Arabuluculuk

MAIN CONTENT:
DENEYİM
Candan Hukuk Bürosu
Avukat
2020 - 2024
`;
    const name = extractCandidateName(cv);
    expect(name).toBe('Bahar Candan');
    const exp = extractDeterministicExperiences(cv);
    expect(exp).toHaveLength(1);
  });

  // 27. CV with icon-based contact data
  it('Scenario 27: Unicode icon-prefixed contact tokens', () => {
    const cv = `
👤 Kemal Sunal
📱 +90 532 100 20 30
📧 kemal@example.com
🔗 linkedin.com/in/kemalsunal
🏠 Maltepe, İstanbul

DENEYİM
Yeşilçam Film
Tiyatro ve Sinema Oyuncusu
1975 - 2000
`;
    const name = extractCandidateName(cv);
    expect(name).toBe('Kemal Sunal');
  });

  // 28. CV with "|" delimiters
  it('Scenario 28: Pipe delimiters in headline and skills', () => {
    const cv = `
Umut Bulut | Santrafor | Kayseri
0533 123 45 67 | umut@example.com

DENEYİM
Kayserispor | Futbolcu | 2019 - 2022
Galatasaray | Futbolcu | 2012 - 2016
`;
    const name = extractCandidateName(cv);
    expect(name).toBe('Umut Bulut');
    const exp = extractDeterministicExperiences(cv);
    expect(exp).toHaveLength(2);
  });

  // 29. CV with "-" delimiters
  it('Scenario 29: Hyphen and dash delimiters between company and role', () => {
    const cv = `
Sinan Engin - Futbol Yorumcusu - İstanbul

DENEYİM
Beyaz TV - Spor Yorumcusu - 2018 - 2024
Beşiktaş JK - Menajer - 2002 - 2004
`;
    const name = extractCandidateName(cv);
    expect(name).toBe('Sinan Engin');
  });

  // 30. CV with malformed spacing
  it('Scenario 30: Excessive whitespace and double newlines', () => {
    const cv = `


   Ayşe     Fatma   Özdemir   


   İstanbul   /   Üsküdar


   DENEYİM

   THY    Teknik   A.Ş.

   Uçak   Bakım   Mühendisi

   2019   -   2024


`;
    const name = extractCandidateName(cv);
    expect(name).toBe('Ayşe Fatma Özdemir');
    const exp = extractDeterministicExperiences(cv);
    expect(exp).toHaveLength(1);
    expect(exp[0].company).toMatch(/THY/i);
  });
});
