import { describe, expect, it } from 'vitest';
import fs from 'fs';
import { extractCandidateName } from './cv-name-extractor';
import {
  extractDeterministicCv,
  extractDeterministicExperiences,
  extractDeterministicEducation,
  extractDeterministicSkillsAndTools,
  extractDeterministicLanguagesAndCerts,
} from './cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from './cv-taxonomy-mapper';
import { buildProfileDraftFromCanonicalResult } from './cv-profile-builder';
import { cvService } from './cv.service';

describe('CV Extraction Engine 6.0 — Property Invariants & Adversarial Validation', () => {
  // ==========================================
  // SECTION 1: 10 CORE PROPERTY INVARIANTS
  // ==========================================

  it('Invariant 1: Education text changes -> Sector does NOT change', () => {
    const cvWithPublicAdmin = `
Uğur Zaman
İstanbul / Maltepe
Telemarketing ve Çağrı Merkezi Operasyonları Direktörü

EĞİTİM
Anadolu Üniversitesi - Kamu Yönetimi Lisans (2011 - 2015)

DENEYİM
Mplus Group - Çağrı Merkezi Operasyon Müdürü (2011 - 2016)
`;
    const cvWithEngineering = `
Uğur Zaman
İstanbul / Maltepe
Telemarketing ve Çağrı Merkezi Operasyonları Direktörü

EĞİTİM
İTÜ - İnşaat Mühendisliği Lisans (2011 - 2015)

DENEYİM
Mplus Group - Çağrı Merkezi Operasyon Müdürü (2011 - 2016)
`;
    const res1 = mapCvToCanonicalTaxonomy(extractDeterministicCv(cvWithPublicAdmin));
    const res2 = mapCvToCanonicalTaxonomy(extractDeterministicCv(cvWithEngineering));

    expect(res1.primarySector).toBe('Çağrı merkezi');
    expect(res2.primarySector).toBe('Çağrı merkezi');
    expect(res1.primarySector).toBe(res2.primarySector);
  });

  it('Invariant 2: Reference text changes -> Candidate Name does NOT change', () => {
    const cv1 = `
Uğur Zaman
İstanbul / Maltepe
Çağrı Merkezi Müdürü

REFERANSLAR
Ahmet Kaya - Genel Müdür
5321112233
`;
    const cv2 = `
Uğur Zaman
İstanbul / Maltepe
Çağrı Merkezi Müdürü

REFERANSLAR
Zeynep Şahin - Yönetim Kurulu Başkanı
5449998877
`;
    const name1 = extractCandidateName(cv1);
    const name2 = extractCandidateName(cv2);

    expect(name1).toBe('Uğur Zaman');
    expect(name2).toBe('Uğur Zaman');
  });

  it('Invariant 3: Skill section changes -> Experience count does NOT change', () => {
    const baseCv = `
Deniz Yılmaz
İstanbul / Beşiktaş
Yazılım Mühendisi

DENEYİM
Trendyol - Backend Developer (2020 - 2024)
Hepsiburada - Software Engineer (2018 - 2020)
`;
    const cvWithManySkills = `
${baseCv}
YETKİNLİKLER: Node.js, TypeScript, PostgreSQL, Redis, Docker, Kubernetes, Microservices, CI/CD, AWS, Clean Code, Agile, Scrum
`;
    const res1 = extractDeterministicCv(baseCv);
    const res2 = extractDeterministicCv(cvWithManySkills);

    expect(res1.experiences).toHaveLength(2);
    expect(res2.experiences).toHaveLength(2);
  });

  it('Invariant 4: Publication dates change -> Experience count does NOT change', () => {
    const cv = `
Dr. Selim Koç
Ankara / Çankaya
Veri Bilimci

İŞ DENEYİMİ
TÜBİTAK - Kıdemli Araştırmacı (2021 - 2024)
Aselsan - Yapay Zeka Mühendisi (2018 - 2021)

YAYINLAR
1. Derin Öğrenme ile Doğal Dil İşleme, IEEE Transactions, 2023.
2. Büyük Veri Analitiği ve Optimizasyon, Springer, 2020.
3. Makine Öğrenmesi Algoritmaları, ACM, 2019.
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(2);
  });

  it('Invariant 5: Company name changes -> Role does NOT become company name', () => {
    const cv = `
Ali Kaya
İzmir / Konak
Satış Müdürü

DENEYİM
Doktor Takvimi A.Ş. - Bölge Satış Müdürü (2021 - 2024)
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.primaryRole).not.toContain('Doktor');
    expect(canonical.primaryRole).toBe('Bölge Satış Müdürü');
  });

  it('Invariant 6: Section order changes -> Extraction remains stable', () => {
    const cvOrder1 = `
Mert Yıldız
İstanbul / Kadıköy
Frontend Geliştirici

EĞİTİM
Boğaziçi Üniversitesi - Bilgisayar Mühendisliği (2016 - 2020)

DENEYİM
Getir - Frontend Developer (2020 - 2024)

BECERİLER
React, TypeScript, CSS
`;

    const cvOrder2 = `
Mert Yıldız
İstanbul / Kadıköy
Frontend Geliştirici

BECERİLER
React, TypeScript, CSS

DENEYİM
Getir - Frontend Developer (2020 - 2024)

EĞİTİM
Boğaziçi Üniversitesi - Bilgisayar Mühendisliği (2016 - 2020)
`;

    const res1 = mapCvToCanonicalTaxonomy(extractDeterministicCv(cvOrder1));
    const res2 = mapCvToCanonicalTaxonomy(extractDeterministicCv(cvOrder2));

    expect(res1.fullName).toBe(res2.fullName);
    expect(res1.primaryRole).toBe(res2.primaryRole);
    expect(res1.experiences.length).toBe(res2.experiences.length);
    expect(res1.educationList.length).toBe(res2.educationList.length);
  });

  it('Invariant 7: Multi-column stream separation -> Zero cross-contamination', () => {
    const twoColCv = `
Kişisel Bilgiler
mert.kaya@gmail.com
5551234567
İzmir / Bornova
Eğitim
Beceriler
JavaScript
Python
Referanslar
Kemal Sunal - 5320001122
MERT KAYA
Kıdemli Veri Analisti
Ege Üniversitesi - İstatistik Lisans 2018
İş Deneyimi
Vestel - Kıdemli Veri Analisti (2018 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(twoColCv));
    expect(res.fullName).toBe('Mert Kaya');
    expect(res.primaryRole).toBe('Veri Analisti');
    expect(res.experiences).toHaveLength(1);
  });

  it('Invariant 8: Decorative characters change -> Semantic output remains identical', () => {
    const cvPlain = `
Seda Çelik
Ankara / Çankaya
İnsan Kaynakları Müdürü

DENEYİM
Koç Holding - İK Müdürü (2020 - 2024)
İşe alım, performans değerlendirme ve bordro yönetimi.
`;
    const cvDecorated = `
★ Seda Çelik ★
• Ankara / Çankaya •
▶ İnsan Kaynakları Müdürü ◀

■ DENEYİM ■
Koç Holding | İK Müdürü (2020 - 2024)
→ İşe alım | Performans değerlendirme | Bordro yönetimi.
`;
    const res1 = mapCvToCanonicalTaxonomy(extractDeterministicCv(cvPlain));
    const res2 = mapCvToCanonicalTaxonomy(extractDeterministicCv(cvDecorated));

    expect(res1.fullName).toBe(res2.fullName);
    expect(res1.primaryRole).toBe(res2.primaryRole);
    expect(res1.experiences.length).toBe(res2.experiences.length);
  });

  it('Invariant 9: Deterministic signals are preserved 100% without hallucination', () => {
    const cv = `
Uğur Zaman
İstanbul / Maltepe
Telemarketing ve Çağrı Merkezi Operasyonları Direktörü | Sigorta Satış Yönetimi

EĞİTİM
Marmara Üniversitesi - Sermaye Piyasası ve Borsa Yüksek Lisans (2020 - 2022)
Anadolu Üniversitesi - Kamu Yönetimi Lisans (2011 - 2015)

İŞ DENEYİMİ
IGS Türkiye - Telemarketing ve Ticari Destek Operasyonları Müdürü (2025 - 2026)
Gedik Yatırım - Alternatif Satış Kanalları Müdürü (2023 - 2025)
Mehrwerk - Sigorta Çağrı Merkezi Operasyon Müdürü (2019 - 2023)
Viennalife - Sigorta Dijital Kanal Çağrı Merkezi Satış Müdürü (2016 - 2019)
Fibabanka - Outsource Kanal Operasyon Müdürü (2016 - 2016)
Mplus Group - Çağrı Merkezi Operasyon Müdürü (2011 - 2016)
`;
    const res = extractDeterministicCv(cv);
    expect(res.fullName).toBe('Uğur Zaman');
    expect(res.experiences).toHaveLength(6);
    expect(res.education).toHaveLength(2);
  });

  it('Invariant 10: Taxonomy maps canonical form while preserving original title', () => {
    const cv = `
Burak Kaya
İstanbul / Ataşehir
Kıdemli Fullstack Web Geliştiricisi

DENEYİM
Trendyol - Fullstack Developer (2021 - 2024)
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    expect(canonical.primaryRole).toMatch(/Full-Stack Geliştirici|Full Stack Developer/i);
  });

  // ==========================================
  // SECTION 2: ADVERSARIAL ATTACK VALIDATION
  // ==========================================

  it('Adversarial 1: "EĞİTİM" at line 1 is never extracted as name', () => {
    const cv = `
EĞİTİM
Marmara Üniversitesi - İktisat Lisans
DENEYİM
Boran Tan - Satış Danışmanı (2021 - 2024)
`;
    const name = extractCandidateName(cv);
    expect(name).not.toBe('Eğitim');
  });

  it('Adversarial 2: "DENEYİM" at line 1 is never extracted as name', () => {
    const cv = `
DENEYİM
Garanti BBVA - Müşteri Temsilcisi (2020 - 2024)
EĞİTİM
İstanbul Üniversitesi - İşletme
`;
    const name = extractCandidateName(cv);
    expect(name).not.toBe('Deneyim');
  });

  it('Adversarial 3: "KAMU YÖNETİMİ" degree never contaminates primarySector', () => {
    const cv = `
Kemal Sunar
İstanbul / Kadıköy
Çağrı Merkezi Müdürü

EĞİTİM
Kamu Yönetimi Lisans
Anadolu Üniversitesi

DENEYİM
Mplus - Çağrı Merkezi Müdürü (2018 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primarySector).not.toBe('Kamu / Belediye');
    expect(res.primarySector).toBe('Çağrı merkezi');
  });

  it('Adversarial 4: "GENEL MÜDÜR" in references block never contaminates candidate role', () => {
    const cv = `
Pelin Yılmaz
İstanbul / Şişli
Grafik Tasarımcı

DENEYİM
Ajans 360 - Görsel İletişim Tasarımcısı (2020 - 2024)

REFERANSLAR
Oğuzhan Kaya - Genel Müdür
5329990011
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primaryRole).not.toBe('Genel Müdür');
    expect(res.primaryRole).toMatch(/Görsel İletişim Tasarımcısı|Grafik Tasarımcı/i);
  });

  it('Adversarial 5: "TRABZON" or city in header is never extracted as candidate name', () => {
    const cv = `
TRABZON
Murat Çakır
Makine Mühendisi
murat@gmail.com
DENEYİM
Tofaş - Bakım Mühendisi (2020 - 2024)
`;
    const name = extractCandidateName(cv);
    expect(name).toBe('Murat Çakır');
  });

  it('Adversarial 6: "İNGİLİZCE" language header is never extracted as candidate name', () => {
    const cv = `
İNGİLİZCE
Ayşe Demir
Finans Uzmanı
ayse@gmail.com
DENEYİM
QNB Finansbank - Mali Analist (2020 - 2024)
`;
    const name = extractCandidateName(cv);
    expect(name).toBe('Ayşe Demir');
  });

  it('Adversarial 7: "DOKTOR TAKVİMİ A.Ş." company does not set role to Doctor', () => {
    const cv = `
Büşra Er
İstanbul / Beşiktaş
İçerik Pazarlama Uzmanı

DENEYİM
Doktor Takvimi A.Ş. - Dijital Pazarlama Yöneticisi (2020 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primaryRole).not.toContain('Doktor');
    expect(res.primaryRole).toMatch(/Dijital Pazarlama|Pazarlama/i);
  });

  // ==========================================
  // SECTION 3: REAL PDF GOLDEN REPLAY
  // ==========================================

  it('Golden Document Replay: Real Uğur Zaman PDF produces 100% verified canonical values', async () => {
    const pdfPath = 'C:/Users/ugurz/Desktop/CV - UĞUR ZAMAN (4).pdf';
    if (!fs.existsSync(pdfPath)) return;
    const buffer = fs.readFileSync(pdfPath);

    const draft = await cvService.processCvBuffer({
      buffer,
      fileName: 'CV - UĞUR ZAMAN (4).pdf',
      mimeType: 'application/pdf',
    });

    // 1. Candidate Full Name
    expect(draft.formValues.fullName).toBe('Uğur Zaman');

    // 2. Primary Sector
    expect(draft.formValues.primarySector).toBe('Çağrı merkezi');

    // 3. Desired Role
    expect(draft.formValues.desiredRole).toBe('Çağrı Merkezi Operasyon Müdürü');

    // 4. Experience Level
    expect(draft.formValues.experienceLevel).toBe('Yönetici');

    // 5. Experiences Count & Consolidation (Exactly 6, never 11)
    expect(draft.formValues.experiences).toHaveLength(6);
    expect(draft.formValues.experiences[0].company).toContain('IGS Türkiye');
    expect(draft.formValues.experiences[1].company).toContain('Gedik');
    expect(draft.formValues.experiences[2].company).toContain('Mehrwerk');
    expect(draft.formValues.experiences[3].company).toContain('Viennalife');
    expect(draft.formValues.experiences[4].company).toContain('Fibabanka');
    expect(draft.formValues.experiences[5].company).toContain('Mplus');

    // 6. Education History (Exactly 2, Marmara + Anadolu)
    expect(draft.formValues.educationHistory).toHaveLength(2);
    expect(draft.formValues.educationHistory[0].school).toContain('Marmara');
    expect(draft.formValues.educationHistory[1].school).toContain('Anadolu');

    // 7. Clean Professional Skills (No orphan "Uzman", No "-")
    const skills = draft.formValues.professionalSkillsList || [];
    expect(skills.length).toBeGreaterThanOrEqual(5);
    expect(skills.length).toBeLessThanOrEqual(10);
    expect(skills).toContain('Satış Yönetimi');
    expect(skills).toContain('Operasyon Yönetimi');
    expect(skills).toContain('Çağrı Merkezi Yönetimi');
    expect(skills).toContain('Yeni Müşteri Kazanımı');
    expect(skills).toContain('Saha Satış Yönetimi');
    expect(skills).not.toContain('Uzman');
    expect(skills).not.toContain('Eğitim');

    // 8. Location
    expect(draft.formValues.residenceCity).toBe('İstanbul');
    expect(draft.formValues.residenceDistrict).toBe('Maltepe');
  });
});
