import { describe, expect, it } from 'vitest';
import { extractDeterministicCv } from '@/features/candidates/cv/cv-deterministic-extractor';
import { extractCvText, CvExtractionError } from '@/features/candidates/cv/cv-text-extractor';

describe('CV Extraction 2.0 - Multi-Format & Synthetic CV Tests (10+ Formats)', () => {
  // 1. Türkçe Klasik CV
  it('Fixture 1: Türkçe Klasik CV', () => {
    const cv = `
Ahmet Yılmaz
İstanbul / Kadıköy
0532 111 22 33

İŞ DENEYİMİ
Akbank A.Ş.
Müşteri İlişkileri Yöneticisi
2020 - 2023
Portföy yönetimi ve müşteri kazanımı sağlandı.

EĞİTİM
İstanbul Üniversitesi - İktisat (Lisans) - 2019

YETKİNLİKLER
Satış Yönetimi, Portföy Yönetimi, MS Excel
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences.length).toBe(1);
    expect(res.education.length).toBe(1);
    expect(res.locations).toContain('İstanbul');
  });

  // 2. İngilizce CV
  it('Fixture 2: English CV', () => {
    const cv = `
John Doe
Istanbul / Besiktas

WORK EXPERIENCE
Mehrwerk
Call Center Operations Manager
2018 - 2022
Managed operations and performance.

EDUCATION
Bogazici University - Business Administration (Bachelor) - 2017

SKILLS
Operations Management, Team Management, Jira, Excel
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences.length).toBe(1);
    expect(res.education.length).toBe(1);
  });

  // 3. Canva CV (Compact blocks)
  it('Fixture 3: Canva Format CV', () => {
    const cv = `
CANSU DEMİR | İSTANBUL
cagri merkezi operasyon muduru

DENEYİM
IGS TURKIYE - Cagri Merkezi Muduru (2022 - 2024)

EGITIM
Marmara Universitesi / Isletme (Lisans) 2020

BECERILER
Musteri Iliskileri, Liderlik, CRM
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences.length).toBe(1);
    expect(res.locations).toContain('İstanbul');
  });

  // 4. LinkedIn PDF
  it('Fixture 4: LinkedIn Export CV', () => {
    const cv = `
Deneyim
Gedik Yatirim
Alternatif Satis Kanallari Muduru
Ocak 2021 - Aralik 2023 (3 yil)
Istanbul, Turkiye

Egitim
Anadolu Universitesi
Kamu Yonetimi (Lisans) - 2016
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences.length).toBe(1);
    expect(res.education.length).toBe(1);
  });

  // 5. Word DOCX format
  it('Fixture 5: Word Document Format', () => {
    const cv = `
ÖZGEÇMİŞ
Mehmet Kaya - Ankara / Çankaya
İŞ GEÇMİŞİ:
Aselsan A.Ş. - Proje Yöneticisi (2019 - 2024)
EĞİTİM GEÇMİŞİ:
ODTÜ - Endüstri Mühendisliği (Yüksek Lisans) - 2018
YETENEKLER:
Proje Yönetimi, Agile, Jira
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences.length).toBe(1);
    expect(res.education.length).toBe(1);
    expect(res.locations).toContain('Ankara');
  });

  // 6. Tek Sütun CV
  it('Fixture 6: Single-column Linear CV', () => {
    const cv = `
Ali Can
İzmir
2018 - 2022 | Trendyol | Yazılım Geliştirici
Lisans: Ege Üniversitesi - Bilgisayar Mühendisliği (2017)
Yetenekler: TypeScript, React, Docker, Git
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences.length).toBe(1);
    expect(res.tools).toContain('Docker');
    expect(res.tools).toContain('Git');
  });

  // 7. İki Sütun CV
  it('Fixture 7: Two-column Multi-section CV', () => {
    const cv = `
SOL SÜTUN:
İletişim: Bursa
Diller: Türkçe, İngilizce, Almanca
Sertifikalar: SEGEM, PMP

SAĞ SÜTUN:
İŞ DENEYİMİ:
Fibabanka - Şube Müdürü (2017 - 2023)
EĞİTİM:
Uludağ Üniversitesi - Maliye (Lisans) - 2015
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences.length).toBe(1);
    expect(res.education.length).toBe(1);
    expect(res.certificates).toContain('SEGEM');
    expect(res.certificates).toContain('PMP');
  });

  // 8. Çok Deneyimli Yönetici CV'si (6+ jobs)
  it('Fixture 8: Executive CV with 6 experiences', () => {
    const cv = `
Uğur Zaman
İstanbul

İŞ DENEYİMİ
IGS Türkiye - Müdür (2025 - 2026)
Gedik Yatırım - Müdür (2023 - 2025)
Mehrwerk - Müdür (2019 - 2023)
Viennalife - Müdür (2016 - 2019)
Fibabanka - Müdür (2016 - 2016)
Mplus Group - Müdür (2011 - 2016)

EĞİTİM
Marmara Üniversitesi - Sermaye Piyasası (Yüksek Lisans)
Anadolu Üniversitesi - Kamu Yönetimi (Lisans)
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences.length).toBe(6);
    expect(res.education.length).toBe(2);
  });

  // 9. Yeni Mezun CV'si
  it('Fixture 9: Fresh Graduate CV', () => {
    const cv = `
Selin Yurt
İstanbul
EĞİTİM:
Koç Üniversitesi - İşletme (Lisans) - 2024 (GPA: 3.8)
STAJ VE DENEYİM:
PwC - Finansal Denetim Stajyeri (2023 - 2024)
YETKİNLİKLER:
Finansal Analiz, MS Excel, Power BI
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences.length).toBe(1);
    expect(res.education.length).toBe(1);
    expect(res.tools).toContain('MS Excel');
    expect(res.tools).toContain('Power BI');
  });

  // 10. Teknik Yazılımcı CV'si
  it('Fixture 10: Technical Software Engineer CV', () => {
    const cv = `
Burak Öz
İstanbul

İŞ DENEYİMİ
Getir - Senior Backend Developer (2021 - 2024)
Go, PostgreSQL, Redis, Docker, Kubernetes, AWS, microservices mimarisi.

EĞİTİM
İTÜ - Bilgisayar Mühendisliği (Lisans) - 2020
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences.length).toBe(1);
    expect(res.tools).toContain('PostgreSQL');
    expect(res.tools).toContain('Docker');
    expect(res.tools).toContain('Kubernetes');
    expect(res.tools).toContain('AWS');
  });

  // 11. Scanned Image / Empty PDF error handling
  it('Fixture 11: Scanned image PDF friendly notification without hallucination', async () => {
    // Zero-length or non-text PDF throws friendly informative error
    const emptyBuf = Buffer.from('empty');
    await expect(extractCvText(emptyBuf, 'scanned.pdf', 'application/pdf')).rejects.toThrowError(
      CvExtractionError,
    );
  });
});
