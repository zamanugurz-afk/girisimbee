import { describe, it, expect } from 'vitest';
import {
  extractDeterministicCv,
  cleanHeaderLine,
} from '@/features/candidates/cv/cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from '@/features/candidates/cv/cv-taxonomy-mapper';
import { buildProfileDraftFromCanonicalResult } from '@/features/candidates/cv/cv-profile-builder';

describe('CV Extraction Negative Tests & Disambiguation Suite', () => {
  // 1. University Name under Education MUST NOT become a Company in Experiences
  it('Negative 1: University name in education section is NEVER extracted as a company', () => {
    const cv = `
Canan Kaya
İstanbul / Kadıköy
Yazılım Geliştirici

EĞİTİM BİLGİLERİ
İstanbul Teknik Üniversitesi - Bilgisayar Mühendisliği (Lisans) - 2021

DENEYİM
Trendyol (2021 - 2024)
Frontend Geliştirici
React ve TypeScript ile web uygulamaları geliştirildi.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'test.pdf');

    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toBe('Trendyol');
    expect(res.experiences.some((e) => e.company?.includes('İstanbul Teknik Üniversitesi'))).toBe(false);
    expect(draft.formValues.experiences?.some((e) => e.company?.includes('Teknik'))).toBe(false);
    expect(draft.formValues.educationHistory?.length).toBeGreaterThanOrEqual(1);
    expect(draft.formValues.educationHistory?.[0].school).toContain('İstanbul Teknik Üniversitesi');
  });

  // 2. University as an Employer in Experience Section MUST be correctly extracted as a Company
  it('Negative 2: University as an employer (Research Assistant) under Experience IS correctly recognized as a company', () => {
    const cv = `
Dr. Selim Yıldız
Ankara / Çankaya
Araştırma Görevlisi

İŞ DENEYİMİ
Orta Doğu Teknik Üniversitesi (2018 - 2024)
Araştırma Görevlisi
Makine Öğrenmesi laboratuvarında araştırma ve ders asistanlığı.

EĞİTİM
Bilkent Üniversitesi - Bilgisayar Mühendisliği (Doktora) - 2024
ODTÜ - Bilgisayar Mühendisliği (Lisans) - 2018
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(/Orta Doğu Teknik Üniversitesi|ODTÜ/i);
    expect(res.experiences[0].role).toBe('Araştırma Görevlisi');
    expect(canonical.primaryRole).toMatch(/Araştırma Görevlisi|Eğitmen|Akademisyen/i);
    expect(canonical.educationList.length).toBeGreaterThanOrEqual(2);
  });

  // 3. Education Degree / Department Name MUST NOT become the Candidate Job Role
  it('Negative 3: Department name (e.g. İktisat Fakültesi) is not set as candidate job role', () => {
    const cv = `
Ahmet Demir
İzmir / Bornova
Finansal Analist

İŞ TECRÜBESİ
Garanti BBVA (2020 - 2024)
Finansal Analist
Mali tablolar ve bütçe analizi.

ÖĞRENİM
Dokuz Eylül Üniversitesi - İktisat Fakültesi (Lisans) - 2019
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.primaryRole).toBe('Finansal Analist');
    expect(canonical.primaryRole).not.toContain('İktisat Fakültesi');
  });

  // 4. Skills Bullet Points in Yetkinlikler Section MUST NOT become Experience Items
  it('Negative 4: Skill bullets in Yetkinlikler section are not parsed as work experience', () => {
    const cv = `
Merve Öz
İstanbul / Şişli
Backend Geliştirici

YETKİNLİKLER VE TEKNOLOJİLER
- React, Node.js, Express.js ve mikroservis mimarileri
- PostgreSQL ve Redis veritabanı yönetimi
- Docker ve Kubernetes konteynerizasyon
- CI/CD pipeline tasarımı ve AWS bulut entegrasyonu

İŞ DENEYİMİ
Hepsiburada (2021 - 2024)
Backend Geliştirici
E-ticaret ödeme servisleri geliştirildi.
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toBe('Hepsiburada');
    expect(res.experiences.some((e) => e.company?.includes('PostgreSQL') || e.company?.includes('Docker'))).toBe(false);
  });

  // 5. Missing Fields MUST NOT be Hallucinated (Honest Zero-Hallucination)
  it('Negative 5: Missing fields (no phone, no certificates, no languages) remain empty and not hallucinated', () => {
    const cv = `
Mehmet Yılmaz
Bursa / Nilüfer
Makine Mühendisi

İŞ DENEYİMİ
Tofaş (2019 - 2023)
Makine Mühendisi
Gövde üretim hattı tasarımı.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv.pdf');

    expect(canonical.certificates).toBe('');
    expect(canonical.languages).toBe('Türkçe');
    expect(draft.formValues.certificates).toHaveLength(0);
    expect(draft.formValues.city).toBe('Bursa');
    expect(draft.formValues.residenceDistrict).toBe('Nilüfer');
  });

  // 6. Header / Footer Artifacts (e.g. Page Numbers, LinkedIn Footers) are NOT parsed as Data
  it('Negative 6: Page numbers, confidentiality notices, and footer strings are filtered out', () => {
    const cv = `
Page 1 of 2
Curriculum Vitae - Confidential
Ali Vural
Ankara / Çankaya
Sistem Yöneticisi

DENEYİM
Havelsan (2018 - 2023)
Sistem Yöneticisi
Linux sunucu ve ağ altyapı yönetimi.

Page 2 of 2
Generated by LinkedIn on 2024
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toBe('Havelsan');
    expect(res.experiences.some((e) => e.company?.includes('Page') || e.company?.includes('LinkedIn'))).toBe(false);
  });

  // 7. Compound / Multi-word Unvans are NOT Hijacked by Generic Single Words
  it('Negative 7: Compound titles (e.g. Çağrı Merkezi Operasyon Müdürü) take precedence over generic "Müdür"', () => {
    const cv = `
Zeynep Kara
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Turkcell Global Bilgi (2015 - 2023)
Çağrı Merkezi Operasyon Müdürü
Operasyonel KPI ve ekip yönetimi.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.primaryRole).toBe('Çağrı Merkezi Operasyon Müdürü');
    expect(canonical.primaryRole).not.toBe('Operasyon Müdürü');
    expect(canonical.primaryRole).not.toBe('Müdür');
  });

  // 8. cleanHeaderLine correctly trims symbols and formats
  it('Negative 8: cleanHeaderLine strips markdown symbols and bullets cleanly', () => {
    expect(cleanHeaderLine('### 1. İŞ TECRÜBESİ ###')).toBe('İŞ TECRÜBESİ');
    expect(cleanHeaderLine('=== MESLEKİ DENEYİM ===')).toBe('MESLEKİ DENEYİM');
    expect(cleanHeaderLine('● Core Competencies ●')).toBe('Core Competencies');
    expect(cleanHeaderLine('[EĞİTİM BİLGİLERİ]')).toBe('EĞİTİM BİLGİLERİ');
    expect(cleanHeaderLine('## EDUCATION & QUALIFICATIONS')).toBe('EDUCATION & QUALIFICATIONS');
  });
});
